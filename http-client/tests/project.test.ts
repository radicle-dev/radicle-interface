import { describe, test } from "vitest";

import { HttpdClient } from "@http-client";
import {
  aliceMainHead,
  aliceRemote,
  cobRid,
  defaultHttpdPort,
  sourceBrowsingRid,
} from "@tests/support/fixtures.js";

describe("project", () => {
  const api = new HttpdClient({
    hostname: "127.0.0.1",
    port: defaultHttpdPort,
    scheme: "http",
  });

  test("#getByDelegate(delegateId)", async () => {
    await api.project.getByDelegate(aliceRemote);
  });

  test("#getAll()", async () => {
    await api.project.getAll();
  });

  test("#getById(id)", async () => {
    await api.project.getById(sourceBrowsingRid);
  });

  test("#getActivity(id)", async () => {
    await api.project.getActivity(sourceBrowsingRid);
  });

  test("#getReadme(id, sha)", async () => {
    await api.project.getReadme(sourceBrowsingRid, aliceMainHead);
  });

  test("#getBlob(id, sha, path)", async () => {
    await api.project.getBlob(sourceBrowsingRid, aliceMainHead, "src/true.c");
  });

  test("#getTree(id, sha)", async () => {
    await api.project.getTree(sourceBrowsingRid, aliceMainHead);
  });

  test("#getTreeStats(id, sha)", async () => {
    await api.project.getTreeStatsBySha(sourceBrowsingRid, aliceMainHead);
  });

  test("#getTree(id, sha, path)", async () => {
    await api.project.getTree(sourceBrowsingRid, aliceMainHead, "src");
  });

  test("#getAllRemotes(id)", async () => {
    await api.project.getAllRemotes(sourceBrowsingRid);
  });

  test("#getRemoteByPeer(id, peer)", async () => {
    await api.project.getRemoteByPeer(
      sourceBrowsingRid,
      aliceRemote.substring(8),
    );
  });

  test("#getAllCommits(id)", async () => {
    await api.project.getAllCommits(sourceBrowsingRid);
  });

  // TODO: test since/until properly.
  test("#getAllCommits(id, {parent, since, until, page, perPage})", async () => {
    await api.project.getAllCommits(sourceBrowsingRid, {
      parent: aliceMainHead,
      since: 1679065819581,
      until: 1679065819590,
      page: 1,
      perPage: 2,
    });
  });

  test("#getCommitBySha(id, sha)", async () => {
    await api.project.getCommitBySha(sourceBrowsingRid, aliceMainHead);
  });

  test("#getDiff(id, revisionBase, revisionOid)", async () => {
    await api.project.getDiff(
      sourceBrowsingRid,
      "90f6d058ece12f75f349bc7bbe88142187fe0379",
      aliceMainHead,
    );
  });

  test("#getIssueById(id, issueId)", async () => {
    await api.project.getIssueById(
      cobRid,
      "d481fe6e562dd78129589d4738f171a8380fcb19",
    );
  });

  test("#getAllIssues(id)", async () => {
    await api.project.getAllIssues(cobRid, {
      page: 0,
      perPage: 5,
      status: "open",
    });
  });

  test("#getPatchById(id, patchId)", async () => {
    await api.project.getPatchById(
      cobRid,
      "59a0821edc73630bce540596cffc7854da557365",
    );
  });

  test("#getAllPatches(id)", async () => {
    await api.project.getAllPatches(cobRid);
  });
});
