import React, { type PropsWithChildren } from "react";
import Styles from "./styles.module.scss";

export function DesktopOnly(params: DesktopOnly.Params): React.ReactElement {
  const options = {
    ...DesktopOnly.Defaults,
    ...params,
  };

  return <div className={Styles.DesktopOnly}>{options.children}</div>;
}
export namespace DesktopOnly {
  export type Params = PropsWithChildren<{}>;
  export const Defaults = {};
}
