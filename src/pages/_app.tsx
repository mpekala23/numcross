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

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <NumpadContext.Provider value={{ numpadVal, setNumpadVal }}>
        <SettingsContext.Provider value={{ settings, setSettings }}>
          <ConfettiContext.Provider
            value={{ confetti, startConfetti: setConfetti }}
          >
            <Layout>
              <Component {...pageProps} />
            </Layout>
            <Toaster />
          </ConfettiContext.Provider>
        </SettingsContext.Provider>
      </NumpadContext.Provider>
    </SessionContextProvider>
  );
}
