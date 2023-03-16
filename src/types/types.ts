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
  difficulty: Difficulty;
  theme: string;
  puzzle: Puzzle;
  solution?: Solution;
}

export type Scratch = { [key: string]: number | null };

export interface Attempt {
  puzzleId: number;
  startTime: string;
  hasCheated: boolean;
  scratch: Scratch;
}

export interface Solve {
  puzzleId: number;
  startTime: string;
  endTime: string;
  didCheat: boolean;
}

export interface UserStats {
  numPlayed: number;
  numSolved: number;
  currentStreak: number;
  maxStreak: number;
  averageSolveTime?: number;
}
