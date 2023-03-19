import React from "react";
import { FunctionComponent, useState, useCallback, useEffect } from "react";
import { Range, cellKey } from "@/utils";
import { Cell, CellState } from "@/components/cell";
import { cloneDeep } from "lodash";
import { Clue } from "@/components/clue";
import {
  Puzzle,
  Scratch,
  DownClue,
  AcrossClue,
  FillableClue,
} from "@/types/types";

interface Props {
  puzzle: Puzzle;
}

type ClueMappingsEntryCell = {
  row: number;
  col: number;
  across: boolean;
};
type ClueMappingsEntry = ClueMappingsEntryCell[];
type ClueMappingsRow = ClueMappingsEntry[];
type ClueMappings = ClueMappingsRow[];

export const Crossword: FunctionComponent<Props> = ({ puzzle }) => {
  const [currFilling, setCurrFilling] = useState<Scratch>({});
  const [focusedRow, setFocusedRow] = useState<number | undefined>(undefined);
  const [focusedCol, setFocusedCol] = useState<number | undefined>(undefined);
  const [clueIdx, setClueIdx] = useState(0);
  const [clueMappings, setClueMappings] = useState<ClueMappings>([]);

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
                value={currFilling[cellKey(rowidx, colidx)]}
                onUpdate={onUpdate}
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
