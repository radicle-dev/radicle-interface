import * as zod from "zod";

export interface Root {
  message: "Welcome!";
  service: "radicle-http-api";
  version: string;
  peer: {
    id: string;
  };
  path: string;
  links: {
    href: string;
    rel: string;
    type: "GET";
  }[];
}

export const rootSchema: zod.Schema<Root> = zod.object({
  message: zod.literal("Welcome!"),
  service: zod.literal("radicle-http-api"),
  version: zod.string(),
  peer: zod.object({
    id: zod.string(),
  }),
  path: zod.string(),
  links: zod.array(
    zod.object({
      href: zod.string(),
      rel: zod.string(),
      type: zod.literal("GET"),
    }),
  ),
});
