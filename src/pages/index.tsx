import Head from "next/head";
import { Crossword } from "@/components/crossword";
import React, { useCallback, useEffect, useState } from "react";
import useApi from "@/hooks/useApi";
import { Attempt, Numcross, Scratch, Solve } from "@/types/types";
import { isAttemptFull } from "@/utils";
import { toast } from "react-hot-toast";
import useModal from "@/hooks/useModal";
import { Numpad } from "@/components/numpad";
import { isEqual, update } from "lodash";
import SolvedOverlay from "@/common/solved_overlay";
import { useUser } from "@supabase/auth-helpers-react";
import { mineAttempt, mineSolve, storeSolve } from "@/hooks/useStorage";

export default function Home() {
  const {
    getTodaysNumcross,
    getTodaysProgress,
    checkAttempt,
    logSolve,
    updateAttempt,
  } = useApi();
  const [numcross, setNumcross] = useState<Numcross | null>(null);
  const [scratch, setScratch] = useState<Scratch>({});
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [shouldPopOff, setShouldPopOff] = useState(true);
  const [solve, setSolve] = useState<Solve | null>(null);
  const [SolvedModal, openSolved, closeSolved] = useModal();
  const [lastAttempt, setLastAttempt] = useState<Attempt | null>(null);
  const user = useUser();

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
  }, [getTodaysNumcross]);

  // A function that gets our progress
  useEffect(() => {
    if (!numcross) return;
    const work = async () => {
      let finalAtt: Attempt | null = null;
      const matt = mineAttempt(numcross.id);
      const msol = mineSolve(numcross.id);
      if (user) {
        if (matt && msol) {
          // The user just created an account and solved this puzzle before
          await updateAttempt(matt, user.id);
          await logSolve(msol, user.id);
          finalAtt = matt;
          setShouldPopOff(false);
          setSolve(msol);
          // TODO: More granular way of doing this
          localStorage.clear();
        } else {
          const progress = await getTodaysProgress(user.id, numcross.id);
          finalAtt = progress.attempt;
          setShouldPopOff(!progress.solve);
        }
      } else {
        finalAtt = matt || {
          puzzleId: numcross.id,
          startTime: new Date().toISOString(),
          scratch: {},
          hasCheated: false,
        };
        setShouldPopOff(!msol);
        setSolve(msol);
      }
      setAttempt(finalAtt);
      if (finalAtt) setScratch(finalAtt.scratch);
    };
    work();
  }, [user, numcross, getTodaysProgress, logSolve, updateAttempt]);

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
      <div className="flex w-full flex-1 flex-col justify-center items-center">
        <Crossword
          puzzle={numcross.puzzle}
          scratch={scratch}
          setScratch={setScratch}
          editable={false}
        />
        <Numpad editable={false} />
        <SolvedModal>
          <SolvedOverlay closeModal={closeSolved} solve={solve} />
        </SolvedModal>
      </div>
    </>
  );
}
