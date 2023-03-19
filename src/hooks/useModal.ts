import { ReactElement, useCallback, useState } from "react";
import Modal from "@/common/modal";

export default function useModal(): [
  ({ children }: { children: ReactElement | ReactElement[] }) => JSX.Element,
  () => void,
  () => void
] {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const partialModal = useCallback(
    ({ children }: { children: ReactElement | ReactElement[] }) => {
      return Modal({ isOpen, setIsOpen, children });
    },
    [isOpen]
  );

  return [partialModal, openModal, closeModal];
}
