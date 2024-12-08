import { useEffect, useRef, useState } from "react";

import { classNames } from "@frontend/utils/classNames";
import { AutoHeightTextarea } from "@app/components/AutoHeightTextarea";
import { ParagraphControls } from "./ParagraphControls";
import StringFieldsLength from "@app/constants/StringFiledsLength";

type ParagraphInputKeyEvt = React.KeyboardEvent<HTMLTextAreaElement>;

interface ParagraphInputProps {
  innerRef?: (e: HTMLTextAreaElement | null) => void;
  className?: string;
  id?: string;
  value: string | null;
  disableInput?: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  onKeyDown: (e: ParagraphInputKeyEvt) => void;
  onDelete?: () => void;
}

export function ParagraphInput({
  innerRef,
  id,
  className,
  value,
  disableInput,
  onChange,
  onBlur,
  onKeyDown,
  onDelete,
}: ParagraphInputProps) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.selectionStart = inputRef.current.selectionEnd = inputRef.current.value.length;
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className={classNames("relative", className)} data-testid="paragraph-item">
      <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        {!disableInput && (
          <ParagraphControls
            className={classNames("transition-all duration-500 ease-in-out", !isHovered && "translate-x-full")}
            onRemove={onDelete}
          />
        )}
        <div className="bg-white opacity-100">
          <AutoHeightTextarea
            innerRef={e => {
              inputRef.current = e;
              innerRef?.(e);
            }}
            className="rounded-tl-none relative"
            id={`paragraph-${id ?? "input"}`}
            rows={2}
            placeholder="Write plot here"
            data-testid="paragraph-input"
            value={value!}
            disabled={disableInput}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
          />
        </div>
      </div>

      {value && value.length < StringFieldsLength.MIN_PARAGRAPH_LENGTH && (
        <p className="text-xs text-red-600 mt-1">
          Please enter at least {StringFieldsLength.MIN_PARAGRAPH_LENGTH} characters
        </p>
      )}
    </div>
  );
}
