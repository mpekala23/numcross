import classNames from "classnames";
import React, { FunctionComponent, useState, useCallback } from "react";

interface Props {
  enabled: boolean;
  divProps?: any;
  inputProps?: any;
  text: string;
  updateText: (text: string) => void;
}

export const EditableText: FunctionComponent<Props> = ({
  enabled,
  divProps,
  inputProps,
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
      if (enabled) {
        updateText(e.target.value);
      }
    },
    [enabled, updateText]
  );

  return isInputting ? (
    <input
      {...inputProps}
      onChange={onChange}
      onBlur={onBlur}
      autoFocus
      value={text}
    />
  ) : (
    <div
      {...divProps}
      className={classNames(
        enabled ? "hover:cursor-pointer" : "",
        inputProps.className ?? ""
      )}
      onClick={onClick}
    >
      {text}
    </div>
  );
};
