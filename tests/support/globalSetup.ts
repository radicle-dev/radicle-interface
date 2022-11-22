import type { FullConfig } from "@playwright/test";

import { exec } from "child_process";

export default async function globalSetup(_config: FullConfig): Promise<void> {
  assertHttpApiRunning();
}

// Assert that the docker container with the test http-api is running. If it is
// not running, throw an error that explains how to run it.
async function assertHttpApiRunning(): Promise<void> {
  const containerName = "radicle-http-api-test";
  const notRunningMessage =
    "The http-api test container is required for this test.\n" +
    "👉 You can run it with `./scripts/http-api-test`\n";

  exec(
    `docker container inspect ${containerName} --format {{.State.Running}}`,
    (_error, stdout, _stderr) => {
      if (stdout.trim() !== "true") {
        throw new Error(notRunningMessage);
      }
    },
  );
}
