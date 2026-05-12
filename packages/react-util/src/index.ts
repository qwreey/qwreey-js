import React from "react";

export * from "./passState.js";
import { PassState } from "./passState.js";
export const usePassState = PassState.use;

// #region useSize hook
// 객체의 크기 변경을 감지합니다.
// ref 로써 대상 객체를 제공해야합니다. 즉
//
// const ref = useRef<HtmlDivElement>(null);
// useSize(ref, ({width, height})=>console.log(width, height), []);
// return <div ref={ref}></div>
//
// 는 div 의 크기 변경을 추적하여 콘솔에 log 하게 됩니다. 만약 디펜던시가
// 부여된 경우 디펜던시의 변경에 따라 callback 함수가 다시 수행될 수 있습니다.
// 가장 처음 useSize 를 수행했을 때 크기 변경이 감지되지 않더라도 요소의 크기를
// callback 으로 보고합니다.
export type Size = { width: number; height: number };
export type UseSizeCallback = (size: Size) => any;
export function useSize(
  container: React.RefObject<HTMLElement | null>,
  callback: UseSizeCallback,
  callbackDeps: any[],
  source: "contentRect" | "clientSize" = "contentRect",
) {
  "use client";

  const callbackRef = React.useRef(callback);
  const currentValue = React.useRef<Size | null>(null);

  // callback 의 디펜던시 업데이트시 callback 재수행
  React.useEffect(() => {
    callbackRef.current = callback;
    if (currentValue.current) {
      callback(currentValue.current);
    }
  }, callbackDeps);

  // 컨테이너 변경에 따라 observer 생성
  React.useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver((entries) => {
      const target = entries[0];
      if (!target) return;
      let { width, height } = target.contentRect;
      if (source == "clientSize") {
        width = target.target.clientWidth;
        height = target.target.clientHeight;
      } else if (source == "contentRect") {
        width = target.contentRect.width;
        height = target.contentRect.height;
      }
      currentValue.current = { width, height };
      callback(currentValue.current);
    });
    observer.observe(container.current);
    return observer.disconnect.bind(observer);
  }, [container.current]);
}
export function useSizeState<Elem extends HTMLElement>(
  ref?: React.RefObject<Elem | null>,
  source: "contentRect" | "clientSize" = "contentRect",
): [React.RefObject<Elem | null>, Size | null] {
  "use client";

  ref ??= React.useRef<Elem>(null);
  const [size, setSize] = React.useState<Size | null>(null);
  useSize(ref, setSize, [], source);

  return [ref, size];
}
export function useBodySizeState(
  source: "contentRect" | "clientSize" = "contentRect",
): Size | null {
  "use client";

  if (isServer()) return null;
  const ref = React.useRef(document.body);
  const sizeState = useSizeState(ref, source);

  return sizeState[1];
}
// #endregion useSize hook

