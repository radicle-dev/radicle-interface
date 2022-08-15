import App from "./App.svelte";

// Taken from svelte-routing, since it's not exported.
export interface RouteLocation {
  pathname: string;
  search: string;
  hash?: string;
  state: {
    [k in string | number]: unknown;
  };
}

const app = new App({
  target: document.body,
});

export default app;
