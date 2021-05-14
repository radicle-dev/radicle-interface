import { ethers } from "ethers";
import type { BigNumber } from "ethers";
import type { Config } from '@app/config';

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

// Takes a domain name, eg. 'cloudhead.radicle.eth' and
// returns the label, eg. 'cloudhead'.
export function parseEnsLabel(name: string, config: Config) {
  let domain = config.registrar.domain.replace(".", "\\.");
  return name.replace(new RegExp(`\\.${domain}$`), "");
}

// Return the current unix time.
export function unixTime(): number {
  return Math.floor(Date.now() / 1000);
}
