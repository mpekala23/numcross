import Head from "next/head";
import { Crossword } from "@/components/crossword";
import React, { useCallback, useEffect, useState } from "react";
import useApi from "@/hooks/useApi";
import { Attempt, Numcross, Scratch } from "@/types/types";
import { isAttemptFull } from "@/utils";
import { toast } from "react-hot-toast";
import useModal from "@/hooks/useModal";
import { Numpad } from "@/components/numpad";
import { isEqual } from "lodash";
import SolvedOverlay from "@/common/solved_overlay";

export default function Home() {
  const { getTodaysNumcross, checkAttempt, updateAttempt } = useApi();
  const [numcross, setNumcross] = useState<Numcross | null>(null);
  const [scratch, setScratch] = useState<Scratch>({});
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [hasSolved, setHasSolved] = useState<boolean>(false);
  const [SolvedModal, openSolved, closeSolved] = useModal();
  const [lastAttempt, setLastAttempt] = useState<Attempt | null>(null);

  useEffect(() => {
    // Helper function to do the get
    const performGet: () => Promise<void> = async () => {
      const result = await getTodaysNumcross();
      if (!result) {
        setPageError("Error loading today's numcross");
        return;
      }
      const { numcross, attempt: attemptFetch } = result;
      setNumcross(numcross);
      setAttempt(
        attemptFetch || {
          puzzleId: numcross.id,
          scratch: {},
          startTime: new Date().toISOString(),
          hasCheated: false,
        }
      );
      // Explicitly update the scratch, note that usually data
      // flows in the reverse direction
      if (attemptFetch) {
        setScratch(attemptFetch.scratch);
        console.log("setting scratch", attemptFetch.scratch);
      }
    };

    performGet();
  }, [getTodaysNumcross]);

  // Effect to make sure the "scratch" is updated in the attempt
  useEffect(() => {
    setAttempt((a) => {
      if (!a || a.scratch === scratch) return a;
      return { ...a, scratch };
    });
  }, [scratch]);

  // Do the check attempt
  // NOTE: Short circuits if the attempt is null or if
  // the puzzle has already been solved
  const doCheckAttempt = useCallback(async () => {
    if (!attempt || hasSolved) return;
    const apiResult = await checkAttempt(attempt);
    if (apiResult?.correct) {
      setHasSolved(true);
    } else {
      toast("Puzzle incorrect", { icon: "😑" });
    }
    return;
  }, [attempt, checkAttempt, hasSolved, setHasSolved]);

  // Update the attempt over API on change
  // Check the attempt if it's full
  // NOTE: Short circuits if the attempt is null or if
  // the puzzle has already been solved
  useEffect(() => {
    if (attempt && !isEqual(attempt, lastAttempt) && !hasSolved) {
      updateAttempt(attempt);
      setLastAttempt(attempt);
      if (numcross?.puzzle && isAttemptFull(attempt, numcross?.puzzle)) {
        doCheckAttempt();
      }
    }
  }, [
    attempt,
    lastAttempt,
    hasSolved,
    updateAttempt,
    setLastAttempt,
    numcross?.puzzle,
    doCheckAttempt,
  ]);

  // Fun stuff on solve
  useEffect(() => {
    if (hasSolved) {
      toast("Puzzle solved!", { icon: "🎉" });
      openSolved();
    }
  }, [hasSolved, openSolved]);

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
      <div className="flex w-full flex-1 flex-col justify-center items-center">
        <Crossword
          puzzle={numcross.puzzle}
          scratch={scratch}
          setScratch={setScratch}
        />
        <Numpad />
        <SolvedModal>
          <SolvedOverlay closeModal={closeSolved} />
        </SolvedModal>
      </div>
    </>
  );
}
