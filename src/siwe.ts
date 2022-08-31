/* eslint-disable @typescript-eslint/naming-convention */
import { SiweMessage } from "siwe";
import { Request, type Host } from "@app/api";
import type { Config } from "@app/config";
import { connectSeed } from "@app/session";
import type { Seed } from "@app/base/seeds/Seed";

export interface SeedSession {
  domain: string;
  address: string;
  statement?: string;
  uri: string;
  version: string;
  chainId: string;
  nonce: string;
  issuedAt: number;
  expirationTime: number;
  resources: string[];
}

export function createSiweMessage(
  seed: Seed,
  address: string,
  nonce: string,
  config: Config,
): string {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const message = new SiweMessage({
    domain: seed.api.host,
    address,
    statement: "It's a Radicle world!",
    uri: window.location.origin,
    nonce,
    version: "1",
    expirationTime: nextWeek.toISOString(),
    chainId: config.network.chainId,
  });

  return message.prepareMessage();
}

export async function createUnauthorizedSession(
  host: Host,
): Promise<{ nonce: string; id: string }> {
  return await new Request(`sessions`, host).post();
}

/// Signs the user into given seed and returns when successfull a session id
export async function signInWithEthereum(
  seed: Seed,
  config: Config,
): Promise<{ id: string } | null> {
  if (!config.signer) {
    return null;
  }

  const address = await config.signer.getAddress();
  const result = await createUnauthorizedSession(seed.api);
  const message = createSiweMessage(seed, address, result.nonce, config);
  const signature = await config.signer.signMessage(message);

  const auth: {
    id: string;
    session: SeedSession;
  } = await new Request(`sessions/${result.id}`, seed.api).put({
    message,
    signature,
  });

  connectSeed({ id: result.id, session: auth.session });

  return { id: result.id };
}
