import { ChangeEvent, useState, useEffect, useRef } from "react";

// This hook is used to control the cursor position in controlled textarea
function useControlledTextarea<T extends HTMLTextAreaElement>(
  controlledValue = "",
  onChange: ((e: ChangeEvent<T>) => void) | null = null
) {
  const textareaRef = useRef<T | null>(null);

  const [cursor, setCursor] = useState<number | null>(null);

  useEffect(() => {
    const textArea = textareaRef.current;
    if (textArea) {
      textArea.setSelectionRange(cursor, cursor);
    }
  }, [textareaRef, cursor, controlledValue]);

  const handleTextAreaChange = (e: ChangeEvent<T>) => {
    const target = e.target as T;
    setCursor(target.selectionStart);
    onChange?.(e);
  };

  return { controlledValue, textareaRef, handleTextAreaChange };
}

export default useControlledTextarea;
