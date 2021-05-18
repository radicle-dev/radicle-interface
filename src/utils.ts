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
// returns the label, eg. 'cloudhead', otherwise `null`.
export function parseEnsLabel(name: string, config: Config): string | null {
  let domain = config.registrar.domain.replace(".", "\\.");
  let label = name.replace(new RegExp(`\\.${domain}$`), "");

  return label;
}

// Return the current unix time.
export function unixTime(): number {
  return Math.floor(Date.now() / 1000);
}

// Check whether the input is a Radicle ID.
export function isRadicleId(input: string): boolean {
  return /^rad:[a-z]+:[a-zA-Z0-9]+$/.test(input);
}

export function getSearchParam(key: string, location: RouteLocation): string | null {
  let params = new URLSearchParams(location.search);
  return params.get(key);
};
