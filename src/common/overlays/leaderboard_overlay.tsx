import { LeaderboardStats } from "@/types/stats";
import React, { useCallback, useEffect, useState } from "react";
import Slink from "../../components/slink";
import { solveSecondsToString } from "@/utils";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "react-hot-toast";

interface Props {
  closeModal: () => void;
  updateUsername: (username: string) => void;
  username: string | null;
  stats: LeaderboardStats | null;
  loading: boolean;
  error: string;
}

function RenderNoUsername(
  stateStuff: [string, React.Dispatch<React.SetStateAction<string>>],
  updateUsername: (username: string) => void
) {
  const [username, setUsername] = stateStuff;

  const tryUpdate = () => {
    if (username.length < 4 || username.length >= 16) {
      toast("Usernames must be between 4 and 16 characters.", {
        icon: "🚫",
        id: "length",
      });
      return;
    }
    toast.remove();
    updateUsername(username);
  };

  return (
    <div className="flex flex-col justify-center align-center">
      <p className="text-center text-2xl font-bold font-title pb-2">
        One more thing...
      </p>
      <p className="pb-2">
        Set a username for the leaderboard. You can always visit settings in the
        top right to change this later.
      </p>
      <p className="pb-2">
        NOTE: This is how you will be identified on both public{" "}
        <span className="italic">and</span> private leaderboards.
      </p>
      <div className="flex">
        <p className="flex">Username:</p>
        <input
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
          }}
          className="p-0.5 mx-2 flex-1"
        />
      </div>
      <div className="flex justify-center items-center pt-4">
        <Slink href="" onClick={tryUpdate} className="text-xl">
          Submit
        </Slink>
      </div>
    </div>
  );
}

export default function LeaderboardOverlay({
  updateUsername,
  username,
  stats,
  loading,
  error,
}: Props) {
  const user = useUser();
  const [myIndex, setMyIndex] = useState<number | null>(null);
  const editState = useState("");

  // Update myIndex
  useEffect(() => {
    for (let ix = 0; ix < (stats?.today ? stats.today.length : 0); ix += 1) {
      if (stats?.today && stats.today[ix].username === username) {
        setMyIndex(ix);
      }
    }
  }, [stats, username]);

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
              <th className="text-left">Username</th>
              <th className="text-left">Time</th>
            </tr>
          </thead>
          <tbody>
            {stats.today.map((user, index) => {
              return (
                <tr
                  key={index}
                  className={index === myIndex ? "bg-slate-300" : ""}
                >
                  <td className="border px-4 py-2">{index}</td>
                  <td className="border px-4 py-2">
                    {index === myIndex ? username : user.username}
                  </td>
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
  }, [loading, error, stats, renderError, renderLoading, myIndex, username]);

  if (user && !username) return RenderNoUsername(editState, updateUsername);

  return (
    <div className="flex flex-col justify-center align-center">
      <p className="text-2xl font-bold font-title pb-2">Leaderboard</p>
      {renderContent()}
    </div>
  );
}
