/* eslint-disable @typescript-eslint/naming-convention */
import type { Config } from "@app/lib/config";
import type { FakeTimers } from "@sinonjs/fake-timers";

declare global {
  interface Window {
    // Defined in vite.config.ts and are available in all environments except
    // production.
    VITEST: boolean;
    PLAYWRIGHT: boolean;
    HASH_ROUTING: boolean;

    HEARTWOOD: boolean;

    // APP_CONFIG is set from within Playwright tests at runtime.
    // To better understand how it works together, have a look at:
    //   tests/support/fixtures.ts
    //   src/config.ts
    APP_CONFIG: Config;
    // eslint-disable-next-line @typescript-eslint/ban-types
    initializeTestStubs?: Function;
    e2eTestStubs: {
      FakeTimers: FakeTimers;
    };

    // Used in
    //   src/session.ts
    //   src/wallet.ts
    ethereum: any;
    registrarState: any;
  }
}

export {};
