import { useRouter } from "next/router";
import React, { useEffect } from "react";

export default function CatchUser() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);

  return <div></div>;
}
