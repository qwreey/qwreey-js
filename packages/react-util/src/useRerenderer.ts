"use client";

import React from "react";

export type Trigger = () => void;
export type Key = number;
export type Rerenderer = { key: Key; trigger: Trigger };

export function useRerenderer(): Rerenderer {
  const [key, update] = React.useState(1);
  const trigger = React.useCallback(() => {
    update((curr) => curr + 1);
  }, []);
  const rerenderer = React.useMemo<Rerenderer>(() => ({ key, trigger }), [key]);
  return rerenderer;
}
