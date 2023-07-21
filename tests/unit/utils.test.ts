import { describe, expect, test } from "vitest";
import * as utils from "@app/lib/utils";

describe("Format functions", () => {
  test.each([
    { hash: "#L42", expected: 42 },
    { hash: "#ETH", expected: null },
  ])("formatLocationHash $hash => $expected", ({ hash, expected }) => {
    expect(utils.formatLocationHash(hash)).toEqual(expected);
  });

  test.each([
    {
      id: "rad:zKtT7DmF9H34KkvcKj9PHW19WzjT",
      expected: "rad:zKtT7D…19WzjT",
    },
  ])("formatRepositoryId $id => $expected", ({ id, expected }) => {
    expect(utils.formatRepositoryId(id)).toEqual(expected);
  });

  test.each([
    {
      id: "did:key:z6MkmzRwg47UWQxczLLLFfkEwpBGitjzJ1vKPE8U9ymd6fz6",
      expected: "did:key:z6Mkmz…md6fz6",
    },
    {
      id: "z6MkmzRwg47UWQxczLLLFfkEwpBGitjzJ1vKPE8U9ymd6fz6",
      expected: "did:key:z6Mkmz…md6fz6",
    },
  ])("formatNodeId $id => $expected", ({ id, expected }) => {
    expect(utils.formatNodeId(id)).toEqual(expected);
  });

  test.each([
    {
      id: "rad:z4V1sjrXqjvFdnCUbxPFqd5p4DtH5",
      expected: "rad:z4V1sj…p4DtH5",
    },
    {
      id: "z4V1sjrXqjvFdnCUbxPFqd5p4DtH5",
      expected: "rad:z4V1sj…p4DtH5",
    },
  ])("formatRepositoryId $id => $expected", ({ id, expected }) => {
    expect(utils.formatRepositoryId(id)).toEqual(expected);
  });

  test.each([
    { commit: "a8a6a979a6261a2ec1ea85fc9a65a4a30aa22cc8", expected: "a8a6a97" },
    { commit: "a8a6a97", expected: "a8a6a97" },
  ])("formatCommit $commit => $expected", ({ commit, expected }) => {
    expect(utils.formatCommit(commit)).toEqual(expected);
  });
});

describe("String Assertions", () => {
  test.each([
    { domain: "alt-clients.radicle.xyz", expected: true },
    { domain: "0.0.0.0", expected: true }, // Pass as true since we are not in production
    { domain: "", expected: false },
  ])("isDomain $domain => $expected", ({ domain, expected }) => {
    expect(utils.isDomain(domain)).toEqual(expected);
  });

  test.each([
    { path: "README.md", expected: true },
    { path: "README.mkd", expected: true },
    { path: "README.markdown", expected: true },
    { path: "", expected: false },
  ])("isMarkdownPath $path => $expected", ({ path, expected }) => {
    expect(utils.isMarkdownPath(path)).toEqual(expected);
  });

  test.each([
    { id: "rad:zKtT7DmF9H34KkvcKj9PHW19WzjT", expected: true },
    { id: "z2H9aHDurxd8Uvx2jsvW4e5mamy5S", expected: true },
    { id: "rad:BBBBBBBBBBBBBBBBBBBBBBBBBBBB", expected: false },
    { id: "0x1234567890123456789012345678901234567890", expected: false },
    {
      id: "did:key:z6MkwPUeUS2fJMfc2HZN1RQTQcTTuhw4HhPySB8JeUg2mVvx",
      expected: false,
    },
    {
      id: "z6MkwPUeUS2fJMfc2HZN1RQTQcTTuhw4HhPySB8JeUg2mVvx",
      expected: false,
    },
  ])("isRepositoryId $id => $expected", ({ id, expected }) => {
    expect(utils.isRepositoryId(id)).toEqual(expected);
  });

  test.each([
    {
      id: "did:key:z6MkwPUeUS2fJMfc2HZN1RQTQcTTuhw4HhPySB8JeUg2mVvx",
      expected: true,
    },
    {
      id: "z6MkwPUeUS2fJMfc2HZN1RQTQcTTuhw4HhPySB8JeUg2mVvx",
      expected: true,
    },
    {
      id: "did:key:CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
      expected: false,
    },
    { id: "rad:zKtT7DmF9H34KkvcKj9PHW19WzjT", expected: false },
    { id: "z2H9aHDurxd8Uvx2jsvW4e5mamy5S", expected: false },
    { id: "0x1234567890123456789012345678901234567890", expected: false },
  ])("isNodeId $id => $expected", ({ id, expected }) => {
    expect(utils.isNodeId(id)).toEqual(expected);
  });

  test.each([
    { url: "https://app.radicle.xyz", expected: true },
    { url: "http://app.radicle.xyz", expected: true },
    { url: "http://app", expected: true },
    { url: "://app", expected: false },
    { url: "//app", expected: false },
    { url: "app", expected: false },
  ])("isUrl $url => $expected", ({ url, expected }) => {
    expect(utils.isUrl(url)).toBe(expected);
  });
});

