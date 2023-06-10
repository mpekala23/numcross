import Image from "next/image";
import React from "react";

interface Props {
  className?: string;
}

const SCALE = 1.25;

export default function Loading({ className }: Props) {
  return (
    <div className={className}>
      <Image
        className="antialiased"
        src={"/loading.gif"}
        width={96 * SCALE}
        height={96 * SCALE}
        alt="Loading gif"
      />
    </div>
  );
}
