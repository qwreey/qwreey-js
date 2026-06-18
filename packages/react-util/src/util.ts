import type React from "react";

/**
 * Determines whether the code is running on the server.
 * Useful in SSR environments to prevent accessing browser-only APIs like `window`.
 *
 * @returns {boolean} `true` if the environment is server-side, `false` if client-side.
 */
export function isServer(): boolean {
  return typeof window === "undefined";
}

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
