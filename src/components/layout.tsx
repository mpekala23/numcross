import React from "react";

interface Props {
  children?: JSX.Element | JSX.Element[];
}

export default function Layout({ children }: Props) {
  return (
    <div className="bg-slate-100 flex flex-col w-screen h-screen p-8 justify-center align-center">
      {children}
    </div>
  );
}
