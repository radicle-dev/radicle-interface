import type { PlaywrightTestConfig } from "@playwright/test";

import base from "./playwright.config.js";

const config: PlaywrightTestConfig = {
  ...base,
  testIgnore: undefined,
  webServer: {
    command: "npm run start:ipfs",
    port: 3000,
  },
};

export default config;
