export type Nullable<T> = T | null;

export type ClueType = "blank" | "fillable";

interface ClueBase {
  type: ClueType;
}

export interface BlankClue extends ClueBase {
  type: "blank";
}

interface FillableBase extends ClueBase {
  clueNumber: number | null;
}

export interface AcrossClue extends FillableBase {
  type: "fillable";
  clueNumber: number;
  acrossClue: string;
}

export interface DownClue extends FillableBase {
  type: "fillable";
  clueNumber: number;
  downClue: string;
}

export interface AcrossAndDownClue extends FillableBase {
  type: "fillable";
  clueNumber: number;
  acrossClue: string;
  downClue: string;
}

export interface NumlessClue extends FillableBase {
  type: "fillable";
  clueNumber: null;
}

export type FillableClue =
  | AcrossClue
  | DownClue
  | AcrossAndDownClue
  | NumlessClue;

export type Clue = BlankClue | FillableClue;

export interface Puzzle {
  shape: [number, number];
  clues: Clue[][];
}

export type ClueAnswer = "blank" | number;

export interface Solution {
  shape: [number, number];
  answers: ClueAnswer[][];
}

export type Difficulty = "daily" | "challenge";

export interface Numcross {
  id: number;
  createdAt: string;
  liveDate: string;
  author: string;
  difficulty: Difficulty;
  puzzle: Puzzle;
  solution: Solution;
}

export type Scratch = { [key: string]: number | null };

export interface Attempt {
  puzzleId: number;
  startTime: string;
  scratch: Scratch;
  time: number;
}

export interface Solve {
  puzzleId: number;
  startTime: string;
  endTime: string;
  time: number;
}

export type FillMode = "next" | "nextEmpty" | "stay";
export type DeleteMode = "previous" | "stay";

export interface Settings {
  fillMode: FillMode;
  deleteMode: DeleteMode;
}

export type NumpadVal =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "x"
  | ""
  | "nothing";

export interface Friend {
  uid: string;
  username: string;
}

export type LoadingStatus =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "reloading";
