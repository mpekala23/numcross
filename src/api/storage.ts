import { Attempt, Settings, Solve } from "@/types/types";
import { DEFAULT_SETTINGS } from "@/utils";

export function mineAttempt(pid: number): Attempt | null {
  const attempt = localStorage.getItem(`attempt-${pid}`);
  if (attempt) {
    return JSON.parse(attempt);
  }
  return null;
}

export function storeAttempt(attempt: Attempt) {
  localStorage.setItem(`attempt-${attempt.puzzleId}`, JSON.stringify(attempt));
}

export function mineSolve(pid: number): Solve | null {
  const solve = localStorage.getItem(`solve-${pid}`);
  if (solve) {
    return JSON.parse(solve);
  }
  return null;
}

export function storeSolve(solve: Solve) {
  const existing = mineSolve(solve.puzzleId);
  if (existing) return;
  localStorage.setItem(`solve-${solve.puzzleId}`, JSON.stringify(solve));
}

export function forgetSolve(pid: number) {
  localStorage.removeItem(`solve-${pid}`);
}

export function mineSettings(): Settings {
  const settings = localStorage.getItem("settings");
  if (!settings) {
    return DEFAULT_SETTINGS;
  }
  return JSON.parse(settings);
}

export function storeSettings(settings: Settings) {
  localStorage.setItem("settings", JSON.stringify(settings));
}
