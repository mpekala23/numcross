import Head from "next/head";
import { Crossword } from "@/components/crossword";
import React, { useCallback, useEffect, useState } from "react";
import { Attempt, Numcross, Scratch, Solve } from "@/types/types";
import { cellKey, isAttemptFull } from "@/utils";
import { toast } from "react-hot-toast";
import useModal from "@/hooks/useModal";
import { Numpad } from "@/components/numpad";
import { isEqual } from "lodash";
import SolvedOverlay from "@/common/overlays/solved_overlay";
import { useUser } from "@supabase/auth-helpers-react";
import {
  getTodaysNumcross,
  getSolve,
  startAttempt,
  verifyAttempt,
  logSolve,
} from "@/api/backend";
import {
  mineAttempt,
  mineSolve,
  storeSolve,
  forgetSolve,
  storeAttempt,
} from "@/api/storage";
import { useStopwatch } from "react-timer-hook";
import StartOverlay from "@/components/start_overlay";

export default function Home() {
  const [numcross, setNumcross] = useState<Numcross | null>(null);
  const [scratch, setScratch] = useState<Scratch>({});
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [shouldPopOff, setShouldPopOff] = useState(true);
  const { seconds, start: startStopwatch } = useStopwatch();
  const user = useUser();
  const [StartModal, openStart, closeStart] = useModal({
    onClose: () => {
      if (!numcross) return;
      setAttempt({
        puzzleId: numcross.id,
        startTime: new Date().toISOString(),
        scratch: {},
        time: 0,
      });
      if (user) startAttempt(user.id, numcross.id);
      startStopwatch();
    },
  });
  const [solve, setSolve] = useState<Solve | null>(null);
  const [SolvedModal, openSolved, closeSolved] = useModal();
  const [lastAttempt, setLastAttempt] = useState<Attempt | null>(null);

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
        startStopwatch();
      } else {
        openStart();
      }
    };
    asyncWork();
  }, [numcross, openStart, startStopwatch]);

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

  const checkPuzzle = useCallback(() => {
    // Puzzle must be loaded, an attempt must've been started, it must not already
    // be solved, and the attempt must be full to actually test it's correctness
    if (
      !numcross ||
      !attempt ||
      solve != null ||
      !isAttemptFull(attempt, numcross.puzzle)
    ) {
      return;
    }
    // Test that the attempt is correct
    let correct = true;
    const shape = numcross.solution.shape;
    for (let rx = 0; rx < shape[0]; rx++) {
      for (let cx = 0; cx < shape[1]; cx++) {
        const answer = numcross.solution.answers[rx][cx];
        if (answer === "blank") continue;
        const guess = attempt.scratch[cellKey(rx, cx)];
        if (guess !== answer) {
          correct = false;
          break;
        }
      }
    }
    if (correct) {
      const newSolve: Solve = {
        puzzleId: numcross.id,
        startTime: attempt.startTime,
        endTime: new Date().toISOString(),
        time: 0, // TODO: make real
      };
      setSolve(newSolve);
      if (user) {
        // NOTE: This call might fail, right now we just ignore it
        verifyAttempt(attempt, user.id);
      } else {
        storeSolve(newSolve);
      }
    } else {
      toast("Puzzle incorrect", { icon: "😑", id: "incorrect" });
    }
  }, [numcross, attempt, solve, user]);

  // Update the attempt over API on change
  // Check the attempt if it's full
  // NOTE: Short circuits if the attempt is nul123l or if
  // the puzzle has already been solved
  useEffect(() => {
    if (attempt && !isEqual(attempt, lastAttempt) && !solve) {
      storeAttempt(attempt);
      setLastAttempt(attempt);
      checkPuzzle();
    }
  }, [attempt, lastAttempt, solve, setLastAttempt, checkPuzzle]);

  const incrementTime = useCallback(() => {
    if (!attempt) return;
    const newAttempt = {
      ...attempt,
      time: attempt.time + 1,
    };
    setAttempt(newAttempt);
  }, [attempt, setAttempt]);

  useEffect(() => {
    incrementTime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  // Fun stuff on solve
  useEffect(() => {
    if (solve && shouldPopOff) {
      toast.remove();
      toast("Puzzle solved!", { icon: "🎉", duration: 1000 });
      setShouldPopOff(false);
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
      <div className="flex w-full flex-1 flex-col justify-center items-center my-8">
        <Crossword
          puzzle={numcross.puzzle}
          scratch={scratch}
          setScratch={setScratch}
          editable={false}
          seconds={solve ? solve.time : attempt ? attempt.time : null}
        />
        <Numpad editable={false} />
        <div className="h-8" />
        <SolvedModal>
          <SolvedOverlay closeModal={closeSolved} solve={solve} />
        </SolvedModal>
        <StartModal>
          <StartOverlay
            isLoggedIn={!!user}
            numcross={numcross}
            closeStart={closeStart}
          />
        </StartModal>
      </div>
    </>
  );
}
