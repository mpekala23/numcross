export default function useDev(): {
  isDev: boolean;
  baseUrl: string;
} {
  return {
    isDev: process.env.NEXT_PUBLIC_ENV === "development",
    baseUrl:
      process.env.NEXT_PUBLIC_ENV === "development"
        ? "http://localhost:3000"
        : "https://numcross.com",
  };
}
