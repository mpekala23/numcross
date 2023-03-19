import React from "react";

interface Props {
  closeModal: () => void;
}

export default function HelpOverlay({ closeModal }: Props) {
  return (
    <div className="flex flex-col justify-center align-center">
      <p className="text-2xl font-bold font-title pb-4">How to Play</p>
      <p>Coming soon.</p>
    </div>
  );
}
