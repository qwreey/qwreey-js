import { logErr } from "./libLog.js";

/**
 * Executes a standard, synchronous function repeatedly based on the provided millisecond interval.
 */
export class Interval<T> {
  private func: () => T;
  private interval: number;
  private id?: any;
  private running: boolean;
  private name: string;
  private _result?: T;

  /**
   * @param func The synchronous function to execute.
   * @param interval The execution interval in milliseconds.
   * @param name Optional name for logging purposes.
   */
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

  /**
   * Schedules the function execution using a timeout. Throws an error if the interval is already running.
   */
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

  /**
   * Clears the current timeout and stops the interval.
   */
  public drop() {
    this.running = false;
    if (this.id) {
      clearTimeout(this.id as any);
      delete this.id;
    }
  }

  /**
   * Immediately executes the function. Resets the timeout if it is already running.
   */
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

  /**
   * Immediately executes the function and guarantees that the interval continues running afterward.
   */
  public executeThenRun() {
    this.execute();
    if (!this.running) {
      this.run();
    }
  }

  /**
   * Returns the return value of the last executed function.
   */
  public get result(): T | undefined {
    return this._result;
  }
}

/**
 * Executes an asynchronous function repeatedly based on the provided millisecond interval.
 */
export class IntervalAsync<T> {
  private func: () => Promise<T>;
  private interval: number;
  private id?: any;
  private running: boolean;
  private name: string;
  private _result?: Promise<T>;

  /**
   * @param func The asynchronous function to execute.
   * @param interval The execution interval in milliseconds.
   * @param name Optional name for logging purposes.
   */
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

  /**
   * Schedules the function execution using a timeout. Throws an error if the interval is already running.
   */
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

  /**
   * Clears the current timeout and stops the interval.
   */
  public drop() {
    this.running = false;
    if (this.id) {
      clearTimeout(this.id as any);
      delete this.id;
    }
  }

  /**
   * Immediately executes the function. Resets the timeout if it is already running.
   */
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

  /**
   * Immediately executes the function and guarantees that the interval continues running afterward.
   */
  public async executeThenRun() {
    await this.execute();
    if (!this.running) {
      this.run();
    }
  }

  /**
   * Returns the Promise of the last executed function.
   */
  public get result(): Promise<T> | undefined {
    return this._result;
  }
}
