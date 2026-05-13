"use client";

import React from "react";
import { isServer } from "./util.js";

/**
 * Represents the scroll dimensions, position, and status of an element.
 */
export type Scroll = {
  scrollWidth: number;
  scrollHeight: number;
  clientWidth: number;
  clientHeight: number;
  scrollTop: number;
  scrollLeft: number;
  isStopped: boolean;
};

/**
 * Callback function triggered when a scroll event occurs.
 *
 * @param {Scroll} size - The updated scroll dimensions and status.
 */
export type UseScrollCallback = (size: Scroll) => any;

/**
 * Observes scroll events on a target element and triggers a callback.
 *
 * @remarks Direct modification of the ref value is not supported. Please assign it to the ref prop of a rendered element.
 *
 * @template Elem
 * @param {React.RefObject<Elem | null>} container - The ref of the scrollable element.
 * @param {UseScrollCallback} callback - The function to execute on scroll.
 * @param {any[]} callbackDeps - Dependency array to update the callback.
 */
export function useScroll<Elem extends HTMLElement>(
  container: React.RefObject<Elem | null>,
  callback: UseScrollCallback,
  callbackDeps: any[],
) {
  const callbackRef = React.useRef(callback);
  const currentValue = React.useRef<Scroll | null>(null);

  // callback 의 디펜던시 업데이트시 callback 재수행
  React.useEffect(() => {
    callbackRef.current = callback;
    if (currentValue.current) {
      callback(currentValue.current);
    }
  }, callbackDeps);

  // 컨테이너에 scroll 이벤트 바인딩 추가
  React.useEffect(() => {
    const element = container.current;
    if (!element) return;
    const onScroll = (event: Event | null) => {
      currentValue.current = {
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
        scrollLeft: element.scrollLeft,
        scrollTop: element.scrollTop,
        scrollHeight: element.scrollHeight,
        clientHeight: element.clientHeight,
        isStopped: event == null || event.type == "scrollend",
      };
      callbackRef.current(currentValue.current);
    };
    onScroll(null);
    element.addEventListener("scroll", onScroll);
    element.addEventListener("scrollend", onScroll);
    return () => {
      element.removeEventListener("scroll", onScroll);
      element.removeEventListener("scrollend", onScroll);
    };
  }, [container.current]);
}

/**
 * A hook that returns an element's scroll data as React state along with its ref.
 *
 * @remarks Direct modification of the ref value is not supported. Please assign it to the ref prop of a rendered element.
 *
 * @template Elem
 * @param {React.RefObject<Elem | null>} [ref] - An optional existing ref to attach.
 * @returns {[React.RefObject<Elem | null>, Scroll | null]} A tuple containing the ref and current scroll state.
 *
 * @remarks
 * Direct modification of the ref value is not supported. Please assign it to the `ref` prop of a rendered element.
 */
export function useScrollState<Elem extends HTMLElement>(
  ref?: React.RefObject<Elem | null>,
): [React.RefObject<Elem | null>, Scroll | null] {
  const fallbackRef = React.useRef<Elem>(null);
  ref ??= fallbackRef;
  const [scroll, setScroll] = React.useState<Scroll | null>(null);
  useScroll(ref, setScroll, []);

  return [ref, scroll];
}

/**
 * A hook that tracks and returns the scroll state of the document body.
 *
 * @returns {Scroll | null} The current scroll state of the document body, or null if rendered on the server.
 */
export function useBodyScrollState(): Scroll | null {
  const ref = React.useRef(isServer() ? null : document.body);
  const [, scroll] = useScrollState(ref);
  return scroll;
}
