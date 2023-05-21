import Head from "next/head";
import { Crossword } from "@/components/crossword";
import React, { useCallback, useEffect, useState } from "react";
import { Attempt, Numcross, Scratch, Solve } from "@/types/types";
import { isAttemptFull } from "@/utils";
import { toast } from "react-hot-toast";
import useModal from "@/hooks/useModal";
import { Numpad } from "@/components/numpad";
import { isEqual } from "lodash";
import SolvedOverlay from "@/common/solved_overlay";
import { useUser } from "@supabase/auth-helpers-react";
import {
  getTodaysNumcross,
  getSolve,
  startAttempt,
  checkAttempt,
  logSolve,
} from "@/api/backend";
import { mineAttempt, mineSolve, storeSolve, forgetSolve } from "@/api/storage";
import { useStopwatch } from "react-timer-hook";

export default function Home() {
  const [numcross, setNumcross] = useState<Numcross | null>(null);
  const [scratch, setScratch] = useState<Scratch>({});
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [shouldPopOff, setShouldPopOff] = useState(true);
  const [solve, setSolve] = useState<Solve | null>(null);
  const [SolvedModal, openSolved, closeSolved] = useModal();
  const [lastAttempt, setLastAttempt] = useState<Attempt | null>(null);
  const user = useUser();
  const { seconds } = useStopwatch({ autoStart: true });

  // Function that _just_ gets the puzzle
  useEffect(() => {
    const performGet: () => Promise<void> = async () => {
      const result = await getTodaysNumcross();
      if (!result) {
        setPageError("Error loading today's numcross");
      } else {
        setNumcross(result.numcross);
      }
    };
    performGet();
  }, []);

  // Function that _just_ loads our attempt from local storage
  useEffect(() => {
    const asyncWork = async () => {
      if (!numcross) return;
      const matt = mineAttempt(numcross.id);
      if (matt) {
        setAttempt(matt);
        setScratch(matt.scratch);
      }
    };
    asyncWork();
  }, [numcross]);

  // Function that _just_ sees if we've already solved this puzzle
  useEffect(() => {
    const asyncWork = async () => {
      if (!numcross) return;
      const msol = mineSolve(numcross.id);
      if (user) {
        if (msol) {
          // Only happens if the user solved this puzzle logged out
          await startAttempt(user.id, numcross.id);
          await logSolve(msol, user.id);
          forgetSolve(numcross.id); // TODO: Add a function that will backfill all solves
          setShouldPopOff(false);
          setSolve(msol);
        } else {
          const existSolve = await getSolve(user.id, numcross.id);
          if (existSolve) {
            setShouldPopOff(false);
            setSolve(existSolve);
          }
        }
      }
    };
    asyncWork();
  }, [numcross, user]);

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
    if (!attempt || !!solve) return;
    const apiResult = await checkAttempt(attempt, user?.id);
    if (apiResult?.solve) {
      setSolve(apiResult.solve);
      if (!user?.id) {
        storeSolve(apiResult.solve);
      }
    } else {
      toast("Puzzle incorrect", { icon: "😑" });
    }
    return;
  }, [attempt, checkAttempt, user?.id, solve]);

  // Update the attempt over API on change
  // Check the attempt if it's full
  // NOTE: Short circuits if the attempt is nul123l or if
  // the puzzle has already been solved
  useEffect(() => {
    if (attempt && !isEqual(attempt, lastAttempt) && !solve) {
      updateAttempt(attempt, user?.id);
      setLastAttempt(attempt);
      if (numcross?.puzzle && isAttemptFull(attempt, numcross?.puzzle)) {
        doCheckAttempt();
      }
    }
  }, [
    attempt,
    lastAttempt,
    solve,
    updateAttempt,
    setLastAttempt,
    numcross?.puzzle,
    doCheckAttempt,
    user?.id,
  ]);

  // Fun stuff on solve
  useEffect(() => {
    if (solve && shouldPopOff) {
      toast("Puzzle solved!", { icon: "🎉" });
      openSolved();
    }
  }, [solve, shouldPopOff, openSolved]);

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
        <link rel="icon" href="/logo64_black.png" />
      </Head>
      {seconds ? "" : null}
      <div className="flex w-full flex-1 flex-col justify-center items-center my-8">
        <Crossword
          puzzle={numcross.puzzle}
          scratch={scratch}
          setScratch={setScratch}
          editable={false}
          seconds={
            solve
              ? (new Date(solve.endTime).getTime() -
                  new Date(solve.startTime).getTime()) /
                1000
              : attempt
              ? (new Date().getTime() - new Date(attempt.startTime).getTime()) /
                1000
              : null
          }
        />
        <Numpad editable={false} />
        <div className="h-8" />
        <SolvedModal>
          <SolvedOverlay closeModal={closeSolved} solve={solve} />
        </SolvedModal>
      </div>
    </>
  );
}
