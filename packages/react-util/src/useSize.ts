"use client";

import React from "react";
import { isServer } from "./util.js";
import { useLatest } from "./useLatest.js";

/**
 * Represents the dimensions of an HTML element.
 */
export type Size = {
  width: number;
  height: number;
  target: HTMLElement;
  entry: ResizeObserverEntry;
};

/**
 * Callback function triggered when the observed element's size changes.
 * * @param {Size} size - The updated width and height.
 */
export type UseSizeCallback = (size: Size) => any;

/**
 * Observes changes in an element's size and triggers a callback.
 *
 * @remarks Direct modification of the ref value is not supported. Please assign it to the ref prop of a rendered element.
 *
 * @template Elem
 * @param {React.RefObject<Elem | null>} container - The ref of the target element.
 * @param {UseSizeCallback} callback - The function to execute on size change.
 * @param {any[]} callbackDeps - Dependency array to update the callback.
 * @param {"contentRect" | "clientSize" | "offsetSize"} [source="contentRect"] - The size measurement property to use.
 */
export function useSize<Elem extends HTMLElement>(
  container: React.RefObject<Elem | null>,
  callback: UseSizeCallback,
  callbackDeps: any[],
  source: "contentRect" | "clientSize" | "offsetSize" = "contentRect",
) {
  const callbackRef = useLatest(callback);
  const currentValue = React.useRef<Size | null>(null);

  // callback 의 디펜던시 업데이트시 callback 재수행
  React.useEffect(() => {
    if (currentValue.current) {
      callback(currentValue.current);
    }
  }, callbackDeps);

  // 컨테이너 변경에 따라 observer 생성
  React.useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const target = entry.target as HTMLElement;

      let width: number, height: number;
      if (source == "clientSize") {
        width = target.clientWidth;
        height = target.clientHeight;
      } else if (source == "contentRect") {
        width = entry.contentRect.width;
        height = entry.contentRect.height;
      } else {
        width = target.offsetWidth;
        height = target.offsetHeight;
      }
      currentValue.current = {
        width,
        height,
        target,
        entry: entry,
      };
      callbackRef.current(currentValue.current);
    });
    observer.observe(container.current);
    return observer.disconnect.bind(observer);
  }, [container.current]);
}

/**
 * A hook that returns an element's size as React state along with its ref.
 *
 * @remarks Direct modification of the ref value is not supported. Please assign it to the ref prop of a rendered element.
 *
 * @template Elem
 * @param {React.RefObject<Elem | null>} [ref] - An optional existing ref to attach.
 * @param {"contentRect" | "clientSize" | "offsetSize"} [source="contentRect"] - The size measurement property to use.
 * @returns {[React.RefObject<Elem | null>, Size | null]} A tuple containing the ref and current size state.
 */
export function useSizeState<Elem extends HTMLElement>(
  ref?: React.RefObject<Elem | null>,
  source: "contentRect" | "clientSize" | "offsetSize" = "contentRect",
): [React.RefObject<Elem | null>, Size | null] {
  const fallbackRef = React.useRef<Elem>(null);
  ref ??= fallbackRef;
  const [size, setSize] = React.useState<Size | null>(null);
  useSize(ref, setSize, [], source);

  return [ref, size];
}

/**
 * A hook that tracks and returns the size of the document body.
 *
 * @param {"contentRect" | "clientSize"} [source="contentRect"] - The size measurement property to use.
 * @returns {Size | null} The current size of the document body, or null if rendered on the server.
 */
export function useBodySizeState(
  source: "contentRect" | "clientSize" = "contentRect",
): Size | null {
  const ref = React.useRef(isServer() ? null : document.body);
  const [, sizeState] = useSizeState(ref, source);

  return sizeState;
}

/**
 * Calculates the optimal coordinates for a floating element to ensure it stays within its container.
 *
 * @remarks
 * If the widget overflows the bottom edge, attempt to place it on the top side.
 * If it still overflows the top edge after flipping, clamp it to the bottom-most visible boundary.
 * (Fallback to 0 if the container is smaller than the widget)
 *
 * @param {[number, number]} targetPos - The reference coordinates (x, y) relative to the container, around which the element is placed.
 * @param {Size | undefined | null} popupSize - The dimensions of the floating element.
 * @param {Size | undefined | null} containerSize - The dimensions of the bounding container.
 * @param {number} [offsetX=0] - The horizontal gap to prevent overlapping with the cursor or target.
 * @param {number} [offsetY=0] - The vertical gap to prevent overlapping with the cursor or target.
 * @returns {[number, number]} The adjusted (x, y) coordinates, relative to the container, to ensure the element stays fully visible.
 */
export function getContainedPosition(
  targetPos: [number, number],
  popupSize: Size | undefined | null,
  containerSize: Size | undefined | null,
  offsetX: number = 0,
  offsetY: number = 0,
): [number, number] {
  const bodyWidth = containerSize?.width ?? 0;
  const bodyHeight = containerSize?.height ?? 0;
  const width = popupSize?.width ?? 0;
  const height = popupSize?.height ?? 0;

  let x = targetPos[0] + offsetX;
  let y = targetPos[1] + offsetY;

  if (bodyWidth < x + width) {
    x = targetPos[0] - offsetX - width;
    if (x < 0) {
      if (bodyWidth >= width) {
        x = bodyWidth - width;
      } else {
        x = 0;
      }
    }
  }
  if (bodyHeight < y + height) {
    y = targetPos[1] - offsetY - height;
    if (y < 0) {
      if (bodyHeight >= height) {
        y = bodyHeight - height;
      } else {
        y = 0;
      }
    }
  }
  return [x, y];
}
