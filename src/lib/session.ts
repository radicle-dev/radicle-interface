import { derived, get, writable } from "svelte/store";

interface Session {
  id: string;
  publicKey: string;
}
const store = writable<Session | undefined>(undefined);
export const sessionStore = derived(store, s => s);

const endpoint = "http://localhost:8080/api/v1/sessions";

export async function authenticate(params: {
  id: string;
  signature: string;
  publicKey: string;
}): Promise<"success" | "failure"> {
  disconnect();

  const request = await fetch(`${endpoint}/${params.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sig: params.signature, pk: params.publicKey }),
  });
  if (request.ok) {
    save(params.id, params.publicKey);
    return "success";
  } else {
    return "failure";
  }
}

export async function disconnect() {
  const session = get(store);
  if (!session) {
    return "success";
  }

  await fetch(`${endpoint}/${session.id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.id}`,
    },
  });

  window.localStorage.removeItem("session");
  store.set(undefined);
}

function save(id: string, publicKey: string) {
  window.localStorage.setItem("session", JSON.stringify({ id, publicKey }));
  store.set({ id, publicKey });
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
}
