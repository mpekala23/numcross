import express from "express";
import next from "next";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";
import { Attempt, Solution } from "@/types/types";
import { cellKey } from "./utils";
import { CheckAttemptReq } from "@/types/api";

const IS_DEV = process.env.NODE_ENV !== "production";
const app = next({ dev: IS_DEV });
const handle = app.getRequestHandler();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321",
  process.env.NEXT_PUBLIC_SUPABASE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
);

app
  .prepare()
  .then(() => {
    const server = express();

    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));

    server.get("/api/todays_numcross", async (_, res) => {
      console.log("GET /api/todays_numcross");
      const { data, error } = await supabase
        .from("puzzles")
        .select("*")
        .order("live_date", { ascending: false })
        .single();
      if (error) {
        res.status(500).send({
          status: "error",
          errorMessage: "Error: Can't get puzzle",
        });
      } else {
        res.send({
          status: "ok",
          numcross: data,
        });
      }
    });

    server.post("/api/add_puzzle", async (req, res) => {
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
          errorMessage: "Error: Can't add puzzle",
        });
      } else {
        res.send({
          status: "ok",
        });
      }
    });

    server.post(
      "/api/check_attempt",
      async (req: { body: CheckAttemptReq }, res) => {
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
        // user, create a row in the solves table
        // Attempt is correct, create a row in the solves table
        res.send({
          correct,
        });
      }
    );

    server.get("*", (req, res) => {
      return handle(req, res);
    });

    server.listen(3000, () => {
      console.log("> Ready on http://localhost:3000");
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
