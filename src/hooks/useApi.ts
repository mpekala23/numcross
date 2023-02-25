import { RespAttempt } from "@/types/api";
import { Attempt, Numcross } from "@/types/types";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { toast } from "react-hot-toast";
import useStorage from "./useStorage";
import { postJSON } from "@/utils";

export default function useApi() {
  const supabaseClient = useSupabaseClient();
  const user = useUser();
  const { storeAttempt } = useStorage();

  const getTodaysNumcross: () => Promise<Numcross | null> = async () => {
    const { data, error } = await supabaseClient
      .from("puzzles")
      .select("*")
      .eq("date", new Date().toISOString().split("T")[0])
      .single();

    if (error) {
      return null;
    }

    return data;
  };

  const submitAttempt: (
    attempt: Attempt
  ) => Promise<RespAttempt | null> = async (attempt) => {
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
    const { data, error }: { data: RespAttempt; error: Error | null } =
      await postJSON("/api/check_attempt", {
        ...attempt,
        scratch: JSON.stringify(attempt.scratch),
      });

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
    submitAttempt,
  };
}
