import React from "react";
import Link from "next/link";

interface Props {
  href: string;
  className?: string;
  children: string;
  onClick?: () => void;
  newTab?: boolean;
}

export default function Slink({
  href,
  className,
  children,
  onClick,
  newTab,
}: Props) {
  return (
    <Link
      onClick={onClick}
      className={`${className || ""} underline`}
      href={href}
      target={newTab ? "_blank" : undefined}
    >
      {children}
    </Link>
  );
}
