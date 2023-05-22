import dotenv from "dotenv";
import express from "express";
import next from "next";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";
import { Solution, Solve } from "../src/types/types";
import {
  cellKey,
  getAverageSolveTime,
  getESTDatestring,
  getStreaks,
} from "./utils";
import {
  AddPuzzleReq,
  AddPuzzleResp,
  GetSolveReq,
  GetSolveResp,
  LeaderboardReq,
  LeaderboardResp,
  LogSolveReq,
  LogSolveResp,
  MakeFriendsReq,
  MakeFriendsResp,
  PrivateLeaderboardReq,
  PrivateLeaderboardResp,
  SetUsernameReq,
  SetUsernameResp,
  StartAttemptReq,
  StartAttemptResp,
  TodaysNumcrossReq,
  TodaysNumcrossResp,
  TypedRequestBody,
  TypedRequestQuery,
  TypedResponse,
  UserStatsReq,
  UserStatsResp,
  UsernameReq,
  UsernameResp,
  VerifyAttemptReq,
  VerifyAttemptResp,
} from "../src/types/api";
import { LeaderboardEntry, PrivateLeaderboardEntry } from "../src/types/stats";

const env_path =
  process.env.NODE_ENV === "production" || true
    ? ".env.production"
    : ".env.development";
dotenv.config({ path: env_path });

const IS_DEV = process.env.NODE_ENV !== "production";
const app = next({ dev: IS_DEV });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SECRET || ""
);

