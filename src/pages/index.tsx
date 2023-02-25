import Head from "next/head";
import { Crossword } from "@/components/crossword";
import React, { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import useApi from "@/hooks/useApi";

export default function Home() {
  const supabaseClient = useSupabaseClient();
  const { getTodaysPuzzle } = useApi();
  const [puzzle, setPuzzle] = useState<Puzzzle | null>(null);

  useEffect(() => {
    const init = async () => {
      if (puzzle) return;
      const today = await getTodaysPuzzle();
      setPuzzle(today);
    };
    init();
  }, [getTodaysPuzzle, puzzle]);

  const updateAttempt = async () => {
    const resp = await fetch("/api/update_attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attempt: "test" }),
    });
    console.log("resp", resp);
  };

  return (
    <>
      <Head>
        <title>NumCross</title>
        <meta
          name="description"
          content="You're probably not smart enough for this."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <button onClick={updateAttempt}>Submit</button>
        <Crossword schema={{ gridSize: [3, 3] }} />
      </main>
    </>
  );
}
