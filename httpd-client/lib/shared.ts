import type { ZodSchema } from "zod";

import { literal, strictObject } from "zod";

export interface SuccessResponse {
  success: true;
}

export const successResponseSchema = strictObject({
  success: literal(true),
}) satisfies ZodSchema<SuccessResponse>;
