import { NumpadVal } from "@/types/types";
import React, { createContext } from "react";

interface Props {
  numpadVal: NumpadVal;
  setNumpadVal: React.Dispatch<React.SetStateAction<NumpadVal>> | (() => void);
}

export const NumpadContext = createContext<Props>({
  numpadVal: "nothing",
  setNumpadVal: () => {},
});