export function calcHoverWidgetPosition(
  pos: [number, number],
  size: Size | undefined | null,
  bodySize: Size | undefined | null,
  xGap: number = 0,
  yGap: number = 0,
): [number, number] {
  const bodyWidth = bodySize?.width ?? 0;
  const bodyHeight = bodySize?.height ?? 0;
  const width = size?.width ?? 0;
  const height = size?.height ?? 0;

  let x = pos[0] + xGap;
  let y = pos[1] + yGap;

  if (bodyWidth < x + width) {
    x = pos[0] - xGap - width;
    if (x < 0) {
      if (bodyWidth >= width) {
        x = bodyWidth - width;
      } else {
        x = 0;
      }
    }
  }
  if (bodyHeight < y + height) {
    y = pos[0] - yGap - height;
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

// #region useScroll hook
export type Scroll = {
  scrollWidth: number;
  scrollHeight: number;
  clientWidth: number;
  clientHeight: number;
  scrollTop: number;
  scrollLeft: number;
  isStopped: boolean;
};
export type UseScrollCallback = (size: Scroll) => any;
export function useScroll(
  container: React.RefObject<HTMLElement>,
  callback: UseScrollCallback,
  callbackDeps: any[],
) {
  "use client";

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
      callback(currentValue.current);
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
export function useBodyScroll(
  callback: UseScrollCallback,
  callbackDeps: any[],
) {
  "use client";

  if (isServer()) return;
  const ref = React.useRef(document.body);
  useScroll(ref, callback, callbackDeps);
}
// #endregion useScroll hook

// #region className utility
export type ClassNameType = string | undefined | false | null;
// 문자열이 들어있는, null 또는 undefined 필드가 허용되는 배열
// 또는 문자열
// 또는 null 또는 undefined 를
// 클래스 네임으로 받아 합칩니다
// 즉, mergeClassName("classname1", null, undefined, [null, "classname2"]) 을 받은 경우
// "classname1 classname2" 를 반환합니다.
// recursive 하지는 않기 때문에 mergeClassName([[ "clsasname" ]]) 과 같은 중첩
// 배열을 처리하지는 않습니다.
//
// 아래와 같은 사용 케이스를 고려하세요
// <div className={mergeClassName(
//   Styles.Scroll,
//   active ? Styles.Active : null,
//   ...
// )}>
// </div>
export function mergeClassName(
  ...classNameList: (ClassNameType | ClassNameType[])[]
): string {
  const buffer = [];
  for (const className of classNameList) {
    if (Array.isArray(className)) {
      for (const item of className) {
        if (item) buffer.push(item);
      }
    } else {
      if (className) buffer.push(className);
    }
  }
  return buffer.join(" ");
}
// #endregion className utility

// #region date format utility
export function removeTime(dateTime: Date): Date {
  return new Date(
    dateTime.getFullYear(),
    dateTime.getMonth(),
    dateTime.getDate(),
  );
}

function zeroPadding(value: number): string {
  if (value > 10) return value.toString();
  return "0" + value.toString();
}

export function formatYYYYMMDD(date: Date): string {
  return `${date.getFullYear()}-${zeroPadding(date.getMonth() + 1)}-${zeroPadding(date.getDate())}`;
}

export function formatYYYYMM(date: Date): string {
  return `${date.getFullYear()}-${zeroPadding(date.getMonth() + 1)}`;
}

export function formatDateDot(date: Date | string): string {
  if (typeof date == "string") date = new Date(date);

  let month = (date.getMonth() + 1).toString();
  if (month.length == 1) month = "0" + month;

  let day = date.getDate().toString();
  if (day.length == 1) day = "0" + day;

  return `${date.getFullYear()}.${month}.${day}`;
}

const nbsp = String.fromCharCode(0x00a0);
export function formatTerm(
  startAt: Date | string,
  endAt: Date | string,
): string {
  return `${formatDateDot(startAt)}${nbsp}~ ${formatDateDot(endAt)}`;
}

export const WeekNames = ["일", "월", "화", "수", "목", "금", "토"];
// #endregion date format utility

export function isServer(): boolean {
  return typeof window === "undefined";
}

export class ParamsBuilder {
  private inner: string[];
  constructor() {
    this.inner = [];
  }
  private getPrefix() {
    return this.inner.length == 0 ? "?" : "&";
  }
  public push(name: string, value: any): ParamsBuilder {
    if (value == undefined) return this;
    this.inner.push(
      `${this.getPrefix()}${name}=${encodeURIComponent(JSON.stringify(value))}`,
    );
    return this;
  }
  public finalize(): string {
    return this.inner.join("");
  }
}

export class Router {
  private inner: AppRouterInstance;
  public readonly search: { readonly [key: string]: string };
  public readonly path: string;
  public readonly lazyPath: string;
  private constructor() {
    "use client";
    this.inner = Navigation.useRouter();
    this.search = isServer()
      ? {}
      : Object.fromEntries(Navigation.useSearchParams().entries());
    this.path = isServer() ? "" : Navigation.usePathname();
    const [lazyPath, setLazyPath] = React.useState("");
    React.useEffect(() => {
      setLazyPath(this.path);
    }, [lazyPath]);
    this.lazyPath = lazyPath;
  }
  public readSearchJSON(key: string): any {
    const item = this.search[key];
    if (item == undefined) return undefined;
    return JSON.parse(this.search[key]);
  }
  // 훅이라는것을 암시하기 위해서 use 사용
  public static use(): Router {
    "use client";
    return new Router();
  }
  // 리프레시 없이 url 을 바꿉니다
  public shallowReplace(url: string) {
    window.history.replaceState(null, "", url);
  }
  public replace(url: string, opt?: NavigateOptions) {
    this.inner.replace(url, opt);
  }
  public push(url: string, opt?: NavigateOptions) {
    this.inner.push(url, opt);
  }
  public refresh() {
    this.inner.refresh();
  }
  public back() {
    this.inner.back();
  }
  public forward() {
    this.inner.forward();
  }
  public prefetch(url: string, opt?: PrefetchOptions) {
    this.inner.prefetch(url, opt);
  }
  // 리프레시 없이 url 을 기록에 추가합니다
  public shallowPush(url: string) {
    window.history.pushState(null, "", url);
  }
}

const GB_UNIT = 1024 * 1024 * 1024;
const MB_UNIT = 1024 * 1024;
const KB_UNIT = 1024;
export function formatFileSize(size: number): string {
  if (size >= GB_UNIT) {
    return `${(size / GB_UNIT).toFixed(1)}GB`;
  } else if (size >= MB_UNIT) {
    return `${(size / MB_UNIT).toFixed(1)}MB`;
  } else if (size >= KB_UNIT) {
    return `${(size / KB_UNIT).toFixed(1)}KB`;
  }
  return `${size}B`;
}

const idSpace = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];
// 랜덤한 아이디를 생성합니다
export function createRandomId(): string {
  const buf = [];
  for (let count = 0; count < 16; count++) {
    buf.push(idSpace[Math.round(Math.random() * idSpace.length)]);
  }
  return buf.join("");
}

// 파일의 확장자를 가져옵니다
export function getExtension(name: string): string {
  return name.match(/\.([^.]*?)$/)?.[1] ?? "bin";
}

const imageExtensions = new Set([
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "tiff",
  "bmp",
  "svg",
  "heic",
  "heif",
]);
export function isImage(name: string): boolean {
  return imageExtensions.has(getExtension(name).toLowerCase());
}

/**
 * Linearly interpolates between two hexadecimal colors.
 * @param {string} color1 The start color (hex string, e.g., "#0000ff").
 * @param {string} color2 The end color (hex string, e.g., "#ff0000").
 * @param {number} amount The interpolation factor (0.0 to 1.0).
 * @returns {string} The interpolated color (hex string).
 */
export function lerpColor(
  color1: string,
  color2: string,
  amount: number,
): string {
  // Helper to convert hex to decimal
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return { r, g, b };
  };

  // Helper to convert decimal to hex and pad
  const rgbToHex = (r: number, g: number, b: number) => {
    const componentToHex = (c: number) => {
      const hex = c.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  };

  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  // Linear interpolation for each color component
  const r = Math.round(c1.r + (c2.r - c1.r) * amount);
  const g = Math.round(c1.g + (c2.g - c1.g) * amount);
  const b = Math.round(c1.b + (c2.b - c1.b) * amount);

  return rgbToHex(r, g, b);
}
