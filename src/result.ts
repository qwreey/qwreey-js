export type Result<T, U> =
  | {
      result: undefined;
      error: U;
    }
  | {
      result: T;
      error: undefined;
    };

export namespace Result {
  export function ok<T>(result: T): { result: T; error: undefined } {
    return { error: undefined, result };
  }
  export function err<U>(error: U): { result: undefined; error: U } {
    return { error, result: undefined };
  }
}
