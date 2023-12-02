/* eslint-disable @typescript-eslint/naming-convention */
import type { BaseUrl } from "@httpd-client";
import type { ExecaChildProcess, Options as ExecaOptions } from "execa";

import * as Fs from "node:fs/promises";
import * as Os from "node:os";
import * as Path from "node:path";
import * as Stream from "node:stream";
import * as Util from "node:util";
import getPort from "get-port";
import matches from "lodash/matches.js";
import waitOn from "wait-on";
import { execa } from "execa";
import * as readline from "node:readline/promises";

import * as Process from "./process.js";
import { randomTag } from "@tests/support/support.js";
import { sleep } from "@app/lib/sleep.js";
import { array, boolean, literal, number, object, string, union, z } from "zod";
import { logPrefix } from "./logPrefix.js";

export type RefsUpdate =
  | { updated: { name: string; old: string; new: string } }
  | { created: { name: string; oid: string } }
  | { deleted: { name: string; oid: string } }
  | { skipped: { name: string; oid: string } };

export type NodeEvent =
  | {
      type: "refsFetched";
      remote: string;
      rid: string;
      updated: RefsUpdate[];
    }
  | {
      type: "refsSynced";
      remote: string;
      rid: string;
    }
  | {
      type: "seedDiscovered";
      rid: string;
      nid: string;
    }
  | {
      type: "seedDropped";
      nid: string;
      rid: string;
    }
  | {
      type: "peerConnected";
      nid: string;
    }
  | {
      type: "peerDisconnected";
      nid: string;
      reason: string;
    };

export interface RoutingEntry {
  nid: string;
  rid: string;
}

interface PeerManagerParams {
  dataPath: string;
  radSeed: string;
  // Name for easy identification. Used on file system and in logs.
  name: string;
  gitOptions?: Record<string, string>;
  outputLog: Stream.Writable;
}

export interface PeerManager {
  createPeer(params: {
    name: string;
    gitOptions?: Record<string, string>;
  }): Promise<RadiclePeer>;
}

export async function createPeerManager(createParams: {
  dataDir: string;
  outputLog?: Stream.Writable;
}): Promise<PeerManager> {
  let outputLog: Stream.Writable;
  let outputLogFile: Fs.FileHandle;
  if (createParams.outputLog) {
    outputLog = createParams.outputLog;
  } else {
    outputLogFile = await Fs.open(
      Path.join(createParams.dataDir, "peerManager.log"),
      "a",
    );
    outputLog = outputLogFile.createWriteStream();
  }

  const peers: RadiclePeer[] = [];
  return {
    async createPeer(params) {
      const peer = await RadiclePeer.create({
        dataPath: createParams.dataDir,
        name: params.name,
        gitOptions: params.gitOptions,
        radSeed: Array(64)
          .fill((peers.length + 1).toString())
          .join(""),
        outputLog,
      });
      peers.push(peer);

      return peer;
    },
  };
}

export const NodeConfigSchema = object({
  node: object({
    alias: string(),
    peers: union([
      object({ type: literal("static") }),
      object({ type: literal("dynamic"), target: number() }),
    ]),
    connect: array(string()),
    externalAddresses: array(string()),
    network: union([literal("main"), literal("test")]),
    relay: boolean(),
    limits: object({
      routingMaxSize: number(),
      routingMaxAge: number(),
      fetchConcurrency: number(),
      gossipMaxAge: number(),
      rate: object({
        inbound: object({ fillRate: number(), capacity: number() }),
        outbound: object({ fillRate: number(), capacity: number() }),
      }),
    }),
    policy: union([literal("allow"), literal("block")]),
    scope: union([literal("followed"), literal("all")]),
  }),
});

export interface NodeConfig extends z.infer<typeof NodeConfigSchema> {}

// Options passed to `RadiclePeer#rad` and `RadiclePeer#git` that control how
// the process is spawned.
interface SpawnOptions extends ExecaOptions {
  // Sets the prefix for the commands output in the logs. If `null`, does not
  // log any output. Defaults to `<peer name> <binary name>`.
  logPrefix?: string | null;
}

