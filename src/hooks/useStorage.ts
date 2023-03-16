import { Attempt } from "@/types/types";
import { useCallback } from "react";

export default function useStorage() {
  const storeAttempt = useCallback((attempt: Attempt) => {
    localStorage.setItem("attempt", JSON.stringify(attempt));
  }, []);

  const mineAttempt: () => Attempt | null = useCallback(() => {
    const attempt = localStorage.getItem("attempt");
    if (attempt) {
      return JSON.parse(attempt);
    }
    return null;
  }, []);

  return {
    storeAttempt,
    mineAttempt,
  };
}
