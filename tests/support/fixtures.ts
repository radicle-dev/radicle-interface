import type * as Stream from "node:stream";

import * as Fs from "node:fs/promises";
import * as Path from "node:path";
import { test as base } from "@playwright/test";

import * as logLabel from "@tests/support/logLabel.js";

export { expect } from "@playwright/test";

export const test = base.extend<{
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  forAllTests: void;
  customAppConfig: boolean;
  stateDir: string;
  outputLog: Stream.Writable;
}>({
  customAppConfig: [false, { option: true }],

  forAllTests: [
    async ({ customAppConfig, outputLog, page }, use) => {
      const browserLabel = logLabel.make("browser");
      page.on("console", msg => {
        log(msg.text(), browserLabel, outputLog);
      });

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
              pinned: [{ host: "0.0.0.0", emoji: "🚀" }],
            },
            projects: { pinned: [] },
          };
        });
      }

      const playwrightLabel = logLabel.make("playwright");
      await page.route("**/*", route => {
        if (
          route.request().url().startsWith("http://127.0.0.1") ||
          route.request().url().startsWith("http://localhost") ||
          route.request().url().startsWith("http://0.0.0.0")
        ) {
          return route.continue();
        } else {
          log(
            `Aborted remote request: ${route.request().url()}`,
            playwrightLabel,
            outputLog,
          );
          return route.abort();
        }
      });

      page.on("websocket", ws => {
        log(`WebSocket opened: ${ws.url()}`, playwrightLabel, outputLog);
        ws.on("framesent", event =>
          log(
            `WebSocket framesent: ${event.payload}`,
            playwrightLabel,
            outputLog,
          ),
        );
        ws.on("framereceived", event =>
          log(
            `WebSocket framereceived: ${event.payload}`,
            playwrightLabel,
            outputLog,
          ),
        );
        ws.on("close", () =>
          log(`WebSocket closed`, playwrightLabel, outputLog),
        );
      });

      await use();
    },
    { scope: "test", auto: true },
  ],

  outputLog: async ({ stateDir }, use) => {
    const logFile = await Fs.open(Path.join(stateDir, "test.log"), "a");
    await use(logFile.createWriteStream());
    await logFile.close();
  },

  // eslint-disable-next-line no-empty-pattern
  stateDir: async ({}, use, testInfo) => {
    const stateDir = await prepareStateDir(testInfo.file, testInfo.title);
    await use(stateDir);
    if (process.env.CI && testInfo.status === "passed") {
      await Fs.rm(stateDir, { recursive: true });
    }
  },
});

function log(text: string, label: string, outputLog: Stream.Writable) {
  const output = text
    .split("\n")
    .map(line => `${label}${line}`)
    .join("\n");

  outputLog.write(`${output}\n`);
  if (!process.env.CI) {
    console.log(output);
  }
}

// Returns a path to a directory where the test can store files.
//
// The directory is cleared before it is returned.
export async function prepareStateDir(
  testPath: string,
  testName: string,
): Promise<string> {
  const stateDir = Path.resolve(`${testPath}--state`, testName);
  await Fs.rm(stateDir, { recursive: true, force: true });
  await Fs.mkdir(stateDir, { recursive: true });
  return stateDir;
}
