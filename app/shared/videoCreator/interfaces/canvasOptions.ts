import { FetchedFile, InternalOptions } from ".";

export interface CanvasOptions extends InternalOptions {
  animate: boolean;
  oldImage?: FetchedFile;
  oldScale?: number;
}
