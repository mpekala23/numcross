import React, { useEffect } from "react";
import { FunctionComponent, useState, useCallback } from "react";
import { Range, cellKey, safeParse } from "@/utils";
import { Cell, CellState } from "@/components/cell";
import { cloneDeep } from "lodash";
import { Puzzle, Scratch } from "@/types/types";
import { useNumpad } from "@/hooks/useNumpad";

interface Props {
  puzzle: Puzzle;
  scratch: Scratch;
  setScratch: React.Dispatch<React.SetStateAction<Scratch>>;
}

export const Crossword: FunctionComponent<Props> = ({
  puzzle,
  scratch,
  setScratch,
}) => {
  const [focusedRow, setFocusedRow] = useState<number | undefined>(undefined);
  const [focusedCol, setFocusedCol] = useState<number | undefined>(undefined);
  const [wordRow, setWordRow] = useState(true);
  const { numpadVal, setNumpadVal } = useNumpad();

  // A function to move to the next square after a square has been filled in
  const incrementFocus = useCallback(() => {
    if (focusedRow === undefined || focusedCol === undefined) return;

    const startRow = focusedRow;
    const startCol = focusedCol;

    if (wordRow) {
      let newRow = focusedRow;
      let newCol = focusedCol + 1;
      while (!(newRow === startRow && newCol === startCol)) {
        if (newCol >= puzzle.shape[1]) {
          newCol = 0;
          newRow = (newRow + 1) % puzzle.shape[0];
          continue;
        }
        if (puzzle.clues[newRow][newCol].type === "blank") {
          newCol++;
          continue;
        }
        const key = cellKey(newRow, newCol);
        if (key in scratch && scratch[key] !== null) {
          newCol++;
          continue;
        }
        // We've ended up at a non-blank square that's not filled in
        setFocusedRow(newRow);
        setFocusedCol(newCol);
        break;
      }
    } else {
      let newRow = focusedRow + 1;
      let newCol = focusedCol;
      while (!(newRow === startRow && newCol === startCol)) {
        if (newRow >= puzzle.shape[0]) {
          newRow = 0;
          newCol = (newCol + 1) % puzzle.shape[1];
          continue;
        }
        if (puzzle.clues[newRow][newCol].type === "blank") {
          newRow++;
          continue;
        }
        const key = cellKey(newRow, newCol);
        if (key in scratch && scratch[key] !== null) {
          newRow++;
          continue;
        }
        // We've ended up at a non-blank square that's not filled in
        setFocusedRow(newRow);
        setFocusedCol(newCol);
        break;
      }
    }
  }, [
    focusedCol,
    focusedRow,
    puzzle,
    scratch,
    setFocusedCol,
    setFocusedRow,
    wordRow,
  ]);

  const onUpdate = useCallback(
    (rowidx: number, colidx: number, value?: number) => {
      setScratch((s) => {
        let s2 = cloneDeep(s);
        if (value === undefined) {
          delete s2[cellKey(rowidx, colidx)];
        } else {
          s2[cellKey(rowidx, colidx)] = value;
        }
        return s2;
      });
    },
    [setScratch]
  );

  // Update the scratch when the numpad value changes
  useEffect(() => {
    if (focusedRow === undefined || focusedCol === undefined) return;
    if (numpadVal === "nothing") return;
    const numeric = safeParse(numpadVal);
    onUpdate(focusedRow, focusedCol, numeric);
    console.log("numpadVal", numpadVal);
    if (numpadVal !== undefined && numpadVal !== "") incrementFocus();
    setNumpadVal("nothing");
  }, [
    focusedRow,
    focusedCol,
    numpadVal,
    onUpdate,
    setNumpadVal,
    incrementFocus,
  ]);

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
              value={scratch[cellKey(rowidx, colidx)]}
              onClick={onClick}
              state={getState(rowidx, colidx)}
            />
          ))
        )
        .flat()}
    </div>
  );
};
