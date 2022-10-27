import * as FakeTimers from "@sinonjs/fake-timers";

if (typeof window.initializeTestStubs === "function") {
  window.e2eTestStubs = {
    FakeTimers: FakeTimers,
  };
  window.initializeTestStubs();
}
