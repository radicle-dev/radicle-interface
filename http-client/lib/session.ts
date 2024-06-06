import type { Fetcher, RequestOptions } from "./fetcher.js";
import type { SuccessResponse } from "./shared.js";
import type { z } from "zod";

import { number, object, string } from "zod";

import { successResponseSchema } from "./shared.js";

export const sessionPayloadSchema = object({
  sessionId: string(),
  signature: string(),
  publicKey: string(),
});

export type SessionPayload = z.infer<typeof sessionPayloadSchema>;

const sessionSchema = object({
  sessionId: string(),
  status: string(),
  publicKey: string(),
  alias: string(),
  issuedAt: number(),
  expiresAt: number(),
});

export type Session = z.infer<typeof sessionSchema>;

export class Client {
  #fetcher: Fetcher;

  public constructor(fetcher: Fetcher) {
    this.#fetcher = fetcher;
  }

  public async getById(id: string, options?: RequestOptions): Promise<Session> {
    return this.#fetcher.fetchOk(
      {
        method: "GET",
        path: `sessions/${id}`,
        options,
      },
      sessionSchema,
    );
  }

  public async create(options?: RequestOptions): Promise<Session> {
    return this.#fetcher.fetchOk(
      {
        method: "POST",
        path: "sessions",
        options,
      },
      sessionSchema,
    );
  }

  public async update(
    id: string,
    body: {
      sig: string;
      pk: string;
    },
    options?: RequestOptions,
  ): Promise<SuccessResponse> {
    return this.#fetcher.fetchOk(
      {
        method: "PUT",
        path: `sessions/${id}`,
        body,
        options,
      },
      successResponseSchema,
    );
  }

  public async delete(
    id: string,
    options?: RequestOptions,
  ): Promise<SuccessResponse> {
    return this.#fetcher.fetchOk(
      {
        method: "DELETE",
        path: `sessions/${id}`,
        headers: { Authorization: `Bearer ${id}` },
        options,
      },
      successResponseSchema,
    );
  }
}
