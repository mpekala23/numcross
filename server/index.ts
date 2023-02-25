import express from "express";
import next from "next";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";
import { Attempt } from "@/types/types";
import { cellKey } from "./utils";

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
        res.status(500).send("Error");
      } else {
        res.send("OK");
      }
    });

    server.post("/api/check_attempt", async (req, res) => {
      const attempt: Attempt = req.body;
      const { data, error } = await supabase
        .from("puzzles")
        .select()
        .eq("id", attempt.puzzleId)
        .single();
      if (error) {
        res.status(500).send("Error: Can't load puzzle");
        return;
      }

      let correct = true;
      const shape = data.solution.shape;
      for (let rx = 0; rx < shape[0]; rx++) {
        for (let cx = 0; cx < shape[1]; cx++) {
          const answer = data.solution.answers[rx][cx];
          if (answer === "blank") continue;
          const guess = attempt.scratch[cellKey(rx, cx)];
          if (guess !== answer) {
            correct = false;
            break;
          }
        }
      }

      res.send({
        correct,
      });
    });

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
