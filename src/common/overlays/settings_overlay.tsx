import React, { useCallback } from "react";
import useSettings from "@/hooks/useSettings";
import { RadioGroup } from "@headlessui/react";
import { Settings, FillMode, DeleteMode } from "@/types/types";
import useDev from "@/hooks/useDev";

interface Props {
  closeModal: () => void;
}

interface OptionProps<T extends string> {
  value: T;
  title: string;
  description: string;
}
function renderOption<T extends string>({
  value,
  title,
  description,
}: OptionProps<T>) {
  return (
    <RadioGroup.Option
      value={value}
      className={({ active, checked }) =>
        `${
          active
            ? "ring-2 ring-white ring-opacity-60 ring-offset-2 ring-offset-slate-300"
            : ""
        }
        ${checked ? "bg-slate-900 bg-opacity-75 text-white" : "bg-white"}
        relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-none my-2`
      }
    >
      {({ checked }) => (
        <>
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center">
              <div className="text-sm">
                <RadioGroup.Label
                  as="p"
                  className={`font-medium  ${
                    checked ? "text-white" : "text-slate-900"
                  }`}
                >
                  {title}
                </RadioGroup.Label>
                <RadioGroup.Description
                  as="span"
                  className={`inline ${
                    checked ? "text-slate-100" : "text-slate-500"
                  }`}
                >
                  <span>{description}</span>
                </RadioGroup.Description>
              </div>
            </div>
          </div>
        </>
      )}
    </RadioGroup.Option>
  );
}

export default function SettingsOverlay({ closeModal }: Props) {
  const { settings, setSettings } = useSettings();
  const { version } = useDev();

  const updateFillMode = useCallback(
    (value: FillMode) => {
      const newSettings: Settings = { ...settings, fillMode: value };
      setSettings(newSettings);
    },
    [settings, setSettings]
  );

  const updateDeleteMode = useCallback(
    (value: DeleteMode) => {
      const newSettings: Settings = { ...settings, deleteMode: value };
      setSettings(newSettings);
    },
    [settings, setSettings]
  );

  return (
    <div className="flex flex-col justify-center align-center">
      <p className="text-2xl font-bold font-title">Settings</p>
      <p className="text-sm pb-4 text-gray-700">Version {version}</p>
      <RadioGroup value={settings.fillMode} onChange={updateFillMode}>
        <RadioGroup.Label className="mb-8 text-xl">Fill Mode</RadioGroup.Label>
        {renderOption<FillMode>({
          value: "next",
          title: "Next",
          description: "After filling a cell, move on to the next cell",
        })}
        {renderOption<FillMode>({
          value: "nextEmpty",
          title: "Next Empty",
          description: "After filling a cell, move on to the next empty cell",
        })}
        {renderOption<FillMode>({
          value: "stay",
          title: "Stay",
          description: "Don't move after filling a cell",
        })}
      </RadioGroup>

      <RadioGroup
        value={settings.deleteMode}
        onChange={updateDeleteMode}
        className="mt-4"
      >
        <RadioGroup.Label className="mb-8 text-xl">
          Delete Mode
        </RadioGroup.Label>
        {renderOption<DeleteMode>({
          value: "previous",
          title: "Previous",
          description: "After deleting a cell, go to the previous cell",
        })}
        {renderOption<FillMode>({
          value: "stay",
          title: "Stay",
          description: "Don't move after deleting a cell",
        })}
      </RadioGroup>
    </div>
  );
}
