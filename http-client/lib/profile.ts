import type { Fetcher, RequestOptions } from "./fetcher.js";
import type { z } from "zod";

import { array, boolean, object, string } from "zod";
import { nodeConfigSchema } from "./shared.js";

const profileSchema = object({
  config: object({
    publicExplorer: string(),
    preferredSeeds: array(string()),
    cli: object({ hints: boolean() }),
    node: nodeConfigSchema,
  }),
  home: string(),
});

export type Profile = z.infer<typeof profileSchema>;

export class Client {
  #fetcher: Fetcher;

  public constructor(fetcher: Fetcher) {
    this.#fetcher = fetcher;
  }

  public async getProfile(options?: RequestOptions): Promise<Profile> {
    return this.#fetcher.fetchOk(
      {
        method: "GET",
        path: `profile`,
        options,
      },
      profileSchema,
    );
  }
}
