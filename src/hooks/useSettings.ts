import { Settings } from "@/types/types";
import { useCallback, useContext, useEffect } from "react";
import useStorage from "./useStorage";
import { SettingsContext } from "@/context/SettingsContext";

export default function useSettings() {
  const { settings: contextSettings, setSettings: setContextSettings } =
    useContext(SettingsContext);
  const { mineSettings, storeSettings } = useStorage();

  useEffect(() => {
    const minedSettings = mineSettings();
    setContextSettings(minedSettings);
  }, [mineSettings, setContextSettings]);

  const setSettings: (settings: Settings) => void = useCallback(
    (settings) => {
      setContextSettings(settings);
      storeSettings(settings);
    },
    [setContextSettings, storeSettings]
  );

  return { settings: contextSettings, setSettings };
}
