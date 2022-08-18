import LruCache from "lru-cache";

// Creates a function that memoizes its result using an LRU cache.
//
// The cache key is a string created from the arguments using
// `makeKey`.
export function cached<Args extends unknown[], V>(
  f: (...args: Args) => Promise<V>,
  makeKey: (...args: Args) => string,
  options?: LruCache.Options<string, { value: V }>
): (...args: Args) => Promise<V> {
  const cache = new LruCache(options || { max: 500 });
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
