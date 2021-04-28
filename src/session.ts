import { get, writable, Writable } from "svelte/store";
import { ethers } from "ethers";
import { getConfig } from "./config";

export enum Connection {
  Disconnected,
  Connecting,
  Connected
}

export type Session = {
  connection: Connection
  address?: string
  tokenBalance?: any
};

export const session: Writable<Session> = writable({
  connection: Connection.Disconnected,
});

session.subscribe(s => {
  console.log("Session", s);
});

const tokenAbi = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address, uint256) returns (bool)",
  "function allowance(address, address) view returns (uint256)",
];

export async function connectWallet() {
  session.set({ connection: Connection.Connecting });

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
      connection: Connection.Connected
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

export async function refreshBalance(config) {
  const addr = get(session).address;

  if (addr) {
    try {
      const token = new ethers.Contract(config.radToken.address, tokenAbi, config.provider);
      const tokenBalance = await token.balanceOf(addr);
      console.log("new balance", tokenBalance);

      session.update((s) => {
        s.tokenBalance = tokenBalance;
        return s;
      });
    } catch (e) {
      console.error(e);
    }
  }
}

export function disconnectWallet() {
  location.reload();
}
