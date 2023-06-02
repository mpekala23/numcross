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

export async function backendAddPuzzle(data: AddPuzzleReq): Promise<null> {
  const error = (await postJSON<AddPuzzleResp>("/api/add_puzzle", data)).error;

  if (error) {
    toast("There was an error uploading your puzzle.", { icon: "🚫" });
  } else {
    toast("Success! Puzzle uploaded.");
  }

  return null;
}

export async function backendGetTodaysNumcross(): Promise<{
  numcross: Numcross;
}> {
  const { data, error } = await getJSON<TodaysNumcrossResp>(
    "/api/todays_numcross"
  );
  if (error || !data?.numcross) {
    throw Error("There was an error getting today's puzzle.");
  }
  return { numcross: data.numcross };
}

export async function backendGetSolve(
  userId: string,
  puzzleId: number
): Promise<Solve | null> {
  const { data, error } = await getJSON<GetSolveResp>("/api/get_solve", {
    uid: userId,
    pid: puzzleId,
  });
  if (error) {
    throw Error("No previous solve");
  }
  return data?.solve || null;
}

export async function backendStartAttempt(
  userId: string,
  puzzleId: number
): Promise<void> {
  const start_req: StartAttemptReq = {
    userId,
    puzzleId,
  };
  await postJSON<StartAttemptReq>("/api/start_attempt", start_req);
}

export async function backendVerifyAttempt(
  attempt: Attempt,
  userId: string
): Promise<VerifyAttemptResp> {
  // Then check if the attempt is correct
  const check_req: VerifyAttemptReq = {
    attempt,
    userId,
  };
  const { data, error } = await postJSON<VerifyAttemptResp>(
    "/api/verify_attempt",
    check_req
  );

  if (error || !data || data.errorMessage) {
    throw Error("There was an error submitting your attempt.");
  }

  if (data.correct && userId && !data.saved) {
    // User is logged in and the attempt is correct, but something
    // went wrong saving the attempt
    toast("There was an error saving your solve.", { icon: "🚫" });
  }

  return data;
}

export async function backendLogSolve(
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

export async function backendGetStats(userId: string): Promise<UserStats> {
  // Users must be logged in to get stats?
  const { data, error } = await getJSON<UserStatsResp>("/api/user_stats", {
    uid: userId,
  });
  if (error || !data) {
    throw Error("There was an error getting your stats.");
  }
  return {
    numPlayed: data.numPlayed,
    numSolved: data.numSolved,
    currentStreak: data.currentStreak,
    maxStreak: data.maxStreak,
    averageSolveTime: data.averageSolveTime,
  };
}

export async function backendGetUsername(
  userId: string
): Promise<string | null> {
  const { data } = await getJSON<UsernameResp>("/api/username", {
    uid: userId,
  });
  return data?.username || null;
}

export async function backendSetUsername(
  userId: string,
  username: string | null
) {
  return await postJSON<SetUsernameResp>("/api/set_username", {
    uid: userId,
    username,
  });
}

export async function backendGetLeaderboard(): Promise<LeaderboardStats> {
  const { data, error } = await getJSON<LeaderboardStats>(
    "/api/leaderboard",
    {}
  );
  if (error || !data) {
    throw Error("There was an error getting the leaderboard.");
  }
  return data;
}

export async function backendGetPrivateLeaderboard(
  userId: string
): Promise<PrivateLeaderboardStats> {
  const { data, error } = await getJSON<PrivateLeaderboardStats>(
    "/api/private_leaderboard",
    {
      userId,
    }
  );
  if (error || !data) {
    throw Error("There was an error getting your leaderboard.");
  }
  return data;
}

export async function backendMakeFriends(
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
