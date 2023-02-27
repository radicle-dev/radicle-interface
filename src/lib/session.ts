import { derived, get, writable } from "svelte/store";

import { HttpdClient } from "@httpd-client";

export interface StoredSession {
  id: string;
  publicKey: string;
}

const store = writable<StoredSession | undefined>(undefined);
export const sessionStore = derived(store, s => s);

const api = new HttpdClient({
  hostname: "127.0.0.1",
  port: 8080,
  scheme: "http",
});

export async function authenticate(params: {
  id: string;
  signature: string;
  publicKey: string;
}): Promise<boolean> {
  await disconnect();

  try {
    await api.session.update(params.id, {
      sig: params.signature,
      pk: params.publicKey,
    });
    save(params.id, params.publicKey);
    return true;
  } catch {
    return false;
  }
}

let pollSessionHandle: number | undefined = undefined;

function pollSession() {
  if (pollSessionHandle) {
    return;
  }

  pollSessionHandle = window.setInterval(async () => {
    const session = get(sessionStore);
    if (!session) {
      return;
    }

    try {
      const sess = await api.session.getById(session.id);

      const unixTimeInSeconds = Math.floor(Date.now() / 1000);
      if (
        sess.status === "unauthorized" ||
        sess.expiresAt < unixTimeInSeconds
      ) {
        clear();
      }
    } catch {
      clear();
    }
  }, 60_000);
}

export async function disconnect() {
  const session = get(store);
  if (!session) {
    return "success";
  }

  await api.session.delete(session.id);

  clear();
}

function save(id: string, publicKey: string) {
  window.localStorage.setItem("session", JSON.stringify({ id, publicKey }));
  store.set({ id, publicKey });
}

function clear() {
  window.localStorage.removeItem("session");
  store.set(undefined);
}

export function initialize() {
  // Sync session state changes with other open tabs and windows.
  addEventListener("storage", event => {
    if (event.key === "session") {
      if (event.newValue === null) {
        store.set(undefined);
      } else {
        const parsed = JSON.parse(event.newValue);

        if (parsed.id && parsed.publicKey) {
          store.set({ id: parsed.id, publicKey: parsed.publicKey });
        }
      }
    }
  });

  const session = window.localStorage.getItem("session");

  if (session) {
    const parsed = JSON.parse(session);
    if (parsed.id && parsed.publicKey) {
      store.set({ id: parsed.id, publicKey: parsed.publicKey });
    }
  }

  // Properly clean up setInterval and restart session polling when Vite
  // performs hot module reload on file changes.
  if (import.meta.hot) {
    import.meta.hot.accept();
    import.meta.hot.dispose(() => {
      clearInterval(pollSessionHandle);
      pollSessionHandle = undefined;
      pollSession();
    });
  }

  pollSession();
}
