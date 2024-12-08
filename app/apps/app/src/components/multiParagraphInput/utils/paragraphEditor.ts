import CaretPosition from "@app/interfaces/CaretPosition";
import Scene from "@app/interfaces/Scene";

export const getCaretPosition = (element: HTMLTextAreaElement | HTMLInputElement): CaretPosition => {
  const isCaretAtStart = element.selectionStart === 0;
  const isCaretAtEnd = element.selectionStart === element.value.length;
  const caretPosition = element.selectionStart!;

  return { isCaretAtStart, isCaretAtEnd, caretPosition };
};

export const getFilledStrings = (strings: string[]) => strings.filter(s => s.length > 0);

export const splitParagraphs = (scenes: Scene[]) =>
  scenes.reduce<string[]>((acc, scene) => {
    const desc = scene.desc?.split("\n") ?? [];
    return [...acc, ...desc];
  }, []);
