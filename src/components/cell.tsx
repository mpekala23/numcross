import React, { useEffect, useRef, useState } from "react";
import { FunctionComponent, useCallback } from "react";
import styles from "@/styles/cell.module.css";
import { CELL_MATCH } from "@/consts";
import classNames from "classnames";

type CellProps = {
  rowidx: number;
  colidx: number;
  value: number | null;
  onClick: (rowidx: number, colidx: number) => void;
  state: CellState;
  number: number | null | undefined;
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
  [CellState.ACTIVE_WORD]: "bg-amber-200",
  [CellState.ACTIVE_LETTER]: "bg-amber-400",
};

const hoverColors: { [key in CellState]: string } = {
  [CellState.INVALID]: "black",
  [CellState.INACTIVE]: "bg-slate-200",
  [CellState.ACTIVE_WORD]: "bg-slate-300",
  [CellState.ACTIVE_LETTER]: "bg-slate-400",
};

const DEFAULT_FONT_SIZE = 36;

export const Cell: FunctionComponent<CellProps> = ({
  rowidx,
  colidx,
  value,
  state,
  number,
  onClick,
}) => {
  const contRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const onSelect = useCallback(() => {
    onClick(rowidx, colidx);
  }, [rowidx, colidx, onClick]);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);

  const updateFontSize = useCallback(() => {
    if (!contRef.current) return;
    setFontSize(contRef.current.clientHeight / 3);
  }, [setFontSize]);

  useEffect(() => {
    updateFontSize();
    window.addEventListener("resize", updateFontSize);
    return () => {
      window.removeEventListener("resize", updateFontSize);
    };
  }, [contRef, updateFontSize]);

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.fontSize = `${fontSize}px`;
  }, [inputRef, fontSize]);

  return (
    <div
      ref={contRef}
      className={classNames(
        styles.square,
        "rounded-sm border-2 place-content-center"
      )}
    >
      {state !== CellState.INVALID && (
        <div className={styles.wrap}>
          <div className={styles.number}>{number}</div>
          <input
            ref={inputRef}
            pattern={CELL_MATCH.toString()}
            className={classNames(
              styles.square,
              "w-full h-full text-center",
              colors[state],
              "hover:" + hoverColors[state] + " hover:cursor-pointer",
              "focus:outline-none",
              "caret-transparent",
              `text-[${fontSize}px]`
            )}
            value={value ?? ""}
            onClick={onSelect}
          />
        </div>
      )}
    </div>
  );
};
