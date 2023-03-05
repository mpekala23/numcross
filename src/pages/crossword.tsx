import Head from "next/head";
import { Crossword } from "@/components/crossword";
<<<<<<< HEAD:src/pages/crossword.tsx
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
=======
import React, { useEffect, useState } from "react";
import useApi from "@/hooks/useApi";
import { Attempt, Numcross } from "@/types/types";

export default function Home() {
  const { getTodaysNumcross, checkAttempt } = useApi();
  const [numcross, setNumcross] = useState<Numcross | null>(null);
  const attempt: Attempt = {
    puzzleId: numcross?.id || 1,
    startTime: new Date().toISOString(),
    hasCheated: false,
    scratch: {},
  };

  useEffect(() => {
    const init = async () => {
      if (numcross) return;
      const today = await getTodaysNumcross();
      setNumcross(today);
    };
    init();
  }, [getTodaysNumcross, numcross]);

  const doCheckAttempt = async () => {
    await checkAttempt(attempt);
  };

  if (!numcross) return <div>Loading...</div>;
>>>>>>> 6ef646e1e24ce0b37e6f2e40a1fad8579b41338c:src/pages/index.tsx

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
<<<<<<< HEAD:src/pages/crossword.tsx
      {puzzle && <Crossword puzzle={puzzle} /> }
=======
      <main>
        <button onClick={doCheckAttempt}>Submit</button>
        <Crossword puzzle={numcross.puzzle} />
      </main>
>>>>>>> 6ef646e1e24ce0b37e6f2e40a1fad8579b41338c:src/pages/index.tsx
    </>
  );
}
