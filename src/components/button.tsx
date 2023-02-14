import { useState } from "react";

interface Props {
  onPress: (() => void) | (() => Promise<void>);
  blocking?: boolean;
  children: string;
  className?: string;
}

export default function Button({
  children,
  className,
  onPress,
  blocking,
}: Props) {
  const [isSpinning, setIsSpinning] = useState(false);

  const handlePress = async () => {
    if (blocking) {
      setIsSpinning(true);
      try {
        await onPress();
      } catch (e) {
      } finally {
        setIsSpinning(false);
      }
    } else {
      onPress();
    }
  };

  return (
    <div
      className={`${className || ""} ${
        isSpinning ? "animate-spin" : ""
      } text-xl p-2 border text-center`}
      onClick={handlePress}
    >
      {children}
    </div>
  );
}
