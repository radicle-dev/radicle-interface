import type { HttpdClient } from "@http-client";
import type { RadiclePeer } from "@tests/support/peerManager.js";

import assert from "node:assert";

export async function authenticate(
  api: HttpdClient,
  peer: RadiclePeer,
): Promise<string> {
  const { stdout } = await peer.spawn("rad-web", [
    "http://localhost:3001",
    "--no-open",
    "--connect",
    `${peer.httpdBaseUrl.hostname}:${peer.httpdBaseUrl.port}`,
  ]);
  const match = stdout.match(/Visit (http:\/\/\S+) to connect/);
  assert(
    match !== null && match[1],
    `Failed to get authentication URL from: ${stdout}`,
  );

  const authUrl = new URL(match[1]);
  const sessionId = authUrl.pathname.split("/")[2];

  await api.session.update(sessionId, {
    sig: authUrl.searchParams.get("sig")!,
    pk: authUrl.searchParams.get("pk")!,
  });
  return sessionId;
}
