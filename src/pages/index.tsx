import Head from "next/head";
import { Crossword } from "@/components/crossword";
import React, { useCallback, useEffect, useState } from "react";
import useApi from "@/hooks/useApi";
import { Attempt, Numcross, Scratch } from "@/types/types";
import { isAttemptFull } from "@/utils";
import { toast } from "react-hot-toast";

export default function Home() {
  const { getTodaysNumcross, checkAttempt, updateAttempt } = useApi();
  const [numcross, setNumcross] = useState<Numcross | null>(null);
  const [scratch, setScratch] = useState<Scratch>({});
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    // Helper function to do the get
    const performGet: () => Promise<void> = async () => {
      const result = await getTodaysNumcross();
      if (!result) {
        setPageError("Error loading today's numcross");
        return;
      }
      const { numcross, attempt } = result;
      setNumcross(numcross);
      setAttempt(
        attempt || {
          puzzleId: numcross.id,
          scratch: {},
          startTime: new Date().toISOString(),
          hasCheated: false,
        }
      );
      // Explicitly update the scratch, note that usually data
      // flows in the reverse direction
      if (attempt) {
        setScratch(attempt.scratch);
      }
    };

    performGet();
  }, [getTodaysNumcross, setNumcross, setAttempt, setPageError]);

  // Effect to make sure the "scratch" is updated in the attempt
  useEffect(() => {
    setAttempt((a) => {
      if (!a) return a;
      return { ...a, scratch };
    });
  }, [scratch]);

  const doCheckAttempt = useCallback(async () => {
    if (!attempt) return;
    const apiResult = await checkAttempt(attempt);
    if (apiResult?.correct) {
      toast("Puzzle solved!", { icon: "✅" });
    } else {
      toast("Puzzle incorrect", { icon: "😑" });
    }
    return;
  }, [attempt, checkAttempt]);

  // Update the attempt over API on change
  // Check the attempt if it's full
  useEffect(() => {
    if (attempt) {
      updateAttempt(attempt);
      if (numcross?.puzzle && isAttemptFull(attempt, numcross?.puzzle)) {
        doCheckAttempt();
      }
    }
  }, [attempt, updateAttempt, numcross?.puzzle, doCheckAttempt]);

  if (!numcross) return <div>Loading...</div>;

  if (pageError) return <div>{pageError}</div>;

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
        <Crossword
          puzzle={numcross.puzzle}
          scratch={scratch}
          setScratch={setScratch}
        />
      </main>
    </>
  );
}
