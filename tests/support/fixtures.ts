/* eslint-disable @typescript-eslint/naming-convention */
import type * as Stream from "node:stream";
import type { PeerManager, RadiclePeer } from "./peerManager.js";

import * as Fs from "node:fs/promises";
import * as FsSync from "node:fs";
import * as Path from "node:path";
import { test as base, expect, type ViewportSize } from "@playwright/test";

import * as Process from "./process.js";
import * as issue from "@tests/support/cobs/issue.js";
import * as logLabel from "@tests/support/logLabel.js";
import * as patch from "@tests/support/cobs/patch.js";
import { createOptions, supportDir, tmpDir } from "@tests/support/support.js";
import { createPeerManager } from "@tests/support/peerManager.js";
import { createProject } from "@tests/support/project.js";
import { object, string, ZodSchema } from "zod";

export { expect };

const fixturesDir = Path.resolve(supportDir, "..", "./fixtures");

type ViewportTypes = "iPhoneXR" | "Desktop";

interface Auth {
  sessionId: string;
  publicKey: string;
  signature: string;
}

const authSchema = object({
  sessionId: string(),
  publicKey: string(),
  signature: string(),
}) satisfies ZodSchema<Auth>;

export const viewportSizes: Record<ViewportTypes, ViewportSize> = {
  iPhoneXR: { width: 414, height: 896 },
  Desktop: { width: 1280, height: 720 },
};

