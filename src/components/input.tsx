import React from "react";
import { useState } from "react";

interface Props {
  onChange: (val: string) => void;
  className?: string;
}

export default function Input({ onChange, className }: Props) {
  const [value, setValue] = useState("");

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className={`${
        className || ""
      } w-full my-2 p-2 text-xl border border-slate-900`}
    />
  );
}
