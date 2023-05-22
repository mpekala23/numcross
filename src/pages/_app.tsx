import React from "react";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider, Session } from "@supabase/auth-helpers-react";
import { useState } from "react";
import Layout from "@/common/layout";
import { Toaster } from "react-hot-toast";
import { NumpadContext } from "@/context/NumpadContext";
import { SettingsContext } from "@/context/SettingsContext";
import { ConfettiContext } from "@/context/ConfettiContext";
import { NumpadVal, Settings } from "@/types/types";
import { DEFAULT_SETTINGS } from "@/utils";
import { usePathname } from "next/navigation";
import { HeaderContext } from "@/context/HeaderContext";

export default function App({
  Component,
  pageProps,
}: AppProps<{ initialSession: Session }>) {
  const [supabaseClient] = useState(() =>
    createBrowserSupabaseClient({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_KEY,
    })
  );

  const [numpadVal, setNumpadVal] = useState<NumpadVal>("nothing");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [confetti, setConfetti] = useState<number>(0);
  // TODO: Mark is being hacky and lazy. We should move this to redux at some point
  const [leaderboardTrigger, setLeaderboardTrigger] = useState<boolean>(false);
  const [statsTrigger, setStatsTrigger] = useState<boolean>(false);
  const currentPage = usePathname();

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <HeaderContext.Provider
        value={{
          leaderboardTrigger,
          refreshLeaderboards: () => setLeaderboardTrigger((trig) => !trig),
          statsTrigger,
          refreshStats: () => setStatsTrigger((trig) => !trig),
        }}
      >
        <NumpadContext.Provider value={{ numpadVal, setNumpadVal }}>
          <SettingsContext.Provider value={{ settings, setSettings }}>
            <ConfettiContext.Provider
              value={{ confetti, startConfetti: setConfetti }}
            >
              <Layout currentPage={currentPage || ""}>
                <Component {...pageProps} />
              </Layout>
              <Toaster />
            </ConfettiContext.Provider>
          </SettingsContext.Provider>
        </NumpadContext.Provider>
      </HeaderContext.Provider>
    </SessionContextProvider>
  );
}
