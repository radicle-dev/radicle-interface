/* eslint-disable @typescript-eslint/naming-convention */
import type * as Stream from "node:stream";

import * as Fs from "node:fs/promises";
import * as FsSync from "node:fs";
import * as Path from "node:path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { test as base, expect } from "@playwright/test";

import * as Process from "./process.js";
import * as logLabel from "@tests/support/logLabel.js";
import { createPeerManager } from "./peerManager.js";

export { expect };

const filename = fileURLToPath(import.meta.url);
export const supportDir = dirname(filename);
export const tmpDir = Path.resolve(supportDir, "..", "./tmp");
const fixturesDir = Path.resolve(supportDir, "..", "./fixtures");

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
            .includes("Please make sure it wasn't preloaded for nothing.") ||
          // @sinonjs/fake-timers uses a global variable called `timers` which
          // is also used by node, so vite erronously detects this and shows a
          // warning whenever we install fake timers in tests. We suppress the
          // warning here to avoid clogging the logs. For more info see:
          //
          //   https://vitejs.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility
          msg
            .text()
            .startsWith(
              'Module "timers" has been externalized for browser compatibility.',
            )
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
              defaultHttpdPort: 8080,
              defaultHttpdScheme: "http",
              defaultNodePort: 8776,
              pinned: [
                {
                  baseUrl: {
                    hostname: "127.0.0.1",
                    port: 8080,
                    scheme: "http",
                  },
                },
              ],
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
          return route.fulfill({
            status: 200,
            path: "./public/radicle.svg",
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

export function appConfigWithFixture() {
  window.APP_CONFIG = {
    reactions: [],
    seeds: {
      defaultHttpdPort: 8080,
      defaultHttpdScheme: "http",
      defaultNodePort: 8776,
      pinned: [
        {
          baseUrl: {
            hostname: "127.0.0.1",
            port: 8080,
            scheme: "http",
          },
        },
      ],
    },
    projects: {
      pinned: [
        {
          name: "source-browsing",
          id: "rad:z4BwwjPCFNVP27FwVbDFgwVwkjcir",
          baseUrl: {
            hostname: "127.0.0.1",
            port: 8080,
            scheme: "http",
          },
        },
      ],
    },
  };
}

export async function startPalmHttpd() {
  const peerManager = await createPeerManager({
    dataDir: Path.resolve(Path.join(tmpDir, "peers")),
    outputLog: FsSync.createWriteStream(Path.resolve(Path.join(tmpDir, "log"))),
  });
  const palm = await peerManager.startPeer({ name: "palm" });
  await palm.startHttpd();
}

export async function createSeedFixture() {
  const projectName = "source-browsing";
  const sourceBrowsingDir = Path.join(tmpDir, "repos", projectName);
  await Fs.mkdir(sourceBrowsingDir, { recursive: true });
  await Process.spawn("tar", [
    "-xf",
    Path.join(fixturesDir, `repos/${projectName}.tar.bz2`),
    "-C",
    sourceBrowsingDir,
  ]);
  // Workaround for fixing MaxListenersExceededWarning.
  // Since every prefixOutput stream adds stream listeners that don't autoClose.
  // TODO: We still seem to have some descriptors left open when running vitest, which we should handle.
  const peerManager = await createPeerManager({
    dataDir: Path.resolve(Path.join(tmpDir, "peers")),
    outputLog: FsSync.createWriteStream(
      Path.join(tmpDir, "log"),
    ).setMaxListeners(20),
  });
  const palm = await peerManager.startPeer({ name: "palm" });
  await palm.startHttpd();
  const alice = await peerManager.startPeer({
    name: "alice",
    gitOptions: gitOptions["alice"],
  });
  const bob = await peerManager.startPeer({
    name: "bob",
    gitOptions: gitOptions["bob"],
  });
  await palm.startNode({ trackingPolicy: "track", trackingScope: "all" });
  await alice.startNode();
  await bob.startNode();
  await alice.connect(palm);
  await bob.connect(palm);

  await alice.git(["clone", sourceBrowsingDir], { cwd: alice.checkoutPath });
  await alice.git(["checkout", "feature/branch"]);
  await alice.git(["checkout", "orphaned-branch"]);
  await alice.git(["checkout", "main"]);
  await alice.rad([
    "init",
    "--name",
    projectName,
    "--default-branch",
    "main",
    "--description",
    "Git repository for source browsing tests",
    "--announce",
  ]);
  // Needed due to rad init not pushing all branches.
  await alice.git(["push", "rad", "--all"]);
  await alice.rad(["track", bob.nodeId]);

  await alice.waitForRoutes(rid, alice.nodeId, palm.nodeId);
  await bob.waitForRoutes(rid, alice.nodeId, palm.nodeId);
  await palm.waitForRoutes(rid, alice.nodeId, palm.nodeId);

  await bob.rad(["clone", rid], { cwd: bob.checkoutPath });

  await alice.waitForRoutes(rid, alice.nodeId, palm.nodeId, bob.nodeId);
  await bob.waitForRoutes(rid, alice.nodeId, palm.nodeId, bob.nodeId);
  await palm.waitForRoutes(rid, alice.nodeId, palm.nodeId, bob.nodeId);

  await Fs.writeFile(
    Path.join(bob.checkoutPath, "source-browsing", "README.md"),
    "Updated readme",
  );
  await bob.git(["add", "README.md"]);
  await bob.git([
    "commit",
    "--message",
    "Update readme",
    "--date",
    "Mon Dec 21 14:00 2022 +0100",
  ]);
  await bob.git(["push", "rad"]);
}

export const aliceMainHead = "fcc929424b82984b7cbff9c01d2e20d9b1249842";
export const aliceRemote =
  "did:key:z6MkqGC3nWZhYieEVTVDKW5v588CiGfsDSmRVG9ZwwWTvLSK";
export const bobRemote =
  "did:key:z6Mkg49NtQR2LyYRDCQFK4w1VVHqhypZSSRo7HsyuN7SV7v5";
export const bobHead = "ec5eb0b5efb73da17a2d25454cc47eea3967f328";
export const rid = "rad:z4BwwjPCFNVP27FwVbDFgwVwkjcir";
export const projectFixtureUrl = `/seeds/127.0.0.1/${rid}`;
export const seedPort = 8080;
export const seedRemote = "z6MktULudTtAsAhRegYPiZ6631RV3viv12qd4GQF8z1xB22S";
export const gitOptions = {
  alice: {
    GIT_AUTHOR_NAME: "Alice Liddell",
    GIT_AUTHOR_EMAIL: "alice@radicle.xyz",
    GIT_AUTHOR_DATE: "1671125284",
    GIT_COMMITTER_NAME: "Alice Liddell",
    GIT_COMMITTER_EMAIL: "alice@radicle.xyz",
    GIT_COMMITTER_DATE: "1671125284",
  },
  bob: {
    GIT_AUTHOR_NAME: "Bob Belcher",
    GIT_AUTHOR_EMAIL: "bob@radicle.xyz",
    GIT_AUTHOR_DATE: "1671125284",
    GIT_COMMITTER_NAME: "Bob Belcher",
    GIT_COMMITTER_EMAIL: "bob@radicle.xyz",
    GIT_COMMITTER_DATE: "Mon Dec 21 14:00 2022 +0100",
  },
};
