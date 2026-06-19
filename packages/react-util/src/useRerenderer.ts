"use client";

import { useRef, useState } from "react";

export type Rerenderer = (() => void) & { value: any };

function createRerenderer(
  value: null | [],
  updateFn: React.Dispatch<React.SetStateAction<null | []>>,
): Rerenderer {
  let fn: Rerenderer;
  // eslint-disable-next-line prefer-const
  fn = (() => {
    fn.value = [];
    updateFn(fn.value);
  }) as Rerenderer;
  fn.value = value;
  return fn;
}

export function useRerenderer(): Rerenderer {
  const [value, update] = useState<null | []>(null);
  const updateWrap = useRef<Rerenderer>(null);

  return (updateWrap.current ??= createRerenderer(value, update));
}
