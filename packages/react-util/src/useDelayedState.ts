"use client";

import { useEffect, useState } from "react";

/**
 * A custom React hook that returns a state value which updates after a specified delay
 * when the input value changes.
 *
 * @template T The type of the input and state value.
 * @param {T} input - The current input value to be set after the delay.
 * @param {number | ((input: T) => number)} delay - The delay in milliseconds, or a function that returns the delay based on the input.
 * @returns {T} The delayed state value.
 */
export function useDelayedState<T>(
  input: T,
  delay: number | ((input: T) => number),
): T {
  const [value, setValue] = useState(input);

  useEffect(() => {
    const delayMs = typeof delay === "function" ? delay(input) : delay;

    const timeout = setTimeout(() => {
      setValue(input);
    }, delayMs);

    return () => {
      clearTimeout(timeout);
    };
  }, [input]);

  return value;
}
