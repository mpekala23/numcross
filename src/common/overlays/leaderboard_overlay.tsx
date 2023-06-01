import React, { useCallback, useEffect, useState } from "react";
import Slink from "../../components/slink";
import { solveSecondsToString } from "@/utils";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import ReactLoading from "react-loading";
import {
  refreshPrivateLeaderboard,
  refreshPublicLeaderboard,
} from "@/redux/slices/leaderboards";

interface Props {
  closeModal: () => void;
  updateUsername: (username: string) => void;
  username: string | null;
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
  closeModal,
  updateUsername,
  username,
}: Props) {
  const user = useUser();
  const dispatch = useAppDispatch();
  const [myIndex, setMyIndex] = useState<number | null>(null);
  const editState = useState("");
  const [tab, setTab] = useState<"global" | "private">(
    user ? "private" : "global"
  );
  const {
    privateStatus,
    private: privateLeaderboard,
    publicStatus,
    public: publicLeaderboard,
  } = useAppSelector((state) => state.leaderboards);

  useEffect(() => {
    dispatch(refreshPublicLeaderboard());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(refreshPrivateLeaderboard({ userId: user.id }));
    }
  }, [dispatch, user]);

  // Update myIndex
  useEffect(() => {
    if (tab === "global" || !privateLeaderboard) {
      for (
        let ix = 0;
        ix < (publicLeaderboard?.today ? publicLeaderboard.today.length : 0);
        ix += 1
      ) {
        if (
          publicLeaderboard?.today &&
          publicLeaderboard.today[ix].username === username
        ) {
          setMyIndex(ix);
        }
      }
    } else {
      for (
        let ix = 0;
        ix < (privateLeaderboard?.today ? privateLeaderboard.today.length : 0);
        ix += 1
      ) {
        if (
          privateLeaderboard?.today &&
          privateLeaderboard.today[ix].friend.username === username
        ) {
          setMyIndex(ix);
        }
      }
    }
  }, [publicLeaderboard, privateLeaderboard, username, tab]);

  // For rendering a little loading spinner
  const renderLoading = useCallback(() => {
    return (
      <div className="flex w-full flex-1 justify-center items-center">
        <ReactLoading height={100} width={100} type={"cubes"} color="#111" />
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
    if (
      (tab === "global" && publicStatus === "loading") ||
      (tab === "private" && privateStatus === "loading")
    )
      return renderLoading();
    if (!publicLeaderboard && !privateLeaderboard)
      return renderError("No stats found. Are you logged in?");

    return (
      <div>
        <div className="flex w-full">
          <div
            onClick={() => setTab("global")}
            className={`${
              tab === "global"
                ? "basis-2/3 border-t-2 border-x-2 border-slate-200"
                : "basis-1/3 bg-slate-200"
            } p-2 text-center`}
          >
            Global
          </div>
          <div
            onClick={() => {
              if (user) setTab("private");
              else
                toast(
                  "Sorry, you must make an account to access private leaderboards.",
                  {
                    icon: "🚫",
                  }
                );
            }}
            className={`${
              tab === "private"
                ? "basis-2/3 border-t-2 border-x-2 border-slate-200"
                : "basis-1/3 bg-slate-200"
            } p-2 text-center`}
          >
            Private
          </div>
        </div>
        {tab === "private" && (
          <div className="flex my-2">
            <p>
              Want to make changes?{" "}
              <Slink onClick={closeModal} href="my_leaderboard">
                Manage Friends
              </Slink>
              .
            </p>
          </div>
        )}
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="text-left">Rank</th>
              <th className="text-left">Username</th>
              <th className="text-left">Time</th>
            </tr>
          </thead>
          {tab === "global" ? (
            <tbody>
              {(publicLeaderboard || { today: [] }).today.map((user, index) => {
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
          ) : (
            <tbody>
              {(privateLeaderboard || { today: [] }).today.map(
                (entry, index) => {
                  return (
                    <tr
                      key={index}
                      className={index === myIndex ? "bg-slate-300" : ""}
                    >
                      <td className="border px-4 py-2">{index}</td>
                      <td className="border px-4 py-2">
                        {index === myIndex ? username : entry.friend.username}
                      </td>
                      <td className="border px-4 py-2">
                        {solveSecondsToString(entry.time || 0)}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          )}
        </table>
      </div>
    );
  }, [
    privateLeaderboard,
    publicLeaderboard,
    renderError,
    renderLoading,
    myIndex,
    username,
    tab,
    closeModal,
    user,
    privateStatus,
    publicStatus,
  ]);

  if (user && !username) return RenderNoUsername(editState, updateUsername);

  return (
    <div className="flex flex-col justify-center align-center">
      <p className="text-2xl font-bold font-title pb-2">Leaderboard</p>
      {renderContent()}
    </div>
  );
}
