import { ElementType } from "react";

interface ImageTagProps {
  Image?: ElementType | null;
  text?: string | null;
}

export function ImageTag({ Image, text }: ImageTagProps) {
  if (!Image || !text) {
    return null;
  }

  return (
    <div className="inline-flex flex-row justify-center items-center gap-1 absolute left-3 bottom-3 px-2 py-0.5 bg-slate-200 rounded-md bg-opacity-70 pointer-events-none">
      <Image className="w-4 h-4 opacity-75" />
      <div className="text-sm font-bold">{text}</div>
    </div>
  );
}
