export const Range = (n: number) => {
  return Array.from(Array(n).keys());
};

export const cellKey = (colidx: number, rowidx: number) => {
  return `${colidx},${rowidx}`;
};

export const getESTTimestring = () => {
  return new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
};

function toTwoDigits(n: string) {
  return n.length === 1 ? "0" + n : n;
}

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

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function withinDays(a: Date, b: Date, days: number) {
  return Math.abs(a.getTime() - b.getTime()) <= days * 24 * 60 * 60 * 1000;
}

// Relatively hacky interface, will maybe eventually want to get firmer
// types from the supabase
export function getStreaks(puzzles: any): {
  currentStreak: number;
  maxStreak: number;
} {
  const sortedPuzzles = puzzles.sort((a: any, b: any) => {
    const aDate = new Date(a.live_date);
    const bDate = new Date(b.live_date);
    return aDate.getTime() - bDate.getTime();
  });

  const todayInEST = new Date(getESTDatestring());
  let previousDate = addDays(todayInEST, 1);
  let ix = sortedPuzzles.length - 1;
  let currentStreak = 0;
  let lostCurrentStreak = false;
  let maxStreak = 0;
  let maxStreakTally = 0;

  while (ix >= 0) {
    const puzzle = sortedPuzzles[ix];
    const puzzleDate = new Date(puzzle.live_date);
    if (!lostCurrentStreak) {
      // Special tallying for the streak from today backwards
      if (withinDays(puzzleDate, previousDate, 1)) {
        currentStreak += 1;
      } else {
        lostCurrentStreak = true;
      }
    }
    // Tallying for max streak
    if (withinDays(puzzleDate, previousDate, 1)) {
      maxStreakTally += 1;
    } else {
      maxStreakTally = 1;
    }
    if (maxStreakTally > maxStreak) {
      maxStreak = maxStreakTally;
    }
    previousDate = puzzleDate;

    ix -= 1;
  }

  return {
    currentStreak,
    maxStreak,
  };
}

export function getAverageSolveTime(solves: any) {
  let totalSolveTime = solves.reduce((acc: number, solve: any) => {
    return acc + solve.time;
  }, 0);
  return totalSolveTime / solves.length;
}
