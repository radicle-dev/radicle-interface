import type { ExecaChildProcess, Options } from "execa";

import * as Stream from "node:stream";
import onExit from "exit-hook";
import { StringDecoder } from "string_decoder";
import { execa } from "execa";

import { logPrefix } from "./logPrefix.js";

// Processes that should be SIGKILLed when the Node process shutsdown.
// We add all proxy and node instances that we spawn to this list.
const processes: ExecaChildProcess[] = [];

onExit(killAllProcesses);

// Kill all processes with SIGKILL
export function killAllProcesses(): void {
  for (const process of processes) {
    if (process.exitCode === null) {
      process.kill("SIGKILL");
    }
  }
}

// Spawn a process with `execa` and register it.
//
// The process will be killed by `killAllProcesses`.
export function spawn(
  bin: string,
  args: string[],
  options?: Options,
): ExecaChildProcess {
  const child = execa(bin, args, options);
  processes.push(child);
  return child;
}

// Forwards piped `stdout` and `stderr` of a child process to `output`
// and prefixes it with the given label. The prefix is colored.
export function prefixOutput(
  childProcess: ExecaChildProcess,
  label: string,
  output: Stream.Writable,
): ExecaChildProcess {
  const pref = logPrefix(label);
  if (childProcess.stdout) {
    const stdoutPrefix = new LinePrefix(pref);
    childProcess.stdout.pipe(stdoutPrefix).pipe(output, { end: false });
  }
  if (childProcess.stderr) {
    const stderrPrefix = new LinePrefix(pref);
    childProcess.stderr.pipe(stderrPrefix).pipe(output, { end: false });
  }

  return childProcess;
}

// A transform that prefixes each line from the source with the given
// string and pushes it to the sink.
class LinePrefix extends Stream.Transform {
  private buffer: string = "";
  private stringDecoder = new StringDecoder();

  public constructor(private prefix: string) {
    super();
  }

  public _transform(data: Buffer, _encoding: string, next: () => void): void {
    const str = this.buffer + this.stringDecoder.write(data);
    const lines = str.split(/\r?\n/);
    this.buffer = lines.pop() || "";
    lines.forEach(line => this.push(`${this.prefix}${line}\n`));
    next();
  }

  public _flush(done: () => void): void {
    const rest = `${this.buffer}${this.stringDecoder.end()}`;
    if (rest) {
      this.push(`${this.prefix}${rest}\n`);
    }
    done();
  }
}
