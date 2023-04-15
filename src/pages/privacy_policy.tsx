import React, { useEffect, useRef } from "react";
import getPrivacyPolicy from "@/privacy";

export default function PrivacyPolicyPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pageRef.current) return;
    pageRef.current.innerHTML = getPrivacyPolicy();
  }, []);

  return (
    <div className="overflow-scroll">
      <div ref={pageRef}></div>
    </div>
  );
}
