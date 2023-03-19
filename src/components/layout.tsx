import React from "react";
import Header from "./header";

interface Props {
  children?: JSX.Element | JSX.Element[];
}

export default function Layout({ children }: Props) {
  return (
    <div className="bg-slate-50 flex flex-col w-screen min-h-screen">
      <Header />
      <div className="flex flex-1 flex-col justify-center align-center p-4">
        {children}
      </div>
    </div>
  );
}
