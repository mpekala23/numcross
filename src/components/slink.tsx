import React from "react";
import Link from "next/link";

interface Props {
  href: string;
  className?: string;
  children: string;
}

export default function Slink({ href, className, children }: Props) {
  return (
    <Link className={`${className || ""} underline`} href={href}>
      {children}
    </Link>
  );
}
