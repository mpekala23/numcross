import React, { useEffect } from "react";
import { FunctionComponent, useState, useCallback } from "react";
import { Range, cellKey, safeParse } from "@/utils";
import { Cell, CellState } from "@/components/cell";
import { cloneDeep } from "lodash";
import { Clue } from "@/components/clue";
import {
  Puzzle,
  Scratch,
  AcrossClue,
  DownClue,
  FillableClue,
} from "@/types/types";
import { useNumpad } from "@/hooks/useNumpad";

interface Props {
  puzzle: Puzzle;
  scratch: Scratch;
  setScratch: React.Dispatch<React.SetStateAction<Scratch>>;
}

type ClueMappingsEntryCell = {
  row: number;
  col: number;
  across: boolean;
};
type ClueMappingsEntry = ClueMappingsEntryCell[];
type ClueMappingsRow = ClueMappingsEntry[];
type ClueMappings = ClueMappingsRow[];

export const Crossword: FunctionComponent<Props> = ({
  puzzle,
  scratch,
  setScratch,
}) => {
  const [focusedRow, setFocusedRow] = useState<number | undefined>(undefined);
  const [focusedCol, setFocusedCol] = useState<number | undefined>(undefined);
  const [clueIdx, setClueIdx] = useState(0);
  const [clueMappings, setClueMappings] = useState<ClueMappings>([]);
  const { numpadVal, setNumpadVal } = useNumpad();

  // A function to move to the next square after a square has been filled in
  const incrementFocus = useCallback(() => {
    if (focusedRow === undefined || focusedCol === undefined) return;

    const startRow = focusedRow;
    const startCol = focusedCol;

    const isAcross = clueMappings[focusedRow]?.[focusedCol]?.[clueIdx]?.across;

    if (isAcross === undefined) return;

    if (isAcross) {
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
    clueIdx,
    clueMappings,
    puzzle,
    scratch,
    setFocusedCol,
    setFocusedRow,
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

  useEffect(() => {
    let maps: ClueMappings = [];
    for (let i = 0; i < puzzle.shape[0]; i++) {
      let rowMap: ClueMappingsRow = [];
      for (let j = 0; j < puzzle.shape[1]; j++) {
        let mapEntry: ClueMappingsEntry = [];

        for (let j2 = j; j2 >= 0; j2--) {
          if (puzzle.clues[i]?.[j2]?.type === "blank") {
            break;
          }
          if ((puzzle.clues[i]?.[j2] as AcrossClue).acrossClue !== undefined) {
            mapEntry.push({ row: i, col: j2, across: true });
          }
        }
        for (let i2 = i; i2 >= 0; i2--) {
          if (puzzle.clues[i2]?.[j]?.type === "blank") {
            break;
          }
          if ((puzzle.clues[i2]?.[j] as DownClue).downClue !== undefined) {
            mapEntry.push({ row: i2, col: j, across: false });
          }
        }

        rowMap.push(mapEntry);
      }
      maps.push(rowMap);
    }
    setClueMappings(maps);
  }, [setClueMappings, puzzle]);

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
      const clues = clueMappings[rowidx]?.[colidx] ?? [];

      if (clues.length === 0) {
        return;
      }

      if (rowidx === focusedRow && colidx === focusedCol) {
        setClueIdx((idx) => (idx + 1) % clues.length);
      } else {
        setClueIdx((idx) => {
          let desiredIdx = -1;
          if (focusedRow !== undefined && focusedCol !== undefined) {
            const isAcross =
              clueMappings[focusedRow]?.[focusedCol]?.[idx]?.across;
            if (isAcross !== undefined) {
              desiredIdx = clues.findIndex((v) => v.across === isAcross);
            }
          }
          return desiredIdx >= 0 ? desiredIdx : 0;
        });
        setFocusedRow(rowidx);
        setFocusedCol(colidx);
      }
    },
    [
      setFocusedRow,
      setFocusedCol,
      setClueIdx,
      focusedCol,
      focusedRow,
      clueMappings,
    ]
  );

  const getState = (rowidx: number, colidx: number) => {
    if (puzzle.clues[rowidx]?.[colidx]?.type === "blank") {
      return CellState.INVALID;
    }

    if (focusedRow === undefined || focusedCol === undefined) {
      return CellState.INACTIVE;
    }

    if (focusedRow === rowidx && focusedCol === colidx) {
      return CellState.ACTIVE_LETTER;
    }

    const isAcross = clueMappings[focusedRow]?.[focusedCol]?.[clueIdx]?.across;

    if (isAcross === undefined) {
      // Should never trigger
      return CellState.INACTIVE;
    }

    if (
      (focusedRow === rowidx && isAcross) ||
      (focusedCol === colidx && !isAcross)
    ) {
      return CellState.ACTIVE_WORD;
    }
    return CellState.INACTIVE;
  };

  const clueText = "";

  return (
    <>
      <div className={`grid p-8 gap-4 grid-cols-${puzzle.shape[1]}`}>
        {Range(puzzle.shape[0])
          .map((rowidx) =>
            Range(puzzle.shape[1]).map((colidx) => (
              <Cell
                key={cellKey(rowidx, colidx)}
                rowidx={rowidx}
                colidx={colidx}
                number={
                  (puzzle.clues[rowidx]?.[colidx] as FillableClue)?.clueNumber
                }
                value={scratch[cellKey(rowidx, colidx)]}
                onClick={onClick}
                state={getState(rowidx, colidx)}
              />
            ))
          )
          .flat()}
      </div>
      <Clue text={clueText} />
    </>
  );
};
