import { Attempt, Numcross, Puzzle, Solution, Solve } from "./types";
import { LeaderboardStats, PrivateLeaderboardStats, UserStats } from "./stats";
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

// GET get_solve
export interface GetSolveReq {
  uid: string;
  pid: string;
}
export interface GetSolveResp extends RespBase {
  solve: Solve | null;
}

// POST add_puzzle
export interface AddPuzzleReq {
  live_date: string;
  author: string;
  puzzle: Puzzle;
  solution: Solution;
  difficulty: string;
}
export interface AddPuzzleResp extends RespBase {}

// POST start_attempt
export interface StartAttemptReq {
  userId: string;
  puzzleId: number;
}
export interface StartAttemptResp extends RespBase {}

// POST verify_attempt
export interface VerifyAttemptReq {
  attempt: Attempt;
  userId: string;
}
export interface VerifyAttemptResp extends RespBase {
  correct: boolean;
  solve: Solve | null;
  saved: boolean;
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

// GET private_leaderboard
export interface PrivateLeaderboardReq {
  userId: string;
}
export interface PrivateLeaderboardResp
  extends RespBase,
    PrivateLeaderboardStats {}

export interface MakeFriendsReq {
  userId: string;
  friendId: string;
}
export interface MakeFriendsResp extends RespBase {}

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
