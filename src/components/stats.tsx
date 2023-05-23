import { UserStats } from "@/types/stats";
import React, { useCallback } from "react";
import { asPercentage, solveSecondsToString, streakToString } from "@/utils";

function renderStat({ name, value }: { name: string; value: number | string }) {
  return (
    <div className="flex flex-col justify-center items-center">
      {value && <p className="text-2xl font-title px-4">{value}</p>}
      <p className="text-xs text-center h-8 font-body px-4 text-slate-600">
        {name}
      </p>
    </div>
  );
}
interface Props {
  stats: UserStats | null
}
export default function Stats({stats}: Props) {

  const renderError = useCallback((errorString: string) => {
    return (
      <div className="flex h-16 justify-center items-center">
        <p className="text-md font-body px-4">{errorString}</p>
      </div>
    );
  }, []);
  if (!stats) return renderError("No stats found. Are you logged in?");
  return (
    <div>
      <div className="flex justify-around">
        {renderStat({ name: "Played", value: stats.numPlayed })}
        {renderStat({
          name: "Win %",
          value: asPercentage(stats.numSolved, stats.numPlayed),
        })}
        {renderStat({
          name: "Avg. Solve Time",
          value: solveSecondsToString(stats.averageSolveTime),
        })}
      </div>
      <div className="flex justify-around">
        {renderStat({
          name: "Current Streak",
          value: streakToString(stats.currentStreak),
        })}
        {renderStat({
          name: "Max Streak",
          value: streakToString(stats.maxStreak),
        })}
      </div>
    </div>
  );
}