import { Modal, ModalActionType } from "@app/components/Modal";

interface AlertModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onAction: () => void;
}

export default function AlertModal({ open, setOpen, onAction }: AlertModalProps) {
  return (
    <Modal
      title="Edit previous step"
      text="You already completed this step and the next step depends on it. If you unlock this step to
      edit it, the results of the next step will be lost."
      actionType={ModalActionType.ABORT}
      actionBtn="Unlock"
      cancelBtn="Cancel"
      show={open}
      onClose={setOpen}
      onAction={onAction}
    />
  );
}
