import { ConfettiContext } from "@/context/ConfettiContext";
import { useContext, useCallback } from "react";

export default function useConfetti() {
  const { confetti, startConfetti: startConfettiContext } =
    useContext(ConfettiContext);

  const startConfetti = useCallback(
    (numPieces?: number) => {
      startConfettiContext(numPieces || 500);
    },
    [startConfettiContext]
  );

  return { confetti, startConfetti };
}
