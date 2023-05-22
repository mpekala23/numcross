import { Settings } from "@/types/types";
import { useCallback, useContext, useEffect } from "react";
import { SettingsContext } from "@/context/SettingsContext";
import { mineSettings, storeSettings } from "@/api/storage";

export default function useSettings() {
  const { settings: contextSettings, setSettings: setContextSettings } =
    useContext(SettingsContext);

  useEffect(() => {
    const minedSettings = mineSettings();
    setContextSettings(minedSettings);
  }, [setContextSettings]);

  const setSettings: (settings: Settings) => void = useCallback(
    (settings) => {
      setContextSettings(settings);
      storeSettings(settings);
    },
    [setContextSettings]
  );

  return { settings: contextSettings, setSettings };
}
