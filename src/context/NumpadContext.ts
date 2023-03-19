import React, { createContext } from "react";

interface Props {
  numpadVal:
    | "0"
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | ""
    | "nothing";
  setNumpadVal: React.Dispatch<React.SetStateAction<string>> | (() => void);
}

export const NumpadContext = createContext<Props>({
  numpadVal: "nothing",
  setNumpadVal: () => {},
});
