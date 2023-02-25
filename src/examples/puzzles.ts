import { Puzzle } from "@/types/types";

export const EXAMPLE_PUZZLE: Puzzle[] = [
  {
    shape: [2, 2],
    clues: [
      [
        {
          type: "fillable",
          clueNumber: 1,
          acrossClue: "The answer is 36",
          downClue: "The answer is 36",
        },
        {
          type: "fillable",
          clueNumber: 2,
          downClue: "The answer is 64",
        },
      ],
      [
        {
          type: "fillable",
          clueNumber: 3,
          acrossClue: "The answer is 64",
        },
        {
          type: "fillable",
          clueNumber: null,
        },
      ],
    ],
  },
];
