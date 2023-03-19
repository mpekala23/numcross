import useConfetti from "@/hooks/useConfetti";
import React, { useEffect } from "react";

interface Props {
  closeModal: () => void;
}

export default function SolvedOverlay({ closeModal }: Props) {
  const { startConfetti } = useConfetti();

  useEffect(() => {
    startConfetti();
  }, [startConfetti]);

  return (
    <div className="flex flex-col justify-center align-center">
      <p className="text-2xl font-bold font-title pb-4">Congrats!</p>
      <p>You solved the puzzle</p>
    </div>
  );
}
