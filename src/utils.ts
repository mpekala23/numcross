import { Attempt, Puzzle, Settings } from "./types/types";
import { cloneDeep } from "lodash";

export const Range = (n: number) => {
  return Array.from(Array(n).keys());
};

// Create an array with the same value in each entry
export const Arr = (n: number, v: any) => {
  return Array.from(Array(n)).map((_) => cloneDeep(v));
};

export const Arr2D = (nx: number, ny: number, v: any) => {
  return Arr(nx, Arr(ny, v));
};

export const cellKey = (rowidx: number, colidx: number) => {
  return `${rowidx},${colidx}`;
};

export const parseCellKey = (key: string) => {
  const l = key.split(",");
  if (l.length !== 2) {
    return [-1, -1];
  }
  return [parseFloat(l[0]), parseFloat(l[1])];
};

export async function getJSON<Type>(
  url: string,
  params?: any
): Promise<{ data: Type | null; error: Error | null }> {
  try {
    const searchParams = new URLSearchParams(params || {});
    const resp = await fetch(`${url}?${searchParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (resp.status !== 200) {
      throw new Error("Bad response from server");
    }
    const json = await resp.json();
    return { data: json, error: null };
  } catch (e) {
    const error = e as Error;
    return { data: null, error };
  }
}

export async function postJSON<Type>(
  url: string,
  body: any
): Promise<{ data: Type | null; error: Error | null }> {
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (resp.status !== 200) {
      const json = await resp.json();
      throw new Error(json["errorMessage"]);
    }
    const json = await resp.json();
    return { data: json, error: null };
  } catch (e) {
    const error = e as Error;
    return { data: null, error };
  }
}

export function isAttemptFull(attempt: Attempt, puzzle: Puzzle): boolean {
  for (let rx = 0; rx < puzzle.shape[0]; ++rx) {
    for (let cx = 0; cx < puzzle.shape[1]; ++cx) {
      if (puzzle.clues[rx][cx].type === "blank") continue;
      const key = cellKey(rx, cx);
      if (attempt.scratch[key] === undefined) return false;
    }
  }
  return true;
}

export function asPercentage(num: number, denom: number): number {
  return Math.round((num / denom) * 100);
}

export function safeParse(numStr: string): number | undefined {
  if (numStr === "0") return 0;
  if (numStr === "1") return 1;
  if (numStr === "2") return 2;
  if (numStr === "3") return 3;
  if (numStr === "4") return 4;
  if (numStr === "5") return 5;
  if (numStr === "6") return 6;
  if (numStr === "7") return 7;
  if (numStr === "8") return 8;
  if (numStr === "9") return 9;
  return undefined;
}

export const DEFAULT_SETTINGS: Settings = {
  fillMode: "nextEmpty",
  deleteMode: "previous",
};

export function streakToString(streak: number) {
  if (streak < 0) return "-";
  return `${streak}d`;
}

export function twoDigits(val: number) {
  const str = `${val}`;
  if (str.length < 2) {
    return "0" + str;
  }
  return str;
}

export function getSolveTime(startDate: Date, endDate: Date) {
  return (endDate.getTime() - startDate.getTime()) / 1000;
}

export function solveSecondsToString(seconds?: number) {
  if (!seconds) return "-";
  if (seconds < 3600) {
    return `${twoDigits(Math.floor(seconds / 60))}:${twoDigits(
      Math.round(seconds % 60)
    )}`;
  }
  return `${twoDigits(Math.floor(seconds / 3600))}:${twoDigits(
    Math.floor(seconds / 60) % 60
  )}:${twoDigits(Math.round(seconds % 60))}`;
}

function toTwoDigits(n: string) {
  return n.length === 1 ? "0" + n : n;
}

export const getESTTimestring = () => {
  return new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
};

export const getESTDatestring = () => {
  const date = getESTTimestring();
  const splitSpaces = date.split(" ");
  const splitSlashes = splitSpaces[0]
    .slice(0, splitSpaces[0].length - 1)
    .split("/");
  return `${splitSlashes[2]}-${toTwoDigits(splitSlashes[0])}-${toTwoDigits(
    splitSlashes[1]
  )}`;
};

export async function sleep(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}
