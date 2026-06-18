import React, { type PropsWithChildren } from "react";
import Styles from "./styles.module.scss";

export function MobileOnly(params: MobileOnly.Params): React.ReactElement {
  const options = {
    ...MobileOnly.Defaults,
    ...params,
  };

  return <div className={Styles.MobileOnly}>{options.children}</div>;
}
export namespace MobileOnly {
  export type Params = PropsWithChildren<{}>;
  export const Defaults = {};
}
