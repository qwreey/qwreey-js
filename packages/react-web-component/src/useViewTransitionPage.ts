"use client";

import { PassState } from "@qwreey-js/react-util";
import { useState } from "react";
import { flushSync } from "react-dom";

export function useViewTransitionPage<Page>(
  defaultPage: Page,
  getTypes?: (
    pageFrom: Page,
    pageTo: Page,
  ) => void | null | undefined | string[],
  beforeTransition?: (
    pageFrom: Page,
    pageTo: Page,
  ) => void | null | undefined | (() => void),
): PassState<Page> {
  const [rawPage, setRawPage] = useState<Page>(defaultPage);

  return PassState.useMemoWrap(rawPage, (newValue) => {
    // 브라우저가 View Transition API를 지원하는지 확인
    // (지원 안 하면 애니메이션 없이 그냥 변경)
    if (!document.startViewTransition) {
      setRawPage(newValue);
      return;
    }
    const cleanup = beforeTransition?.(rawPage, newValue);

    // 지원하는 브라우저라면 애니메이션 시작
    const transition = document.startViewTransition({
      types: getTypes?.(rawPage, newValue) ?? [],
      update: () => {
        // flushSync를 사용해 React가 상태 변경과 DOM 리렌더링을
        // 이 콜백 함수 안에서 즉시 완료하도록 강제합니다.
        flushSync(() => {
          setRawPage(newValue);
        });
      },
    });
    if (cleanup) {
      transition.finished.finally(cleanup);
    }
  });
}
