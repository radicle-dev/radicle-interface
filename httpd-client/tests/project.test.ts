import { describe, test } from "vitest";

import { HttpdClient } from "@httpd-client";
import {
  aliceMainHead,
  aliceRemote,
  bobRemote,
  cobRid,
  defaultHttpdPort,
  sourceBrowsingRid,
} from "@tests/support/fixtures.js";
import {
  assertIssue,
  assertPatch,
  createIssueToBeModified,
  createPatchToBeModified,
} from "@httpd-client/tests/support/support";
import { authenticate } from "@httpd-client/tests/support/httpd.js";
import { testFixture as testWithAPI } from "@httpd-client/tests/support/fixtures.js";

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
      "4fc727e722d3979fd2073d9b56b2751658a4ae79",
    );
  });

  test("#getAllIssues(id)", async () => {
    await api.project.getAllIssues(cobRid, {
      page: 0,
      perPage: 5,
      state: "open",
    });
  });

  testWithAPI(
    "#createIssue(id, { title, description, assignees, tags })",
    async ({ httpd: { api, peer } }) => {
      const sessionId = await authenticate(api, peer);
      const { id: issueId } = await api.project.createIssue(
        cobRid,
        {
          title: "aaa",
          description: "bbb",
          assignees: [],
          tags: ["bug", "documentation"],
        },
        sessionId,
      );
      await assertIssue(
        issueId,
        {
          title: "aaa",
          discussion: [{ body: "bbb" }],
          assignees: [],
          tags: ["bug", "documentation"],
        },
        api,
      );
    },
  );

  testWithAPI(
    "#updateIssue(id, issueId, { type: 'edit' }, authToken)",
    async ({ httpd: { api, peer } }) => {
      const sessionId = await authenticate(api, peer);
      const issueId = await createIssueToBeModified(api, sessionId);
      await api.project.updateIssue(
        cobRid,
        issueId,
        { type: "edit", title: "ccc" },
        sessionId,
      );
      await assertIssue(issueId, { title: "ccc" }, api);
    },
  );

  testWithAPI(
    "#updateIssue(id, issueId, { type: 'tag' }, authToken)",
    async ({ httpd: { api, peer } }) => {
      const sessionId = await authenticate(api, peer);
      const issueId = await createIssueToBeModified(api, sessionId);
      await api.project.updateIssue(
        cobRid,
        issueId,
        { type: "tag", add: ["bug"], remove: [] },
        sessionId,
      );
      await assertIssue(issueId, { tags: ["bug"] }, api);
    },
  );

  testWithAPI(
    "#updateIssue(id, issueId, { type: 'assign' }, authToken)",
    async ({ httpd: { api, peer } }) => {
      const sessionId = await authenticate(api, peer);
      const issueId = await createIssueToBeModified(api, sessionId);
      const assignee = bobRemote.replace("did:key:", "");
      await api.project.updateIssue(
        cobRid,
        issueId,
        {
          type: "assign",
          add: [assignee],
          remove: [],
        },
        sessionId,
      );
      await assertIssue(issueId, { assignees: [`did:key:${assignee}`] }, api);
    },
  );

  testWithAPI(
    "#updateIssue(id, issueId, { type: 'lifecycle' }, authToken)",
    async ({ httpd: { api, peer } }) => {
      const sessionId = await authenticate(api, peer);
      const issueId = await createIssueToBeModified(api, sessionId);
      await api.project.updateIssue(
        cobRid,
        issueId,
        { type: "lifecycle", state: { status: "closed", reason: "solved" } },
        sessionId,
      );
      await assertIssue(
        issueId,
        {
          state: { status: "closed", reason: "solved" },
        },
        api,
      );
    },
  );

  test("#getPatchById(id, patchId)", async () => {
    await api.project.getPatchById(
      cobRid,
      "013f8b2734df1840b2e33d52ff5632c8d66b199a",
    );
  });

  test("#getAllPatches(id)", async () => {
    await api.project.getAllPatches(cobRid);
  });

  testWithAPI(
    "#createPatch(id, patchCreate, authToken)",
    async ({ httpd: { api, peer } }) => {
      const sessionId = await authenticate(api, peer);
      const { id: oid } = await api.project.createPatch(
        cobRid,
        {
          title: "ppp",
          description: "qqq",
          target: "d7dd8cecae16b1108234e09dbdb5d64ae394bc25",
          oid: "38c225e2a0b47ba59def211f4e4825c31d9463ec",
          tags: [],
        },
        sessionId,
      );
      await assertPatch(
        oid,
        {
          title: "ppp",
          state: { status: "open" },
          target: "delegates",
          tags: [],
          revisions: [
            {
              description: "qqq",
              base: "d7dd8cecae16b1108234e09dbdb5d64ae394bc25",
              oid: "38c225e2a0b47ba59def211f4e4825c31d9463ec",
            },
          ],
        },
        api,
      );
    },
  );

  testWithAPI(
    "#updatePatch(id, patchId, { type: 'edit' }, authToken)",
    async ({ httpd: { api, peer } }) => {
      const sessionId = await authenticate(api, peer);
      const patchId = await createPatchToBeModified(api, sessionId);
      await api.project.updatePatch(
        cobRid,
        patchId,
        { type: "tag", add: ["bug"], remove: [] },
        sessionId,
      );
      await assertPatch(
        patchId,
        {
          tags: ["bug"],
        },
        api,
      );
    },
  );
});
