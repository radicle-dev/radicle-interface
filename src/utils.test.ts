import { BigNumber } from "ethers";
import { describe, expect, test } from "vitest";
import type { Config } from "./config";
import * as utils from "./utils";

describe("Conversions", () => {
  test("toWei", () => {
    expect(
      utils.toWei("10")
    ).toEqual(BigNumber.from("10000000000000000000"));
  });
});

describe("Format functions", () => {
  test.each([
    { cid: "Qm1234567890123456789012345678901234567890", expected: "https://ipfs.io/ipfs/Qm1234567890123456789012345678901234567890" },
    { cid: undefined, expected: undefined }
  ])("formatIpfsFile $cid => $expected", ({ cid, expected }) => {
    expect(
      utils.formatIpfsFile(cid)
    ).toEqual(expected);
  });

  test.each([
    { amount: "1000", digits: 2, expected: "10.0" },
    { amount: "10000000000000000000", expected: "10.0" },
  ])("formatBalance", ({ amount, digits, expected }) => {
    expect(utils.formatBalance(BigNumber.from(amount), digits)).toEqual(expected);
  });

  test("formatRadicleId", () => {
    expect(
      utils.formatRadicleId(
        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 156, 38, 115, 99, 61, 118, 237, 10, 20, 115, 111, 188, 10, 117, 137, 59, 107, 76, 77, 86])
      ))
      .toEqual("rad:git:hnrkjajuucc6zp5eknt3s9xykqsrus44cjimy");
  });

  test("formatProjectHash", () => {
    expect(
      utils.formatProjectHash(
        new Uint8Array([17, 20, 69, 234, 87, 208, 172, 127, 33, 22, 110, 216, 52, 69, 104, 219, 88, 66, 50, 152, 115, 23])
      )
    ).toEqual("45ea57d0ac7f21166ed8344568db584232987317");
  });

  test.each([
    { hash: "#L42", expected: 42 },
    { hash: "#ETH", expected: null },
  ])("formatLocationHash $hash => $expected", ({ hash, expected }) => {
    expect(
      utils.formatLocationHash(hash))
      .toEqual(expected);
  });

  test.each([
    { id: "hydkkkf5ksbe5fuszdhpqhytu3q36gwagj874wxwpo5a8ti8coygh1", expected: "hydkkk…coygh1" }
  ])("formatSeedId $id => $expected", ({ id, expected }) => {
    expect(
      utils.formatSeedId(id))
      .toEqual(expected);
  });

  test("formatRadicleUrn", () => {
    expect(
      utils.formatRadicleUrn("rad:git:hnrkemobagsicpf9sr95o3g551otspcd84c9o"))
      .toEqual("rad:git:hnrkem…d84c9o");
  });

  test("formatRadicleUrn throw when wrong URN", () => {
    expect(() => utils.formatRadicleUrn("hnrkemobagsicpf9sr95o3g551otspcd84c9o"))
      .toThrow();
  });

  test("formatCAIP10Address", () => {
    expect(
      utils.formatCAIP10Address(
        "0x1234567890123456789012345678901234567890",
        "eip155",
        1
      ))
      .toEqual("0x1234567890123456789012345678901234567890@eip155:1");
  });

  test("formatAddress", () => {
    expect(
      utils.formatAddress(
        "0xb5d85cbf7cb3ee0d56b3bb207d5fc4b82f43f511",
      )
    ).toEqual("b5d8 – F511");

    expect(
      () => utils.formatAddress(
        "0x8f91813",
      )
    ).toThrowError('invalid address (argument="address", value="0x8f91813", code=INVALID_ARGUMENT, version=address/5.5.0)');
  });

  test.each([
    { hash: "0x8f918133b56bb85c18ea192549503f0ea59e3beb1f88023f442656c660018e3a", expected: "0x8f91...8e3a" },
    { hash: "0x8f91813", expected: "0x8f91813" }, // If the string length is less than 10 characters the entire string is returned.
  ])("formatHash $hash => $expected", ({ hash, expected }) => {
    expect(
      utils.formatHash(hash)
    ).toEqual(expected);
  });

  test.each([
    { commit: "a8a6a979a6261a2ec1ea85fc9a65a4a30aa22cc8", expected: "a8a6a97" },
    { commit: "a8a6a97", expected: "a8a6a97" }
  ])("formatCommit $commit => $expected", ({ commit, expected }) => {
    expect(
      utils.formatCommit(commit)
    ).toEqual(expected);
  });
});