describe("Parse Functions", () => {
  test.each([
    { input: "https://twitter.com/cloudhead", expected: "cloudhead" },
    { input: "sebastinez", expected: "sebastinez" },
  ])("parseUsername", ({ input, expected }) => {
    expect(utils.parseUsername(input)).toEqual(expected);
  });
  test.each([
    {
      input: "rad:z6MkmzRwg47UWQxczLLLFfkEwpBGitjzJ1vKPE8U9ymd6fz6",
      expected: undefined,
    },
    {
      input: "did:key:z6Mkmz…md6fz6",
      expected: undefined,
    },
    {
      input: "z6MkmzRwg47UWQxczLLLFfkEwpBGitjzJ1vKPE8U9ymd6fz6",
      expected: {
        prefix: "did:key:",
        pubkey: "z6MkmzRwg47UWQxczLLLFfkEwpBGitjzJ1vKPE8U9ymd6fz6",
      },
    },
    {
      input: "did:key:z6MkmzRwg47UWQxczLLLFfkEwpBGitjzJ1vKPE8U9ymd6fz6",
      expected: {
        prefix: "did:key:",
        pubkey: "z6MkmzRwg47UWQxczLLLFfkEwpBGitjzJ1vKPE8U9ymd6fz6",
      },
    },
  ])("parseNodeId", ({ input, expected }) => {
    expect(utils.parseNodeId(input)).toEqual(expected);
  });
});

describe("Path Manipulation", () => {
  test.each([
    {
      imagePath: "/assets/images/tux.png",
      base: "/",
      origin: "https://app.radicle.xyz",
      expected: "assets/images/tux.png",
    },
    {
      imagePath: "assets/images/tux.png",
      base: "/",
      origin: "https://app.radicle.xyz",
      expected: "assets/images/tux.png",
    },
    {
      imagePath: "assets/images/tux.png",
      base: "/",
      origin: "http://localhost:3000",
      expected: "assets/images/tux.png",
    },
    {
      imagePath: "../tux.png",
      base: "/components/assets/README.md",
      origin: "http://localhost:3000",
      expected: "components/tux.png",
    },
    {
      imagePath: "../tux.png",
      base: "/components/assets/",
      origin: "http://localhost:3000",
      expected: "components/tux.png",
    },
    {
      imagePath: "../../tux.png",
      base: "/components/assets/images/README.md",
      origin: "http://localhost:3000",
      expected: "components/tux.png",
    },
  ])(
    "canonicalize origin: $origin base: $base, path: $imagePath => $expected",
    ({ imagePath, base, expected, origin }) => {
      expect(utils.canonicalize(imagePath, base, origin)).toEqual(expected);
    },
  );
  test.each([
    { path: "README.md", expected: "md" },
    { path: ".eslintrc.cjs", expected: "cjs" },
    { path: ".gitignore", expected: undefined },
    { path: ".seed.env", expected: "env" },
    { path: "./relative/path/doc.rs", expected: "rs" },
    { path: "./relative/../path/doc.rs", expected: "rs" },
    { path: "/absolute/path/doc.rs", expected: "rs" },
    { path: "/absolute/path/playwright.config.ts", expected: "ts" },
  ])("getFileExtension $path => $expected", ({ path, expected }) => {
    expect(utils.getFileExtension(path)).toEqual(expected);
  });
});

describe("Date Manipulation", () => {
  test.each([
    { from: new Date("2022-01-01"), to: new Date("2022-02-01"), expected: 31 },
    { from: new Date("2022-01-01"), to: new Date("2022-01-02"), expected: 1 },
    { from: new Date("2022-01-01"), to: new Date("2022-01-01"), expected: 0 },
  ])("getDaysPassed expected: $expected ", ({ from, to, expected }) => {
    expect(utils.getDaysPassed(from, to)).toEqual(expected);
  });
  test.each([
    {
      from: new Date("2022-01-01 12:00:00"),
      to: new Date("2022-01-01 12:00:00"),
      expected: "now",
    },
    {
      from: new Date("2022-01-01 12:00:00"),
      to: new Date("2022-01-01 12:00:01"),
      expected: "1 second ago",
    },
    {
      from: new Date("2022-01-01 12:00:00"),
      to: new Date("2022-01-01 12:01:01"),
      expected: "1 minute ago",
    },
    {
      from: new Date("2022-01-01 12:00:00"),
      to: new Date("2022-01-01 13:01:01"),
      expected: "1 hour ago",
    },
    {
      from: new Date("2022-01-01 12:00:00"),
      to: new Date("2022-01-02 13:01:01"),
      expected: "yesterday",
    },
    {
      from: new Date("2022-01-01 12:00:00"),
      to: new Date("2022-01-04 13:01:01"),
      expected: "3 days ago",
    },
    {
      from: new Date("2022-01-01 12:00:00"),
      to: new Date("2022-02-02 13:01:01"),
      expected: "last month",
    },
    {
      from: new Date("2022-01-01 12:00:00"),
      to: new Date("2022-04-02 13:01:01"),
      expected: "3 months ago",
    },
    {
      from: new Date("2022-01-01 12:00:00"),
      to: new Date("2023-04-02 12:00:00"),
      expected: "Sat, 01 Jan 2022 12:00:00 GMT",
    },
    {
      from: new Date("2022-03-05 12:00:00"),
      to: new Date("2026-04-02 12:00:00"),
      expected: "Sat, 05 Mar 2022 12:00:00 GMT",
    },
  ])("formatTimestamp expected: $expected", ({ from, to, expected }) => {
    expect(utils.formatTimestamp(from.getTime() / 1000, to.getTime())).toEqual(
      expected,
    );
  });
});

describe("createAddRemoveArrays", () => {
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
      expect(utils.createAddRemoveArrays(currentArray, newArray)).toEqual(
        expected,
      );
    },
  );
});
