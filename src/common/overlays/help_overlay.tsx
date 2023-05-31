import React from "react";

interface Props {
  closeModal: () => void;
}

export default function HelpOverlay({ closeModal }: Props) {
  return (
    <div className="flex flex-col justify-center align-center">
      <p className="text-2xl font-bold font-title pb-4">How to Play</p>
      <p>
        Numcross is a daily puzzle designed for the mathematically inclined.
        Puzzles refresh at midnight ET each day and get increasingly difficult
        as the week goes on (Monday - Sunday). The idea is to fill in rows and
        columns from the clues, which range from facts about special numbers to
        quantitative trivia.
      </p>
      <p>Here are some rules:</p>
      <ul className="list-disc pl-4">
        <li>Numbers cannot start with a leading 0.</li>
        <li>
          Some clues build off each other. If you get stuck or a clue doesn't
          make sense, explore the rest of the puzzle.
        </li>
      </ul>
    </div>
  );
}
