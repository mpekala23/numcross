import React, { useEffect } from "react";
import { FunctionComponent, useState, useCallback, useRef } from "react";
import { Range, cellKey, safeParse } from "@/utils";
import { Cell, CellState } from "@/components/cell";
import { cloneDeep, isEqual } from "lodash";
import { ClueText } from "@/components/cluetext";
import classNames from "classnames";
import {
  Puzzle,
  Scratch,
  AcrossClue,
  DownClue,
  Clue,
  BlankClue,
  AcrossAndDownClue,
} from "@/types/types";
import { useNumpad } from "@/hooks/useNumpad";
import useSettings from "@/hooks/useSettings";
import Heatmap from "./heatmap";
import { useAppSelector } from "@/redux/hooks";

const DEFAULT_CLUE: Clue = {
  type: "fillable",
  clueNumber: null,
};

const BLANK_CLUE: BlankClue = {
  type: "blank",
};

const ACROSS_CLUE: AcrossClue = {
  type: "fillable",
  clueNumber: 1,
  acrossClue: "Clue text",
};

const DOWN_CLUE: DownClue = {
  type: "fillable",
  clueNumber: 1,
  downClue: "Clue text",
};

const ACROSSDOWN_CLUE: AcrossAndDownClue = {
  type: "fillable",
  clueNumber: 1,
  downClue: "Clue text",
  acrossClue: "Clue text",
};

