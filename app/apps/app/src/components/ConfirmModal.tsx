import { Modal, ModalActionType } from "@app/components/Modal";

interface ConfirmModalProps {
  title: string;
  text: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  onAction: () => void;
}

export default function ConfirmModal({ title, text, open, setOpen, onAction }: ConfirmModalProps) {
  return (
    <Modal
      title={title}
      text={text}
      actionType={ModalActionType.ABORT}
      actionBtn="Delete"
      cancelBtn="Cancel"
      show={open}
      onClose={setOpen}
      onAction={onAction}
    />
  );
}
