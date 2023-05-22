import {
  VerifyAttemptReq,
  VerifyAttemptResp,
  TodaysNumcrossResp,
  UserStatsResp,
  AddPuzzleReq,
  AddPuzzleResp,
  LogSolveResp,
  GetSolveResp,
  UsernameResp,
  SetUsernameResp,
  StartAttemptReq,
  MakeFriendsResp,
} from "@/types/api";
import { Attempt, Numcross, Solve } from "@/types/types";
import {
  LeaderboardStats,
  PrivateLeaderboardStats,
  UserStats,
} from "@/types/stats";
import { toast } from "react-hot-toast";
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

export async function getSolve(
  userId: string,
  puzzleId: number
): Promise<Solve | null> {
  const { data } = await getJSON<GetSolveResp>("/api/get_solve", {
    uid: userId,
    pid: puzzleId,
  });
  return data?.solve || null;
}

export async function startAttempt(
  userId: string,
  puzzleId: number
): Promise<null> {
  const start_req: StartAttemptReq = {
    userId,
    puzzleId,
  };
  await postJSON<StartAttemptReq>("/api/start_attempt", start_req);
  return null;
}

export async function verifyAttempt(
  attempt: Attempt,
  userId: string
): Promise<VerifyAttemptResp | null> {
  // Then check if the attempt is correct
  const check_req: VerifyAttemptReq = {
    attempt,
    userId,
  };
  const { data, error } = await postJSON<VerifyAttemptResp>(
    "/api/verify_attempt",
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

export async function getStats(userId: string): Promise<UserStats | null> {
  // Users must be logged in to get stats?
  // TODO: What do we want the incentive structure to be here?
  // Maybe ideally we just give them limited stats and then prompt them
  // to create an account.
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

export async function getUsername(userId: string): Promise<string | null> {
  const { data } = await getJSON<UsernameResp>("/api/username", {
    uid: userId,
  });
  return data?.username || null;
}

export async function setUsername(userId: string, username: string | null) {
  return await postJSON<SetUsernameResp>("/api/set_username", {
    uid: userId,
    username,
  });
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

export async function getPrivateLeaderboard(
  userId: string
): Promise<PrivateLeaderboardStats | null> {
  const { data, error } = await getJSON<PrivateLeaderboardStats>(
    "/api/private_leaderboard",
    {
      userId,
    }
  );
  if (error || !data) {
    toast("There was an error getting your leaderboard.", { icon: "🚫" });
    return null;
  }
  return data;
}

export async function makeFriends(
  userId: string,
  friendId: string
): Promise<boolean> {
  const { data, error } = await postJSON<MakeFriendsResp>("/api/make_friends", {
    userId,
    friendId,
  });
  if (error || !data || data.status === "error") {
    return false;
  }
  return true;
}
