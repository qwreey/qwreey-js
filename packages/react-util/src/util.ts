/**
 * Determines whether the code is running on the server.
 * Useful in SSR environments to prevent accessing browser-only APIs like `window`.
 *
 * @returns {boolean} `true` if the environment is server-side, `false` if client-side.
 */
export function isServer(): boolean {
  return typeof window === "undefined";
}
