if (window.PLAYWRIGHT) import("./e2eTestStubs");
import App from "./App.svelte";

const app = new App({
  target: document.body,
});

export default app;