export class RadiclePeer {
  public checkoutPath: string;
  public nodeId: string;

  #radSeed: string;
  #socket: string;
  #radHome: string;
  #eventRecords: NodeEvent[] = [];
  #outputLog: Stream.Writable;
  #gitOptions?: Record<string, string>;
  #listenSocketAddr?: string;
  #httpdBaseUrl?: BaseUrl;
  #nodeProcess?: ExecaChildProcess;
  #httpdProcess?: ExecaChildProcess;
  // Name for easy identification. Used on file system and in logs.
  #name: string;

  private constructor(props: {
    checkoutPath: string;
    nodeId: string;
    radSeed: string;
    socket: string;
    gitOptions?: Record<string, string>;
    radHome: string;
    logFile: Stream.Writable;
    name: string;
  }) {
    this.checkoutPath = props.checkoutPath;
    this.nodeId = props.nodeId;
    this.#gitOptions = props.gitOptions;
    this.#radSeed = props.radSeed;
    this.#socket = props.socket;
    this.#radHome = props.radHome;
    this.#outputLog = props.logFile;
    this.#name = props.name;
  }

  public async waitForEvent(searchEvent: NodeEvent, timeoutInMs: number) {
    const start = new Date().getTime();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (this.#eventRecords.find(matches(searchEvent))) {
        return;
      }
      if (new Date().getTime() - start > timeoutInMs) {
        throw Error(
          `Timeout waiting for event on node ${this.#name} ${Util.inspect(
            searchEvent,
            { depth: null },
          )}`,
        );
      }
      await sleep(100);
    }
  }

  public static async create({
    dataPath,
    name,
    gitOptions,
    radSeed: node,
    outputLog: logFile,
  }: PeerManagerParams): Promise<RadiclePeer> {
    const checkoutPath = Path.join(dataPath, name, "copy");
    await Fs.mkdir(checkoutPath, { recursive: true });
    const radHome = Path.join(dataPath, name, "home");
    await Fs.mkdir(radHome, { recursive: true });

    const socketDir = await Fs.mkdtemp(
      Path.join(Os.tmpdir(), `radicle-${randomTag()}`),
    );
    const socket = Path.join(socketDir, "control.sock");

    const env = {
      ...gitOptions,
      RAD_HOME: radHome,
      RAD_PASSPHRASE: "asdf",
      RAD_SEED: node,
      RAD_SOCKET: socket,
    };

    await execa("rad", ["auth", "--alias", name], { env });
    const { stdout: nodeId } = await execa("rad", ["self", "--nid"], { env });

    return new RadiclePeer({
      checkoutPath,
      gitOptions,
      radSeed: node,
      socket,
      nodeId,
      radHome,
      logFile,
      name,
    });
  }

  public async startHttpd(port?: number): Promise<void> {
    if (!port) {
      port = await getPort();
    }
    this.#httpdBaseUrl = {
      hostname: "127.0.0.1",
      port,
      scheme: "http",
    };
    this.#httpdProcess = this.spawn("radicle-httpd", [
      "--listen",
      `${this.#httpdBaseUrl.hostname}:${this.#httpdBaseUrl.port}`,
    ]);

    await waitOn({
      resources: [
        `tcp:${this.#httpdBaseUrl.hostname}:${this.#httpdBaseUrl.port}`,
      ],
      timeout: 2000,
    });
  }

  public async stopHttpd() {
    if (!this.#httpdBaseUrl || !this.#httpdProcess) {
      throw new Error("No httpd service running");
    }
    this.#httpdProcess?.kill("SIGTERM");

    await waitOn({
      resources: [
        `tcp:${this.#httpdBaseUrl.hostname}:${this.#httpdBaseUrl.port}`,
      ],
      reverse: true,
      timeout: 2000,
    });

    this.#httpdBaseUrl = undefined;
  }

  public async startNode(nodeParams: Partial<NodeConfig["node"]> = {}) {
    const listenPort = await getPort();
    this.#listenSocketAddr = `0.0.0.0:${listenPort}`;

    await updateNodeConfig(this.#radHome, nodeParams);

    // Because of a bug in `radicle-node`, `limits.gossipMaxAge` is not included
    // in the default config. We add it manually.
    await updateNodeConfig(this.#radHome, {
      limits: {
        routingMaxSize: 1000,
        routingMaxAge: 604800,
        fetchConcurrency: 1,
        gossipMaxAge: 1209600,
        rate: {
          inbound: { fillRate: 0.2, capacity: 32 },
          outbound: { fillRate: 1.0, capacity: 64 },
        },
      },
    });

    this.#nodeProcess = this.spawn("radicle-node", [
      "--listen",
      this.#listenSocketAddr,
    ]);

    await waitOn({
      resources: [`socket:${this.#socket}`],
      timeout: 2000,
    });

    const { stdout } = this.rad(["node", "events"], {
      cwd: this.#radHome,
      logPrefix: null,
    });

    if (!stdout) {
      throw new Error("Could not get stdout to track events");
    }

    readline
      .createInterface({
        input: stdout,
        terminal: false,
      })
      .on("line", line => {
        let event;
        try {
          event = JSON.parse(line);
        } catch (e) {
          console.log("Error parsing event", line);
          return;
        }

        this.#eventRecords.push(event);
        for (const line of Util.inspect(event, { depth: null }).split("\n")) {
          this.#outputLog.write(
            `${logPrefix(`${this.#name} node events`)} ${line}\n`,
          );
        }
      });
  }

  public async stopNode() {
    this.#nodeProcess?.kill("SIGTERM");

    await waitOn({
      resources: [`socket:${this.#socket}`],
      reverse: true,
      timeout: 2000,
    });
  }

  public get address(): string {
    if (!this.#listenSocketAddr) {
      throw new Error("Remote node has no listen addr yet");
    }
    return `${this.nodeId}@${this.#listenSocketAddr}`;
  }

  public uiUrl(): string {
    if (!this.#httpdBaseUrl) {
      throw new Error("No httpd service running");
    }

    return `/nodes/${this.#httpdBaseUrl.hostname}:${this.#httpdBaseUrl.port}`;
  }

  public ridUrl(rid: string): string {
    return `/nodes/${this.httpdBaseUrl.hostname}:${this.httpdBaseUrl.port}/${rid}`;
  }

  public get httpdBaseUrl(): BaseUrl {
    if (!this.#httpdBaseUrl) {
      throw new Error("No httpd service running");
    }

    return this.#httpdBaseUrl;
  }

  public git(args: string[] = [], opts?: SpawnOptions): ExecaChildProcess {
    return this.spawn("git", args, { ...opts });
  }

  public rad(args: string[] = [], opts?: SpawnOptions): ExecaChildProcess {
    return this.spawn("rad", args, { ...opts });
  }

  public spawn(
    cmd: string,
    args: string[] = [],
    opts?: SpawnOptions,
  ): ExecaChildProcess {
    opts = {
      ...opts,
      env: {
        GIT_CONFIG_GLOBAL: "/dev/null",
        GIT_CONFIG_NOSYSTEM: "1",
        RAD_HOME: this.#radHome,
        RAD_PASSPHRASE: "asdf",
        RAD_COMMIT_TIME: "1671125284",
        RAD_SEED: this.#radSeed,
        RAD_SOCKET: this.#socket,
        ...opts?.env,
        ...this.#gitOptions,
      },
    };
    const childProcess = Process.spawn(cmd, args, opts);

    if (opts.logPrefix !== null) {
      void Process.prefixOutput(
        childProcess,
        opts.logPrefix || `${this.#name} ${cmd}`,
        this.#outputLog,
      );
    }

    return childProcess;
  }
}

async function updateNodeConfig(
  radHome: string,
  nodeParams: Partial<NodeConfig["node"]>,
) {
  const configPath = Path.join(radHome, "config.json");
  const config = await Fs.readFile(configPath, "utf-8");
  const nodeConfig = NodeConfigSchema.parse(JSON.parse(config));
  nodeConfig.node = {
    ...nodeConfig.node,
    network: "test",
    ...nodeParams,
  };
  await Fs.writeFile(configPath, JSON.stringify(nodeConfig), "utf-8");
}
