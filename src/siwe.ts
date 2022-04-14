/* eslint-disable @typescript-eslint/naming-convention */
import { SiweMessage } from "siwe";
import { Request, type Host } from '@app/api';
import type { Config } from "@app/config";
import { removePrefix } from "@app/utils";
import { connectSeed } from "./session";
import type { Seed } from "./base/seeds/Seed";

export interface SeedSession {
  domain: string;
  address: string;
  statement: string;
  uri: string;
  version: string;
  chain_id: string;
  nonce: string;
  issued_at: number;
  expiration_time: number;
  resources: string[];
}

export function createSiweMessage(seed: Seed, address: string, nonce: string, config: Config): string {
  const date = new Date();
  const expirationTime = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7).toISOString();

  const message = new SiweMessage({
    domain: seed.api.host,
    address,
    statement: `${seed.api.host} wants you to sign in with Ethereum`,
    uri: window.location.origin,
    nonce,
    version: '1',
    resources: [`rad:git:${seed.id}`],
    expirationTime,
    chainId: config.network.chainId
  });

  return message.prepareMessage();
}

export async function createUnauthorizedSession(host: Host): Promise<{ nonce: string; id: string }> {
  return await new Request(`sessions`, host).post();
}

/// Signs the user into given seed and returns when succesfull a session id
export async function signInWithEthereum(seed: Seed, config: Config): Promise<{ id: string } | null> {
  if (! config.signer) {
    return null;
  }

  const result = await createUnauthorizedSession(seed.api);
  const address = await config.signer.getAddress();
  const message = createSiweMessage(seed, address, result.nonce, config);
  const signature = await config.signer.signMessage(message);

  const auth: { id: string; session: SeedSession } = await new Request(`sessions/${result.id}`, seed.api).put({ message, signature: removePrefix(signature) });
  connectSeed({ id: result.id, session: auth.session });

  return { id: result.id };
}
