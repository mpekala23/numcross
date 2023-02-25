import { Attempt, Puzzle } from "@/types/types";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

export default function useApi() {
  const supabaseClient = useSupabaseClient();
  const user = useUser();

  const getTodaysPuzzle: () => Promise<Puzzle | null> = async () => {
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

  const submitAttempt: (attempt: Attempt) => Promise<boolean> = async () => {
    const { data, error } = await supabaseClient
        .from("attempts")
        .upsert({
            uid: 
        })
  };

  return {
    getTodaysPuzzle,
    submitAttempt,
  };
}
