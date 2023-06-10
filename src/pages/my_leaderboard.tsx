import { backendMakeFriends, backendSetUsername } from "@/api/backend";
import Loading from "@/common/loading";
import Slink from "@/components/slink";
import useDev from "@/hooks/useDev";
import useUsername from "@/hooks/useUsername";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { refreshPrivateLeaderboard } from "@/redux/slices/leaderboards";
import { solveSecondsToString } from "@/utils";
import { ClipboardIcon, ShareIcon } from "@heroicons/react/24/outline";
import { useUser } from "@supabase/auth-helpers-react";
import Head from "next/head";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RWebShare } from "react-web-share";

function RenderLoggedOut() {
  return (
    <div className="flex flex-col justify-center align-center bg-slate-100 p-3">
      <p className="text-center text-2xl font-bold font-title pb-2">
        No Access
      </p>
      <p className="text-center font-title pb-2">
        You must be logged in to access private leaderboards.
      </p>
      <p className="text-center font-title pb-2">
        New around here? <Slink href="signup">Sign Up</Slink>.
      </p>
      <p className="text-center font-title pb-2">
        Back for more? <Slink href="signup">Log in</Slink>.
      </p>
    </div>
  );
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
    <div className="flex flex-col justify-center align-center bg-slate-100 p-3">
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

export default function MyLeaderboard() {
  const user = useUser();
  const { baseUrl } = useDev();
  const dispatch = useAppDispatch();

  const searchParams = useSearchParams();
  const otherId = searchParams.get("with");
  const router = useRouter();
  const [myIndex, setMyIndex] = useState<number | null>(null);

  const { privateStatus, private: privateLeaderboard } = useAppSelector(
    (state) => state.leaderboards
  );

  const editState = useState("");
  const { username, setUsername: setUsernameState } = useUsername();

  useEffect(() => {
    if (!user || (username?.length || 0) <= 0) return;
    dispatch(refreshPrivateLeaderboard({ userId: user.id }));
  }, [dispatch, username, user]);

  const updateUsername = useCallback(
    async (newUsername: string) => {
      if (!user) return;
      if (newUsername === "framster") {
        toast("Sorry, that's a stupid username.", {
          icon: "🚫",
        });
        return;
      }
      const { data, error } = await backendSetUsername(user.id, newUsername);
      if (data?.status === "ok") {
        setUsernameState(newUsername);
      } else if (error?.message?.includes("duplicate")) {
        toast("Sorry, that username is taken.", { icon: "🚫" });
      } else {
        toast("Something strange went wrong...", { icon: "🚫" });
      }
    },
    [user, setUsernameState]
  );

  // Make the friendship when otherId is provided
  useEffect(() => {
    if (!otherId || otherId.length <= 0 || !user) return;

    backendMakeFriends(user.id, otherId).then((result) => {
      if (result) {
        // clears the params
        const { pathname } = router;
        router.push({ pathname });
        toast("Friendship added!", {
          icon: "✅",
        });
      } else {
        toast("Something strange went wrong...", { icon: "🚫" });
      }
    });
  }, [otherId, user, router]);

  // Update myindex to highlight myself
  useEffect(() => {
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
  }, [username, privateLeaderboard]);

  const magicLink = user ? `${baseUrl}/my_leaderboard?with=${user.id}` : "";
  const renderContent = useCallback(() => {
    return (
      <div className="flex flex-col h-full p-3">
        <p className="text-2xl font-bold font-title pb-2">My Leaderboard</p>
        <p className="">
          Use the magic link below to add people to your leaderboard.
        </p>
        <div className="flex items-center">
          <div className="flex-1">
            <Slink newTab href={magicLink} className="text-xl">
              My magic link.
            </Slink>
          </div>
          <div
            className="p-1 hover:cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(magicLink);
              toast("Copied to clipboard!", {
                icon: "✅",
                id: "clipboard",
                duration: 800,
              });
            }}
          >
            <ClipboardIcon className="w-8 h-8 text-black" />
          </div>
          <RWebShare
            data={{
              text: "Think you can beat my NumCross time?",
              url: magicLink,
              title: "NumCross",
            }}
          >
            <div className="p-1 hover:cursor-pointer">
              <ShareIcon className="w-8 h-8 text-black" />
            </div>
          </RWebShare>
        </div>
        <div className="mt-4 flex-1 overflow-auto">
          {privateLeaderboard ? (
            <table className="table-auto w-full">
              <thead>
                <tr>
                  <th className="text-left">Rank</th>
                  <th className="text-left">Username</th>
                  <th className="text-left">Time</th>
                </tr>
              </thead>
              <tbody>
                {privateLeaderboard.today.map((entry, index) => {
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
                })}
              </tbody>
            </table>
          ) : (
            <p>Loading</p>
          )}
        </div>
      </div>
    );
  }, [magicLink, privateLeaderboard, myIndex, username]);

  if (privateStatus === "loading") {
    return (
      <div className="flex w-full flex-1 justify-center items-center">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>NumCross</title>
        <meta
          name="description"
          content="Add your friends to compete on a private leaderboard"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {user
        ? username == null
          ? RenderNoUsername(editState, updateUsername)
          : renderContent()
        : RenderLoggedOut()}
    </>
  );
}
