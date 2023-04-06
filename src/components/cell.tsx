import React from "react";
import { FunctionComponent, useCallback } from "react";
import classNames from "classnames";
import { Corner } from "@/components/Corner";

type CellProps = {
  rowidx: number;
  colidx: number;
  value: number | null;
  onClick: (rowidx: number, colidx: number) => void;
  state: CellState;
  number: number | null | undefined;
  fontSize: number;
  editable: boolean;
};

export enum CellState {
  INVALID = 0,
  INACTIVE,
  ACTIVE_WORD,
  ACTIVE_LETTER,
}

const colors: { [key in CellState]: string } = {
  [CellState.INVALID]: "bg-black",
  [CellState.INACTIVE]: "bg-slate-100",
  [CellState.ACTIVE_WORD]: "bg-sky-200",
  [CellState.ACTIVE_LETTER]: "bg-sky-400",
};

export const Cell: FunctionComponent<CellProps> = ({
  rowidx,
  colidx,
  value,
  state,
  number,
  onClick,
  fontSize,
  editable,
}) => {
  const onSelect = useCallback(() => {
    onClick(rowidx, colidx);
  }, [rowidx, colidx, onClick]);

  return (
    <div
      className={classNames(
        "rounded-md border-2 place-content-center aspect-square",
        colors[state]
      )}
    >
      {(state !== CellState.INVALID || editable) && (
        <div
          className={
            "relative w-full h-full flex items-center justify-center hover:cursor-pointer"
          }
          onClick={onSelect}
        >
          <Corner>{number}</Corner>
          <span className={"aspect-square select-none"} style={{ fontSize }}>
            {value ?? ""}
          </span>
        </div>
      )}
    </div>
  );
};
