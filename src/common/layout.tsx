import React, { useEffect } from "react";
import Header from "./header";
import Confetti from "react-confetti";
import useConfetti from "@/hooks/useConfetti";

interface Props {
  children?: JSX.Element | JSX.Element[];
}

export default function Layout({ children }: Props) {
  const { confetti } = useConfetti();
  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);

  useEffect(() => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  }, [confetti]);

  return (
    <div className="bg-slate-50 flex flex-col w-screen min-h-screen">
      <Confetti
        numberOfPieces={confetti}
        recycle={false}
        width={width}
        height={height}
        gravity={0.2}
        initialVelocityY={20}
      />
      <Header />
      <div className="flex flex-1 flex-col justify-center align-center p-8 max-w-[700px] w-screen self-center">
        {children}
      </div>
    </div>
  );
}
