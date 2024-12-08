import { ChangeEvent, useEffect, useLayoutEffect } from "react";
import { classNames } from "@frontend/utils/classNames";
import useControlledTextarea from "@app/hooks/useControlledTextArea";

interface AutoHeightTextareaProps {
  innerRef?: (e: HTMLTextAreaElement | null) => void;
  value: string;
  id: string;
  className?: string;
  placeholder?: string;
  name?: string;
  required?: boolean;
  rows?: number;
  disabled?: boolean;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const SCROLL_HEIGHT_PADDING = 2;

export function AutoHeightTextarea({
  innerRef,
  value,
  id,
  className,
  placeholder,
  disabled = false,
  rows = 1,
  onChange,
  onBlur,
  onKeyDown,
  ...props
}: AutoHeightTextareaProps) {
  const { controlledValue, textareaRef, handleTextAreaChange } = useControlledTextarea(value, onChange);

  const resizeField = () => {
    if (textareaRef.current) {
      textareaRef.current.style.minHeight = "auto";
      textareaRef.current.style.minHeight = `${textareaRef.current.scrollHeight + SCROLL_HEIGHT_PADDING}px`;
    }
  };

  useLayoutEffect(() => {
    resizeField();
  }, [value]);

  useEffect(() => {
    window.addEventListener("resize", resizeField);

    return () => {
      window.removeEventListener("resize", resizeField);
    };
  }, []);

  useEffect(() => {
    if (innerRef && textareaRef.current) {
      innerRef(textareaRef.current);
    }
  }, [innerRef]);

  return (
    <textarea
      ref={textareaRef}
      id={id}
      data-testid={id}
      rows={rows}
      className={classNames(
        "resize-none block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-80 disabled:cursor-not-allowed sm:text-sm",
        className
      )}
      name={id}
      placeholder={placeholder}
      value={controlledValue}
      disabled={disabled}
      onChange={handleTextAreaChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      {...props}
    />
  );
}
