import dotenv from "dotenv";
import express from "express";
import next from "next";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";
import { Attempt, Solution } from "../src/types/types";
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
  TodaysNumcrossReq,
  TodaysNumcrossResp,
  TypedRequestBody,
  TypedRequestQuery,
  TypedResponse,
  UserStatsReq,
  UserStatsResp,
} from "../src/types/api";

const env_path =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
console.log(env_path);
dotenv.config({ path: env_path });

const IS_DEV = process.env.NODE_ENV !== "production";
const app = next({ dev: IS_DEV });
const handle = app.getRequestHandler();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_KEY || ""
);

app
  .prepare()
  .then(() => {
    const server = express();

    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));

    server.get(
      "/api/todays_numcross",
      async (
        req: TypedRequestQuery<TodaysNumcrossReq>,
        res: TypedResponse<TodaysNumcrossResp>
      ) => {
        console.log("GET /api/todays_numcross");

        // Will get the current date in format yyyy-mm-dd and fetch
        // the most recent puzzle that was/is live on or before this date
        const todaysDatestring = getESTDatestring();
        const { data, error } = await supabase
          .from("puzzles")
          .select("*")
          .lte("live_date", todaysDatestring)
          .order("live_date", { ascending: false })
          .limit(1)
          .single();
        if (error) {
          res.status(500).send({
            status: "error",
            errorMessage: "Error: Can't get puzzle",
          });
        } else {
          // Try to load the users attempt from DB
          const { uid } = req.query;
          let attempt: Attempt | undefined = undefined;
          if (uid) {
            const { data: attemptData, error: attemptError } = await supabase
              .from("attempts")
              .select("*")
              .eq("uid", uid)
              .eq("pid", data.id)
              .single();
            if (attemptData && !attemptError) {
              attempt = {
                startTime: attemptData.start_time,
                puzzleId: attemptData.pid,
                hasCheated: attemptData.has_cheated,
                scratch: attemptData.jsonb,
              };
            }
          }
          const numcross = data;
          // Wipe solution information before handing response to client
          numcross.solution = undefined;
          res.send({
            status: "ok",
            numcross,
            attempt,
          });
        }
      }
    );

    server.post(
      "/api/add_puzzle",
      async (
        req: TypedRequestBody<AddPuzzleReq>,
        res: TypedResponse<AddPuzzleResp>
      ) => {
        console.log("POST /api/add_puzzle");
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
        // correct = true, return. It's the client's responsibility to store
        // the attempt in local storage.
        if (!userId) {
          res.send({
            status: "ok",
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
            saved: true,
          });
          return;
        }

        // If not, we need to insert a row into the solves table
        const { error: solveError } = await supabase
          .from("solves")
          .upsert({
            uid: userId,
            pid: attempt.puzzleId,
            start_time: attempt.startTime,
            end_time: new Date(),
            did_cheat: attempt.hasCheated,
          })
          .select();

        res.send({
          status: "ok",
          correct,
          saved: !solveError,
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

    server.get("*", (req, res) => {
      return handle(req, res);
    });

    server.listen(80, () => {
      console.log("> Ready on http://localhost:80");
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
