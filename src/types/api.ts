import { Attempt, Numcross, Puzzle, Solution, UserStats } from "./types";
import { Send, Response } from "express-serve-static-core";

interface RespBase {
  status: "ok" | "error";
  errorMessage?: string;
}
interface ErrorResp extends RespBase {
  status: "error";
  errorMessage: string;
}

// GET todays_numcross
export interface TodaysNumcrossReq {
  uid?: string;
}
export interface TodaysNumcrossResp extends RespBase {
  numcross: Numcross;
  attempt?: Attempt;
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
  saved?: boolean;
}

// GET user_stats
export interface UserStatsReq {
  uid: string;
}
export interface UserStatsResp extends RespBase, UserStats {}

/* ------------------ */
// START HELPER STUFF FOR EXPRESS BACKEND

export interface TypedRequestBody<T> extends Express.Request {
  body: T;
}
export interface TypedRequestQuery<T> extends Express.Request {
  query: T;
}

type DataOrError<T> = T | ErrorResp;
export interface TypedResponse<T> extends Response {
  json: Send<DataOrError<T>, this>;
  send: Send<DataOrError<T>, this>;
}
