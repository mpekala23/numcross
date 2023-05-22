import Head from "next/head";
import { Crossword } from "@/components/crossword";
import React, { useCallback, useState, useEffect } from "react";
import { Arr, Arr2D, cellKey } from "@/utils";
import { Numpad } from "@/components/numpad";
import { cloneDeep } from "lodash";
import {
  Scratch,
  Puzzle,
  Clue,
  AcrossClue,
  DownClue,
  BlankClue,
} from "@/types/types";
import { AddPuzzleReq } from "@/types/api";
import { useUser } from "@supabase/auth-helpers-react";
import { addPuzzle } from "@/api/backend";

const DEFAULT_PUZZLE: Puzzle = {
  shape: [2, 2],
  clues: [
    [{ type: "blank" }, { type: "blank" }],
    [{ type: "blank" }, { type: "blank" }],
  ],
};

const BLANK_CLUE: BlankClue = {
  type: "blank",
};

export default function Upload() {
  const [live_date, setLiveDate] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [author, setAuthor] = useState("");
  const [scratch, setScratch] = useState<Scratch>({});
  const [puzzle, setPuzzle] = useState<Puzzle>(cloneDeep(DEFAULT_PUZZLE));
  const [disabled, setDisabled] = useState(false);
  const user = useUser();

  const doUpload = useCallback(async () => {
    const answers: ("blank" | number)[][] = Arr2D(
      puzzle.shape[0],
      puzzle.shape[1],
      "blank"
    );

    for (let i = 0; i < puzzle.shape[0]; i++) {
      for (let j = 0; j < puzzle.shape[1]; j++) {
        const num = scratch[cellKey(i, j)];
        if (puzzle.clues[i][j].type != "blank" && num !== null) {
          answers[i][j] = num;
        }
      }
    }

    const data: AddPuzzleReq = {
      solution: {
        shape: puzzle.shape,
        answers,
      },
      live_date,
      author,
      puzzle,
      difficulty,
    };

    setDisabled(true);
    await addPuzzle(data);
    setDisabled(false);
  }, [setDisabled, puzzle, scratch, live_date, author, difficulty]);

  const updatePuzzle = useCallback(
    (rowidx: number, colidx: number, clue?: Clue) => {
      setPuzzle((puzzle) => {
        const copy = cloneDeep(puzzle);
        if (rowidx < copy.clues.length && colidx < copy.clues[rowidx].length) {
          if (clue === undefined) {
            delete copy.clues[rowidx][colidx];
          } else {
            copy.clues[rowidx][colidx] = cloneDeep(clue);
          }

          let num = 1;
          copy.clues.forEach((r) => {
            r.forEach((e) => {
              if ((e as AcrossClue)?.acrossClue !== undefined) {
                (e as AcrossClue).clueNumber = num;
                num++;
              } else if ((e as DownClue)?.downClue !== undefined) {
                (e as DownClue).clueNumber = num;
                num++;
              }
            });
          });

          return copy;
        }
        return puzzle;
      });
    },
    [setPuzzle]
  );

  const updateShape = useCallback(
    (shape: [number, number]) => {
      setPuzzle((puzzle) => {
        const copy = cloneDeep(puzzle);
        const prevShape = copy.shape;
        copy.shape = cloneDeep(shape);
        if (prevShape[0] < shape[0]) {
          copy.clues.push(
            ...Arr2D(shape[0] - prevShape[0], prevShape[1], BLANK_CLUE)
          );
        } else if (prevShape[0] > shape[0]) {
          copy.clues = copy.clues.slice(0, shape[0]);
        }

        if (prevShape[1] < shape[1]) {
          copy.clues.forEach((r) => {
            r.push(...Arr(shape[1] - prevShape[1], BLANK_CLUE));
          });
        } else if (prevShape[1] > shape[1]) {
          copy.clues.map((r) => {
            return r.slice(0, shape[1]);
          });
        }

        return copy;
      });
    },
    [updatePuzzle]
  );

  const setDate = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLiveDate(e.target.value);
    },
    [setLiveDate]
  );

  if (
    user?.email !== "mpek66@gmail.com" &&
    user?.email !== "rajatmittal@college.harvard.edu"
  ) {
    return null;
  }

  return (
    <>
      <Head>
        <title>NumCross</title>
        <meta
          name="description"
          content="You're probably not smart enough for this."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex w-full flex-1 flex-col justify-center items-center">
        <Crossword
          puzzle={puzzle}
          scratch={scratch}
          setScratch={setScratch}
          updatePuzzle={updatePuzzle}
          updateShape={updateShape}
          editable
          seconds={null}
        />
        <Numpad editable />
        <div className="flex justify-center items-center">
          <input
            type="text"
            className="bg-slate-200 py-6 px-12 my-2"
            placeholder="Author"
            onChange={(e) => setAuthor(e.target.value)}
          ></input>
        </div>
        <div className="flex justify-center items-center">
          <input
            type="text"
            className="bg-slate-200 py-6 px-12 my-2"
            placeholder="Difficulty"
            onChange={(e) => setDifficulty(e.target.value)}
          ></input>
        </div>
        <div className="flex justify-center items-center">
          <input
            type="date"
            className="bg-slate-200 py-6 px-12 m-10 hover:cursor-pointer"
            onChange={setDate}
          ></input>
          <button
            className="text-3xl py-6 px-12 bg-green-300 m-10 disabled:bg-slate-100"
            onClick={doUpload}
            disabled={disabled || !live_date}
          >
            Upload
          </button>
        </div>
      </div>
    </>
  );
}
