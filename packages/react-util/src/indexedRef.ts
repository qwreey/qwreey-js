"use client";

import { useRef } from "react";

export function indexedRef<
  Elem,
  RefObjInner extends (Elem | null)[] | { [key: string]: Elem | null },
>(
  obj: React.RefObject<RefObjInner>,
  idx: RefObjInner extends (Elem | null)[] ? number : string,
): (item: Elem | null) => void {
  return (item: Elem | null) => {
    (obj.current as any)[idx] = item;
  };
}

/**
 * Utility to assign a node to any type of React ref
 */
export function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) return;

  if (typeof ref === "function") {
    ref(value); // Handle Function / Callback Ref
  } else {
    (ref as React.RefObject<T | null>).current = value; // Handle RefObject
  }
}

export function useArrayRef<Elem>(): React.RefObject<(Elem | null)[]> {
  return useRef<(Elem | null)[]>([]);
}

export function useMapRef<Elem>(): React.RefObject<{
  [key: string]: Elem | null;
}> {
  return useRef<{ [key: string]: Elem | null }>({});
}
