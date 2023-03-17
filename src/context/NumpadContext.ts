import React, { createContext } from "react";

interface Props {
  numpadVal: string;
  setNumpadVal: React.Dispatch<React.SetStateAction<string>> | (() => void);
}

export const NumpadContext = createContext<Props>({
  numpadVal: "",
  setNumpadVal: () => {},
});
