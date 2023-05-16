import classNames from "classnames";
import React, { FunctionComponent, useState, useCallback } from "react";

interface Props {
  enabled: boolean;
  text: string;
  updateText: (text: string) => void;
}

export const EditableText: FunctionComponent<Props> = ({
  enabled,
  text,
  updateText,
}) => {
  const [isInputting, setIsInputting] = useState(false);

  const onClick = useCallback(() => {
    if (enabled) {
      setIsInputting(true);
    }
  }, [enabled, setIsInputting]);

  const onBlur = useCallback(() => {
    setIsInputting(false);
  }, [setIsInputting]);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (enabled) {
        updateText(e.target.value);
      }
    },
    [enabled, updateText]
  );

  return isInputting ? (
    <input onChange={onChange} onBlur={onBlur} autoFocus value={text} />
  ) : (
    <div
      className={classNames(
        enabled ? "hover:cursor-pointer" : "",
        "w-full text-left overflow-auto"
      )}
      onClick={onClick}
    >
      {text}
    </div>
  );
};
