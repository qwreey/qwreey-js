"use client";

import React from "react";
import { isServer } from "./util.js";

export type KeyboardCallback = (ev: KeyboardEvent) => any;
export function useKeyboard(callback: KeyboardCallback) {
  const callbackRef = React.useRef(callback);
  callbackRef.current = callback;

  React.useEffect(() => {
    if (isServer()) return;

    const handleKeyDown = (ev: KeyboardEvent) => {
      callbackRef.current(ev);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
}
