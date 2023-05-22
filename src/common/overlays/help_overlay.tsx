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
          For the leaderboard and stats, your time starts as soon as the puzzle
          goes live and ends when you solve it. There is no pausing, and
          cheating will be detected and invalidate scores from appearing on the
          leaderboard.
        </li>
      </ul>
    </div>
  );
}
