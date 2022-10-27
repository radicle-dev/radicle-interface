import { cached } from "@app/cache";
import { expect, test, vi } from "vitest";

test("it caches undefined return values", async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const inner = vi.fn(async (_: string) => undefined);
  const memoized = cached(inner, key => key);

  expect(await memoized("a")).toBe(undefined);
  expect(await memoized("a")).toBe(undefined);

  expect(inner).toHaveBeenCalledTimes(1);
});
