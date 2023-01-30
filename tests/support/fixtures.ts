import type * as Stream from "node:stream";

import * as Fs from "node:fs/promises";
import * as Path from "node:path";
import { test as base, expect } from "@playwright/test";

import * as logLabel from "@tests/support/logLabel.js";

export { expect };

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
        // Ignore common console logs that we don't care about.
        if (
          msg.text().startsWith("[vite] connected.") ||
          msg.text().startsWith("[vite] connecting...") ||
          msg
            .text()
            .includes("Please make sure it wasn't preloaded for nothing.")
        ) {
          return;
        }
        log(msg.text(), browserLabel, outputLog);
      });

      page.on("pageerror", msg => {
        expect(
          false,
          `Test failed because there was a console error in the app: ${msg}`,
        ).toBeTruthy();
      });

      if (!customAppConfig) {
        // Remember: `page.addInitScript()` is run in the browser which
        // is completely isolated from the test environment, so we don't have
        // access to any variables that we have in the test.
        await page.addInitScript(() => {
          window.APP_CONFIG = {
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
        } else if (
          route
            .request()
            .url()
            .startsWith("https://www.gravatar.com/avatar/") ||
          route.request().url().endsWith(".png")
        ) {
          route.fulfill({
            status: 200,
            path: "./public/favicon.ico",
          });
        } else {
          log(
            `Aborted remote request: ${route.request().url()}`,
            playwrightLabel,
            outputLog,
          );
          return route.abort();
        }
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
    const stateDir = testInfo.outputDir;
    await Fs.rm(stateDir, { recursive: true, force: true });
    await Fs.mkdir(stateDir, { recursive: true });

    await use(stateDir);
    if (
      process.env.CI &&
      (testInfo.status === "passed" || testInfo.status === "skipped")
    ) {
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

export const appConfigWithFixture = process.env.HEARTWOOD
  ? configFixtureHeartwood
  : configFixture;

export function configFixture() {
  window.APP_CONFIG = {
    reactions: [],
    seeds: {
      pinned: [{ host: "0.0.0.0", emoji: "🚀" }],
    },
    projects: {
      pinned: [
        {
          name: "source-browsing",
          id: "rad:git:hnrkdi8be7n4hhqoz9rpzrgd68u9dr3zsxgmy",
          seed: "0.0.0.0",
        },
      ],
    },
  };
}

export function configFixtureHeartwood() {
  window.APP_CONFIG = {
    reactions: [],
    seeds: {
      pinned: [{ host: "0.0.0.0", emoji: "🚀" }],
    },
    projects: {
      pinned: [
        {
          name: "source-browsing",
          id: "rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
          seed: "0.0.0.0",
        },
      ],
    },
  };
}

export const aliceMainHead = "fcc929424b82984b7cbff9c01d2e20d9b1249842";
export const aliceRemote = process.env.HEARTWOOD
  ? "z6MknSLrJoTcukLrE435hVNQT4JUhbvWLX4kUzqkEStBU8Vi"
  : "hybg18bc4cu8z9xtj44skxperfdpxpp1wp8zygyzti5kfiggdizfxy";
export const bobRemote = process.env.HEARTWOOD
  ? "z6MksMTThc1aDU2Ztc43jJUivuyBLNWiLsDf4X65rABe7HbA"
  : "hyyzz9w4ffg16zftjki3enajm4mkqkayb5ch1p6ns3f83np1hqkrp6";
export const rid = process.env.HEARTWOOD
  ? "zKtT7DmF9H34KkvcKj9PHW19WzjT"
  : "hnrkdi8be7n4hhqoz9rpzrgd68u9dr3zsxgmy";
export const ridPrefix = process.env.HEARTWOOD ? "rad:" : "rad:git:";
export const projectFixtureUrl = `/seeds/0.0.0.0/${ridPrefix}${rid}`;
export const seedPort = process.env.HEARTWOOD ? 8080 : "8777";
export const seedVersion = process.env.HEARTWOOD ? "0.1.0" : "0.2.0";
export const seedRemote = process.env.HEARTWOOD
  ? "z6Mkk7oqY4pPxhMmGEotDYsFo97vhCj85BLY1H256HrJmjN8"
  : "hybuytx44z9cfsm5739wecia9j4b7expgc15qkazph59szp57m4d3o";
