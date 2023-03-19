import { createContext } from "react";

interface Props {
  confetti: number;
  startConfetti: (numPieces: number) => void;
}

export const ConfettiContext = createContext<Props>({
  confetti: 0,
  startConfetti: () => {},
});
