import type { PlaywrightTestConfig } from "@playwright/test";

import base from "./playwright.config.js";

const config: PlaywrightTestConfig = {
  ...base,
  testIgnore: undefined,
  webServer: {
    command: "npm run start:ipfs -- --strictPort --port 3001",
    port: 3001,
  },
};

export default config;
