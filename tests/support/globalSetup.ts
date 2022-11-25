import type { FullConfig } from "@playwright/test";

export default async function globalSetup(_config: FullConfig): Promise<void> {
  assertHttpApiRunning();
}

// Assert that the test http-api is running. If it is not running, throw an
// error that explains how to run it.
async function assertHttpApiRunning(): Promise<void> {
  const palmTestFixtureSeedId =
    "hybuytx44z9cfsm5739wecia9j4b7expgc15qkazph59szp57m4d3o";

  const notRunningMessage =
    "The http-api server with test fixtures needs to be running.\n" +
    "👉 You can start it with `./scripts/run-http-api-with-fixtures`\n";

  let peerId: string | undefined = undefined;

  try {
    const response = await fetch("http://0.0.0.0:8777");
    const data = await response.json();
    peerId = data.peer.id;
  } catch (err) {
    console.error(err);
    throw new Error(notRunningMessage);
  }

  if (peerId !== palmTestFixtureSeedId) {
    const wrongSeedMessage =
      "The server on port 8777 doesn't have the right fixtures.\n";
    throw new Error(wrongSeedMessage + notRunningMessage);
  }
}
