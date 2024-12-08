import { classNames } from "./utils/classNames";

interface TagProps {
  className?: string;
  text: string;
  selected?: boolean;
  clickable?: boolean;
}

export function Tag({ className, text, selected, clickable }: TagProps) {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium drop-shadow whitespace-nowrap",
        selected
          ? "text-gray-600 bg-gradient-to-b from-gray-300 to-gray-100"
          : "text-gray-800 bg-gradient-to-b from-gray-50 to-gray-200",
        !selected && clickable ? "hover:from-gray-100 hover:to-gray-300" : "",
        clickable ? "cursor-pointer" : "cursor-default",
        className
      )}
    >
      {text}
    </span>
  );
}
