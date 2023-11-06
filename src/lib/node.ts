import { derived, writable } from "svelte/store";
import { withTimeout, Mutex, E_CANCELED, E_TIMEOUT } from "async-mutex";

import { HttpdClient } from "@httpd-client";
import { config } from "@app/lib/config";

export type NodeState = "stopped" | "running";

const NODE_STATE_STORAGE_KEY = "nodeState";

const store = writable<NodeState>("stopped");
export const nodeStore = derived(store, s => s);

export const api = new HttpdClient({
  hostname: "127.0.0.1",
  port: config.nodes.defaultLocalHttpdPort,
  scheme: "http",
});

let pollHttpdStateHandle: number | undefined = undefined;

function update(state: NodeState) {
  window.localStorage.setItem(NODE_STATE_STORAGE_KEY, state);
  store.set(state);
}

const stateMutex = withTimeout(new Mutex(), 5_000);

async function checkState() {
  let nodeState: NodeState | null = null;
  const rawNodeState = window.localStorage.getItem(NODE_STATE_STORAGE_KEY);
  if (rawNodeState === "running" || rawNodeState === "stopped") {
    nodeState = rawNodeState;
  }

  await stateMutex
    .runExclusive(async () => {
      try {
        if (nodeState) {
          update(nodeState);
        }
        const node = await api.getNode();
        update(node.state);
      } catch (error) {
        if (error instanceof TypeError) {
          console.error(error);
        }
        update("stopped");
      }
    })
    .catch(error => {
      if (error !== E_CANCELED && error !== E_TIMEOUT) {
        throw error;
      }
    });
}

function pollSession() {
  if (pollHttpdStateHandle) {
    return;
  }

  pollHttpdStateHandle = window.setInterval(() => checkState(), 10_000);
}

export async function initialize() {
  // Sync session state changes with other open tabs and windows.
  addEventListener("storage", event => {
    if (
      event.key === NODE_STATE_STORAGE_KEY &&
      event.oldValue !== event.newValue
    ) {
      void checkState();
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
