import { Attempt, Numcross, Puzzle, Solution } from "./types";

interface RespBase {}

// GET todays_numcross
export interface TodaysNumcrossReq {}
export interface TodaysNumcrossResp extends RespBase {
  numcross: Numcross;
}

// POST add_puzzle
export interface AddPuzzleReq {
  live_date: string;
  puzzle: Puzzle;
  solution: Solution;
  difficulty: string;
  theme: string;
}
export interface AddPuzzleResp extends RespBase {}

// POST check_attempt
export interface CheckAttemptReq {
  attempt: Attempt;
  userId: string | null;
}
export interface CheckAttemptResp extends RespBase {
  correct: boolean;
}
