import useApi from "@/hooks/useApi";
import { LeaderboardStats } from "@/types/stats";
import React, { useCallback, useEffect, useState } from "react";
import Slink from "../components/slink";
import { asPercentage, solveSecondsToString } from "@/utils";

interface Props {
  closeModal: () => void;
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

export default function LeaderboardOverlay({ closeModal }: Props) {
  const { getLeaderboard } = useApi();
  const [stats, setStats] = useState<LeaderboardStats | null>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const doWork = async () => {
      try {
        const stats = await getLeaderboard();
        if (!stats) {
          setError("Can't get leaderboard. Try again later.");
          setLoading(false);
          return;
        }
        console.log(stats);
        setStats(stats);
        setLoading(false);
      } catch (error) {
        setError("Unknown error while getting the leaderboard.");
        setLoading(false);
      }
    };
    doWork();
  }, [getLeaderboard]);

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
    if (loading) return renderLoading();
    if (error.length > 0 || (!loading && !stats)) return renderError(error);
    if (!stats) return renderError("No stats found. Are you logged in?");

    return (
      <div>
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="text-left">Rank</th>
              <th className="text-left">Name</th>
              <th className="text-left">Time</th>
            </tr>
          </thead>
          <tbody>
            {stats.today.map((user, index) => {
              return (
                <tr key={index}>
                  <td className="border px-4 py-2">{index}</td>
                  <td className="border px-4 py-2">{user.username}</td>
                  <td className="border px-4 py-2">
                    {solveSecondsToString(user.time)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }, [loading, error, stats, renderError, renderLoading]);

  return (
    <div className="flex flex-col justify-center align-center">
      <p className="text-2xl font-bold font-title pb-4">Leaderboard</p>
      {renderContent()}
    </div>
  );
}
