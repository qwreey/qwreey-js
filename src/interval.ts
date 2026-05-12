import { logErr } from "./libLog.js";

// 입력받은 시간을 기준으로 함수를 반복 실행합니다.
// 처음 실행되지는 않습니다. drop 하거나 execute 할 수 있습니다
// execute 시 시간은 초기화됩니다 (0 초 부터 다시 카운팅)
// 내부 구현은 setInterval 로 구현됩니다
export class Interval {
  private func: Function;
  private interval: number;
  private id?: any;
  private running: boolean;
  private name: string;

  public constructor(
    func: Function,
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
    this.id = setTimeout(async () => {
      try {
        await (this.func() ?? null);
      } catch (e) {
        logErr(`interval failed(${this.name}): ${e}`);
      }
      this.running = false;
      this.run();
    }, this.interval) as any;
  }

  public drop() {
    this.running = false;
    if (this.id) {
      clearTimeout(this.id as any);
      delete this.id;
    }
  }

  public async executeAsync() {
    const running = this.running;
    if (running) this.drop();
    try {
      await (this.func() ?? null);
    } catch (e) {
      logErr(`interval failed(${this.name}): ${e}`);
    }
    if (running) this.run();
  }

  public execute(
    options: {
      runTimerAfterExecute?: boolean;
      runIn?: number;
    } = {},
  ) {
    setTimeout(async () => {
      await this.executeAsync();
      if (options.runTimerAfterExecute && !this.running) {
        this.run();
      }
    }, options.runIn ?? 0);
  }
}
