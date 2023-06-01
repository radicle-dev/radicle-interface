import { describe, test } from "vitest";

import { HttpdClient } from "../index";
import {
  aliceMainHead,
  aliceRemote,
  sourceBrowsingRid,
} from "@tests/support/fixtures";

const api = new HttpdClient({
  hostname: "127.0.0.1",
  port: 8080,
  scheme: "http",
});

describe("project", () => {
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

  test.todo("#getDiff(id, revisionBase, revisionOid)");
  test.todo("#getIssueById(id, issueId)");
  test.todo("#getAllIssues(id)");
  test.todo("#createIssue(id, { title, description, assignees, tags })");
  test.todo("#updateIssue(id, issueId, issueUpdateAction, authToken)");
  test.todo("#getPatchById(id, patchId)");
  test.todo("#getAllPatches(id)");
  test.todo("#updatePatch(id, patchId, patchUpdateAction, authToken)");
});
