import App from "./App.svelte";

const app = new App({
  target: document.body,
});

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      hashRouting: number;
    }
  }
}

export default app;
