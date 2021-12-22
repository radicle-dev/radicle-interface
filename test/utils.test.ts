import { test, expect } from 'vitest';
import * as utils from '../src/utils';
import { BigNumber } from "ethers";

test("toWei conversion", () => {
  expect(utils.toWei("1").eq(BigNumber.from("1000000000000000000"))).toBeTruthy();
  expect(utils.toWei("0").eq(BigNumber.from("0"))).toBeTruthy();
});
test('Is address equal', () => {
  expect(utils.isAddressEqual("0x5E813e48a81977c6Fdd565ed5097eb600C73C4f0", "0x5e813e48a81977c6fdd565ed5097eb600c73c4f0")).toBeTruthy();
  expect(utils.isAddressEqual("0x5E813e48a81977c6Fdd565ed5097eb600C73C4f0", "0x5f813e48a81977c6fdd565ed5097eb600c73c4f0")).toBeFalsy();
  expect(utils.toWei("0").eq(BigNumber.from("0"))).toBeTruthy();
});
test('Format Balance Wei to float ETH', () => {
  expect(utils.formatBalance(BigNumber.from("0"))).toBe("0.0");
  expect(utils.formatBalance(BigNumber.from("1000000000000000000"))).toBe("1.0");
  expect(utils.formatBalance(BigNumber.from("1230000000000000000"))).toBe("1.23");
});
test('Format CAIP10 Address', () => {
  expect(utils.formatCAIP10Address("0x5E813e48a81977c6Fdd565ed5097eb600C73C4f0", "eip155", 1)).toBe("0x5e813e48a81977c6fdd565ed5097eb600c73c4f0@eip155:1");
});
test('Checksum and shorten address', () => {
  expect(utils.formatAddress("0x5e813e48a81977c6fdd565ed5097eb600c73c4f0")).toBe("5E81 – C4f0");
  expect(() => {
    utils.formatAddress("");
  }).toThrowError('invalid address (argument="address", value="", code=INVALID_ARGUMENT, version=address/5.5.0)');
});
test('Format IPFS file', () => {
  expect(utils.formatIpfsFile("QmTECdjXPxJP4bJp5H2Mn9SpA5a4zjrzi2Xu56FBDjXFcy")).toBe("https://ipfs.io/ipfs/QmTECdjXPxJP4bJp5H2Mn9SpA5a4zjrzi2Xu56FBDjXFcy");
  expect(utils.formatIpfsFile("ipfs://QmTECdjXPxJP4bJp5H2Mn9SpA5a4zjrzi2Xu56FBDjXFcy")).toBe("https://ipfs.io/ipfs/QmTECdjXPxJP4bJp5H2Mn9SpA5a4zjrzi2Xu56FBDjXFcy");
});
test("Shorten Hash", () => {
  expect(utils.formatHash("93c35799f831de83f5c29a92671abd340c520fc4")).toBe("93c357...0fc4");
  expect(utils.formatHash("93c35799f")).toBe("93c35799f");
});
test("Shorten Commit", () => {
  expect(utils.formatCommit("93c35799f831de83f5c29a92671abd340c520fc4")).toBe("93c3579");
  expect(utils.formatCommit("93c")).toBe("93c");
});
test("Capitalize", () => {
  expect(utils.capitalize("cloudhead")).toBe("Cloudhead");
  expect(utils.capitalize("x")).toBe("X");
  expect(utils.capitalize("")).toBe("");
});
test("parseUsername", () => {
  expect(utils.parseUsername("https://twitter.com/cloudhead")).toBe("cloudhead");
  expect(utils.parseUsername("cloudhead")).toBe("cloudhead");
});
test("isRadicleId", () => {
  expect(utils.isRadicleId("rad:git:hnrkqdpm9ub19oc8dccx44echy76hzfsezyio")).toBeTruthy();
});
test("isUrl", () => {
  expect(utils.isUrl("https://google.com")).toBeTruthy();
  expect(utils.isUrl("http://google.com")).toBeTruthy();
});
test("isDid", () => {
  expect(utils.isDid("did:key:z6MkrEm7ugUCndwcSwgphZXBPRTprqf59AzufA8pJNk8uN8G")).toBeTruthy();
  expect(utils.isDid("did:z6MkrEm7ugUCndwcSwgphZXBPRTprqf59AzufA8pJNk8uN8G")).toBeFalsy();
  expect(utils.isDid("z6MkrEm7ugUCndwcSwgphZXBPRTprqf59AzufA8pJNk8uN8G")).toBeFalsy();
});
test("isAddress", () => {
  expect(utils.isAddress("0x5E813e48a81977c6Fdd565ed5097eb600C73C4f0")).toBeTruthy();
  expect(utils.isAddress("0x5e813e48a81977c6fdd565ed5097eb600c73c4f0")).toBeTruthy();
  expect(utils.isAddress("0x5E813e48a81977c6fdd565ed5097eb600c73c4f0")).toBeFalsy();
});
test("formatProjectHash", () => {
  expect(utils.formatProjectHash(
    Uint8Array.from([17, 20, 147, 195, 87, 153, 248, 49, 222, 131, 245, 194, 154, 146, 103, 26, 189, 52, 12, 82, 15, 196])))
    .toBe("93c35799f831de83f5c29a92671abd340c520fc4");
});
