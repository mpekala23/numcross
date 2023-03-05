import Head from "next/head";
import { Crossword } from "@/components/crossword";
import React, { useEffect, useState } from "react";
import useApi from "@/hooks/useApi";
import { Attempt, Numcross } from "@/types/types";

export default function CrosswordPage() {
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
        <button onClick={doCheckAttempt}>Submit</button>
        <Crossword puzzle={numcross.puzzle} />
      </main>
    </>
  );
}
