import dotenv from "dotenv";
import express from "express";
import next from "next";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";
import { Attempt, Solution, Solve } from "../src/types/types";
import {
  cellKey,
  getAverageSolveTime,
  getESTDatestring,
  getStreaks,
} from "./utils";
import {
  AddPuzzleReq,
  AddPuzzleResp,
  CheckAttemptReq,
  CheckAttemptResp,
  LeaderboardReq,
  LeaderboardResp,
  LogSolveReq,
  LogSolveResp,
  SetUsernameReq,
  SetUsernameResp,
  TodaysNumcrossReq,
  TodaysNumcrossResp,
  TodaysProgressReq,
  TodaysProgressResp,
  TypedRequestBody,
  TypedRequestQuery,
  TypedResponse,
  UpdateAttemptReq,
  UpdateAttemptResp,
  UserStatsReq,
  UserStatsResp,
  UsernameReq,
  UsernameResp,
} from "../src/types/api";
import { LeaderboardEntry } from "../src/types/stats";

const env_path =
  process.env.NODE_ENV === "production" || true // force production
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
        data.solution = undefined;
        res.send({
          status: "ok",
          numcross: data,
        });
      }
    );

    server.get(
      "/api/todays_progress",
      async (
        req: TypedRequestQuery<TodaysProgressReq>,
        resp: TypedResponse<TodaysProgressResp>
      ) => {
        console.log("GET /api/todays_progress");

        const { uid, pid } = req.query;
        let attempt: Attempt | undefined = undefined;
        let solve: Solve | undefined = undefined;
        const { data: attemptData, error: attemptError } = await supabase
          .from("attempts")
          .select("*")
          .eq("uid", uid)
          .eq("pid", pid)
          .single();
        if (attemptData && !attemptError) {
          attempt = {
            startTime: attemptData.start_time,
            puzzleId: attemptData.pid,
            hasCheated: attemptData.has_cheated,
            scratch: attemptData.jsonb,
          };
        }
        const { data: solveData, error: solveError } = await supabase
          .from("solves")
          .select("*")
          .eq("uid", uid)
          .eq("pid", pid)
          .single();
        if (solveData && !solveError) {
          solve = solveData;
        }
        resp.send({
          status: "ok",
          attempt,
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
            solution: req.body.solution,
            difficulty: req.body.difficulty,
            theme: req.body.theme,
          })
          .select();
        if (error) {
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
      "/api/update_attempt",
      async (
        req: TypedRequestBody<UpdateAttemptReq>,
        res: TypedResponse<UpdateAttemptResp>
      ) => {
        console.log("POST /api/update_attempt");
        const { attempt, userId } = req.body;
        const { error } = await supabase
          .from("attempts")
          .upsert({
            uid: userId,
            pid: attempt.puzzleId,
            start_time: attempt.startTime,
            has_cheated: attempt.hasCheated,
            jsonb: attempt.scratch,
          })
          .select();
        if (error) {
          res.status(500).send({
            status: "error",
            errorMessage: "Error: Can't update attempt",
          });
        } else {
          res.send({
            status: "ok",
          });
        }
      }
    );

    server.post(
      "/api/check_attempt",
      async (
        req: TypedRequestBody<CheckAttemptReq>,
        res: TypedResponse<CheckAttemptResp>
      ) => {
        // Get the relevant puzzle
        const { attempt, userId } = req.body;
        const { data, error } = await supabase
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

        const solution: Solution = data.solution;

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
            correct,
          });
          return;
        }

        // If there is no user associated with this attempt, simply send
        // correct = true and the time, return. It's the client's responsibility to store
        // the attempt in local storage.
        if (!userId) {
          res.send({
            status: "ok",
            solve: {
              puzzleId: attempt.puzzleId,
              startTime: attempt.startTime,
              endTime: new Date().toISOString(),
              didCheat: attempt.hasCheated,
            },
            correct,
          });
          return;
        }

        // This correct attempt is associated with an already existing
        // user

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
            correct,
            solve: {
              puzzleId: checkData.pid,
              startTime: checkData.start_time,
              endTime: checkData.end_time,
              didCheat: checkData.did_cheat,
            },
            saved: true,
          });
          return;
        }

        const endDate = new Date();

        // If not, we need to insert a row into the solves table
        const { error: solveError } = await supabase
          .from("solves")
          .upsert({
            uid: userId,
            pid: attempt.puzzleId,
            start_time: attempt.startTime,
            end_time: endDate,
            did_cheat: attempt.hasCheated,
          })
          .select();

        res.send({
          status: "ok",
          correct,
          solve: {
            puzzleId: attempt.puzzleId,
            startTime: attempt.startTime,
            endTime: endDate.toISOString(),
            didCheat: attempt.hasCheated,
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
            did_cheat: solve.didCheat,
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

        const { data: solvesData, error: solvesError } = await supabase
          .from("solves")
          .select("*")
          .eq("pid", data.id)
          .eq("did_cheat", false);
        if (solvesError) {
          res.status(500).send({
            status: "error",
            errorMessage: "Error: Can't get user stats",
          });
          return;
        }

        const todaysSolves: any[] = [];

        solvesData.forEach((solve) => {
          const extendedSolve = {
            ...solve,
            time:
              (new Date(solve.end_time).getTime() -
                new Date(solve.start_time).getTime()) /
              1000,
          };

          if (solve.pid === data.id) {
            todaysSolves.push(extendedSolve);
          }
        });

        // Sort by time ascending
        todaysSolves.sort((a, b) => a.time - b.time);

        // Get the top 10
        const todays_top_10 = todaysSolves.slice(0, 10);
        const top_ten_uids: string[] = [];

        todays_top_10.forEach((solve) => {
          if (!top_ten_uids.includes(solve.uid)) {
            top_ten_uids.push(solve.uid);
          }
        });

        const map_uid_to_username: { [key: string]: string } = {};
        for (let i = 0; i < top_ten_uids.length; i++) {
          const uid = top_ten_uids[i];
          const { data: profile, error: userError } = await supabase
            .from("profiles")
            .select("username")
            .eq("uid", uid)
            .single();
          if (userError) {
            map_uid_to_username[uid] = "<no username>";
          } else {
            map_uid_to_username[uid] = profile.username || "<no username>";
          }
        }

        const today: LeaderboardEntry[] = todays_top_10.map((solve) => {
          return {
            username: map_uid_to_username[solve.uid],
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
