import { Attempt } from "@/types/types";

export default function useStorage() {
  const storeAttempt = (attempt: Attempt) => {
    localStorage.setItem("attempt", JSON.stringify(attempt));
  };
  const mineAttempt: () => Attempt | null = () => {
    const attempt = localStorage.getItem("attempt");
    if (attempt) {
      return JSON.parse(attempt);
    }
    return null;
  };

  return {
    storeAttempt,
    mineAttempt,
  };
}
