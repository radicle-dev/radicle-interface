import { writable } from "svelte/store";
import { ethers } from "ethers";
import { getConfig } from "./config.js";

export const CONNECTION = {
  DISCONNECTED: 0,
  CONNECTING: 1,
  CONNECTED: 2
};

export const session = writable({
  connection: CONNECTION.DISCONNECTED,
});

const tokenAbi = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address, uint256) returns (bool)",
  "function allowance(address, address) view returns (uint256)",
];

export async function connectWallet() {
  session.set({ connection: CONNECTION.CONNECTING });

  // TODO: This hangs on Brave, if you have to unlock your wallet..
  try {
    let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  } catch (e) {
    console.error(e);
  }

  const config = await getConfig();

  const token = new ethers.Contract(config.radToken.address, tokenAbi, config.provider);
  const signer = config.provider.getSigner();

  let addr = await signer.getAddress();

  try {
    let tokenBalance = await token.balanceOf(addr);
    session.set({
      address: addr,
      tokenBalance: tokenBalance,
      connection: CONNECTION.CONNECTED
    });
  } catch (e) {
    console.error(e);
  }
}

export async function approveSpender(spender, amount, config) {
  const token = new ethers.Contract(config.radToken.address, tokenAbi, config.provider);
  const signer = config.provider.getSigner();
  const addr = await signer.getAddress();

  const allowance = await token.allowance(addr, spender);

  if (allowance < amount) {
    let tx = await token.connect(signer).approve(spender, amount);
    await tx.wait();
  }
}

export async function updateBalance(n) {
  session.update((s) => {
    s.tokenBalance = s.tokenBalance.add(n);
    return s;
  });
}

export function disconnectWallet() {
  location.reload();
}

export function shortAddress(addr) {
  return addr.substring(0, 6)
    + '...'
    + addr.substring(addr.length - 4, addr.length);
}
