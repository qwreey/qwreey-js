import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import Styles from "./styles.module.scss";
import { PassState, useSize, asCssVars } from "@qwreey-js/react-util";
import { mergeClassName } from "@qwreey-js/ts-util";

export function FullOverlay(params: FullOverlay.Params): React.ReactElement {
  const options = {
    ...FullOverlay.Defaults,
    ...params,
  };

  // visible 은 display: none 으로 완전 가림 여부
  // open 은 투명도 조절용
  // 닫을 때 open=false 이 완전히 수행 후 visible 이 변경되어야함
  const [visible, setVisible] = useState(false);
  const [dimming, setDimming] = useState(false);
  const open = PassState.unwrap(options.open);
  useEffect(() => {
    let timeout: number | null = null;
    if (open) {
      setVisible(true);
      setDimming(true);
    } else {
      setDimming(false);
      timeout = setTimeout(() => {
        setVisible(false);
      }, options.dimCloseDurationMs) as unknown as number;
    }
    return () => {
      if (timeout != null) clearTimeout(timeout);
    };
  }, [open]);

  // Native dialog 테그의 열고 닫기를 제어
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  useEffect(() => {
    if (!dialogRef.current) return;
    if (visible) dialogRef.current.showModal();
    else dialogRef.current.close();
  }, [dialogRef, visible]);

  // 배경 크기가 maxScreenWidth 보다 크면 숨깁니다
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  useSize(
    backgroundRef,
    (size) => {
      if (!options.open.value) return;
      if (options.maxScreenWidth == null) return;
      if (size.width > options.maxScreenWidth) {
        options.open.update(false);
      }
    },
    [options.maxScreenWidth],
  );

  return (
    <dialog
      ref={dialogRef}
      closedby={
        options.noCloseOnEscape || !options.open.value ? "none" : undefined
      }
      onCancel={(event) => {
        if (options.noCloseOnEscape) {
          event.preventDefault();
          return;
        }
        if (!options.open.value) return;
        options.open.update(false);
        event.preventDefault();
      }}
      onClick={() => {
        if (options.noCloseOnBackgroundClick) return;
        options.open.update(false);
      }}
      className={mergeClassName(Styles.Dialog, visible ? null : Styles.Hidden)}
      style={asCssVars({
        dimBackground: options.dimBackground,
        dimCloseDuration: options.dimCloseDurationMs.toString() + "ms",
        dimOpenDuration: options.dimOpenDurationMs.toString() + "ms",
      })}
    >
      <div
        className={mergeClassName(
          Styles.Background,
          dimming ? Styles.Dimming : null,
        )}
        ref={backgroundRef}
      >
        {options.children}
      </div>
    </dialog>
  );
}
export namespace FullOverlay {
  export type Params = PropsWithChildren<{
    open: PassState<boolean>;
    maxScreenWidth?: number | null;
    dimCloseDurationMs?: number;
    dimOpenDurationMs?: number;
    dimBackground?: string;
    noCloseOnBackgroundClick?: boolean;
    noCloseOnEscape?: boolean;
  }>;

  export const Defaults = {
    maxScreenWidth: 1200,
    dimCloseDurationMs: 200,
    dimOpenDurationMs: 300,
    dimBackground: "rgba(0, 0, 0, 0.4)",
    noCloseOnBackgroundClick: false,
    noCloseOnEscape: false,
  };
}
