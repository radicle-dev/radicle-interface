import { describe, expect, test } from "vitest";
import { testExports } from "@app/views/repos/router";

// Defining the window.origin value, since vitest doesn't provide one.
window.origin = "http://localhost:3000";

describe("isOid", () => {
  test.each([
    { oid: "a64ae9c6d572e0ad906faa9a4a7a8d43f113278c", expected: true },
    { oid: "a64ae9c", expected: false },
  ])("isOid $oid => $expected", ({ oid, expected }) => {
    expect(testExports.isOid(oid)).toEqual(expected);
  });
});
