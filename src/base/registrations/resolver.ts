import type { TransactionResponse } from '@ethersproject/providers';
import type { EnsResolver } from '@ethersproject/providers';
import { ethers } from 'ethers';
import type { Config } from '@app/config';
import { assert } from '@app/error';

export type EnsRecord = { name: string; value: string };

export async function setRecords(name: string, records: EnsRecord[], resolver: EnsResolver, config: Config): Promise<TransactionResponse> {
  assert(config.signer, "no signer available");

  const resolverContract = new ethers.Contract(resolver.address, config.abi.resolver, config.signer);
  const node = ethers.utils.namehash(`${name}.${config.registrar.domain}`);

  const calls = [];
  const iface = new ethers.utils.Interface(config.abi.resolver);

  for (const r of records) {
    switch (r.name) {
      case "address":
        calls.push(
          iface.encodeFunctionData("setAddr", [node, r.value])
        );
        break;
      case "url":
      case "avatar":
        calls.push(
          iface.encodeFunctionData("setText", [node, r.name, r.value])
        );
        break;
      case "github":
      case "twitter":
        calls.push(
          iface.encodeFunctionData("setText", [node, "com." + r.name, r.value])
        );
        break;
      case "seed.id":
      case "seed.api":
        calls.push(
          iface.encodeFunctionData("setText", [node, "eth.radicle." + r.name, r.value])
        );
        break;
      default:
        console.error(`unknown field "${r.name}"`);
    }
  }
  return resolverContract.multicall(calls);
}
