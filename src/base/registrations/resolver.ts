import type { TransactionResponse } from "@ethersproject/providers";
import type { EnsResolver } from "@ethersproject/providers";
import { ethers } from "ethers";
import type { Wallet } from "@app/wallet";
import { assert } from "@app/error";
import ethereumContractAbis from "@app/ethereum/contractAbis.json";

export type EnsRecord = { name: string; value: string };

export async function setRecords(
  name: string,
  records: EnsRecord[],
  resolver: EnsResolver,
  wallet: Wallet,
): Promise<TransactionResponse> {
  assert(wallet.signer, "no signer available");

  const resolverContract = new ethers.Contract(
    resolver.address,
    ethereumContractAbis.resolver,
    wallet.signer,
  );
  const node = ethers.utils.namehash(name);

  const calls = [];
  const iface = new ethers.utils.Interface(ethereumContractAbis.resolver);

  for (const r of records) {
    switch (r.name) {
      case "address":
        calls.push(iface.encodeFunctionData("setAddr", [node, r.value]));
        break;
      case "url":
      case "avatar":
        calls.push(
          iface.encodeFunctionData("setText", [node, r.name, r.value]),
        );
        break;
      case "github":
      case "twitter":
        calls.push(
          iface.encodeFunctionData("setText", [node, "com." + r.name, r.value]),
        );
        break;
      case "id":
      case "seed.id":
      case "seed.host":
      case "seed.git":
      case "seed.api":
        calls.push(
          iface.encodeFunctionData("setText", [
            node,
            "eth.radicle." + r.name,
            r.value,
          ]),
        );
        break;
      default:
        console.error(`unknown field "${r.name}"`);
    }
  }
  return resolverContract.multicall(calls);
}
