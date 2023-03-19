import useApi from "@/hooks/useApi";
import { UserStats } from "@/types/types";
import { useUser } from "@supabase/auth-helpers-react";
import React, { useCallback, useEffect, useState } from "react";
import Slink from "./slink";
import { asPercentage } from "@/utils";

interface Props {
  closeModal: () => void;
}

function streakToString(streak: number) {
  if (streak < 0) return "-";
  return `${streak}d`;
}

function solveSecondsToString(seconds?: number) {
  if (!seconds) return "-";
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m`;
  } else if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)}h`;
  } else {
    return `${Math.floor(seconds / 86400)}d`;
  }
}

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

export default function StatsOverlay({ closeModal }: Props) {
  const { getStats } = useApi();
  const user = useUser();
  const [stats, setStats] = useState<UserStats | null>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const doWork = async () => {
      try {
        const stats = await getStats();
        if (!stats) {
          setError("No stats found. Are you logged in?");
          setLoading(false);
          return;
        }
        setStats(stats);
        setLoading(false);
      } catch (error) {
        setError("Unknown error while getting stats.");
        setLoading(false);
      }
    };
    doWork();
  }, [getStats]);

  // For rendering a message prompting non-logged in users to log in
  // or create an account
  const renderNotLoggedIn = useCallback(() => {
    return (
      <div className="flex flex-col h-16 justify-center items-center">
        <p className="text-md font-body px-4">
          You need to be logged in to see stats.
        </p>
        <Slink onClick={closeModal} href="/signin">
          Sign in
        </Slink>
        <Slink onClick={closeModal} href="/signup">
          Create an account
        </Slink>
      </div>
    );
  }, [closeModal]);

  // For rendering a little loading spinner
  const renderLoading = useCallback(() => {
    return (
      <div className="flex h-16 justify-center items-center">
        <div className="w-4 h-4 border-dashed border-2 border-slate-600 animate-spin" />
        <p className="text-xl font-body px-4">Loading...</p>
        <div className="w-4 h-4 border-dashed border-2 border-slate-600 animate-spin" />
      </div>
    );
  }, []);

  // For rendering an error message
  const renderError = useCallback((errorString: string) => {
    return (
      <div className="flex h-16 justify-center items-center">
        <p className="text-md font-body px-4">{errorString}</p>
      </div>
    );
  }, []);

  // For rendering the content, once loaded without error
  const renderContent = useCallback(() => {
    if (!user?.id) return renderNotLoggedIn();
    if (loading) return renderLoading();
    if (error.length > 0 || (!loading && !stats)) return renderError(error);
    if (!stats) return renderError("No stats found. Are you logged in?");

    return (
      <div>
        <div className="flex justify-around">
          {renderStat({ name: "Played", value: stats.numPlayed })}
          {renderStat({
            name: "Win %",
            value: asPercentage(stats.numPlayed, stats.numSolved),
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
  }, [
    user?.id,
    loading,
    error,
    stats,
    renderNotLoggedIn,
    renderLoading,
    renderError,
  ]);

  return (
    <div className="flex flex-col justify-center align-center">
      <p className="text-2xl font-bold font-title pb-4">Stats</p>
      {renderContent()}
    </div>
  );
}