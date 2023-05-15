import Head from "next/head";
import { Crossword } from "@/components/crossword";
import React, { useCallback, useEffect, useState } from "react";
import useApi from "@/hooks/useApi";
import { Attempt, Numcross, Scratch, Solve } from "@/types/types";
import { isAttemptFull } from "@/utils";
import { toast } from "react-hot-toast";
import useModal from "@/hooks/useModal";
import { Numpad } from "@/components/numpad";
import { isEqual } from "lodash";
import SolvedOverlay from "@/common/solved_overlay";
import { useUser } from "@supabase/auth-helpers-react";
import { mineAttempt, mineSolve, storeSolve } from "@/hooks/useStorage";

export default function Home() {
  const { getTodaysNumcross, checkAttempt, logSolve, updateAttempt } = useApi();
  const [numcross, setNumcross] = useState<Numcross | null>(null);
  const [scratch, setScratch] = useState<Scratch>({});
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [shouldPopOff, setShouldPopOff] = useState(true);
  const [hasSolved, setHasSolved] = useState<boolean>(false);
  const [solve, setSolve] = useState<Solve | null>(null);
  const [SolvedModal, openSolved, closeSolved] = useModal();
  const [lastAttempt, setLastAttempt] = useState<Attempt | null>(null);
  const user = useUser();

  useEffect(() => {
    // Helper function to do the get
    const performGet: () => Promise<void> = async () => {
      console.log(
        !!getTodaysNumcross,
        user?.id,
        !!logSolve,
        !!updateAttempt,
        shouldPopOff
      );
      const result = await getTodaysNumcross(user?.id);
      if (!result) {
        setPageError("Error loading today's numcross");
        return;
      }
      // This is to handle a user who did the puzzle logged out and then
      // made an account
      const { numcross, attempt: attemptFetch, solve: existSolve } = result;
      setNumcross(numcross);
      const preattempt = mineAttempt(numcross.id);
      const presolved = mineSolve(numcross.id);
      if (shouldPopOff && (!!existSolve || (preattempt && presolved))) {
        setShouldPopOff(false);
      }
      if (presolved && preattempt && user?.id) {
        setSolve(presolved);
        await updateAttempt(preattempt, user.id);
        await logSolve(presolved, user.id);
        setAttempt(
          attemptFetch || {
            puzzleId: numcross.id,
            scratch: preattempt.scratch,
            startTime: presolved.startTime,
            hasCheated: presolved.didCheat,
          }
        );
        // TODO: More granular way of doing this
        localStorage.clear();
      } else {
        setAttempt(
          attemptFetch || {
            puzzleId: numcross.id,
            scratch: {},
            startTime: new Date().toISOString(),
            hasCheated: false,
          }
        );
      }
      // Explicitly update the scratch, note that usually data
      // flows in the reverse direction
      if (attemptFetch) {
        setScratch(attemptFetch.scratch);
      }
    };

    performGet();
  }, [getTodaysNumcross, user?.id, logSolve, updateAttempt, shouldPopOff]);

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
    const apiResult = await checkAttempt(attempt, user?.id);
    if (apiResult?.solve) {
      if (!solve) {
        setSolve(apiResult.solve);
        if (!user?.id) {
          storeSolve(apiResult.solve);
        }
      }
    }
    if (apiResult?.correct) {
      setHasSolved(true);
    } else {
      toast("Puzzle incorrect", { icon: "😑" });
    }
    return;
  }, [attempt, checkAttempt, hasSolved, setHasSolved, user?.id, solve]);

  // Update the attempt over API on change
  // Check the attempt if it's full
  // NOTE: Short circuits if the attempt is nul123l or if
  // the puzzle has already been solved
  useEffect(() => {
    if (attempt && !isEqual(attempt, lastAttempt) && !hasSolved) {
      updateAttempt(attempt, user?.id);
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
    user?.id,
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
