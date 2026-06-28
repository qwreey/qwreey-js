"use client";

import React from "react";
import { useLatest } from "./useLatest.js";

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
  const [value, setValue] = React.useState(() => input);
  const timeoutRef = React.useRef<any>(undefined);
  const latestDelay = useLatest(delay);

  const delayMs = React.useMemo(
    () =>
      value === input
        ? null
        : typeof latestDelay.current === "function"
          ? latestDelay.current(input)
          : latestDelay.current,
    [input, value],
  );
  if (delayMs === 0) {
    setValue(() => input);
    clearTimeout(timeoutRef.current);
  }

  React.useEffect(() => {
    if (delayMs === 0 || delayMs === null) return;

    timeoutRef.current = setTimeout(() => {
      setValue(() => input);
    }, delayMs);

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [input, delayMs]);

  return value;
}
