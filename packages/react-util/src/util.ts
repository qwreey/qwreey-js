/**
 * Determines whether the code is running on the server.
 * Useful in SSR environments to prevent accessing browser-only APIs like `window`.
 *
 * @returns {boolean} `true` if the environment is server-side, `false` if client-side.
 */
export function isServer(): boolean {
  return typeof window === "undefined";
}

export interface DOMRectCompat {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function transformInto<T extends DOMRectCompat, U extends DOMRectCompat>(
  current: T,
  into: U,
  anthorPoint: [number, number] = [0.5, 0.5],
): [string, string] {
  const diffX = into.x - current.x;
  const diffY = into.y - current.y;

  const scaleX = into.width / current.width;
  const scaleY = into.height / current.height;

  const originX = current.width * anthorPoint[0];
  const originY = current.height * anthorPoint[1];

  const scaleOffsetX = originX * (scaleX - 1);
  const scaleOffsetY = originY * (scaleY - 1);

  return [
    `translate(${diffX + scaleOffsetX}px, ${diffY + scaleOffsetY}px)`,
    `scale(${scaleX}, ${scaleY})`,
  ];
}
