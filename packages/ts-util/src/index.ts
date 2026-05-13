export * from "./cached-getter.js";
export * from "./color.js";
export * from "./date.js";
export * from "./interval.js";
export * from "./mixin.js";
export * from "./params-builder.js";
export * from "./result.js";
export * from "./utils.js";

import { setLogErr as _setLogErr, logErr as _logErr } from "./libLog.js";
export namespace UtilLogging {
  export const setLogErr = _setLogErr;
  export const logErr = _logErr;
}
