import React, { FunctionComponent, useCallback } from "react";
import { EditableText } from "./EditableText";

interface Props {
  text?: string;
  number?: number;
  across?: boolean;
  fontSize: number;
  editable: boolean;
  isAcross: boolean;
  isDown: boolean;
  addClue: (across: boolean) => void;
  updateText: (text: string) => void;
  removeSquare: () => void;
}

export const ClueText: FunctionComponent<Props> = ({
  text,
  number,
  across,
  isAcross,
  isDown,
  fontSize,
  editable,
  addClue,
  removeSquare,
  updateText,
}) => {
  const set =
    text !== undefined && number !== undefined && across !== undefined;

  const line = !set ? "Tap a square above to get started" : text;
  const num = set ? `${number} ${across ? "Across" : "Down"}` : "";

  return (
    <div className={"w-full bg-slate-200 my-10 mb-7 py-2 px-4 relative"}>
      <div className="text-left font-bold">{num}</div>
      <div className="md:invisible md:h-0">
        <EditableText
          inputProps={{
            className: "text-center bg-slate-200 w-full p-2",
            style: { fontSize },
          }}
          divProps={{
            className: "text-center p-2",
            style: { fontSize: 2 * fontSize, minHeight: 4 * fontSize },
          }}
          text={line}
          updateText={updateText}
          enabled={editable && set}
        />
      </div>
      <div className="invisible h-0 md:h-auto md:visible">
        <EditableText
          inputProps={{
            className: "text-center bg-slate-200 w-full p-2",
            style: { fontSize },
          }}
          divProps={{
            className: "text-center p-2",
            style: { fontSize, minHeight: 2 * fontSize },
          }}
          text={line}
          updateText={updateText}
          enabled={editable && set}
        />
      </div>
      {editable && (
        <div className="text-center">
          {!isAcross && (
            <button
              className="mt-3 py-3 px-10 mr-5 rounded-sm bg-slate-100"
              style={{ fontSize: fontSize * 0.7 }}
              onClick={() => {
                addClue(true);
              }}
            >
              Add Across
            </button>
          )}
          {!isDown && (
            <button
              className="mt-3 py-3 px-10 rounded-sm bg-slate-100"
              style={{ fontSize: fontSize * 0.7 }}
              onClick={() => {
                addClue(false);
              }}
            >
              Add Down
            </button>
          )}
          {
            <button
              className="mt-3 ml-3 py-3 px-10 rounded-sm bg-red-200"
              style={{ fontSize: fontSize * 0.7 }}
              onClick={removeSquare}
            >
              Clear Square
            </button>
          }
        </div>
      )}
    </div>
  );
};