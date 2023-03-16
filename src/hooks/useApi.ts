import {
  CheckAttemptReq,
  CheckAttemptResp,
  TodaysNumcrossResp,
} from "@/types/api";
import { Attempt, Numcross } from "@/types/types";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { toast } from "react-hot-toast";
import useStorage from "./useStorage";
import { getJSON, postJSON } from "@/utils";
import { useCallback } from "react";

export default function useApi() {
  const supabaseClient = useSupabaseClient();
  const user = useUser();
  const { storeAttempt } = useStorage();

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
      toast("There was an error getting today's puzzle.", { icon: "🚫" });
      return null;
    }

    return { numcross: data.numcross, attempt: data.attempt };
  }, [user?.id]);

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
      // First save the attempt
      if (!user) {
        // Store the attempt in local storage
        storeAttempt(attempt);
      } else {
        // Store the attempt in the database
        const { error } = await supabaseClient.from("attempts").upsert({
          uid: user.id,
          pid: attempt.puzzleId,
          jsonb: attempt.scratch,
          has_cheated: attempt.hasCheated,
        });
        if (error) {
          toast("There was an updating submitting your attempt.", {
            icon: "🚫",
          });
        }
      }
      return null;
    },
    [user, storeAttempt, supabaseClient]
  );

  return {
    getTodaysNumcross,
    checkAttempt,
    updateAttempt,
  };
}
