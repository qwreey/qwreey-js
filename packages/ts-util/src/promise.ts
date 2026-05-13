import { logErr } from "./libLog.js";

export function AsOk(promise: Promise<any>): Promise<boolean> {
  return promise
    .then(() => true)
    .catch((i) => {
      logErr("Promise throw(catch in AsOk): " + i);
      return false;
    });
}

export function NullCatch<T>(promise: Promise<T>): Promise<T | null> {
  return promise.catch((i) => {
    logErr("Promise throw(catch in NullCatch): " + i);
    return null;
  });
}

export async function EmptyPromise(): Promise<undefined> {}
export async function ErrorPromise(err: Error): Promise<any> {
  throw err;
}
