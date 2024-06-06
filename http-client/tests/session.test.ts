import * as FsSync from "node:fs";
import * as Path from "node:path";
import { describe, test } from "vitest";

import { HttpdClient } from "@http-client";
import { authenticate } from "@http-client/tests/support/httpd.js";
import { createPeerManager } from "@tests/support/peerManager.js";
import { gitOptions } from "@tests/support/fixtures.js";
import { tmpDir } from "@tests/support/support.js";

describe("session", async () => {
  const peerManager = await createPeerManager({
    dataDir: Path.resolve(Path.join(tmpDir, "peers")),
    outputLog: FsSync.createWriteStream(
      Path.join(tmpDir, "peerManager.log"),
    ).setMaxListeners(16),
  });
  const peer = await peerManager.createPeer({
    name: "session",
    gitOptions: gitOptions["alice"],
  });
  await peer.startHttpd();
  const api = new HttpdClient(peer.httpdBaseUrl);

  test("#getById(id)", async () => {
    const id = await authenticate(api, peer);
    await api.session.getById(id);
  });

  test("#update(id, {sig, pk})", async () => {
    await authenticate(api, peer);
  });

  test("#delete(id)", async () => {
    const id = await authenticate(api, peer);
    await api.session.delete(id);
  });
});
