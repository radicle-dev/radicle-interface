// Copyright © 2022 The Radicle Upstream Contributors
//
// This file is part of radicle-upstream, distributed under the GPLv3
// with Radicle Linking Exception. For full terms see the included
// LICENSE file.

import { test as base } from "@playwright/test";

export { expect } from "@playwright/test";

export const test = base.extend<{
  forAllTests: undefined;
  customAppConfig: boolean;
}>({
  customAppConfig: [false, { option: true }],

  forAllTests: [
    async ({ customAppConfig, page }, use) => {
      if (!customAppConfig) {
        // Remember: `page.addInitScript()` is run in the browser which
        // is completely isolated from the test environment, so we don't have
        // access to any variables that we have in the test.
        await page.addInitScript(() => {
          window.APP_CONFIG = {
            walletConnect: {
              bridge: "https://radicle.bridge.walletconnect.org",
            },
            reactions: [],
            seeds: {
              pinned: [],
            },
            projects: { pinned: [] },
          };
        });
      }

      await page.route("**/*", route => {
        if (route.request().url().startsWith("http://localhost:3000")) {
          return route.continue();
        } else {
          console.warn("Aborted remote request: ", route.request().url());
          return route.abort();
        }
      });

      page.on("websocket", ws => {
        console.warn("WebSocket opened: ", ws.url());
        ws.on("framesent", event =>
          console.warn("WebSocket framesent: ", event.payload),
        );
        ws.on("framereceived", event =>
          console.warn("WebSocket framereceived: ", event.payload),
        );
        ws.on("close", () => console.warn("WebSocket closed"));
      });

      await use();
    },
    { scope: "test", auto: true },
  ],
});
