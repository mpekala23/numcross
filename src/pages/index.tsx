import Head from "next/head";
import { Crossword } from "@/components/crossword";
import React, { useCallback, useEffect, useState } from "react";
import { Attempt, Scratch, Solve } from "@/types/types";
import { cellKey, isAttemptFull, sleep } from "@/utils";
import { toast } from "react-hot-toast";
import useModal from "@/hooks/useModal";
import { Numpad } from "@/components/numpad";
import { isEqual } from "lodash";
import SolvedOverlay from "@/common/overlays/solved_overlay";
import { useUser } from "@supabase/auth-helpers-react";
import { backendStartAttempt, backendLogSolve } from "@/api/backend";
import {
  mineAttempt,
  mineSolve,
  storeSolve,
  forgetSolve,
  storeAttempt,
  mineCatch,
  storeCatch,
} from "@/api/storage";
import { useStopwatch } from "react-timer-hook";
import StartOverlay from "@/components/start_overlay";
import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { refreshTodaysNumcross } from "@/redux/slices/puzzles";
import {
  fetchSolve,
  setAttempt,
  setSolve,
  verifyAttempt,
} from "@/redux/slices/progress";
import { refreshUserStats } from "@/redux/slices/stats";
import Loading from "@/common/loading";

export default function Home() {
  const dispatch = useAppDispatch();
  const { status: puzzleStatus, today: numcross } = useAppSelector(
    (state) => state.puzzles
  );
  const { attempt, solve, fetchSolveStatus, verifyAttemptStatus } =
    useAppSelector((state) => state.progress);
  const [lastAttempt, setLastAttempt] = useState<Attempt | null>(null);

  const [scratch, setScratch] = useState<Scratch>({});
  const [shouldPopOff, setShouldPopOff] = useState(true);
  const {
    seconds,
    start: startStopwatch,
    pause: pauseStopwatch,
  } = useStopwatch();
  const user = useUser();
  const [StartModal, openStart, closeStart] = useModal({
    onClose: () => {
      if (!numcross) return;
      dispatch(
        setAttempt({
          puzzleId: numcross.id,
          startTime: new Date().toISOString(),
          scratch: {},
          heatmap: {},
          time: 0,
        })
      );
      if (user) backendStartAttempt(user.id, numcross.id);
      startStopwatch();
    },
  });
  const [SolvedModal, openSolved, closeSolved] = useModal();
  const router = useRouter();

  // Catch user id for mobile
  useEffect(() => {
    const caught = mineCatch();
    if (!caught && user) {
      storeCatch(true);
      router.push(`/?uid=${user.id}`);
      setTimeout(() => {
        router.push("/");
      }, 100);
    }
  }, [router, user]);

  // Function that _just_ gets the puzzle
  useEffect(() => {
    dispatch(refreshTodaysNumcross());
  }, [dispatch]);

  // Function that _just_ loads our attempt from local storage
  useEffect(() => {
    const asyncWork = async () => {
      if (!numcross || solve) return;
      const matt = mineAttempt(numcross.id);
      if (matt) {
        dispatch(setAttempt(matt));
        setScratch(matt.scratch);
        startStopwatch();
      } else {
        openStart();
      }
    };
    asyncWork();
  }, [dispatch, numcross, openStart, startStopwatch, solve]);

  // Function that _just_ starts getting solve from backend if there's a user
  useEffect(() => {
    if (!user || !numcross) return;
    sleep(1000).then(() => {
      dispatch(fetchSolve({ userId: user.id, puzzleId: numcross.id }));
      dispatch(refreshUserStats({ userId: user.id }));
    });
  }, [dispatch, user, numcross]);

  // If you've already solved the puzzle, fills in the squares with
  // the solution
  const cheatScratch = useCallback(() => {
    if (!numcross) return;
    const shape = numcross.solution.shape;
    const newScratch: Scratch = {};
    for (let rx = 0; rx < shape[0]; rx++) {
      for (let cx = 0; cx < shape[1]; cx++) {
        const answer = numcross.solution.answers[rx][cx];
        if (answer === "blank") continue;
        newScratch[cellKey(rx, cx)] = answer;
      }
    }
    closeStart();
    setScratch(newScratch);
  }, [numcross, closeStart]);

  // Function that sees if we solved this puzzle logged out
  useEffect(() => {
    const asyncWork = async () => {
      if (!numcross || !user) return;
      const msol = mineSolve(numcross.id);
      if (msol) {
        // Only happens if the user solved this puzzle logged out
        await backendStartAttempt(user.id, numcross.id);
        await backendLogSolve(msol, user.id);
        forgetSolve(numcross.id); // TODO: Add a function that will backfill all solves
        setShouldPopOff(false);
        dispatch(setSolve(msol));
        pauseStopwatch();
      }
    };
    asyncWork();
  }, [dispatch, numcross, user, cheatScratch, pauseStopwatch]);

  // Function that sees if the logged in user has already solved this puzzle
  useEffect(() => {
    if (fetchSolveStatus !== "success" || !solve) return;
    const newAttempt = {
      puzzleId: solve.puzzleId,
      startTime: solve.startTime,
      scratch: {},
      heatmap: {},
      time: solve.time,
    };
    dispatch(setAttempt(newAttempt));
    storeAttempt(newAttempt);
    setLastAttempt(newAttempt);
    cheatScratch();
    setShouldPopOff(false);
    pauseStopwatch();
  }, [dispatch, fetchSolveStatus, solve, cheatScratch, pauseStopwatch]);

  // Effect to make sure the "scratch" is updated in the attempt
  useEffect(() => {
    if (!attempt || solve) return;
    dispatch(setAttempt({ ...attempt, scratch }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, scratch]);

  // Function to update the heatmap
  const updateHeatmap = useCallback(() => {
    if (!attempt || !numcross) return;
    const shape = numcross.solution.shape;
    const newHeatmap: Scratch = {};
    let update = false;
    for (let rx = 0; rx < shape[0]; rx++) {
      for (let cx = 0; cx < shape[1]; cx++) {
        const answer = numcross.solution.answers[rx][cx];
        if (answer === "blank") continue;
        const guess = attempt.scratch[cellKey(rx, cx)];
        if (
          guess === answer &&
          (attempt.heatmap[cellKey(rx, cx)] === null ||
            attempt.heatmap[cellKey(rx, cx)] === undefined)
        ) {
          newHeatmap[cellKey(rx, cx)] = attempt.time;
          update = true;
        } else {
          newHeatmap[cellKey(rx, cx)] =
            attempt.heatmap[cellKey(rx, cx)] || null;
        }
      }
    }
    if (update) dispatch(setAttempt({ ...attempt, heatmap: newHeatmap }));
  }, [numcross, attempt, dispatch]);

  // Effect to update the heatmap when needed
  useEffect(() => {
    updateHeatmap();
  }, [updateHeatmap]);

  const checkPuzzle = useCallback(() => {
    // Puzzle must be loaded, an attempt must've been started, it must not already
    // be solved, and the attempt must be full to actually test it's correctness
    if (
      !numcross ||
      !attempt ||
      solve !== null ||
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
        heatmap: attempt.heatmap,
        time: attempt.time,
      };
      dispatch(setSolve(newSolve));
      if (user) {
        // NOTE: This call might fail, right now we just ignore it
        dispatch(verifyAttempt({ userId: user.id }));
      } else {
        storeSolve(newSolve);
      }
    } else {
      toast("Puzzle incorrect", { icon: "😑", id: "incorrect" });
    }
  }, [dispatch, numcross, attempt, solve, user]);

  useEffect(() => {
    if (verifyAttemptStatus === "success" && solve && user) {
      dispatch(refreshUserStats({ userId: user.id }));
    }
  }, [dispatch, solve, user, verifyAttemptStatus]);

  // Update the attempt in local storage on change
  useEffect(() => {
    if (attempt && !isEqual(attempt, lastAttempt) && !solve) {
      storeAttempt(attempt);
      setLastAttempt(attempt);
      checkPuzzle();
    }
  }, [attempt, lastAttempt, solve, setLastAttempt, checkPuzzle]);

  useEffect(() => {
    if (!attempt || solve) return;
    const newAttempt = {
      ...attempt,
      time: attempt.time + 1,
    };
    dispatch(setAttempt(newAttempt));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, solve, seconds]);

  // Fun stuff on solve
  useEffect(() => {
    if (solve && shouldPopOff) {
      toast.remove();
      toast("Puzzle solved!", { icon: "🎉", duration: 1000 });
      pauseStopwatch();
      setShouldPopOff(false);
      openSolved();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solve, shouldPopOff, openSolved]);

  if (!numcross || puzzleStatus !== "success") {
    return (
      <div className="flex w-full flex-1 justify-center items-center">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>NumCross</title>
        <meta
          name="description"
          content="You're probably not smart enough for this."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
