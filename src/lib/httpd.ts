import type { Node, Policy, Scope } from "@http-client";

import { get, writable } from "svelte/store";
import { withTimeout, Mutex, E_CANCELED, E_TIMEOUT } from "async-mutex";

import { HttpdClient } from "@http-client";
import config from "virtual:config";
import { deduplicateStore } from "@app/lib/deduplicateStore";
import { experimental } from "./appearance";

export interface Session {
  id: string;
  publicKey: string;
  alias: string;
}

export interface HttpdNodeState {
  id: Node["id"];
  state: Node["state"];
  policy: Policy | undefined;
  scope: Scope | undefined;
}

export type HttpdState =
  | { state: "stopped" }
  | {
      state: "running";
      node: HttpdNodeState;
    }
  | {
      state: "authenticated";
      session: Session;
      node: HttpdNodeState;
    };

const HTTPD_STATE_STORAGE_KEY = "httpdState";
const HTTPD_CUSTOM_PORT_KEY = "httpdCustomPort";

const store = writable<HttpdState>({ state: "stopped" });
export const httpdStore = deduplicateStore(store);

export const api = new HttpdClient({
  hostname: "127.0.0.1",
  port: config.nodes.defaultLocalHttpdPort,
  scheme: "http",
});

let pollHttpdStateHandle: number | undefined = undefined;

export function changeHttpdPort(port: number) {
  window.localStorage.setItem(HTTPD_CUSTOM_PORT_KEY, String(port));
  void checkState();
}

function update(state: HttpdState) {
  window.localStorage.setItem(HTTPD_STATE_STORAGE_KEY, JSON.stringify(state));
  store.set(state);
}

const stateMutex = withTimeout(new Mutex(), 5_000);

export async function authenticate(params: {
  id: string;
  signature: string;
  publicKey: string;
}): Promise<boolean> {
  if (!get(experimental)) {
    return false;
  }
  stateMutex.cancel();
  return stateMutex.runExclusive(async () => {
    try {
      await api.session.update(params.id, {
        sig: params.signature,
        pk: params.publicKey,
      });
      const { id, state, config } = await api.getNode();
      const sess = await api.session.getById(params.id);
      update({
        state: "authenticated",
        session: {
          id: params.id,
          publicKey: params.publicKey,
          alias: sess.alias,
        },
        node: { id, state, policy: config?.policy, scope: config?.scope },
      });
      return true;
    } catch (error) {
      console.error(error);
      update({ state: "stopped" });
      return false;
    }
  });
}

export async function disconnect() {
  stateMutex.cancel();
  await stateMutex
    .runExclusive(async () => {
      const httpd = get(store);
      if (httpd.state !== "authenticated") {
        return;
      }

      try {
        await api.session.delete(httpd.session.id);
        const { id, state, config } = await api.getNode();
        update({
          state: "running",
          node: {
            id,
            state,
            policy: config?.policy,
            scope: config?.scope,
          },
        });
      } catch (error) {
        console.error(error);
        update({ state: "stopped" });
      }
    })
    .catch(error => {
      if (error !== E_CANCELED) {
        throw error;
      }
    });
}

async function checkState() {
  let httpdState: HttpdState | null = null;
  const rawHttpdState = window.localStorage.getItem(HTTPD_STATE_STORAGE_KEY);
  const customHttpdPort = window.localStorage.getItem(HTTPD_CUSTOM_PORT_KEY);
  if (customHttpdPort) {
    api.changePort(Number(customHttpdPort));
  }
  if (rawHttpdState) {
    try {
      httpdState = JSON.parse(rawHttpdState);
    } catch (error) {
      console.error(error);
      return;
    }
  }

  await stateMutex
    .runExclusive(async () => {
      try {
        const { id, state, config } = await api.getNode();
        const node = {
          id,
          state,
          policy: config?.policy,
          scope: config?.scope,
        };

        if (httpdState && httpdState.state === "authenticated") {
          const sess = await api.session.getById(httpdState.session.id);
          const unixTimeInSeconds = Math.floor(Date.now() / 1000);
          if (
            sess.status === "unauthorized" ||
            sess.expiresAt < unixTimeInSeconds
          ) {
            update({
              state: "running",
              node,
            });
          } else {
            update({ ...httpdState, node });
          }
        } else {
          update({
            state: "running",
            node,
          });
        }
      } catch (error) {
        if (error instanceof TypeError && error.message !== "Failed to fetch") {
          console.error(error);
        }
        update({ state: "stopped" });
      }
    })
    .catch(error => {
      if (error !== E_CANCELED && error !== E_TIMEOUT) {
        throw error;
      }
    });
}

let windowFocus: boolean = false;
window.addEventListener("focus", () => (windowFocus = true));
window.addEventListener("blur", () => (windowFocus = false));

function pollSession() {
  if (pollHttpdStateHandle) {
    return;
  }

  pollHttpdStateHandle = window.setInterval(() => {
    // We only want to poll for the active browser instance & tab.
    // The other instances and tabs should only react to the storage event.
    if (!document.hidden && windowFocus) {
      void checkState();
    }
  }, 10_000);
}

export async function initialize() {
  // Sync session state changes with other open tabs and windows.
  addEventListener("storage", event => {
    if (
      event.key === HTTPD_STATE_STORAGE_KEY &&
      event.oldValue !== event.newValue
    ) {
      if (!event.newValue) {
        throw new Error("event.newValue was not set");
      }
      const httpdState: HttpdState = JSON.parse(event.newValue);
      store.set(httpdState);
    }

    if (
      event.key === HTTPD_CUSTOM_PORT_KEY &&
      event.oldValue !== event.newValue
    ) {
      api.changePort(Number(event.newValue));
    }
  });

  await checkState();

  // Properly clean up setInterval and restart session polling when Vite
  // performs hot module reload on file changes.
  if (import.meta.hot) {
    import.meta.hot.accept();
    import.meta.hot.dispose(() => {
      clearInterval(pollHttpdStateHandle);
      pollHttpdStateHandle = undefined;
      pollSession();
    });
  }

  pollSession();
}
