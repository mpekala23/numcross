import React, { FunctionComponent } from "react";
import { EditableText } from "./EditableText";

interface Props {
  text?: string;
  number?: number;
  across?: boolean;
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
    <div
      className={
        "flex flex-col w-full h-full bg-slate-200 my-4 py-2 px-4 relative"
      }
    >
      <div className="text-left font-bold">{num}</div>
      <EditableText
        text={line}
        updateText={updateText}
        enabled={editable && set}
      />
      {editable && (
        <div className="text-center">
          {!isAcross && (
            <button
              className="mt-3 py-3 px-10 mr-5 rounded-sm bg-slate-100"
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