export const test = base.extend<{
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  forAllTests: void;
  customAppConfig: boolean;
  stateDir: string;
  peerManager: PeerManager;
  authenticatedPeer: RadiclePeer;
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

  peerManager: async ({ stateDir, outputLog }, use) => {
    const peerManager = await createPeerManager({
      dataDir: Path.resolve(Path.join(stateDir, "peers")),
      outputLog,
    });
    await use(peerManager);
  },

  authenticatedPeer: async ({ page, peerManager }, use) => {
    const peer = await peerManager.startPeer({
      name: "httpd",
      gitOptions: gitOptions["bob"],
    });

    await peer.startHttpd(8070);
    await peer.startNode();
    await page.goto("/");
    await page.getByRole("button", { name: "radicle.local" }).click();
    await page.locator('input[name="port"]').fill("8070");
    await page.locator('input[name="port"]').press("Enter");
    const { stdout } = await peer.rad([
      "web",
      "--frontend",
      "http://localhost:3001",
      "--backend",
      "http://127.0.0.1:8070",
      "--json",
    ]);
    const result = authSchema.safeParse(JSON.parse(stdout));
    if (result.success) {
      const { sessionId, publicKey, signature } = result.data;
      await page.goto(`/session/${sessionId}?pk=${publicKey}&sig=${signature}`);
      await expect(page.getByText("Authenticated")).toBeVisible();
      await page.getByRole("button", { name: "Close" }).click();
    } else {
      throw new Error("Not able to parse rad web output");
    }

    await use(peer);

    await peer.stopHttpd(8070);
    await peer.stopNode();
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
  await palm.startHttpd(8080);
}

export async function createSourceBrowsingFixture(
  peerManager: PeerManager,
  palm: RadiclePeer,
) {
  const projectName = "source-browsing";
  const sourceBrowsingDir = Path.join(tmpDir, "repos", projectName);
  await Fs.mkdir(sourceBrowsingDir, { recursive: true });
  await Process.spawn("tar", [
    "-xf",
    Path.join(fixturesDir, `repos/${projectName}.tar.bz2`),
    "-C",
    sourceBrowsingDir,
  ]);
  const rid = sourceBrowsingRid;
  const alice = await peerManager.startPeer({
    name: "alice",
    gitOptions: gitOptions["alice"],
  });
  const aliceProjectPath = Path.join(alice.checkoutPath, "source-browsing");
  const bob = await peerManager.startPeer({
    name: "bob",
    gitOptions: gitOptions["bob"],
  });
  const bobProjectPath = Path.join(bob.checkoutPath, "source-browsing");
  await alice.startNode();
  await bob.startNode();
  await alice.connect(palm);
  await bob.connect(palm);

  await alice.git(["clone", sourceBrowsingDir], { cwd: alice.checkoutPath });
  await alice.git(["checkout", "feature/branch"], { cwd: aliceProjectPath });
  await alice.git(["checkout", "feature/move-copy-files"], {
    cwd: aliceProjectPath,
  });
  await alice.git(["checkout", "orphaned-branch"], { cwd: aliceProjectPath });
  await alice.git(["checkout", "main"], { cwd: aliceProjectPath });
  await alice.rad(
    [
      "init",
      "--name",
      projectName,
      "--default-branch",
      "main",
      "--description",
      "Git repository for source browsing tests",
      "--announce",
    ],
    { cwd: aliceProjectPath },
  );
  // Needed due to rad init not pushing all branches.
  await alice.git(["push", "rad", "--all"], { cwd: aliceProjectPath });
  await alice.rad(["track", bob.nodeId], { cwd: aliceProjectPath });

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
  await bob.git(["add", "README.md"], { cwd: bobProjectPath });
  await bob.git(
    [
      "commit",
      "--message",
      "Update readme",
      "--date",
      "Mon Dec 21 14:00 2022 +0100",
    ],
    { cwd: bobProjectPath },
  );
  await bob.git(["push", "rad"], { cwd: bobProjectPath });

  await bob.waitForEvent(
    { type: "refs-synced", remote: palm.nodeId, rid },
    2000,
  );
  await bob.waitForEvent(
    { type: "refs-synced", remote: alice.nodeId, rid },
    2000,
  );
  await alice.stopNode();
  await bob.stopNode();
}

export async function createCobsFixture(peer: RadiclePeer) {
  await peer.rad(["track", peer.nodeId, "--alias", "palm"]);
  await Fs.mkdir(Path.join(tmpDir, "repos", "cobs"));
  const { projectFolder, defaultBranch } = await createProject(peer, "cobs");
  const issueOne = await issue.create(
    peer,
    "This `title` has **markdown**",
    "This is a description\nWith some multiline text.",
    ["bug", "feature-request"],
    { cwd: projectFolder },
  );
  await peer.rad(
    ["assign", issueOne, "--to", `did:key:${peer.nodeId}`],
    createOptions(projectFolder, 1),
  );
  const { stdout: commentIssueOne } = await peer.rad(
    [
      "comment",
      issueOne,
      "--message",
      "This is a multiline comment\n\nWith some more text.",
    ],
    createOptions(projectFolder, 2),
  );
  await peer.rad(
    [
      "comment",
      issueOne,
      "--message",
      "This is a reply, to a first comment.",
      "--reply-to",
      commentIssueOne,
    ],
    createOptions(projectFolder, 3),
  );
  await peer.rad(
    [
      "comment",
      issueOne,
      "--message",
      "A root level comment after a reply, for margins sake.",
    ],
    createOptions(projectFolder, 4),
  );

  const issueTwo = await issue.create(
    peer,
    "A closed issue",
    "This issue has been closed\n\nsource: [link](https://radicle.xyz)",
    [],
    { cwd: projectFolder },
  );
  await peer.rad(
    ["issue", "state", issueTwo, "--closed"],
    createOptions(projectFolder, 1),
  );

  const issueThree = await issue.create(
    peer,
    "A solved issue",
    "This issue has been solved\n\n```js\nconsole.log('hello world')\nconsole.log(\"\")\n```",
    [],
    { cwd: projectFolder },
  );
  await peer.rad(
    ["issue", "state", issueThree, "--solved"],
    createOptions(projectFolder, 1),
  );

  const patchOne = await patch.create(
    peer,
    "Add README\n\nThis commit adds more information to the README",
    "feature/add-readme",
    () => Fs.writeFile(Path.join(projectFolder, "README.md"), "# Cobs Repo"),
    ["Let's add a README", "This repo needed a README"],
    { cwd: projectFolder },
  );
  const { stdout: commentPatchOne } = await peer.rad(
    ["comment", patchOne, "--message", "I'll review the patch"],
    createOptions(projectFolder, 1),
  );
  await peer.rad(
    [
      "comment",
      patchOne,
      "--message",
      "Thanks for that!",
      "--reply-to",
      commentPatchOne,
    ],
    createOptions(projectFolder, 2),
  );
  await peer.rad(
    [
      "comment",
      patchOne,
      "--message",
      "Yeah no problem!",
      "--reply-to",
      commentPatchOne,
    ],
    createOptions(projectFolder, 3),
  );
  const { stdout: commentTwo } = await peer.rad(
    ["comment", patchOne, "--message", "Looking good so far"],
    createOptions(projectFolder, 4),
  );
  await peer.rad(
    [
      "comment",
      patchOne,
      "--message",
      "Thanks again!",
      "--reply-to",
      commentTwo,
    ],
    createOptions(projectFolder, 5),
  );
  await peer.rad(
    ["review", patchOne, "-m", "LGTM", "--accept"],
    createOptions(projectFolder, 6),
  );
  await patch.merge(
    peer,
    defaultBranch,
    "feature/add-readme",
    createOptions(projectFolder, 7),
  );

  const patchTwo = await patch.create(
    peer,
    "Add subtitle to README",
    "feature/add-more-text",
    () =>
      Fs.appendFile(Path.join(projectFolder, "README.md"), "\n\n## Subtitle"),
    [],
    { cwd: projectFolder },
  );
  await peer.rad(
    ["review", patchTwo, "-m", "Not the README we are looking for", "--reject"],
    createOptions(projectFolder, 1),
  );

  const patchThree = await patch.create(
    peer,
    "Rewrite subtitle to README",
    "feature/better-subtitle",
    () =>
      Fs.appendFile(Path.join(projectFolder, "README.md"), "\n\n## Better?"),
    [
      "Taking another stab at the README",
      "This is a big improvement over the last one",
      "Hopefully **this** is the last time",
    ],
    { cwd: projectFolder },
  );
  await peer.rad(
    ["tag", patchThree, "documentation"],
    createOptions(projectFolder, 1),
  );
  await peer.rad(
    ["review", patchThree, "-m", "This looks better"],
    createOptions(projectFolder, 2),
  );
  await Fs.appendFile(
    Path.join(projectFolder, "README.md"),
    "\n\nHad to push a new revision",
  );
  await peer.git(["add", "."], { cwd: projectFolder });
  await peer.git(["commit", "-m", "Add more text"], { cwd: projectFolder });
  await peer.git(
    [
      "push",
      "-o",
      "patch.message=Most of the missing README text was caused by the git-daemon not having a writers block. It seems like using an RNG was not a good enough solution.",
      "-o",
      "patch.message=After this change, the README seem to be written correctly",
      "rad",
      "feature/better-subtitle",
    ],
    createOptions(projectFolder, 3),
  );
  await peer.rad(
    ["review", patchThree, "-m", "No this doesn't look better", "--reject"],
    createOptions(projectFolder, 2),
  );

  const patchFour = await patch.create(
    peer,
    "This patch is going to be archived",
    "feature/archived",
    () =>
      Fs.writeFile(Path.join(projectFolder, "CONTRIBUTING.md"), "# Archived"),
    [],
    { cwd: projectFolder },
  );
  await peer.rad(["review", patchFour], createOptions(projectFolder, 1));
  await peer.rad(
    ["patch", "archive", patchFour],
    createOptions(projectFolder, 2),
  );

  const patchFive = await patch.create(
    peer,
    "This patch is going to be reverted to draft",
    "feature/draft",
    () => Fs.writeFile(Path.join(projectFolder, "LICENSE"), "Draft"),
    [],
    { cwd: projectFolder },
  );
  await peer.rad(
    ["patch", "ready", patchFive, "--undo"],
    createOptions(projectFolder, 1),
  );
}

export async function createMarkdownFixture(peer: RadiclePeer) {
  await Fs.mkdir(Path.join(tmpDir, "repos", "markdown"));
  await Process.spawn("tar", [
    "-xf",
    Path.join(fixturesDir, "repos", "markdown.tar.bz2"),
    "-C",
    Path.join(tmpDir, "repos", "markdown"),
  ]);
  const { projectFolder } = await createProject(peer, "markdown");
  await Fs.cp(Path.join(tmpDir, "repos", "markdown"), projectFolder, {
    recursive: true,
  });

  await peer.git(["add", "."], { cwd: projectFolder });
  const commitMessage = `Add Markdown cheat sheet

  Borrowed from [Adam Pritchard][ap].
  No modifications were made.

  [ap]: https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet`;
  await peer.git(["commit", "-m", commitMessage], {
    cwd: projectFolder,
  });
  await peer.git(["push", "rad"], { cwd: projectFolder });
}

export const aliceMainHead = "dd068e9aff9a569e597f6abaf84f120dd0cbbd70";
export const aliceRemote =
  "did:key:z6MkqGC3nWZhYieEVTVDKW5v588CiGfsDSmRVG9ZwwWTvLSK";
export const bobRemote =
  "did:key:z6Mkg49NtQR2LyYRDCQFK4w1VVHqhypZSSRo7HsyuN7SV7v5";
export const bobHead = "28f37105bb78db48111e36281291ff253dd050e8";
export const sourceBrowsingRid = "rad:z4BwwjPCFNVP27FwVbDFgwVwkjcir";
export const cobRid = "rad:z3fpY7nttPPa6MBnAv2DccHzQJnqe";
export const markdownRid = "rad:z2tchH2Ti4LxRKdssPQYs6VHE5rsg";
export const sourceBrowsingUrl = `/seeds/127.0.0.1/${sourceBrowsingRid}`;
export const cobUrl = `/seeds/127.0.0.1/${cobRid}`;
export const markdownUrl = `/seeds/127.0.0.1/${markdownRid}`;
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
