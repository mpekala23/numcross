import { Attempt, Puzzle } from "./types/types";

export const Range = (n: number) => {
  return Array.from(Array(n).keys());
};

export const cellKey = (rowidx: number, colidx: number) => {
  return `${rowidx},${colidx}`;
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
    console.log("caught", e);
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
