import React from "react";
import {
  assignRef,
  transformInto,
  useCssVars,
  type DOMRectCompat,
} from "@qwreey-js/react-util";
import { mergeClassName } from "@qwreey-js/ts-util";
import { useLayoutEffect, useRef, useState, type ComponentProps } from "react";

import Styles from "./styles.module.scss";

enum TransformStateInner {
  None,
  Forward,
  Backward,
}
const TransformStateToClass = {
  [TransformStateInner.None]: null,
  [TransformStateInner.Forward]: Styles.Forward,
  [TransformStateInner.Backward]: Styles.Backward,
};

function applyExtraTransform(
  baseTransform: [string, string],
  extra: TransformDiv.ExtraTransform | null | undefined,
): string {
  return [
    extra?.beforeTranslate,
    baseTransform[0],
    extra?.afterTranslate,
    baseTransform[1],
    extra?.afterScale,
  ]
    .filter((i) => i)
    .join(" ");
}

export function TransformDiv({
  style,
  className,
  children,
  getStartPos,
  getExtraStartTransform,
  getExtraEndTransform,
  targetState,
  forwardEase,
  backwardEase,
  forwardDuration,
  backwardDuration,
  ref,
  ...rest
}: TransformDiv.Params): React.ReactElement {
  const divRef = useRef<HTMLDivElement>(null);

  const [startTransform, setStartTransform] = useState<string>("none");
  const [endTransform, setEndTransform] = useState<string>("none");
  const [currentState, setCurrentState] = useState<TransformStateInner>(
    TransformStateInner.None,
  );

  useLayoutEffect(() => {
    if (!divRef.current) return;

    // return if animation not required
    if (currentState == targetState) return;
    if (targetState == TransformStateInner.None) {
      setCurrentState(TransformStateInner.None);
      return;
    }

    // Calc transform
    divRef.current.classList.remove(Styles.Forward, Styles.Backward);
    const startRect = getStartPos();
    if (!startRect) return;
    const into = transformInto(
      divRef.current.getBoundingClientRect(),
      startRect,
    );

    setCurrentState(targetState);
    setStartTransform(getExtraStartTransform?.() ?? "none");
    setEndTransform(applyExtraTransform(into, getExtraEndTransform?.()));
  }, [targetState, divRef.current, getStartPos]);

  const cssVars = useCssVars({
    tdivStartTransform: startTransform,
    tdivEndTransform: endTransform,
    tdivForwardEase: forwardEase ?? "ease",
    tdivBackwardEase: backwardEase ?? "ease",
    tdivForwardDuration: (forwardDuration ?? 300) + "ms",
    tdivBackwardDuration: (backwardDuration ?? 300) + "ms",
  });

  return (
    <div
      {...rest}
      ref={(item: HTMLDivElement | null) => {
        divRef.current = item;
        assignRef(ref, item);
      }}
      style={{
        ...style,
        ...cssVars,
      }}
      className={mergeClassName(
        className,
        Styles.TransformDiv,
        TransformStateToClass[currentState],
      )}
    >
      {children}
    </div>
  );
}
export namespace TransformDiv {
  export import TransformState = TransformStateInner;
  export type ExtraTransform = {
    beforeTranslate?: string;
    afterTranslate?: string;
    afterScale?: string;
  };
  export type Params = ComponentProps<"div"> & {
    getStartPos: () => DOMRectCompat | null | undefined;
    getExtraEndTransform?: () => ExtraTransform | null | undefined;
    getExtraStartTransform?: () => string | null | undefined;
    targetState: TransformStateInner;
    forwardEase?: string;
    backwardEase?: string;
    forwardDuration?: number;
    backwardDuration?: number;
  };
}
