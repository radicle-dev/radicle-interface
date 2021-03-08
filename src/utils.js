import { ethers } from "ethers";

export function formatBalance(n) {
  return ethers.utils.commify(parseFloat(ethers.utils.formatUnits(n)).toFixed(2));
}
