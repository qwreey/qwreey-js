export class CachedGetter<Res> {
  private func: () => Promise<Res>;
  private interval: number;
  private value?: Promise<Res>;
  private last?: number;

  public constructor(func: () => Promise<Res>, interval: number) {
    this.func = func;
    this.interval = interval;
  }

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

export class CachedGetterMap<Res, Key> {
  private func: (key: Key) => Promise<Res>;
  private interval: number;
  private values: Map<Key, CachedGetterMap.Record<Res>>;

  public constructor(func: (key: Key) => Promise<Res>, interval: number) {
    this.func = func;
    this.values = new Map();
    this.interval = interval;
  }

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
