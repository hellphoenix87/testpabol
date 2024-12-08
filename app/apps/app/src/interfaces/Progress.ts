import { Dispatch, SetStateAction } from "react";

export interface Progress {
  show: boolean;
  progress?: number;
  time?: number;
  text?: string;
}

export type ProgressAction = Dispatch<SetStateAction<Progress>>;

export interface UseProgress {
  setShowProgress: ProgressAction;
  setDefaultProgress: () => void;
  setInitialProgress: (text: string) => void;
  setProgress: (progress: number) => void;
}
