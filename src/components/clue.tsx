import React from "react";
import { FunctionComponent } from "react";

interface Props {
  text?: string;
  number?: number;
  across?: boolean;
}

export const Clue: FunctionComponent<Props> = ({ text, number, across }) => {
  const line =
    text === undefined || number === undefined || across === undefined
      ? "Tap a square above to get started"
      : `#${number} ${across ? "Across" : "Down"}: ${text}`;

  return (
    <div
      className="text-center p-5 text-lg"
      style={{ fontSize: 150 / line.length + "vw" }}
    >
      {line}
    </div>
  );
};
