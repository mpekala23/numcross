import React from "react";
import { FunctionComponent, PropsWithChildren } from "react";

export const Corner: FunctionComponent<PropsWithChildren> = ({ children }) => {
  return <span className={"absolute left-3 top-2 text-lg"}>{children}</span>;
};
