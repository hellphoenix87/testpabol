import { TrashIcon } from "@heroicons/react/24/solid";
import { classNames } from "@frontend/utils/classNames";
import { ParagraphControlBtn } from "./ParagraphControlBtn";

const btnList = ["remove"];

const mapBtnToIcon = {
  remove: TrashIcon,
};

interface ParagraphControlsProps {
  className?: string;
  disabled?: boolean;
  onRemove?: () => void;
}

export function ParagraphControls({ className, disabled, onRemove }: ParagraphControlsProps) {
  const mapBtnToAction = {
    remove: onRemove,
  };

  return (
    <div
      className={classNames(
        "absolute top-0 right-full flex flex-col items-center p-2 rounded-l-md bg-gray-200 overflow-hidden transition-all hover:shadow-sm",
        className
      )}
    >
      {btnList.map((btn, i) => (
        <ParagraphControlBtn
          key={i}
          className={classNames(i < btnList.length - 1 && "mb-2")}
          name={btn}
          disabled={disabled}
          Icon={mapBtnToIcon[btn]}
          onClick={mapBtnToAction[btn]}
          tip="Delete"
        />
      ))}
    </div>
  );
}
