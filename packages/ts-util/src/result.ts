/**
 * A discriminated union type that can represent either a successful value of type `T` or an error of type `U`.
 */
export type Result<T, U> =
  | {
      result: undefined;
      error: U;
      ok: false;
    }
  | {
      result: T;
      error: undefined;
      ok: true;
    };

export namespace Result {
  /**
   * Creates a successful result object containing the provided `result` value.
   * @param result The successful value to wrap.
   */
  export function ok<T>(result: T): { result: T; error: undefined; ok: true } {
    return { error: undefined, result, ok: true };
  }

  /**
   * Creates an error result object containing the provided `error` value.
   * @param error The error value or object to wrap.
   */
  export function err<U>(error: U): { result: undefined; error: U; ok: false } {
    return { error, result: undefined, ok: false };
  }
}

export const Ok = Result.ok;
export const Err = Result.err;
