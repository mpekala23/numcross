import { Attempt, Solve } from "@/types/types";
import { useCallback } from "react";

export default function useStorage() {
  const mineAttempt: (pid: number) => Attempt | null = useCallback((pid) => {
    const attempt = localStorage.getItem(`attempt-${pid}`);
    if (attempt) {
      return JSON.parse(attempt);
    }
    return null;
  }, []);

  const storeAttempt = useCallback((attempt: Attempt) => {
    localStorage.setItem(
      `attempt-${attempt.puzzleId}`,
      JSON.stringify(attempt)
    );
  }, []);

  const mineSolve: (pid: number) => Solve | null = useCallback((pid) => {
    const solve = localStorage.getItem(`solve-${pid}`);
    if (solve) {
      return JSON.parse(solve);
    }
    return null;
  }, []);

  const storeSolve = useCallback(
    (solve: Solve) => {
      const existing = mineSolve(solve.puzzleId);
      if (existing) return;
      localStorage.setItem(`solve-${solve.puzzleId}`, JSON.stringify(solve));
    },
    [mineSolve]
  );

  return {
    storeAttempt,
    mineAttempt,
    storeSolve,
    mineSolve,
  };
}
