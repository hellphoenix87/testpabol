import { Page } from "playwright-core";
import * as videoPlayer from "@e2e/creation/actions/videoPlayer";

export const openVideoPlayerAndCheckVideoIsPlaying = async (page: Page, movieName: string) => {
  await videoPlayer.openVideoPlayer(page, movieName);
  await videoPlayer.checkVideoIsPlayable(page);
};
