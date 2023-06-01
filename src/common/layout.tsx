import React, { useEffect } from "react";
import Header from "./header";
import Confetti from "react-confetti";
import { useAppSelector } from "@/redux/hooks";

interface Props {
  children?: JSX.Element | JSX.Element[];
  currentPage: string;
}

export default function Layout({ children, currentPage }: Props) {
  const confetti = useAppSelector((state) => state.progress.confetti);
  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);

  useEffect(() => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  }, [confetti]);

  return (
    <div className="bg-slate-50 flex flex-col w-screen h-screen">
      <Confetti
        numberOfPieces={confetti}
        recycle={false}
        width={width}
        height={height}
        gravity={0.2}
        initialVelocityY={20}
      />
      <Header />

      <div
        className={`flex flex-1 ${
          currentPage !== "/upload" ? "overflow-hidden" : "overflow-auto"
        } flex-col justify-center align-center p-8 max-w-[550px] w-screen self-center`}
      >
        {children}
      </div>
    </div>
  );
}
