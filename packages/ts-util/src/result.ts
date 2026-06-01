/**
 * A discriminated union type that can represent either a successful value of type `T` or an error of type `U`.
 */
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
  /**
   * Creates a successful result object containing the provided `result` value.
   * @param result The successful value to wrap.
   */
  export function ok<T>(result: T): { result: T; error: undefined } {
    return { error: undefined, result };
  }

  /**
   * Creates an error result object containing the provided `error` value.
   * @param error The error value or object to wrap.
   */
  export function err<U>(error: U): { result: undefined; error: U } {
    return { error, result: undefined };
  }
}

export const Ok = Result.ok;
export const Err = Result.err;
