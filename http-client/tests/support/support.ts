import type { HttpdClient } from "@http-client";

import { expect } from "vitest";
import isMatch from "lodash/isMatch";

import { cobRid } from "@tests/support/fixtures";

export async function createIssueToBeModified(
  api: HttpdClient,
  sessionId: string,
) {
  const { id } = await api.project.createIssue(
    cobRid,
    { title: "aaa", description: "bbb", embeds: [], assignees: [], labels: [] },
    sessionId,
  );

  return id;
}

export async function createPatchToBeModified(
  api: HttpdClient,
  sessionId: string,
) {
  const { id } = await api.project.createPatch(
    cobRid,
    {
      title: "rrr",
      description: "ttt",
      target: "d7dd8cecae16b1108234e09dbdb5d64ae394bc25",
      oid: "38c225e2a0b47ba59def211f4e4825c31d9463ec",
      labels: [],
    },
    sessionId,
  );

  return id;
}
export async function assertIssue(
  oid: string,
  change: Record<string, unknown>,
  api: HttpdClient,
) {
  expect(
    //@prettier-ignore looks more readable than what prettier suggests.
    isMatch(await api.project.getIssueById(cobRid, oid), change),
  ).toBe(true);
}

export async function assertPatch(
  oid: string,
  change: Record<string, unknown>,
  api: HttpdClient,
) {
  expect(
    //@prettier-ignore looks more readable than what prettier suggests.
    isMatch(await api.project.getPatchById(cobRid, oid), change),
  ).toBe(true);
}
