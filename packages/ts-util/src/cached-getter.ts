/**
 * A utility for caching the result of an asynchronous function for a specified Time-To-Live (TTL, interval).
 * If `getValue` is called multiple times within the TTL, it returns the cached result instead of executing the function again.
 */
export class CachedGetter<Res> {
  private func: () => Promise<Res>;
  private interval: number;
  private value?: Promise<Res>;
  private last?: number;

  /**
   * @param func The asynchronous function to execute and cache.
   * @param interval The Time-To-Live interval in milliseconds.
   */
  public constructor(func: () => Promise<Res>, interval: number) {
    this.func = func;
    this.interval = interval;
  }

  /**
   * Retrieves the cached value or executes the function if the cache has expired or is missing.
   */
  public async getValue(): Promise<Res> {
    const curr = +new Date();
    if (!this.value || !this.last || this.last + this.interval < curr) {
      this.last = curr;
      this.value = this.func();
      return await this.value;
    }
    return await this.value;
  }
}

/**
 * A mapped variant of `CachedGetter`. It caches multiple asynchronous function results based on unique keys.
 */
export class CachedGetterMap<Res, Key> {
  private func: (key: Key) => Promise<Res>;
  private interval: number;
  private values: Map<Key, CachedGetterMap.Record<Res>>;

  /**
   * @param func The asynchronous function to execute and cache per key.
   * @param interval The Time-To-Live interval in milliseconds.
   */
  public constructor(func: (key: Key) => Promise<Res>, interval: number) {
    this.func = func;
    this.values = new Map();
    this.interval = interval;
  }

  /**
   * Retrieves the cached value for the specific key, or executes the function if the cache has expired or is missing.
   * @param key The unique key identifying the cached result.
   */
  public async getValue(key: Key): Promise<Res> {
    const curr = +new Date();
    const record = this.values.get(key);

    if (!record || record.last + this.interval < curr) {
      const value = this.func(key);
      this.values.set(key, {
        last: curr,
        value,
      });
      return await value;
    }
    return await record.value;
  }
}
export namespace CachedGetterMap {
  export type Record<Res> = {
    value: Promise<Res>;
    last: number;
  };
}
