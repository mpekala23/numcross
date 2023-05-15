import {
  CheckAttemptReq,
  CheckAttemptResp,
  TodaysNumcrossResp,
  UpdateAttemptReq,
  UpdateAttemptResp,
  UserStatsResp,
  AddPuzzleReq,
  AddPuzzleResp,
  LogSolveResp,
  TodaysProgressResp,
} from "@/types/api";
import { Attempt, Numcross, Solve } from "@/types/types";
import { LeaderboardStats, UserStats } from "@/types/stats";
import { toast } from "react-hot-toast";
import { mineAttempt, mineSolve, storeAttempt } from "./useStorage";
import { getJSON, postJSON } from "@/utils";

export async function addPuzzle(data: AddPuzzleReq): Promise<null> {
  const error = (await postJSON<AddPuzzleResp>("/api/add_puzzle", data)).error;

  if (error) {
    toast("There was an error uploading your puzzle.", { icon: "🚫" });
  } else {
    toast("Success! Puzzle uploaded.");
  }

  return null;
}

export async function getTodaysNumcross(): Promise<{
  numcross: Numcross;
} | null> {
  // Load the numcross
  const { data, error } = await getJSON<TodaysNumcrossResp>(
    "/api/todays_numcross"
  );
  if (error || !data?.numcross) {
    toast("There was an error getting today's puzzle.", { icon: "🚫" });
    return null;
  }

  return { numcross: data.numcross };
}

export async function getTodaysProgress(
  userId: string,
  pid: number
): Promise<{
  attempt: Attempt;
  solve: Solve | null;
}> {
  const BLANK_ATTEMPT: Attempt = {
    puzzleId: pid,
    startTime: new Date().toISOString(),
    scratch: {},
    hasCheated: false,
  };
  const { data } = await getJSON<TodaysProgressResp>("/api/todays_progress", {
    uid: userId,
    pid,
  });
  return {
    attempt: data?.attempt || BLANK_ATTEMPT,
    solve: data?.solve || null,
  };
}

export async function checkAttempt(
  attempt: Attempt,
  userId?: string
): Promise<CheckAttemptResp | null> {
  // Then check if the attempt is correct
  const check_req: CheckAttemptReq = {
    attempt,
    userId: userId || null,
  };
  const { data, error } = await postJSON<CheckAttemptResp>(
    "/api/check_attempt",
    check_req
  );

  if (error || !data) {
    toast("There was an error submitting your attempt.", { icon: "🚫" });
    return null;
  }

  if (data.correct && userId && !data.saved) {
    // User is logged in and the attempt is correct, but something
    // went wrong saving the attempt
    toast("There was an error saving your solve.", { icon: "🚫" });
  }

  return data;
}

export async function logSolve(
  solve: Solve,
  userId: string
): Promise<LogSolveResp | null> {
  const { data, error } = await postJSON<LogSolveResp>("/api/log_solve", {
    solve,
    userId,
  });

  if (error || !data) {
    toast("There was an error saving your past solve.", { icon: "🚫" });
    return null;
  }

  return data;
}

export async function updateAttempt(
  attempt: Attempt,
  userId?: string
): Promise<null> {
  if (!userId) {
    // Store the attempt in local storage
    storeAttempt(attempt);
  } else {
    const update_req: UpdateAttemptReq = {
      attempt,
      userId: userId,
    };

    const { error } = await postJSON<UpdateAttemptResp>(
      "/api/update_attempt",
      update_req
    );

    if (error) {
      toast("There was an error saving your attempt.", { icon: "🚫" });
    }
  }
  return null;
}

export async function getStats(userId?: string): Promise<UserStats | null> {
  // Users must be logged in to get stats?
  // TODO: What do we want the incentive structure to be here?
  // Maybe ideally we just give them limited stats and then prompt them
  // to create an account.
  if (!userId) {
    // Right now no stats for non-logged-in users
    return null;
  }
  const { data, error } = await getJSON<UserStatsResp>("/api/user_stats", {
    uid: userId,
  });
  if (error || !data) {
    toast("There was an error getting your stats.", { icon: "🚫" });
    return null;
  }
  return {
    numPlayed: data.numPlayed,
    numSolved: data.numSolved,
    currentStreak: data.currentStreak,
    maxStreak: data.maxStreak,
    averageSolveTime: data.averageSolveTime,
  };
}

export async function getLeaderboard(): Promise<LeaderboardStats | null> {
  const { data, error } = await getJSON<LeaderboardStats>(
    "/api/leaderboard",
    {}
  );
  if (error || !data) {
    toast("There was an error getting the leaderboard.", { icon: "🚫" });
    return null;
  }
  return data;
}

export default function useApi() {
  return {
    getTodaysNumcross,
    getTodaysProgress,
    checkAttempt,
    logSolve,
    updateAttempt,
    getStats,
    getLeaderboard,
    addPuzzle,
  };
}
