/* eslint-disable @typescript-eslint/naming-convention */
import type { BaseUrl } from "@httpd-client";
import type { ExecaChildProcess, Options } from "execa";

import * as Fs from "node:fs/promises";
import * as Os from "node:os";
import * as Path from "node:path";
import * as Stream from "node:stream";
import getPort from "get-port";
import lodash from "lodash";
import waitOn from "wait-on";
import { execa } from "execa";

import * as Process from "./process.js";
import { randomTag } from "@tests/support/support.js";
import { sleep } from "@app/lib/sleep.js";
import { array, boolean, literal, number, object, string, union, z } from "zod";

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
  node: string;
  name: string;
  gitOptions?: Record<string, string>;
  outputLog: Stream.Writable;
}

export interface PeerManager {
  startPeer(params: {
    name: string;
    gitOptions?: Record<string, string>;
  }): Promise<RadiclePeer>;
}

export function generateNode(index: number) {
  return Array(64).fill(index.toString()).join("");
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

  const nodes: RadiclePeer[] = [];
  return {
    async startPeer(params) {
      const peer = await RadiclePeer.create({
        dataPath: createParams.dataDir,
        name: params.name,
        gitOptions: params.gitOptions,
        node: generateNode(nodes.length + 1),
        outputLog,
      });
      nodes.push(peer);

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
    }),
    policy: union([literal("track"), literal("block")]),
    scope: union([literal("trusted"), literal("all")]),
  }),
});

export interface NodeConfig extends z.infer<typeof NodeConfigSchema> {}

export class RadiclePeer {
  public checkoutPath: string;
  public nodeId: string;

  #node: string;
  #socket: string;
  #radHome: string;
  #eventRecords: NodeEvent[] = [];
  #outputLog: Stream.Writable;
  #gitOptions?: Record<string, string>;
  #listenSocketAddr?: string;
  #httpdBaseUrl?: BaseUrl;
  #nodeProcess?: ExecaChildProcess;
  #httpdProcess?: ExecaChildProcess;

  private constructor(props: {
    checkoutPath: string;
    nodeId: string;
    node: string;
    socket: string;
    gitOptions?: Record<string, string>;
    radHome: string;
    logFile: Stream.Writable;
  }) {
    this.checkoutPath = props.checkoutPath;
    this.nodeId = props.nodeId;
    this.#gitOptions = props.gitOptions;
    this.#node = props.node;
    this.#socket = props.socket;
    this.#radHome = props.radHome;
    this.#outputLog = props.logFile;
  }

  public async waitForEvent(searchEvent: NodeEvent, timeoutInMs: number) {
    const start = new Date().getTime();

    while (new Date().getTime() - start > timeoutInMs) {
      this.#eventRecords.find(event => lodash.isEqual(searchEvent, event));
      await sleep(100);
    }
  }

  public static async create({
    dataPath,
    name,
    gitOptions,
    node,
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
    const config = await Fs.readFile(
      Path.join(radHome, "config.json"),
      "utf-8",
    );
    const parsedConfig = NodeConfigSchema.parse(JSON.parse(config));
    parsedConfig.node.network = "test";
    await Fs.writeFile(
      Path.join(radHome, "config.json"),
      JSON.stringify(parsedConfig),
      "utf-8",
    );
    const { stdout: nodeId } = await execa("rad", ["self", "--nid"], { env });

    return new RadiclePeer({
      checkoutPath,
      gitOptions,
      node,
      socket,
      nodeId,
      radHome,
      logFile,
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
      timeout: 7000,
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
    });

    this.#httpdBaseUrl = undefined;
  }

  public async startNode(params?: {
    trackingScope?: "trusted" | "all";
    trackingPolicy?: "track" | "block";
  }) {
    const gitPort = await getPort();
    const gitSocketAddr = `0.0.0.0:${gitPort}`;
    const listenPort = await getPort();
    this.#listenSocketAddr = `0.0.0.0:${listenPort}`;

    const args = [
      "--git-daemon",
      gitSocketAddr,
      "--listen",
      this.#listenSocketAddr,
    ];
    if (params?.trackingScope) {
      args.push("--tracking-scope", params.trackingScope);
    }
    if (params?.trackingPolicy) {
      args.push("--tracking-policy", params.trackingPolicy);
    }

    this.#nodeProcess = this.spawn("radicle-node", args);

    await waitOn({
      resources: [`socket:${this.#socket}`],
    });

    this.rad(["node", "events"], { cwd: this.#radHome }).stdout?.on(
      "data",
      (data: any) => {
        data
          .toString()
          .split("\n")
          .forEach((data: unknown) => {
            if (data && typeof data === "string" && data.trim() !== "") {
              try {
                const result: NodeEvent = JSON.parse(data);
                this.#eventRecords.push(result);
              } catch (e) {
                console.log("Error parsing event", data);
              }
            }
          });
      },
    );
  }

  public async stopNode() {
    this.#nodeProcess?.kill("SIGTERM");

    await waitOn({
      resources: [`socket:${this.#socket}`],
      reverse: true,
    });
  }

  public async waitForRoutes(rid: string, ...nodes: string[]) {
    let remaining = nodes;

    while (remaining.length > 0) {
      const { stdout: entries } = await this.rad([
        "node",
        "routing",
        "--rid",
        rid,
        "--json",
      ]);

      entries.split("\n").forEach(entry => {
        if (entry && entry.trim() !== "") {
          try {
            const result: RoutingEntry = JSON.parse(entry);
            remaining = remaining.filter(nid => result.nid !== nid);
          } catch (e) {
            console.log("Error parsing entry", entry);
          }
        }
      });

      await this.waitForEvent(
        { type: "seedDiscovered", rid, nid: this.nodeId },
        6000,
      );
    }
  }

  public async connect(remote: RadiclePeer) {
    if (!remote.#listenSocketAddr) {
      throw new Error("Remote node has no listen addr yet");
    }
    await this.rad(
      ["node", "connect", `${remote.nodeId}@${remote.#listenSocketAddr}`],
      { cwd: this.#radHome },
    );

    await this.waitForEvent(
      { type: "peerConnected", nid: remote.nodeId },
      1000,
    );
    await remote.waitForEvent(
      { type: "peerConnected", nid: this.nodeId },
      1000,
    );
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

  public git(args: string[] = [], opts?: Options): ExecaChildProcess {
    return this.spawn("git", args, { ...opts });
  }

  public rad(args: string[] = [], opts?: Options): ExecaChildProcess {
    return this.spawn("rad", args, { ...opts });
  }

  public spawn(
    cmd: string,
    args: string[] = [],
    opts?: Options,
  ): ExecaChildProcess {
    opts = {
      ...opts,
      env: {
        GIT_CONFIG_GLOBAL: "/dev/null",
        GIT_CONFIG_NOSYSTEM: "1",
        RAD_HOME: this.#radHome,
        RAD_PASSPHRASE: "asdf",
        RAD_COMMIT_TIME: "1671125284",
        RAD_SEED: this.#node,
        RAD_SOCKET: this.#socket,
        ...opts?.env,
        ...this.#gitOptions,
      },
    };
    const childProcess = Process.spawn(cmd, args, opts);

    void Process.prefixOutput(childProcess, this.nodeId, this.#outputLog);

    return childProcess;
  }
}
