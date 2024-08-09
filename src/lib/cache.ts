import { LRUCache } from "lru-cache";

export function cached<Args extends unknown[], V>(
  f: (...args: Args) => Promise<V>,
  makeKey: (...args: Args) => string,
  options?: LRUCache.Options<string, { value: V }, unknown>,
): (...args: Args) => Promise<V> {
  const cache = new LRUCache(options || { max: 500 });
  return async function (...args: Args): Promise<V> {
    const key = makeKey(...args);
    const cached = cache.get(key);

    if (cached === undefined) {
      const value = await f(...args);
      cache.set(key, { value });
      return value;
    } else {
      return cached.value;
    }
  };
}
