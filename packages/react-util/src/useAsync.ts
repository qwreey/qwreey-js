"use client";

import { Result } from "@qwreey-js/ts-util";
import React from "react";

/**
 * A React hook that handles the execution and state management of an asynchronous function.
 * It re-executes the function (`func`) whenever the dependencies update.
 * @template T The tuple type of arguments to be passed to the async function.
 * @template U The type of the result value returned when the async function completes.
 * @param {(...args: T) => Promise<U>} func The asynchronous function to execute.
 * @param {T} [args] An array of arguments to pass to the async function `func`.
 * @param {Array<unknown>} dependencies The dependency array that triggers a re-execution (same as `useEffect`'s dependency array).
 * @returns {Result<U, Error> | null} Returns `null` if the task is in progress or not yet completed.
 * Once completed, it returns a `Result` object containing either a success (`Result.ok`) or an error (`Result.err`) state.
 */
export function useAsync<T extends Array<unknown>, U>(
  func: (...args: T) => Promise<U>,
  args: T = [] as unknown as T,
  dependencies: Array<unknown>,
): Result<U, Error> | null {
  const [result, setResult] = React.useState<Result<U, Error> | null>(null);

  React.useEffect(() => {
    func(...args)
      .then((value) => {
        setResult(Result.ok(value));
      })
      .catch((reason: Error) => {
        console.error(
          `promise exception ${reason?.name}: ${reason?.message}\n${reason?.stack}`,
        );
        setResult(Result.err(reason));
      });
  }, dependencies ?? []);

  return result;
}
