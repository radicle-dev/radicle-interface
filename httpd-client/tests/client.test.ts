import { describe, test } from "vitest";
import { HttpdClient } from "@httpd-client";

const api = new HttpdClient({
  hostname: "127.0.0.1",
  port: 8080,
  scheme: "http",
});

describe("client", () => {
  test("#getNodeInfo()", async () => {
    await api.getNodeInfo();
  });

  test("#getStats()", async () => {
    await api.getStats();
  });

  test("#getNode()", async () => {
    await api.getNode();
  });
});
