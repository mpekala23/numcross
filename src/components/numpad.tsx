import React, { useCallback } from "react";
import { BackspaceIcon } from "@heroicons/react/24/outline";
import { useNumpad } from "@/hooks/useNumpad";
import { NumpadVal } from "@/types/types";

function NumberCell(
  num: number | string,
  handleClick: (str: NumpadVal) => void,
  className?: string
) {
  const actuallyHandleClick = () => {
    if (num === "x") {
      handleClick("");
      return;
    } else if (num === " ") {
      return;
    }
    handleClick(num.toString() as NumpadVal);
  };

  return (
    <div
      className={`flex-1 flex justify-center items-center h-16 hover:cursor-pointer ${className} border-2  select-none`}
      onClick={actuallyHandleClick}
    >
      {num !== "x" && <p className="text-2xl font-title px-4">{num}</p>}
      {num === "x" && (
        <div>
          <BackspaceIcon className="w-8 h-8 text-black" />
        </div>
      )}
    </div>
  );
}

export function Numpad() {
  const { setNumpadVal } = useNumpad();

  const handleNumberClick = useCallback(
    (numStr: NumpadVal) => {
      setNumpadVal(numStr);
    },
    [setNumpadVal]
  );

  return (
    <div className="w-full flex flex-col justify-evenly items-center">
      <div className="w-full flex">
        {NumberCell(1, handleNumberClick, "border-t-4 border-l-4")}
        {NumberCell(2, handleNumberClick, "border-t-4")}
        {NumberCell(3, handleNumberClick, "border-t-4 border-r-4")}
      </div>
      <div className="w-full flex">
        {NumberCell(4, handleNumberClick, "border-l-4")}
        {NumberCell(5, handleNumberClick)}
        {NumberCell(6, handleNumberClick, "border-r-4")}
      </div>
      <div className="w-full flex">
        {NumberCell(7, handleNumberClick, "border-l-4")}
        {NumberCell(8, handleNumberClick, "")}
        {NumberCell(9, handleNumberClick, "border-r-4")}
      </div>
      <div className="w-full flex">
        {NumberCell(
          " ",
          handleNumberClick,
          "border-b-4 border-l-4 hover:cursor-default"
        )}
        {NumberCell("x", handleNumberClick, "border-b-4")}
        {NumberCell(
          " ",
          handleNumberClick,
          "border-r-4 border-b-4 hover:cursor-default"
        )}
      </div>
    </div>
  );
}
