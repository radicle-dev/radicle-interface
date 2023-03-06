import { describe, expect, test } from "vitest";
import * as issue from "@app/lib/issue";

describe("Issues", () => {
  test.each([
    {
      currentArray: ["a", "b"],
      newArray: ["a", "b", "c"],
      expected: { add: ["c"], remove: [] },
    },
    {
      currentArray: ["a", "b"],
      newArray: ["c"],
      expected: { add: ["c"], remove: ["a", "b"] },
    },
    { currentArray: [], newArray: ["c"], expected: { add: ["c"], remove: [] } },
    { currentArray: ["a"], newArray: ["a"], expected: { add: [], remove: [] } },
  ])(
    "createAssigneeArrays $hash => $expected",
    ({ currentArray, newArray, expected }) => {
      expect(issue.createAddRemoveArrays(currentArray, newArray)).toEqual(
        expected,
      );
    },
  );
});
