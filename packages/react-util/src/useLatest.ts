"use client";

import React from "react";

/**
 * Returns a mutable ref object whose `.current` property is always synchronized with the latest value.
 *
 * @description
 * This hook is designed to solve the "stale closure" problem in React. By silently updating
 * the ref during every render phase, it guarantees access to the most recent state, prop, or
 * callback inside asynchronous operations, event handlers, or effect cleanups—without needing
 * to include them in dependency arrays and triggering unnecessary re-evaluations.
 *
 * @template T
 * @param {T} value - The dynamic value (such as a callback function or state) to track.
 * @returns {React.RefObject<T>} A ref object consistently holding the latest value.
 */
export function useLatest<T>(value: T): React.RefObject<T> {
  const ref = React.useRef(value);
  ref.current = value;
  return ref;
}
