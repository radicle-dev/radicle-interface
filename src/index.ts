import * as FakeTimers from "@sinonjs/fake-timers";

if (window.PLAYWRIGHT && window.initializeTestStubs !== undefined) {
  window.e2eTestStubs = {
    FakeTimers: FakeTimers,
  };
  window.initializeTestStubs();
}

import App from "@app/App.svelte";

const app = new App({
  target: document.body,
});

export default app;
