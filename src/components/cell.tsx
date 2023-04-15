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
  rowHeight: number;
  className?: string;
};

export enum CellState {
  INVALID = 0,
  INACTIVE,
  ACTIVE_WORD,
  ACTIVE_LETTER,
}

const colors: { [key in CellState]: string } = {
  [CellState.INVALID]: "black",
  [CellState.INACTIVE]: "bg-slate-100",
  [CellState.ACTIVE_WORD]: "bg-sky-200",
  [CellState.ACTIVE_LETTER]: "bg-sky-400",
};

const hoverColors: { [key in CellState]: string } = {
  [CellState.INVALID]: "black",
  [CellState.INACTIVE]: "bg-slate-200",
  [CellState.ACTIVE_WORD]: "bg-slate-300",
  [CellState.ACTIVE_LETTER]: "bg-slate-400",
};

export const Cell: FunctionComponent<CellProps> = ({
  rowidx,
  colidx,
  value,
  state,
  number,
  onClick,
  fontSize,
  rowHeight,
  className,
}) => {
  const onSelect = useCallback(() => {
    onClick(rowidx, colidx);
  }, [rowidx, colidx, onClick]);

  return (
    <div
      className={`border-2 place-content-center aspect-square safari-sucks ${
        className || ""
      }`}
      style={{
        width: `${rowHeight}px`,
        height: `${rowHeight}px`,
      }}
    >
      {state !== CellState.INVALID && (
        <div
          className={classNames(
            "relative w-full h-full flex items-center justify-center",
            colors[state],
            `hover:${hoverColors[state]}`,
            "hover:cursor-pointer"
          )}
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
