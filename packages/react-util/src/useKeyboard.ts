"use client";

import React from "react";
import { useLatest } from "./useLatest.js";

export type KeyboardCallback = (ev: KeyboardEvent) => any;
export function useKeyboard(callback: KeyboardCallback) {
  const latestCallback = useLatest(callback);

  React.useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent) => {
      latestCallback.current(ev);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
}