interface Props {
  puzzle: Puzzle;
  scratch: Scratch;
  editable: boolean;
  setScratch: React.Dispatch<React.SetStateAction<Scratch>>;
  updatePuzzle?: (rowidx: number, colidx: number, clue?: Clue) => void;
  updateShape?: (shape: [number, number]) => void;
  seconds: number | null;
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
  editable,
  updatePuzzle,
  updateShape,
  seconds,
}) => {
  const [focusedRow, setFocusedRow] = useState<number | undefined>(undefined);
  const [focusedCol, setFocusedCol] = useState<number | undefined>(undefined);
  const [clueIdx, setClueIdx] = useState(0);
  const [clueMappings, setClueMappings] = useState<ClueMappings>([]);
  const { numpadVal, setNumpadVal } = useNumpad();
  const { settings } = useSettings();
  const attempt = useAppSelector((state) => state.progress.attempt);

  const contRef = useRef<HTMLDivElement>(null);
  const [rowHeight, setRowHeight] = useState(64);

  // Get the current clue info
  let clueText: undefined | string = undefined;
  let clueNumber: undefined | number = undefined;
  let clueInfo: undefined | ClueMappingsEntryCell = undefined;
  // Is the current square itself an across/down clue?
  let isAcross = false;
  let isDown = false;
  if (focusedRow !== undefined && focusedCol !== undefined) {
    const mappings = clueMappings[focusedRow]?.[focusedCol];
    if (mappings !== undefined) {
      clueInfo = mappings[clueIdx];
      if (clueInfo !== undefined) {
        if (clueInfo.across) {
          const clue = puzzle.clues[clueInfo.row][clueInfo.col] as AcrossClue;
          if (clue !== undefined) {
            clueText = clue.acrossClue;
            clueNumber = clue.clueNumber;
          }
        } else {
          const clue = puzzle.clues[clueInfo.row][clueInfo.col] as DownClue;
          if (clue !== undefined) {
            clueText = clue.downClue;
            clueNumber = clue.clueNumber;
          }
        }
      }
    }
    isAcross =
      (puzzle.clues[focusedRow]?.[focusedCol] as AcrossClue | undefined)
        ?.acrossClue !== undefined;
    isDown =
      (puzzle.clues[focusedRow]?.[focusedCol] as DownClue | undefined)
        ?.downClue !== undefined;
  }

  const updatePuzzleSize = useCallback(() => {
    if (!contRef.current) return;
    const vert = contRef.current.clientHeight / puzzle.shape[0];
    const horiz = contRef.current.parentElement?.clientWidth
      ? contRef.current.parentElement?.clientWidth / puzzle.shape[1]
      : 60000;
    setRowHeight(Math.min(vert, horiz));
  }, [setRowHeight, puzzle.shape]);

  useEffect(() => {
    updatePuzzleSize();
    window.addEventListener("resize", updatePuzzleSize);
    return () => {
      window.removeEventListener("resize", updatePuzzleSize);
    };
  }, [contRef, updatePuzzleSize]);

  // Listen for keypresses
  useEffect(() => {
    const handleKeypress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setFocusedCol((oldVal) => {
          if (oldVal === undefined) return undefined;
          if (oldVal === 0) return puzzle.shape[1] - 1;
          return oldVal - 1;
        });
      } else if (e.key === "ArrowRight") {
        setFocusedCol((oldVal) => {
          if (oldVal === undefined) return undefined;
          if (oldVal === puzzle.shape[1] - 1) return 0;
          return oldVal + 1;
        });
      }

      if (e.key === "ArrowUp") {
        setFocusedRow((oldVal) => {
          if (oldVal === undefined) return undefined;
          if (oldVal === 0) return puzzle.shape[0] - 1;
          return oldVal - 1;
        });
      } else if (e.key === "ArrowDown") {
        setFocusedRow((oldVal) => {
          if (oldVal === undefined) return undefined;
          if (oldVal === puzzle.shape[0] - 1) return 0;
          return oldVal + 1;
        });
      }
    };
    window.addEventListener("keydown", handleKeypress);
    return () => {
      window.removeEventListener("keydown", handleKeypress);
    };
  }, [setFocusedRow, setFocusedCol, puzzle, editable]);

  // A function to manipulate the cursor according to the settings
  // after a cell has been filled in
  const incrementFocus = useCallback(() => {
    if (settings.fillMode === "stay") return;
    if (focusedRow === undefined || focusedCol === undefined) return;

    const startRow = focusedRow;
    const startCol = focusedCol;

    if (clueInfo?.across === undefined) return;

    if (clueInfo.across) {
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
        if (
          settings.fillMode === "nextEmpty" &&
          key in scratch &&
          scratch[key] !== null
        ) {
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
        if (
          settings.fillMode === "nextEmpty" &&
          key in scratch &&
          scratch[key] !== null
        ) {
          newRow++;
          continue;
        }
        // We've ended up at a non-blank square that's not filled in
        setFocusedRow(newRow);
        setFocusedCol(newCol);
        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    focusedCol,
    focusedRow,
    clueIdx,
    clueMappings,
    clueInfo,
    puzzle,
    scratch,
    setFocusedCol,
    setFocusedRow,
    settings,
  ]);

  useEffect(() => {
    if (focusedCol !== undefined && focusedRow !== undefined) {
      return;
    }

    // Focus on first element on load
    for (let i = 0; i < puzzle.shape[0]; i++) {
      for (let j = 0; j < puzzle.shape[1]; j++) {
        if (puzzle.clues[i][j].type === "fillable") {
          setFocusedRow(i);
          setFocusedCol(j);
          return;
        }
      }
    }
  }, [focusedRow, focusedCol, puzzle, setFocusedRow, setFocusedCol]);

  // A function to manipulate the cursor according to the settings
  // after a cell has been deleted
  const decrementFocus = useCallback(() => {
    if (settings.deleteMode === "stay") return;
    if (focusedRow === undefined || focusedCol === undefined) return;

    const startRow = focusedRow;
    const startCol = focusedCol;

    if (clueInfo?.across === undefined) return;

    if (clueInfo.across) {
      let newRow = focusedRow;
      let newCol = focusedCol - 1;
      while (!(newRow === startRow && newCol === startCol)) {
        if (newCol < 0) {
          newCol = puzzle.shape[1] - 1;
          newRow = (newRow - 1 + puzzle.shape[0]) % puzzle.shape[0];
          continue;
        }
        if (puzzle.clues[newRow][newCol].type === "blank") {
          newCol--;
          continue;
        }
        // We've ended up at a non-blank square that's not filled in
        setFocusedRow(newRow);
        setFocusedCol(newCol);
        break;
      }
    } else {
      let newRow = focusedRow - 1;
      let newCol = focusedCol;
      while (!(newRow === startRow && newCol === startCol)) {
        if (newRow < 0) {
          newRow = puzzle.shape[0] - 1;
          newCol = (newCol - 1 + puzzle.shape[1]) % puzzle.shape[1];
          continue;
        }
        if (puzzle.clues[newRow][newCol].type === "blank") {
          newRow--;
          continue;
        }
        // We've ended up at a non-blank square that's not filled in
        setFocusedRow(newRow);
        setFocusedCol(newCol);
        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    focusedCol,
    focusedRow,
    clueIdx,
    clueMappings,
    clueInfo,
    puzzle,
    setFocusedCol,
    setFocusedRow,
    settings,
  ]);

  const onUpdate = useCallback(
    (rowidx: number, colidx: number, value?: number) => {
      setScratch((s) => {
        if (s[cellKey(rowidx, colidx)] === value) {
          return s;
        }

        let s2 = cloneDeep(s);
        if (value === undefined) {
          delete s2[cellKey(rowidx, colidx)];
          if (editable && updatePuzzle) {
            updatePuzzle(rowidx, colidx, BLANK_CLUE);
          }
        } else {
          s2[cellKey(rowidx, colidx)] = value;
        }
        return s2;
      });
    },
    [setScratch, updatePuzzle, editable]
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
          if ((puzzle.clues[i]?.[j2] as AcrossClue)?.acrossClue !== undefined) {
            mapEntry.push({ row: i, col: j2, across: true });
          }
        }
        for (let i2 = i; i2 >= 0; i2--) {
          if (puzzle.clues[i2]?.[j]?.type === "blank") {
            break;
          }
          if ((puzzle.clues[i2]?.[j] as DownClue)?.downClue !== undefined) {
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
    if (numpadVal !== undefined) {
      if (numpadVal === "") {
        decrementFocus();
      } else {
        incrementFocus();
      }
    }
    setNumpadVal("nothing");
  }, [
    focusedRow,
    focusedCol,
    numpadVal,
    onUpdate,
    setNumpadVal,
    incrementFocus,
    decrementFocus,
  ]);

  const onClick = useCallback(
    (rowidx: number, colidx: number) => {
      const clues = clueMappings[rowidx]?.[colidx] ?? [];

      if (clues.length === 0) {
        if (editable) {
          if (updatePuzzle) {
            updatePuzzle(rowidx, colidx, DEFAULT_CLUE);
          }
          setFocusedRow(rowidx);
          setFocusedCol(colidx);
        }
        return;
      }

      if (rowidx === focusedRow && colidx === focusedCol) {
        setClueIdx((idx) => (idx + 1) % clues.length);
      } else {
        setClueIdx((idx) => {
          let desiredIdx = -1;
          if (focusedRow !== undefined && focusedCol !== undefined) {
            const hasAcrossIdx =
              clueMappings[focusedRow]?.[focusedCol]?.[idx]?.across;
            if (hasAcrossIdx !== undefined) {
              desiredIdx = clues.findIndex((v) => v.across === hasAcrossIdx);
            }
          } else {
            desiredIdx = clues.findIndex((v) => v.across);
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
      editable,
      updatePuzzle,
    ]
  );

  const updateClueText = useCallback(
    (text: string) => {
      if (
        editable &&
        updatePuzzle &&
        focusedRow !== undefined &&
        focusedCol !== undefined &&
        clueInfo !== undefined
      ) {
        const copy = cloneDeep(puzzle.clues[focusedRow]?.[focusedCol]);
        if (copy !== undefined) {
          if (clueInfo.across) {
            (copy as AcrossClue).acrossClue = text;
          } else {
            (copy as DownClue).downClue = text;
          }
          updatePuzzle(focusedRow, focusedCol, copy);
        }
      }
    },
    [editable, clueInfo, updatePuzzle, puzzle, focusedRow, focusedCol]
  );

  const removeSquare = useCallback(() => {
    if (
      editable &&
      updatePuzzle &&
      focusedRow !== undefined &&
      focusedCol !== undefined
    ) {
      updatePuzzle(focusedRow, focusedCol, BLANK_CLUE);
      onUpdate(focusedRow, focusedCol, undefined);
      setFocusedRow(undefined);
      setFocusedCol(undefined);
    }
  }, [focusedRow, focusedCol, updatePuzzle, onUpdate, editable]);

  const addClue = useCallback(
    (across: boolean) => {
      if (
        editable &&
        updatePuzzle &&
        focusedRow !== undefined &&
        focusedCol !== undefined
      ) {
        if (isAcross || isDown) {
          updatePuzzle(focusedRow, focusedCol, ACROSSDOWN_CLUE);
        } else {
          updatePuzzle(
            focusedRow,
            focusedCol,
            across ? ACROSS_CLUE : DOWN_CLUE
          );
        }
      }
    },
    [isAcross, isDown, focusedRow, focusedCol, updatePuzzle, editable]
  );

  const getState = (rowidx: number, colidx: number) => {
    const type = puzzle.clues[rowidx]?.[colidx]?.type;
    if (!type || type === "blank") {
      return CellState.INVALID;
    }

    if (focusedRow === undefined || focusedCol === undefined) {
      return CellState.INACTIVE;
    }

    if (focusedRow === rowidx && focusedCol === colidx) {
      return CellState.ACTIVE_LETTER;
    }

    if (clueInfo?.across === undefined) {
      return CellState.INACTIVE;
    }

    if (
      (clueMappings[rowidx]?.[colidx] ?? []).filter((e) => isEqual(e, clueInfo))
        .length !== 0
    ) {
      return CellState.ACTIVE_WORD;
    }
    return CellState.INACTIVE;
  };

  return (
    <>
      <div className={`${editable ? "h-96" : "h-12"}`} />
      <div
        className={classNames(
          `relative w-full flex flex-col ${
            editable ? "h-60" : "flex-1 overflow-hidden"
          }`
        )}
        ref={contRef}
      >
        {Range(puzzle.shape[0])
          .map((rowidx) => (
            <div
              key={cellKey(rowidx, -1)}
              className={`flex flex-row w-full justify-center`}
              style={{ height: `${rowHeight}px` }}
            >
              {Range(puzzle.shape[1]).map((colidx) => {
                const clue = puzzle.clues[rowidx]?.[colidx];
                const thisClueNumber =
                  clue && clue.type === "fillable"
                    ? clue.clueNumber
                    : undefined;
                return (
                  <Cell
                    key={cellKey(rowidx, colidx)}
                    rowidx={rowidx}
                    colidx={colidx}
                    number={thisClueNumber}
                    value={scratch[cellKey(rowidx, colidx)]}
                    onClick={onClick}
                    editable={editable}
                    state={getState(rowidx, colidx)}
                    rowHeight={rowHeight}
                    className={`${rowidx === 0 ? "border-t-4" : ""} ${
                      colidx === 0 ? "border-l-4" : ""
                    } ${rowidx === puzzle.shape[0] - 1 ? "border-b-4" : ""} ${
                      colidx === puzzle.shape[1] - 1 ? "border-r-4" : ""
                    }`}
                  />
                );
              })}
            </div>
          ))
          .flat()}
      </div>
      {editable && (
        <div className="row">
          <button
            className="my-3 w-16 text-center text-3xl bg-slate-300"
            onClick={() => {
              updateShape?.([puzzle.shape[0], puzzle.shape[1] + 1]);
            }}
          >
            Col+
          </button>
          <button
            className="my-3 w-16 text-center text-3xl bg-slate-300"
            onClick={() => {
              updateShape?.([puzzle.shape[0], puzzle.shape[1] - 1]);
            }}
            disabled={puzzle.shape[1] <= 1}
          >
            Col-
          </button>
          <button
            className="mx-3 w-16 text-center text-3xl bg-slate-300"
            onClick={() => {
              updateShape?.([puzzle.shape[0] + 1, puzzle.shape[1]]);
            }}
          >
            Row+
          </button>
          <button
            className="mx-3 w-16 text-center text-3xl bg-slate-300"
            onClick={() => {
              updateShape?.([puzzle.shape[0] - 1, puzzle.shape[1]]);
            }}
            disabled={puzzle.shape[0] <= 1}
          >
            Row-
          </button>
        </div>
      )}
      <div className={`w-full ${editable ? "h-48" : "h-36"} pb-8`}>
        <ClueText
          text={clueText}
          number={clueNumber}
          across={clueInfo?.across}
          isAcross={isAcross}
          isDown={isDown}
          editable={editable}
          updateText={updateClueText}
          addClue={addClue}
          removeSquare={removeSquare}
          seconds={seconds}
        />
      </div>
    </>
  );
};
