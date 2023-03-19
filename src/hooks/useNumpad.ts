import { NumpadContext } from "@/context/NumpadContext";
import { useContext } from "react";

export function useNumpad() {
  const { numpadVal, setNumpadVal } = useContext(NumpadContext);
  return { numpadVal, setNumpadVal };
}
