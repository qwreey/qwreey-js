import { Result } from "@qwreey-js/ts-util";
import React from "react";

// Async 한 함수의 작업을 처리하는 훅입니다.
// 디펜던시가 업데이트 될 때 마다 func 를 수행하며,
// 함수가 수행중일 때 running 이 true, 함수에 오류가 발생했을 때 errored 가 true, 결과엔 오류 메시지가
// 함수가 정상 수행되었을 땐 result 에 결과가 부여됩니다.
// 즉
// const runState = useAsync(async ()=>{}, [ dep ]); 인 경우 dep 의 변경 마다 함수가 수행되며
// runState 는 result, running, errored 필드를 가지게 됩니다.

export function useAsync<T extends Array<unknown>, U>(
  func: (...args: T) => Promise<U>,
  args: T = [] as unknown as T,
  dependencies: Array<unknown>,
): Result<U, Error> | null {
  "use client";

  const [result, setResult] = React.useState<Result<U, Error> | null>(null);

  React.useEffect(() => {
    func(...args)
      .then((value) => {
        setResult(Result.ok(value));
      })
      .catch((reason: Error) => {
        console.error(
          `promise exception ${reason?.name}: ${reason?.message}\n${reason?.stack}`,
        );
        setResult(Result.err(reason));
      });
  }, dependencies ?? []);

  return result;
}
