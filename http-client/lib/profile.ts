import type { Fetcher, RequestOptions } from "./fetcher.js";
import type { z } from "zod";

import { object, string } from "zod";
import { configSchema } from "./shared.js";

const profileSchema = object({
  config: configSchema,
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
