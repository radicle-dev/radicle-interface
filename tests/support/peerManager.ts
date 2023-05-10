/* eslint-disable @typescript-eslint/naming-convention */
import type { ExecaChildProcess, Options } from "execa";

import * as Fs from "node:fs/promises";
import * as Path from "node:path";
import * as Stream from "node:stream";
import getPort from "get-port";
import waitOn from "wait-on";
import { execa } from "execa";

import * as Process from "./process.js";

interface PeerManagerParams {
  dataPath: string;
  seed: string;
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

export function generateSeed(index: number) {
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
      Path.join(createParams.dataDir, "peer-manager.log"),
      "a",
    );
    outputLog = outputLogFile.createWriteStream();
  }

  const nodes: RadiclePeer[] = [];
  return {
    // Starts a new node and registers it.
    async startPeer(params) {
      const peer = await RadiclePeer.create({
        dataPath: createParams.dataDir,
        name: params.name,
        gitOptions: params.gitOptions,
        seed: generateSeed(nodes.length + 1),
        outputLog,
      });
      nodes.push(peer);

      return peer;
    },
  };
}

export class RadiclePeer {
  public checkoutPath: string;
  public nodeId: string;

  #seed: string;
  #radHome: string;
  #outputLog: Stream.Writable;
  #gitOptions?: Record<string, string>;
  #listenSocketAddr?: string;

  private constructor(props: {
    checkoutPath: string;
    nodeId: string;
    seed: string;
    gitOptions?: Record<string, string>;
    radHome: string;
    logFile: Stream.Writable;
  }) {
    this.checkoutPath = props.checkoutPath;
    this.nodeId = props.nodeId;
    this.#gitOptions = props.gitOptions;
    this.#seed = props.seed;
    this.#radHome = props.radHome;
    this.#outputLog = props.logFile;
  }

  public static async create({
    dataPath,
    name,
    gitOptions,
    seed,
    outputLog: logFile,
  }: PeerManagerParams): Promise<RadiclePeer> {
    const checkoutPath = Path.join(dataPath, name, "copy");
    await Fs.mkdir(checkoutPath, { recursive: true });
    const radHome = Path.join(dataPath, name, "home");
    await Fs.mkdir(radHome, { recursive: true });

    const env = {
      ...gitOptions,
      RAD_HOME: radHome,
      RAD_PASSPHRASE: "asdf",
      RAD_SEED: seed,
    };

    await execa("rad", ["auth"], { env });
    const { stdout: nodeId } = await execa("rad", ["self", "--nid"], { env });

    return new RadiclePeer({
      checkoutPath,
      gitOptions,
      seed,
      nodeId,
      radHome,
      logFile,
    });
  }

  public async startHttpd() {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.spawn("radicle-httpd");

    await waitOn({
      resources: ["tcp:127.0.0.1:8080"],
      timeout: 7000,
    });
  }

  public async startNode(params?: {
    connect?: RadiclePeer;
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
    if (params?.connect) {
      args.push(
        "--connect",
        `${params.connect.nodeId}@${params.connect.#listenSocketAddr}`,
      );
    }
    if (params?.trackingScope) {
      args.push("--tracking-scope", params.trackingScope);
    }
    if (params?.trackingPolicy) {
      args.push("--tracking-policy", params.trackingPolicy);
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.spawn("radicle-node", args);

    await waitOn({
      resources: [`tcp:${this.#listenSocketAddr}`],
      timeout: 7000,
    });
  }

  public uiUrl(): string {
    return `/seeds/127.0.0.1:8080`;
  }
  public ridUrl(rid: string): string {
    return `/seeds/127.0.0.1:8080/${rid}`;
  }

  public git(args: string[] = [], opts?: Options): ExecaChildProcess {
    return this.spawn("git", args, {
      cwd: Path.join(this.checkoutPath, "source-browsing"),
      ...opts,
    });
  }

  public rad(args: string[] = [], opts?: Options): ExecaChildProcess {
    return this.spawn("rad", args, {
      cwd: Path.join(this.checkoutPath, "source-browsing"),
      ...opts,
    });
  }

  public spawn(
    cmd: string,
    args: string[] = [],
    opts?: Options,
  ): ExecaChildProcess {
    opts = {
      ...opts,
      env: {
        ...opts?.env,
        ...this.#gitOptions,
        GIT_CONFIG_GLOBAL: "/dev/null",
        GIT_CONFIG_NOSYSTEM: "1",
        RAD_HOME: this.#radHome,
        RAD_PASSPHRASE: "asdf",
        RAD_SEED: this.#seed,
      },
    };
    const childProcess = Process.spawn(cmd, args, opts);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    Process.prefixOutput(childProcess, this.nodeId, this.#outputLog);

    return childProcess;
  }
}
