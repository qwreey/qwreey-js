"use client";

import { useState } from "react";

type DependencyList = ReadonlyArray<unknown>;

/**
 * Runs a synchronous effect during the render phase when specified dependencies change.
 * * @description
 * Unlike React's standard `useEffect`, which fires asynchronously after the paint phase (commit phase),
 * `useInlineEffect` executes the provided callback **inline during the render phase**.
 * This prevents cascading renders and ensures state synchronization happens before the browser paints,
 * making it ideal for updating local or global state in response to prop/dependency updates without triggering
 * redundant layout shifts or extra render cycles.
 *
 * Internally, it performs a shallow equality check using `Object.is`, perfectly mirroring React's internal
 * dependency array comparison algorithm.
 *
 * @param {() => void} effect - The synchronous callback to execute inline when dependencies change.
 * @param {DependencyList} deps - An array of dependencies to watch for changes.
 * * @example
 * useInlineEffect(() => {
 * if (options.isSafeUnlocked.respond?.result && !isWon) {
 * setIsWon(true);
 * options.safeLockState.update(newGlobalState);
 * }
 * }, [options.isSafeUnlocked, isWon]);
 */
export function useInlineEffect(
  effect: () => void,
  deps: DependencyList,
): void {
  const [prevDeps, setPrevDeps] = useState<DependencyList>(deps);

  const hasChanged =
    deps.length !== prevDeps.length ||
    deps.some((dep, i) => !Object.is(dep, prevDeps[i]));

  if (hasChanged) {
    setPrevDeps(deps);
    effect();
  }
}
