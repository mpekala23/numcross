import Head from "next/head";
import { Crossword } from "@/components/crossword";
import React, { useEffect, useCallback, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { EXAMPLE_PUZZLE } from "@/examples/puzzles";
import { Puzzle } from "@/types/types";

export default function CrosswordPage() {
  const supabaseClient = useSupabaseClient();
  const [puzzle, setPuzzle] = useState<Puzzle | undefined>(EXAMPLE_PUZZLE[0]);

  const getPuzzle = useCallback(async () => {    
  }, [supabaseClient]);

  useEffect(() => {
    getPuzzle().catch(console.error);
  }, [getPuzzle]);

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
      {puzzle && <Crossword puzzle={puzzle} /> }
    </>
  );
}
