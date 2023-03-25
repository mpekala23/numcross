import React from "react";
import { FunctionComponent } from "react";
import { Corner } from "@/components/Corner";

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
    <div className="rounded-md pt-4 p-5 bg-slate-200 my-10 relative">
      <div className="text-left">{num}</div>
      <div className="text-center" style={{ fontSize }}>
        {"text a very long clue with this long string of text"}
      </div>
    </div>
  );
};
