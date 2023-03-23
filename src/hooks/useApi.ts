import {
  CheckAttemptReq,
  CheckAttemptResp,
  TodaysNumcrossResp,
  UpdateAttemptReq,
  UpdateAttemptResp,
  UserStatsResp,
} from "@/types/api";
import { Attempt, Numcross, UserStats } from "@/types/types";
import { toast } from "react-hot-toast";
import { mineAttempt, storeAttempt } from "./useStorage";
import { getJSON, postJSON } from "@/utils";

export async function getTodaysNumcross(userId?: string): Promise<{
  numcross: Numcross;
  attempt?: Attempt;
} | null> {
  // Load the numcross
  const { data, error } = await getJSON<TodaysNumcrossResp>(
    "/api/todays_numcross",
    {
      uid: userId,
    }
  );
  if (error || !data?.numcross) {
    console.error(error);
    toast("There was an error getting today's puzzle.", { icon: "🚫" });
    return null;
  }

  if (!userId) {
    // If the user is not logged in, try to load their attempt
    // from local storage
    const attempt = mineAttempt(data.numcross.id);
    return { numcross: data.numcross, attempt: attempt || undefined };
  }

  return { numcross: data.numcross, attempt: data.attempt };
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

export default function useApi() {
  return {
    getTodaysNumcross,
    checkAttempt,
    updateAttempt,
    getStats,
  };
}
