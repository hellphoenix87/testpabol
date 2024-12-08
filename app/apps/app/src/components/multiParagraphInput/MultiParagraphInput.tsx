import { useEffect, useRef, useState } from "react";
import Scene from "@app/interfaces/Scene";
import { classNames } from "@frontend/utils/classNames";
import { getCaretPosition } from "./utils/paragraphEditor";
import { ParagraphInput } from "./ParagraphInput";
import CaretPosition from "@app/interfaces/CaretPosition";
import useToast from "@app/hooks/useToast";
import ToastTypes from "@app/constants/ToastTypes";
import { MAX_SCENES_COUNT } from "@shared/constants";

type ParagraphInputKeyEvt = React.KeyboardEvent<HTMLTextAreaElement>;

interface MultiParagraphInputProps {
  id?: string;
  scenes: Scene[];
  disabled?: boolean;
  onScenesChange: (scenes: Scene[] | ((currentScenes: Scene[]) => Scene[])) => void;
  onBlur?: () => void;
}

export function MultiParagraphInput({
  id = "paragraph",
  scenes,
  disabled = false,
  onScenesChange,
  onBlur,
}: MultiParagraphInputProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  const fieldsRef = useRef<Array<HTMLTextAreaElement>>([]);
  const { openToast } = useToast();

  const handleBlur = () => {
    onBlur?.();
  };

  const handleParagraphChange = (index: number, newValue: string) => {
    onScenesChange(currentScenes => {
      const updatedScenes = [...currentScenes];
      const updatedScene = { ...currentScenes[index], desc: newValue };
      updatedScenes[index] = updatedScene;
      return updatedScenes;
    });
  };

  const handleBackspace = (paragraphIndex: number) => {
    const prevIndex = paragraphIndex > 0 ? paragraphIndex - 1 : 0;

    if (paragraphIndex === 0) {
      return;
    }

    onScenesChange(currentScenes => {
      const updatedScenes = [...currentScenes];
      const updatedScene = { ...currentScenes[paragraphIndex] };
      const prevScene = currentScenes[prevIndex];
      const updatedPrevScene = { ...prevScene, desc: `${prevScene.desc ?? ""} ${updatedScene.desc ?? ""}` };
      updatedScenes[prevIndex] = updatedPrevScene;
      updatedScenes.splice(paragraphIndex, 1);
      return updatedScenes;
    });
    deleteParagraphRef(paragraphIndex);
    setFocusedIndex(prevIndex);
  };

  const handleDelete = (paragraphIndex: number) => {
    // If there is only one paragraph, do nothing
    if (scenes.length <= 1) {
      return;
    }
    onScenesChange(currentScenes => {
      const updatedScenes = [...currentScenes];
      updatedScenes.splice(paragraphIndex, 1);
      return updatedScenes;
    });
    deleteParagraphRef(paragraphIndex);
    setFocusedIndex(paragraphIndex - 1);
  };

  const getUpdatedParagraphTexts = (
    currentSceneDesc: string,
    caretPosition: CaretPosition
  ): {
    newSceneDesc: string;
    updatedCurrentSceneDesc: string;
  } => {
    if (caretPosition?.isCaretAtStart) {
      // If the Caret is at the start of the paragraph, we want to move the text to the next paragraph
      return { newSceneDesc: currentSceneDesc.trim(), updatedCurrentSceneDesc: "" };
    }

    if (caretPosition?.isCaretAtEnd) {
      // if the Caret is at the end of the paragraph, create a new empty paragraph
      return { newSceneDesc: "", updatedCurrentSceneDesc: currentSceneDesc.trim() };
    }

    // if the Caret is in the middle of the paragraph, we want to split the text
    return {
      newSceneDesc: currentSceneDesc.slice(caretPosition?.caretPosition).trim(),
      updatedCurrentSceneDesc: currentSceneDesc.slice(0, caretPosition?.caretPosition).trim(),
    };
  };

  const handleEnter = (paragraphIndex: number, caretPosition: CaretPosition) => {
    if (scenes.length >= MAX_SCENES_COUNT) {
      openToast("You have maximum amount of paragraphs.", ToastTypes.ERROR);
      return;
    }

    const nextIndex = paragraphIndex + 1;
    const currentSceneDesc = scenes[paragraphIndex].desc!;

    const { newSceneDesc, updatedCurrentSceneDesc } = getUpdatedParagraphTexts(currentSceneDesc, caretPosition);

    const newScene: Scene = {
      id: `${nextIndex}`,
      desc: newSceneDesc,
      scene_title: "",
    };

    onScenesChange(currentScenes => {
      const updatedScenes = [...currentScenes];
      const updatedScene = { ...currentScenes[paragraphIndex], desc: updatedCurrentSceneDesc };
      updatedScenes[paragraphIndex] = updatedScene;
      updatedScenes.splice(nextIndex, 0, newScene);
      return updatedScenes;
    });
    setFocusedIndex(nextIndex);
  };

  const handleBackspaceKeyDown = (event: ParagraphInputKeyEvt, paragraphIndex: number) => {
    if (scenes.length === 0 || getCaretPosition(event.currentTarget).isCaretAtStart) {
      event.preventDefault();
      handleBackspace(paragraphIndex);
    }
  };

  const handleDeleteKeyDown = (event: ParagraphInputKeyEvt, paragraphIndex: number) => {
    if (scenes.length === 0 || getCaretPosition(event.currentTarget).isCaretAtEnd) {
      event.preventDefault();
      handleDelete(paragraphIndex);
    }
  };

  const handleEnterKeyDown = (event: ParagraphInputKeyEvt, paragraphIndex: number) => {
    if (scenes.length > 0) {
      event.preventDefault();
      const caretPosition = getCaretPosition(event.currentTarget);
      handleEnter(paragraphIndex, caretPosition);
    }
  };

  const handlePrevKeyDown = (event: ParagraphInputKeyEvt, paragraphIndex: number) => {
    if (getCaretPosition(event.currentTarget).isCaretAtStart && paragraphIndex > 0) {
      event.preventDefault();
      setFocusedIndex(paragraphIndex - 1);
    }
  };

  const handleNextKeyDown = (event: ParagraphInputKeyEvt, paragraphIndex: number) => {
    if (getCaretPosition(event.currentTarget).isCaretAtEnd && paragraphIndex < scenes.length - 1) {
      event.preventDefault();
      setFocusedIndex(paragraphIndex + 1);
    }
  };

  const handleDeleteClick = (paragraphIndex: number) => {
    handleDelete(paragraphIndex);
  };

  const mapKeyToAction = {
    Enter: handleEnterKeyDown,
    Backspace: handleBackspaceKeyDown,
    Delete: handleDeleteKeyDown,
    ArrowUp: handlePrevKeyDown,
    ArrowLeft: handlePrevKeyDown,
    ArrowDown: handleNextKeyDown,
    ArrowRight: handleNextKeyDown,
  };

  const handleKeyDown = (e: ParagraphInputKeyEvt, paragraphIndex: number) => {
    const keyDownAction = mapKeyToAction[e.key];
    if (keyDownAction) {
      keyDownAction(e, paragraphIndex);
    }
  };

  const handleParagraphsRefs = (element: HTMLTextAreaElement | null, index: number) => {
    if (!element || fieldsRef.current.includes(element)) {
      return;
    }
    fieldsRef.current.splice(index, 0, element);
  };

  const deleteParagraphRef = (index: number) => {
    fieldsRef.current.splice(index, 1);
  };

  useEffect(() => {
    fieldsRef.current[focusedIndex]?.focus();
  }, [focusedIndex]);

  return (
    <div className="w-full" id={id}>
      {scenes.map((scene, i) => (
        <ParagraphInput
          key={i}
          id={`multi-${i}`}
          innerRef={element => handleParagraphsRefs(element, i)}
          className={classNames(i < scenes.length - 1 && "mb-4")}
          value={scene.desc}
          disableInput={disabled}
          onChange={e => handleParagraphChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(e, i)}
          onBlur={handleBlur}
          onDelete={() => handleDeleteClick(i)}
        />
      ))}
    </div>
  );
}
