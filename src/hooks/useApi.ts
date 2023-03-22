import {
  CheckAttemptReq,
  CheckAttemptResp,
  TodaysNumcrossResp,
  UpdateAttemptReq,
  UpdateAttemptResp,
  UserStatsResp,
} from "@/types/api";
import { Attempt, Numcross, UserStats } from "@/types/types";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { toast } from "react-hot-toast";
import useStorage from "./useStorage";
import { getJSON, postJSON } from "@/utils";
import { useCallback } from "react";

export default function useApi() {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const { storeAttempt, mineAttempt } = useStorage();

  const getTodaysNumcross: () => Promise<{
    numcross: Numcross;
    attempt?: Attempt;
  } | null> = useCallback(async () => {
    // Load the numcross
    const { data, error } = await getJSON<TodaysNumcrossResp>(
      "/api/todays_numcross",
      {
        uid: user?.id,
      }
    );
    if (error || !data?.numcross) {
      console.error(error);
      toast("There was an error getting today's puzzle.", { icon: "🚫" });
      return null;
    }

    if (!user?.id) {
      // If the user is not logged in, try to load their attempt
      // from local storage
      const attempt = mineAttempt(data.numcross.id);
      return { numcross: data.numcross, attempt: attempt || undefined };
    }

    return { numcross: data.numcross, attempt: data.attempt };
  }, [user?.id, mineAttempt]);

  const checkAttempt: (attempt: Attempt) => Promise<CheckAttemptResp | null> =
    useCallback(
      async (attempt) => {
        // Then check if the attempt is correct
        const check_req: CheckAttemptReq = {
          attempt,
          userId: user ? user.id : null,
        };
        const { data, error } = await postJSON<CheckAttemptResp>(
          "/api/check_attempt",
          check_req
        );

        if (error || !data) {
          toast("There was an error submitting your attempt.", { icon: "🚫" });
          return null;
        }

        if (data.correct && user?.id && !data.saved) {
          // User is logged in and the attempt is correct, but something
          // went wrong saving the attempt
          toast("There was an error saving your solve.", { icon: "🚫" });
        }

        return data;
      },
      [user]
    );

  const updateAttempt: (attempt: Attempt) => Promise<null> = useCallback(
    async (attempt) => {
      if (!user) {
        // Store the attempt in local storage
        storeAttempt(attempt);
      } else {
        const update_req: UpdateAttemptReq = {
          attempt,
          userId: user.id,
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
    },
    [user, storeAttempt]
  );

  const getStats: () => Promise<UserStats | null> = useCallback(async () => {
    // Users must be logged in to get stats?
    // TODO: What do we want the incentive structure to be here?
    // Maybe ideally we just give them limited stats and then prompt them
    // to create an account.
    if (!user) {
      // Right now no stats for non-logged-in users
      return null;
    }
    const { data, error } = await getJSON<UserStatsResp>("/api/user_stats", {
      uid: user?.id,
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
  }, [user]);

  return {
    getTodaysNumcross,
    checkAttempt,
    updateAttempt,
    getStats,
  };
}
