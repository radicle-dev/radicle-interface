import { describe, test } from "vitest";
import { HttpdClient } from "../index";

const api = new HttpdClient({
  hostname: "127.0.0.1",
  port: 8080,
  scheme: "http",
});

describe("project", () => {
  test("#getByDelegate(delegateId)", async () => {
    await api.project.getByDelegate(
      "did:key:z6MknSLrJoTcukLrE435hVNQT4JUhbvWLX4kUzqkEStBU8Vi",
    );
  });

  test("#getAll()", async () => {
    await api.project.getAll();
  });

  test("#getById(id)", async () => {
    await api.project.getById("rad:zKtT7DmF9H34KkvcKj9PHW19WzjT");
  });

  test("#getActivity(id)", async () => {
    await api.project.getActivity("rad:zKtT7DmF9H34KkvcKj9PHW19WzjT");
  });

  test("#getReadme(id, sha)", async () => {
    await api.project.getReadme(
      "rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
      "fcc929424b82984b7cbff9c01d2e20d9b1249842",
    );
  });

  test("#getBlob(id, sha, path)", async () => {
    await api.project.getBlob(
      "rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
      "dd068e9aff9a569e597f6abaf84f120dd0cbbd70",
      "src/true.c",
    );
  });

  test("#getTree(id, sha)", async () => {
    await api.project.getTree(
      "rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
      "dd068e9aff9a569e597f6abaf84f120dd0cbbd70",
    );
  });

  test("#getTree(id, sha, path)", async () => {
    await api.project.getTree(
      "rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
      "dd068e9aff9a569e597f6abaf84f120dd0cbbd70",
      "src",
    );
  });

  test("#getAllRemotes(id)", async () => {
    await api.project.getAllRemotes("rad:zKtT7DmF9H34KkvcKj9PHW19WzjT");
  });

  test("#getRemoteByPeer(id, peer)", async () => {
    await api.project.getRemoteByPeer(
      "rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
      "z6MknSLrJoTcukLrE435hVNQT4JUhbvWLX4kUzqkEStBU8Vi",
    );
  });

  test("#getAllCommits(id)", async () => {
    await api.project.getAllCommits("rad:zKtT7DmF9H34KkvcKj9PHW19WzjT");
  });

  // TODO: test since/until properly.
  test("#getAllCommits(id, {parent, since, until, page, perPage})", async () => {
    await api.project.getAllCommits("rad:zKtT7DmF9H34KkvcKj9PHW19WzjT", {
      parent: "f0b8db68847b01f0964380507a9db6800e5b5342",
      since: 1679065819581,
      until: 1679065819590,
      page: 1,
      perPage: 2,
    });
  });

  test("#getCommitBySha(id, sha)", async () => {
    await api.project.getCommitBySha(
      "rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
      "fcc929424b82984b7cbff9c01d2e20d9b1249842",
    );
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
