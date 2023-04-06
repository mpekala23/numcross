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
  if (l.length != 2) {
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
      throw new Error("Bad response from server");
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
      if (!attempt.scratch[key]) return false;
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
