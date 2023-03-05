import {
  CheckAttemptReq,
  CheckAttemptResp,
  TodaysNumcrossReq,
  TodaysNumcrossResp,
} from "@/types/api";
import { Attempt, Numcross } from "@/types/types";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { toast } from "react-hot-toast";
import useStorage from "./useStorage";
import { getJSON, postJSON } from "@/utils";

export default function useApi() {
  const supabaseClient = useSupabaseClient();
  const user = useUser();
  const { storeAttempt } = useStorage();

  const getTodaysNumcross: () => Promise<Numcross | null> = async () => {
    const { data, error } = await getJSON<TodaysNumcrossResp>(
      "/api/todays_numcross"
    );
    console.log(data);
    console.log(error);
    return data?.numcross ?? null;
  };

  const checkAttempt: (
    attempt: Attempt
  ) => Promise<CheckAttemptResp | null> = async (attempt) => {
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
        toast("There was an error submitting your attempt.", { icon: "🚫" });
        return null;
      }
    }

    // Then check if the attempt is correct
    const check_req: CheckAttemptReq = {
      attempt,
      userId: user ? user.id : null,
    };
    const { data, error } = await postJSON<CheckAttemptResp>(
      "/api/check_attempt",
      check_req
    );

    if (error) {
      toast("There was an error submitting your attempt.", { icon: "🚫" });
      return null;
    }

    if (data.correct) {
      toast("Correct!", { icon: "🎉" });
    } else {
      toast("Incorrect.", { icon: "💀" });
    }

    return data;
  };

  return {
    getTodaysNumcross,
    checkAttempt,
  };
}
