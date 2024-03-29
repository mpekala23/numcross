import React from "react";
import { FunctionComponent } from "react";

interface Props {
  text?: string;
  number?: number;
  across?: boolean;
  fontSize: number;
}

export const Clue: FunctionComponent<Props> = ({
  text,
  number,
  across,
  fontSize,
}) => {
  const set =
    text !== undefined && number !== undefined && across !== undefined;

  const line = !set ? "Tap a square above to get started" : text;
  const num = set ? `${number} ${across ? "Across" : "Down"}` : "";

  return (
    <div className="w-full pt-4 p-2 bg-slate-200 my-10 relative">
      <div className="text-left font-bold text-sm">{num}</div>
      <div className="text-left" style={{ fontSize }}>
        {line}
      </div>
    </div>
  );
};
