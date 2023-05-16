import useApi from "@/hooks/useApi";
import { LeaderboardStats } from "@/types/stats";
import React, { useCallback, useEffect, useState } from "react";
import Slink from "../components/slink";
import { solveSecondsToString } from "@/utils";
import { useUser } from "@supabase/auth-helpers-react";
import useUsername from "@/hooks/useUsername";
import { toast } from "react-hot-toast";

interface Props {
  closeModal: () => void;
}

export default function LeaderboardOverlay({ closeModal }: Props) {
  const { setUsername, getLeaderboard } = useApi();
  const [stats, setStats] = useState<LeaderboardStats | null>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const user = useUser();
  const { username, setUsername: setUsernameState } = useUsername();
  const [newUsername, setNewUsername] = useState("");
  const [editingUsername, setEditingUsername] = useState(false);
  const [myIndex, setMyIndex] = useState<number | null>(null);

  useEffect(() => {
    const doWork = async () => {
      try {
        const stats = await getLeaderboard();
        if (!stats) {
          setError("Can't get leaderboard. Try again later.");
          setLoading(false);
          return;
        }
        setStats(stats);
        setLoading(false);
      } catch (error) {
        setError("Unknown error while getting the leaderboard.");
        setLoading(false);
      }
    };
    doWork();
  }, [getLeaderboard]);

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

  const renderUsername = useCallback(() => {
    if (editingUsername && user?.id) {
      return (
        <div className="pb-2 flex flex-row justify-between align-middle">
          <p className="flex flex-1">Your name:</p>
          <input
            value={newUsername}
            onChange={(e) => {
              setNewUsername(e.target.value);
            }}
            className="p-0.5 mx-2"
          />
          <div className="flex flex-col">
            <Slink
              href=""
              onClick={() => {
                if (newUsername.length < 4 || newUsername.length > 12) {
                  toast("Usernames must be between 4 and 12 characters.", {
                    icon: "🚫",
                  });
                  return;
                }
                const update = async () => {
                  if (newUsername === "framster") {
                    toast("Sorry, that's a stupid username.", {
                      icon: "🚫",
                    });
                  }
                  const { data, error } = await setUsername(
                    user.id,
                    newUsername
                  );
                  if (data?.status === "ok") {
                    setUsernameState(newUsername);
                  } else if (error?.message?.includes("duplicate")) {
                    toast("Sorry, that username is taken.", { icon: "🚫" });
                  } else {
                    toast("Something strange went wrong...", { icon: "🚫" });
                  }
                  setEditingUsername(false);
                };
                update();
              }}
            >
              Submit
            </Slink>
            <Slink
              href=""
              onClick={() => {
                setEditingUsername(false);
              }}
            >
              Cancel
            </Slink>
          </div>
        </div>
      );
    } else {
      return (
        <div className="pb-2 flex justify-between">
          <p>Your name: {username || "<no username>"}</p>
          <Slink
            href=""
            onClick={() => {
              setEditingUsername(true);
            }}
          >
            Change
          </Slink>
        </div>
      );
    }
  }, [
    username,
    user,
    setUsername,
    newUsername,
    editingUsername,
    setEditingUsername,
    setUsernameState,
  ]);

  // For rendering the content, once loaded without error
  const renderContent = useCallback(() => {
    if (loading) return renderLoading();
    if (error.length > 0 || (!loading && !stats)) return renderError(error);
    if (!stats) return renderError("No stats found. Are you logged in?");

    return (
      <div>
        {user && renderUsername()}
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
  }, [
    loading,
    error,
    stats,
    user,
    renderError,
    renderLoading,
    renderUsername,
    myIndex,
    username,
  ]);

  return (
    <div className="flex flex-col justify-center align-center">
      <p className="text-2xl font-bold font-title pb-2">Leaderboard</p>
      {renderContent()}
    </div>
  );
}
