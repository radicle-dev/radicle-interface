import type { ZodSchema } from "zod";

import { literal, object } from "zod";

export interface SuccessResponse {
  success: true;
}

export const successResponseSchema = object({
  success: literal(true),
}) satisfies ZodSchema<SuccessResponse>;
