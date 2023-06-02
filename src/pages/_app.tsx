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
import { NumpadVal, Settings } from "@/types/types";
import { DEFAULT_SETTINGS } from "@/utils";
import { usePathname } from "next/navigation";
import { Provider } from "react-redux";
import store from "@/redux/store";

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
  const currentPage = usePathname();

  return (
    <Provider store={store}>
      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
      >
        <NumpadContext.Provider value={{ numpadVal, setNumpadVal }}>
          <SettingsContext.Provider value={{ settings, setSettings }}>
            <Layout currentPage={currentPage || ""}>
              <Component {...pageProps} />
            </Layout>
            <Toaster />
          </SettingsContext.Provider>
        </NumpadContext.Provider>
      </SessionContextProvider>
    </Provider>
  );
}
