import React, { useEffect, useRef } from "react";
import getTermsOfService from "@/tos";

export default function TermsOfServicePage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pageRef.current) return;
    pageRef.current.innerHTML = getTermsOfService();
  }, []);

  return (
    <div className="overflow-scroll">
      <div ref={pageRef}></div>
    </div>
  );
}
