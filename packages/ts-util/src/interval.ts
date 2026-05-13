import { logErr } from "./libLog.js";

export class Interval<T> {
  private func: () => T;
  private interval: number;
  private id?: any;
  private running: boolean;
  private name: string;
  private _result?: T;

  public constructor(
    func: () => T,
    interval: number,
    name: string = "default",
  ) {
    this.func = func;
    this.interval = interval;
    this.running = false;
    this.name = name;
  }

  public run() {
    if (this.running) {
      throw Error("interval already started");
    }
    this.running = true;
    const currId = (this.id = setTimeout(() => {
      try {
        this._result = this.func();
      } catch (e) {
        logErr(`interval failed(${this.name}): ${e}`);
      }
      if (currId == this.id) {
        this.running = false;
        this.run();
      }
    }, this.interval) as any);
  }

  public drop() {
    this.running = false;
    if (this.id) {
      clearTimeout(this.id as any);
      delete this.id;
    }
  }

  public execute() {
    const running = this.running;
    if (running) this.drop();
    try {
      this._result = this.func();
    } catch (e) {
      logErr(`interval failed(${this.name}): ${e}`);
    }
    if (running) this.run();
  }

  public executeThenRun() {
    this.execute();
    if (!this.running) {
      this.run();
    }
  }

  public get result(): T | undefined {
    return this._result;
  }
}

export class IntervalAsync<T> {
  private func: () => Promise<T>;
  private interval: number;
  private id?: any;
  private running: boolean;
  private name: string;
  private _result?: Promise<T>;

  public constructor(
    func: () => Promise<T>,
    interval: number,
    name: string = "default",
  ) {
    this.func = func;
    this.interval = interval;
    this.running = false;
    this.name = name;
  }

  public run() {
    if (this.running) {
      throw Error("interval already started");
    }
    this.running = true;
    const currId = (this.id = setTimeout(async () => {
      try {
        await (this._result = this.func());
      } catch (e) {
        logErr(`interval failed(${this.name}): ${e}`);
      }
      if (currId == this.id) {
        this.running = false;
        this.run();
      }
    }, this.interval) as any);
  }

  public drop() {
    this.running = false;
    if (this.id) {
      clearTimeout(this.id as any);
      delete this.id;
    }
  }

  public async execute() {
    const running = this.running;
    if (running) this.drop();
    try {
      await (this._result = this.func());
    } catch (e) {
      logErr(`interval failed(${this.name}): ${e}`);
    }
    if (running) this.run();
  }

  public async executeThenRun() {
    await this.execute();
    if (!this.running) {
      this.run();
    }
  }

  public get result(): Promise<T> | undefined {
    return this._result;
  }
}
