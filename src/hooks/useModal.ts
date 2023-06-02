import { ReactElement, useCallback, useEffect, useState } from "react";
import Modal from "@/common/modal";

interface Props {
  onOpen?: () => void;
  onClose?: () => void;
}

export default function useModal(
  props?: Props
): [
  ({ children }: { children: ReactElement | ReactElement[] }) => JSX.Element,
  () => void,
  () => void
] {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);

  const openModal = useCallback(() => {
    setHasOpenedOnce(true);
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

  useEffect(() => {
    if (isOpen && props?.onOpen) props.onOpen();
    if (!isOpen && hasOpenedOnce && props?.onClose) props.onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, hasOpenedOnce]);

  return [partialModal, openModal, closeModal];
}
