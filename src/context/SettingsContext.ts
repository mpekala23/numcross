import { Settings } from "@/types/types";
import { DEFAULT_SETTINGS } from "@/utils";
import { createContext } from "react";

interface Props {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

export const SettingsContext = createContext<Props>({
  settings: DEFAULT_SETTINGS,
  setSettings: () => {},
});
