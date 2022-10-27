import type { Wallet } from "@app/wallet";

import { BigNumber } from "ethers";
import { describe, expect, test } from "vitest";
import * as utils from "@app/utils";

describe("Conversions", () => {
  test("toWei", () => {
    expect(utils.toWei("10")).toEqual(BigNumber.from("10000000000000000000"));
  });
});

describe("Format functions", () => {
  test.each([
    { amount: "1000", digits: 2, expected: "10.0" },
    { amount: "10000000000000000000", expected: "10.0" },
  ])("formatBalance", ({ amount, digits, expected }) => {
    expect(utils.formatBalance(BigNumber.from(amount), digits)).toEqual(
      expected,
    );
  });

  test.each([
    { hash: "#L42", expected: 42 },
    { hash: "#ETH", expected: null },
  ])("formatLocationHash $hash => $expected", ({ hash, expected }) => {
    expect(utils.formatLocationHash(hash)).toEqual(expected);
  });

  test.each([
    {
      id: "hydkkkf5ksbe5fuszdhpqhytu3q36gwagj874wxwpo5a8ti8coygh1",
      expected: "hydkkk…coygh1",
    },
  ])("formatSeedId $id => $expected", ({ id, expected }) => {
    expect(utils.formatSeedId(id)).toEqual(expected);
  });

  test("formatRadicleUrn", () => {
    expect(
      utils.formatRadicleUrn("rad:git:hnrkemobagsicpf9sr95o3g551otspcd84c9o"),
    ).toEqual("rad:git:hnrkem…d84c9o");
  });

  test("formatRadicleUrn throw when wrong URN", () => {
    expect(() =>
      utils.formatRadicleUrn("hnrkemobagsicpf9sr95o3g551otspcd84c9o"),
    ).toThrow();
  });

  test("formatAddress", () => {
    expect(
      utils.formatAddress("0xb5d85cbf7cb3ee0d56b3bb207d5fc4b82f43f511"),
    ).toEqual("b5d8 – F511");

    expect(() => utils.formatAddress("0x8f91813")).toThrowError(
      'invalid address (argument="address", value="0x8f91813", code=INVALID_ARGUMENT, version=address/5.7.0)',
    );
  });

  test.each([
    {
      input: "seedling",
      expected: "🌱",
    },
    {
      input: "+1",
      expected: "👍",
    },
    {
      input: "radicle",
      expected: "radicle",
    },
  ])("parseEmoji $input => $expected", ({ input, expected }) => {
    expect(utils.parseEmoji(input)).toEqual(expected);
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
    {
      a: "0x1234567890123456789012345678901234567890",
      b: "0x1234567890123456789012345678901234567890",
      expected: true,
    },
    {
      a: "0x1234567890123456789012345678901234567890",
      b: "0x5E813e48a81977c6Fdd565ed5097eb600C73C4f0",
      expected: false,
    },
  ])("isAddressEqual", ({ a, b, expected }) => {
    expect(utils.isAddressEqual(a, b)).toEqual(expected);
  });

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
    { id: "rad:git:hnrkemobagsicpf9sr95o3g551otspcd84c9o", expected: true },
    { id: "0x1234567890123456789012345678901234567890", expected: false },
  ])("isRadicleId $id => $expected", ({ id, expected }) => {
    expect(utils.isRadicleId(id)).toEqual(expected);
  });

  test.each([
    { id: "hnrkj4c35uoyceb3d1dsscx8qq55cikrd1aio", expected: true },
    { id: "0x1234567890123456789012345678901234567890", expected: false },
  ])("isPeerId $id => $expected", ({ id, expected }) => {
    expect(utils.isPeerId(id)).toEqual(expected);
  });

  test.each([
    { oid: "a64ae9c6d572e0ad906faa9a4a7a8d43f113278c", expected: true },
    { oid: "a64ae9c", expected: false },
  ])("isOid $oid => $expected", ({ oid, expected }) => {
    expect(utils.isOid(oid)).toEqual(expected);
  });

  test.each([
    { address: "0x5E813e48a81977c6Fdd565ed5097eb600C73C4f0", expected: true },
    { address: "0x5E813e48a81977c6fdd565ed5097eb600c73c4f0", expected: false }, // If address is badly checksummed => false
    { address: "0x5e813e48a81977c6fdd565ed5097eb600c73c4f0", expected: true },
  ])("isAddress $address => $expected", ({ address, expected }) => {
    expect(utils.isAddress(address)).toBe(expected);
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

describe("Others", () => {
  test.each([
    {
      name: "goerli",
      expected:
        "https://goerli.etherscan.io/address/0x5E813e48a81977c6Fdd565ed5097eb600C73C4f0",
    },
    {
      name: "",
      expected:
        "https://etherscan.io/address/0x5E813e48a81977c6Fdd565ed5097eb600C73C4f0",
    },
  ])("explorerLink $name => $expected", ({ name, expected }) => {
    expect(
      utils.explorerLink("0x5E813e48a81977c6Fdd565ed5097eb600C73C4f0", {
        network: {
          name,
        },
      } as Wallet),
    ).toEqual(expected);
  });
});

describe("Parse Strings", () => {
  test.each([
    { label: "sebastinez.radicle.eth", expected: "sebastinez" },
    { label: "sebastinez", expected: "sebastinez" },
  ])("parseEnsLabel", ({ label, expected }) => {
    expect(
      utils.parseEnsLabel(label, {
        registrar: {
          address: "0x1234567890123456789012345678901234567890",
          domain: "radicle.eth",
        },
      } as Wallet),
    ).toEqual(expected);
  });

  test.each([
    { input: "https://twitter.com/cloudhead", expected: "cloudhead" },
    { input: "sebastinez", expected: "sebastinez" },
  ])("parseUsername", ({ input, expected }) => {
    expect(utils.parseUsername(input)).toEqual(expected);
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
