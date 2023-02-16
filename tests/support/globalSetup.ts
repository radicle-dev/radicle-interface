import type { FullConfig } from "@playwright/test";

import { seedPort, seedRemote } from "@tests/support/fixtures.js";

export default async function globalSetup(_config: FullConfig): Promise<void> {
  assertHttpApiRunning();
}

// Assert that the test http-api is running. If it is not running, throw an
// error that explains how to run it.
async function assertHttpApiRunning(): Promise<void> {
  const notRunningMessage =
    "The http-api server with test fixtures needs to be running.\n" +
    "👉 You can start it with `./scripts/run-httpd-with-fixtures`\n";

  let nodeId: string | undefined = undefined;

  try {
    const response = await fetch(`http://0.0.0.0:${seedPort}/api`);
    const data = await response.json();
    nodeId = data.node.id;
  } catch (err) {
    console.error(err);
    throw new Error(notRunningMessage);
  }

  if (nodeId !== seedRemote) {
    const wrongSeedMessage = `The server on port ${seedPort} doesn't have the right fixtures.\n`;
    throw new Error(wrongSeedMessage + notRunningMessage);
  }
}
