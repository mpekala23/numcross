import React from "react";
import Slink from "./slink";
import { Numcross } from "@/types/types";

interface Props {
  isLoggedIn: boolean;
  numcross: Numcross | null;
  closeStart: () => void;
}

export default function StartOverlay({
  isLoggedIn,
  numcross,
  closeStart,
}: Props) {
  if (isLoggedIn && !!numcross) {
    const date = new Date(numcross.liveDate);
    date.setDate(parseInt(numcross.liveDate.split("-")[2]));
    return (
      <div className="flex flex-col justify-center align-center">
        <p className="text-center text-2xl font-bold font-title pb-1">
          Puzzle #{numcross.id}
        </p>
        <p className="text-center text-xl  font-title pb-1">
          {date.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
        <p className="text-gray-500 text-center font-title text-sm pb-2">
          By {numcross.author}
        </p>
        <p className="text-center text-lg">
          Ready to start?{" "}
          <Slink href="" onClick={closeStart}>
            Click here
          </Slink>{" "}
          or close this window.
        </p>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col justify-center align-center">
        <p className="text-2xl font-bold font-title pb-4">
          Welcome to NumCross!
        </p>
        <p>
          NumCross is a daily puzzle for the mathematically inclined. Puzzles
          refresh at midnight and generally get harder as the week goes on
          (Monday - Sunday).
        </p>
        <p className="py-2">Here are some tips to get started:</p>
        <ul className="list-disc pl-4">
          <li>Numbers cannot start with a leading 0.</li>
          <li>Clues sometimes depend on each other.</li>
          <li>
            If you get stuck on a clue, don't hesitate to move on and come back
            to it.
          </li>
        </ul>
        <p className="pt-2">
          Something off? Contact{" "}
          <Slink href="mailto:mpek66@gmail.com">the developers</Slink>.
        </p>
        <p className="pt-2">
          Tired of seeing this? <Slink href="signup">Create an account.</Slink>
        </p>
      </div>
    );
  }
}
