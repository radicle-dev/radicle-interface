import { ethers } from "ethers";
import type { BigNumber } from "ethers";

export function formatBalance(n: BigNumber) {
  return ethers.utils.commify(parseFloat(ethers.utils.formatUnits(n)).toFixed(2));
}

export function formatAddress(addr: string) {
  return addr.substring(0, 6)
    + '...'
    + addr.substring(addr.length - 4, addr.length);
}

export function capitalize(s: string) {
  if (s === "") return s;
  return s[0].toUpperCase() + s.substr(1);
}
