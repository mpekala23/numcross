import Head from "next/head";
import { Crossword } from "@/components/crossword";
import React, { useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function Home() {
  const supabaseClient = useSupabaseClient();

  useEffect(() => {
    supabaseClient
      .from("puzzles")
      .select("*")
      .then((res) => {
        const { data, error } = res;
        console.log(data, error);
      });
  }, [supabaseClient]);

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
        <Crossword schema={{ gridSize: [3, 3] }} />
      </main>
    </>
  );
}
