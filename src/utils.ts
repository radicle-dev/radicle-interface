import { ethers } from "ethers";

export function formatBalance(n) {
  return ethers.utils.commify(parseFloat(ethers.utils.formatUnits(n)).toFixed(2));
}

export function formatAddress(addr) {
  return addr.substring(0, 6)
    + '...'
    + addr.substring(addr.length - 4, addr.length);
}
