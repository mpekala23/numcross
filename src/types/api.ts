import { Attempt, Numcross, Puzzle, Solution, Solve } from "./types";
import { LeaderboardStats, UserStats } from "./stats";
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
export interface TodaysNumcrossReq {}
export interface TodaysNumcrossResp extends RespBase {
  numcross?: Numcross;
}

// GET todays_progress
export interface TodaysProgressReq {
  uid: string;
  pid: string;
}
export interface TodaysProgressResp extends RespBase {
  solve?: Solve;
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

// POST update_attempt
export interface UpdateAttemptReq {
  attempt: Attempt;
  userId: string;
}
export interface UpdateAttemptResp extends RespBase {}

// POST check_attempt
export interface CheckAttemptReq {
  attempt: Attempt;
  userId: string | null;
}
export interface CheckAttemptResp extends RespBase {
  correct: boolean;
  solve?: Solve;
  saved?: boolean;
}

// POST log_solve
export interface LogSolveReq {
  userId: string;
  solve: Solve;
}
export interface LogSolveResp extends RespBase {}

// GET user_stats
export interface UserStatsReq {
  uid: string;
}
export interface UserStatsResp extends RespBase, UserStats {}

// GET username
export interface UsernameReq {
  uid: string;
}
export interface UsernameResp extends RespBase {
  username: string | null;
}

// POST set_username
export interface SetUsernameReq {
  uid: string;
  username: string | null;
}
export interface SetUsernameResp extends RespBase {}

// GET leaderboard
export interface LeaderboardReq {}

export interface LeaderboardResp extends RespBase, LeaderboardStats {}

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
