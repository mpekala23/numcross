import React from "react";
import Link from "next/link";

interface Props {
  href: string;
  className?: string;
  children: string;
  onClick?: () => void;
}

export default function Slink({ href, className, children, onClick }: Props) {
  return (
    <Link
      onClick={onClick}
      className={`${className || ""} underline`}
      href={href}
    >
      {children}
    </Link>
  );
}
