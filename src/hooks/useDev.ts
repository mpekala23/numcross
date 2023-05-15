export default function useDev(): {
  isDev: boolean;
} {
  return {
    isDev: process.env.NEXT_PUBLIC_ENV === "development",
  };
}
