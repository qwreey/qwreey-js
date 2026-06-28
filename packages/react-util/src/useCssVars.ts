"use client";

import React from "react";

/**
 * Converts camelCase object keys to kebab-case, prepends '--' to them,
 * and returns an object suitable for React inline CSS custom properties (variables).
 *
 * @param vars - An object containing key-value pairs to be converted into CSS variables.
 * @returns A React CSSProperties object that can be safely passed to the `style` prop without type errors.
 */
export function asCssVars(vars: { [key: string]: any }): React.CSSProperties {
  return Object.fromEntries(
    Object.entries(vars).map(([k, v]) => [
      "--" + k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()),
      v,
    ]),
  );
}

export function useCssVars(vars: { [key: string]: any }): React.CSSProperties {
  return React.useMemo(() => asCssVars(vars), Object.values(vars));
}
