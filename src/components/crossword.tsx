import React from "react";
import { FunctionComponent, useState, useCallback } from "react";
import { Range, cellKey } from "@/utils";
import { Cell, CellState } from "@/components/cell";
import { cloneDeep } from "lodash";
import { Puzzle, Scratch } from "@/types/types";

interface Props {
  puzzle: Puzzle;
}

export const Crossword: FunctionComponent<Props> = ({ puzzle }) => {
  const [currFilling, setCurrFilling] = useState<Scratch>({});
  const [focusedRow, setFocusedRow] = useState<number | undefined>(undefined);
  const [focusedCol, setFocusedCol] = useState<number | undefined>(undefined);
  const [wordRow, setWordRow] = useState(true);

  const onUpdate = useCallback(
    (rowidx: number, colidx: number, value?: number) => {
      setCurrFilling((s) => {
        let s2 = cloneDeep(s);
        if (value === undefined) {
          delete s2[cellKey(rowidx, colidx)];
        } else {
          s2[cellKey(rowidx, colidx)] = value;
        }
        return s2;
      });
    },
    [setCurrFilling]
  );

  const onClick = useCallback(
    (rowidx: number, colidx: number) => {
      if (rowidx === focusedRow && colidx === focusedCol) {
        setWordRow((w) => !w);
      } else {
        setFocusedRow(rowidx);
        setFocusedCol(colidx);
      }
    },
    [setWordRow, setFocusedRow, setFocusedCol, focusedCol, focusedRow]
  );

  const getState = (rowidx: number, colidx: number) => {
    if (focusedRow === rowidx && focusedCol === colidx) {
      return CellState.ACTIVE_LETTER;
    }
    if (
      (focusedRow === rowidx && wordRow) ||
      (focusedCol === colidx && !wordRow)
    ) {
      return CellState.ACTIVE_WORD;
    }
    return CellState.INACTIVE;
  };

  return (
    <div className={`grid p-8 gap-4 grid-cols-${puzzle.shape[1]}`}>
      {Range(puzzle.shape[0])
        .map((rowidx) =>
          Range(puzzle.shape[1]).map((colidx) => (
            <Cell
              key={cellKey(rowidx, colidx)}
              rowidx={rowidx}
              colidx={colidx}
              value={currFilling[cellKey(rowidx, colidx)]}
              onUpdate={onUpdate}
              onClick={onClick}
              state={getState(rowidx, colidx)}
            />
          ))
        )
        .flat()}
    </div>
  );
};