describe("String Assertions", () => {
  test.each([
    { a: "0x1234567890123456789012345678901234567890", b: "0x1234567890123456789012345678901234567890", expected: true },
    { a: "0x1234567890123456789012345678901234567890", b: "0x5E813e48a81977c6Fdd565ed5097eb600C73C4f0", expected: false }
  ])("isAddressEqual", ({ a, b, expected }) => {
    expect(
      utils.isAddressEqual(a, b))
      .toEqual(expected);
  });

  test.each([
    { domain: "alt-clients.radicle.xyz", expected: true },
    { domain: "0.0.0.0", expected: true }, // Pass as true since we are not in production
    { domain: "", expected: false },
  ])("isDomain $domain => $expected", ({ domain, expected }) => {
    expect(
      utils.isDomain(domain))
      .toEqual(expected);
  });

  test.each([
    { path: "README.md", expected: true },
    { path: "README.mkd", expected: true },
    { path: "README.markdown", expected: true },
    { path: "", expected: false },
  ])("isMarkdownPath $path => $expected", ({ path, expected }) => {
    expect(
      utils.isMarkdownPath(path))
      .toEqual(expected);
  });

  test.each([
    { id: "rad:git:hnrkemobagsicpf9sr95o3g551otspcd84c9o", expected: true },
    { id: "0x1234567890123456789012345678901234567890", expected: false },
  ])("isRadicleId $id => $expected", ({ id, expected }) => {
    expect(
      utils.isRadicleId(id))
      .toEqual(expected);
  });

  test.each([
    { oid: "a64ae9c6d572e0ad906faa9a4a7a8d43f113278c", expected: true },
    { oid: "a64ae9c", expected: false }
  ])("isOid $oid => $expected", ({ oid, expected }) => {
    expect(
      utils.isOid(oid))
      .toEqual(expected);
  });

  test.each([
    { address: "0x5E813e48a81977c6Fdd565ed5097eb600C73C4f0", expected: true },
    { address: "0x5E813e48a81977c6fdd565ed5097eb600c73c4f0", expected: false }, // If address is badly checksummed => false
    { address: "0x5e813e48a81977c6fdd565ed5097eb600c73c4f0", expected: true },
  ])("isAddress $address => $expected", ({ address, expected }) => {
    expect(
      utils.isAddress(
        address,
      ))
      .toBe(expected);
  });

  test.each([
    { url: "https://app.radicle.network", expected: true },
    { url: "http://app.radicle.network", expected: true },
    { url: "http://app", expected: true },
    { url: "://app", expected: false },
    { url: "//app", expected: false },
    { url: "app", expected: false },
  ])("isUrl $url => $expected", ({ url, expected }) => {
    expect(
      utils.isUrl(
        url,
      ))
      .toBe(expected);
  });

  test.each([
    { did: "did:3:kjzl6cwe1jw1481xu9oyww9bhmueqr8f5uryk4xha9jzhj6vi063e0blpnil383", expected: true },
    { did: "did:kjzl6cwe1jw1481xu9oyww9bhmueqr8f5uryk4xha9jzhj6vi063e0blpnil383", expected: false },
  ])("isDid $did => $expected", ({ did, expected }) => {
    expect(
      utils.isDid(did))
      .toBe(expected);
  });
});

describe("Others", () => {
  test.each([
    { viewer: "https://gnosis-safe.io/app/#/safes", name: "", expected: "https://gnosis-safe.io/app/#/safes/0x5E813e48a81977c6Fdd565ed5097eb600C73C4f0" },
    { viewer: null, name: "", expected: "https://etherscan.io/address/0x5E813e48a81977c6Fdd565ed5097eb600C73C4f0" },
  ])("safeLink $viewer => $expected", ({ name, viewer, expected }) => {
    expect(
      utils.safeLink(
        "0x5E813e48a81977c6Fdd565ed5097eb600C73C4f0",
        {
          network: {
            name
          },
          safe: {
            viewer
          }
        } as Config
      ))
      .toEqual(expected);
  });

  test.each([
    { name: "rinkeby", expected: "https://rinkeby.etherscan.io/address/0x5E813e48a81977c6Fdd565ed5097eb600C73C4f0" },
    { name: "", expected: "https://etherscan.io/address/0x5E813e48a81977c6Fdd565ed5097eb600C73C4f0" },
  ])("explorerLink $name => $expected", ({ name, expected }) => {
    expect(
      utils.explorerLink(
        "0x5E813e48a81977c6Fdd565ed5097eb600C73C4f0",
        {
          network: {
            name,
          }
        } as Config
      ))
      .toEqual(expected);
  });

  test.each([
    { id: "rad:git:hnrkjajuucc6zp5eknt3s9xykqsrus44cjimy", expected: new Uint8Array([156, 38, 115, 99, 61, 118, 237, 10, 20, 115, 111, 188, 10, 117, 137, 59, 107, 76, 77, 86]) },
    { id: "hnrkjajuucc6zp5eknt3s9xykqsrus44cjimy", expected: new Uint8Array([156, 38, 115, 99, 61, 118, 237, 10, 20, 115, 111, 188, 10, 117, 137, 59, 107, 76, 77, 86]) }
  ])("decodeRadicleId", ({ id, expected }) => {
    expect(
      utils.decodeRadicleId(id))
      .toEqual(expected);
  });
});

describe("Parse Strings", () => {
  test.each([
    { label: "sebastinez.radicle.eth", expected: "sebastinez" },
    { label: "sebastinez", expected: "sebastinez" },
  ])("parseEnsLabel", ({ label, expected }) => {
    expect(
      utils.parseEnsLabel(
        label,
        {
          registrar: {
            address: "0x1234567890123456789012345678901234567890",
            domain: "radicle.eth"
          }
        } as Config
      )
    ).toEqual(expected);
  });

  test.each([
    { input: "https://twitter.com/cloudhead", expected: "cloudhead" },
    { input: "sebastinez", expected: "sebastinez" }
  ])("parseUsername", ({ input, expected }) => {
    expect(
      utils.parseUsername(input)
    ).toEqual(expected);
  });
});
