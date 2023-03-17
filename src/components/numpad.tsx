import React, { useCallback } from "react";
import { BackspaceIcon } from "@heroicons/react/24/outline";
import { useNumpad } from "@/hooks/useNumpad";

function NumberCell(
  num: number | string,
  handleClick: (str: string) => void,
  className?: string
) {
  const actuallyHandleClick = () => {
    if (num === "x") {
      handleClick("");
      return;
    } else if (num === " ") {
      return;
    }
    handleClick(num.toString());
  };

  return (
    <div
      className={`flex-1 flex justify-center items-center h-16 ${className} border-2`}
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
    (numStr: string) => {
      setNumpadVal(numStr);
    },
    [setNumpadVal]
  );

  return (
    <div className="w-full flex flex-col justify-evenly items-center">
      <div className="w-full flex">
        {NumberCell(1, handleNumberClick, "border-t-4 borderl-4 border-r-4")}
        {NumberCell(2, handleNumberClick, "border-t-4")}
        {NumberCell(3, handleNumberClick, "border-t-4 border-r-4")}
      </div>
      <div className="w-full flex">
        {NumberCell(4, handleNumberClick, "border-l-4")}
        {NumberCell(5, handleNumberClick)}
        {NumberCell(6, handleNumberClick, "border-r-4")}
      </div>
      <div className="w-full flex">
        {NumberCell(" ", handleNumberClick, "border-l-4 border-b-4")}
        {NumberCell(9, handleNumberClick, "border-b-4")}
        {NumberCell("x", handleNumberClick, "border-r-4 border-b-4")}
      </div>
    </div>
  );
}
