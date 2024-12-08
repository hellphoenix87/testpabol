import { classNames } from "@frontend/utils/classNames";

interface TagProps {
  className?: string;
  text: string;
}

export function Tag({ className, text }: TagProps) {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium mr-2 shadow cursor-default",
        className
      )}
    >
      {text}
    </span>
  );
}