app
  .prepare()
  .then(() => {
    const server = express();

    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));

    const getMostRecentPuzzle = async (): Promise<any | null> => {
      const todaysDatestring = getESTDatestring();
      const { data, error } = await supabase
        .from("puzzles")
        .select("*")
        .lte("live_date", todaysDatestring)
        .order("live_date", { ascending: false })
        .limit(1)
        .single();
      if (error) {
        return null;
      } else {
        return data;
      }
    };

    // NOTE: Is directional, adds uid2 to uid1s list (assumes called twice elsewhere)
    const makeFriends = async (
      uid1: string,
      uid2: string
    ): Promise<boolean> => {
      let { data: existFriendlist } = await supabase
        .from("private_leaderboards")
        .select("friendlist")
        .eq("uid", uid1)
        .single();
      if (!existFriendlist) existFriendlist = { friendlist: { friendIds: [] } };
      const friendIds = existFriendlist.friendlist.friendIds;
      const checkExist = friendIds.find((id: string) => id === uid2);
      if (!!checkExist) return true;
      friendIds.push(uid2);
      await supabase
        .from("private_leaderboards")
        .upsert({ uid: uid1, friendlist: { friendIds } })
        .select();
      return true;
    };

    server.get(
      "/api/todays_numcross",
      async (
        req: TypedRequestQuery<TodaysNumcrossReq>,
        res: TypedResponse<TodaysNumcrossResp>
      ) => {
        console.log("GET /api/todays_numcross");

        // Will get the current date in format yyyy-mm-dd and fetch
        // the most recent puzzle that was/is live on or before this date
        const data = await getMostRecentPuzzle();
        if (!data) {
          res.send({ status: "error" });
          return;
        }
        res.send({
          status: "ok",
          numcross: {
            id: data.id,
            createdAt: data.created_at,
            liveDate: data.live_date,
            author: data.author,
            difficulty: data.difficulty,
            puzzle: data.puzzle,
            solution: data.solution,
          },
        });
      }
    );

    server.get(
      "/api/get_solve",
      async (
        req: TypedRequestQuery<GetSolveReq>,
        res: TypedResponse<GetSolveResp>
      ) => {
        console.log("GET /api/get_solve");

        const { uid, pid } = req.query;
        let solve: Solve | null = null;
        const { data: solveData, error: solveError } = await supabase
          .from("solves")
          .select("*")
          .eq("uid", uid)
          .eq("pid", pid)
          .single();
        if (solveData && !solveError) {
          solve = {
            puzzleId: solveData.pid,
            startTime: solveData.start_time,
            endTime: solveData.end_time,
            time: solveData.time,
          };
        }
        res.send({
          status: "ok",
          solve,
        });
      }
    );

    server.post(
      "/api/add_puzzle",
      async (
        req: TypedRequestBody<AddPuzzleReq>,
        res: TypedResponse<AddPuzzleResp>
      ) => {
        const { error } = await supabase
          .from("puzzles")
          .insert({
            live_date: req.body.live_date,
            puzzle: req.body.puzzle,
            author: req.body.author,
            solution: req.body.solution,
            difficulty: req.body.difficulty,
          })
          .select();
        if (error) {
          console.log("error", error);
          res.status(500).send({
            status: "error",
            errorMessage: "Error: Can't add puzzle",
          });
        } else {
          res.send({
            status: "ok",
          });
        }
      }
    );

    server.post(
      "/api/start_attempt",
      async (
        req: TypedRequestBody<StartAttemptReq>,
        res: TypedResponse<StartAttemptResp>
      ) => {
        console.log("POST /api/start_attempt");

        const { userId, puzzleId } = req.body;
        const { data: existsData } = await supabase
          .from("attempts")
          .select("uid")
          .eq("uid", userId)
          .eq("pid", puzzleId)
          .single();
        if (existsData) {
          // We've already logged this attempt
          res.send({
            status: "ok",
          });
          return;
        }

        const { error } = await supabase
          .from("attempts")
          .upsert({
            uid: userId,
            pid: puzzleId,
            start_time: new Date().toISOString(),
          })
          .select();
        if (error) {
          res.status(500).send({
            status: "error",
            errorMessage: "Error: Can't start attempt",
          });
        } else {
          res.send({
            status: "ok",
          });
        }
      }
    );

    server.post(
      "/api/verify_attempt",
      async (
        req: TypedRequestBody<VerifyAttemptReq>,
        res: TypedResponse<VerifyAttemptResp>
      ) => {
        console.log("POST verify_attempt");

        // Get the relevant puzzle
        const { attempt, userId } = req.body;
        const { data: numcross, error } = await supabase
          .from("puzzles")
          .select()
          .eq("id", attempt.puzzleId)
          .single();
        if (error) {
          res.status(500).send({
            correct: false,
            status: "error",
            errorMessage: "Error: Can't get puzzle",
          });
          return;
        }

        // First check if there's already a row in the solves table
        const { data: checkData } = await supabase
          .from("solves")
          .select()
          .eq("uid", userId)
          .eq("pid", attempt.puzzleId)
          .single();

        if (checkData) {
          // If there is, we're done
          res.send({
            status: "ok",
            correct: true,
            solve: {
              puzzleId: checkData.pid,
              startTime: checkData.start_time,
              endTime: checkData.end_time,
              time: checkData.solve,
            },
            saved: true,
          });
          return;
        }

        const solution: Solution = numcross.solution;

        // Test that the attempt is correct
        let correct = true;
        const shape = solution.shape;
        for (let rx = 0; rx < shape[0]; rx++) {
          for (let cx = 0; cx < shape[1]; cx++) {
            const answer = solution.answers[rx][cx];
            if (answer === "blank") continue;
            const guess = attempt.scratch[cellKey(rx, cx)];
            if (guess !== answer) {
              correct = false;
              break;
            }
          }
        }

        if (!correct) {
          // If the attempt is incorrect, send correct = false, return
          res.send({
            status: "ok",
            solve: null,
            correct,
            saved: false,
          });
          return;
        }

        // The attempt is correct
        // We need to insert a row into the solves table
        const endDate = new Date();
        const { error: solveError } = await supabase
          .from("solves")
          .upsert({
            uid: userId,
            pid: attempt.puzzleId,
            start_time: attempt.startTime,
            end_time: endDate,
            time: attempt.time,
          })
          .select();

        res.send({
          status: "ok",
          correct,
          solve: {
            puzzleId: attempt.puzzleId,
            startTime: attempt.startTime,
            endTime: endDate.toISOString(),
            time: attempt.time,
          },
          saved: !solveError,
        });
      }
    );

    // The point of this endpoint is to handle the edge case where the user
    // completes the puzzle without having an account, makes an account, and
    // then would like to have this solve logged into their account stats
    server.post(
      "/api/log_solve",
      async (
        req: TypedRequestBody<LogSolveReq>,
        res: TypedResponse<LogSolveResp>
      ) => {
        console.log("POST /api/log_solve");

        const { solve, userId } = req.body;

        // First check if there's already a row in the solves table
        const { data: checkData } = await supabase
          .from("solves")
          .select()
          .eq("uid", userId)
          .eq("pid", solve.puzzleId)
          .single();

        if (checkData) {
          // If there is, we're done
          res.send({
            status: "ok",
          });
          return;
        }

        // If not, we need to insert a row into the solves table
        const { error: solveError } = await supabase
          .from("solves")
          .upsert({
            uid: userId,
            pid: solve.puzzleId,
            start_time: solve.startTime,
            end_time: solve.endTime,
            time: solve.time,
          })
          .select();

        if (solveError) {
          res.send({
            status: "error",
          });
          return;
        }

        res.send({
          status: "ok",
        });
      }
    );

    server.get(
      "/api/user_stats",
      async (
        req: TypedRequestQuery<UserStatsReq>,
        res: TypedResponse<UserStatsResp>
      ) => {
        console.log("GET /api/user_stats");

        const { uid } = req.query;
        // Get all their attempts
        const { data: attemptsData, error: attemptsError } = await supabase
          .from("attempts")
          .select("*")
          .eq("uid", uid)
          .order("start_time", { ascending: false });
        if (attemptsError) {
          res.status(500).send({
            status: "error",
            errorMessage: "Error: Can't get user stats",
          });
          return;
        }

        // Get all their solves
        const { data: solvesData, error: solvesError } = await supabase
          .from("solves")
          .select("*")
          .eq("uid", uid)
          .order("end_time", { ascending: false });
        if (solvesError) {
          res.status(500).send({
            status: "error",
            errorMessage: "Error: Can't get user stats",
          });
          return;
        }

        const numPlayed = attemptsData.length;
        const numSolved = solvesData.length;

        const solvedIds: number[] = solvesData.map((solve) => solve.pid);
        const { data: solvedPuzzles, error: solvedPuzzlesError } =
          await supabase.from("puzzles").select("*").in("id", solvedIds);

        // Relatively coarse way of dealing with an error from the supabase
        let currentStreak = -1;
        let maxStreak = -1;
        if (!solvedPuzzlesError) {
          const streaks = getStreaks(solvedPuzzles);
          currentStreak = streaks.currentStreak;
          maxStreak = streaks.maxStreak;
        }

        const averageSolveTime =
          solvesData.length > 0 ? getAverageSolveTime(solvesData) : undefined;

        res.send({
          status: "ok",
          numPlayed,
          numSolved,
          currentStreak,
          maxStreak,
          averageSolveTime,
        });
      }
    );

    server.get(
      "/api/username",
      async (
        req: TypedRequestQuery<UsernameReq>,
        res: TypedResponse<UsernameResp>
      ) => {
        console.log("GET /api/username");

        const { uid } = req.query;
        const { data, error } = await supabase
          .from("profiles")
          .select("username")
          .eq("uid", uid)
          .single();
        if (data?.username && !error) {
          res.send({
            status: "ok",
            username: data.username as string,
          });
          return;
        }
        res.send({
          status: "ok",
          username: null,
        });
      }
    );

    server.post(
      "/api/set_username",
      async (
        req: TypedRequestBody<SetUsernameReq>,
        res: TypedResponse<SetUsernameResp>
      ) => {
        const { uid, username } = req.body;
        const { error } = await supabase
          .from("profiles")
          .upsert({
            uid,
            username,
          })
          .select();
        if (error) {
          res.status(500).send({
            status: "error",
            errorMessage: error.message,
          });
          return;
        }
        res.send({ status: "ok" });
      }
    );

    server.get(
      "/api/leaderboard",
      async (
        req: TypedRequestQuery<LeaderboardReq>,
        res: TypedResponse<LeaderboardResp>
      ) => {
        console.log("GET /api/leaderboard");

        const data = await getMostRecentPuzzle();
        if (!data) {
          res.status(500).send({
            status: "error",
            errorMessage: "Error: Can't get puzzle",
          });
          return;
        }

        const { data: todaysSolves, error: solvesError } = await supabase
          .from("solves")
          .select("*")
          .eq("pid", data.id);
        if (solvesError) {
          res.status(500).send({
            status: "error",
            errorMessage: "Error: Can't get user stats",
          });
          return;
        }

        const solvesWithUsernames: any[] = [];

        await Promise.all(
          todaysSolves.map((solve) => {
            return new Promise<void>(async (resolve, reject) => {
              const { data: usernameData } = await supabase
                .from("profiles")
                .select("username")
                .eq("uid", solve.uid)
                .single();
              if (usernameData) {
                solvesWithUsernames.push({
                  ...solve,
                  username: usernameData.username,
                });
              }
              resolve();
            });
          })
        );

        // Sort by time ascending
        solvesWithUsernames.sort((a, b) => a.time - b.time);

        // Get the top 10
        const todays_top_10 = solvesWithUsernames.slice(0, 10);

        const today: LeaderboardEntry[] = todays_top_10.map((solve) => {
          return {
            username: solve.username,
            time: solve.time,
            streak: -1,
            numSolved: -1,
          };
        });
        const allTime: LeaderboardEntry[] = [];

        res.send({
          status: "ok",
          today,
          allTime,
        });
      }
    );

    server.post(
      "/api/make_friends",
      async (
        req: TypedRequestBody<MakeFriendsReq>,
        res: TypedResponse<MakeFriendsResp>
      ) => {
        console.log("POST /api/make_friends");

        const { userId, friendId } = req.body;
        const oneWay = await makeFriends(userId, friendId);
        const otherWay = await makeFriends(friendId, userId);
        if (!oneWay || !otherWay) {
          res.status(500).send({ status: "error" });
          return;
        }
        res.send({ status: "ok" });
      }
    );

    server.get(
      "/api/private_leaderboard",
      async (
        req: TypedRequestQuery<PrivateLeaderboardReq>,
        res: TypedResponse<PrivateLeaderboardResp>
      ) => {
        console.log("GET /api/private_leaderboard");

        const { userId } = req.query;
        const numcross = await getMostRecentPuzzle();
        let { data: friendData } = await supabase
          .from("private_leaderboards")
          .select("friendlist")
          .eq("uid", userId)
          .single();
        if (!friendData) {
          friendData = { friendlist: { friendIds: [] } };
        }
        const friendIds: string[] = friendData.friendlist.friendIds;
        friendIds.push(userId); // also get your own time
        const result: PrivateLeaderboardEntry[] = [];
        for (var fx = 0; fx < friendIds.length; fx += 1) {
          const { data: usernameData } = await supabase
            .from("profiles")
            .select("username")
            .eq("uid", friendIds[fx])
            .single();
          const { data: timeData } = await supabase
            .from("solves")
            .select("time")
            .eq("uid", friendIds[fx])
            .eq("pid", numcross.id)
            .single();
          if (!usernameData) return;
          result.push({
            friend: { username: usernameData.username, uid: friendIds[fx] },
            time: timeData?.time || null,
          });
        }
        result.sort((a, b) => (a.time || 9999999) - (b.time || 9999999));
        res.send({
          status: "ok",
          today: result,
        });
      }
    );

    server.get("*", (req, res) => {
      return handle(req, res);
    });

    server.listen(PORT, () => {
      console.log(`> Ready on http://localhost:${PORT}`);
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
