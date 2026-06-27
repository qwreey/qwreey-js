"use client";

import React from "react";

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
  const [value, update] = React.useState<null | []>(null);
  const updateWrap = React.useRef<Rerenderer>(null);

  return (updateWrap.current ??= createRerenderer(value, update));
}
