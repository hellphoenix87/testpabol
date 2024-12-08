import { Page } from "playwright-core";
import { expect } from "@playwright/experimental-ct-react";
import { LoggerPage, e2eLogger } from "@e2e/utils";

export const log = (message: string) => {
  e2eLogger(message, LoggerPage.VIDEO_PLAYER);
};

export const openVideoPlayer = async (page: Page, movieName: string) => {
  log("Open video page.");

  const movieLink = page.getByRole("link", { name: movieName });
  const url = await movieLink.getAttribute("href");

  await movieLink.click();

  await page.waitForLoadState("networkidle");
  await page.waitForLoadState("domcontentloaded");

  await page.waitForURL(url!);

  await page.locator("video").waitFor({ state: "visible" });
};

export const checkVideoIsPlayable = async (page: Page) => {
  log("Check video is playable.");

  const ATTEMPTS_TO_PLAY = 10;

  const video = page.locator("video");

  log("Wait for a moment to allow potential changes after clicking.");
  await page.waitForTimeout(3 * 1000);

  let isVideoPlaying = false;

  for (let currentAttempt = 1; currentAttempt <= ATTEMPTS_TO_PLAY; currentAttempt++) {
    log(`Attempt ${currentAttempt} to check if video is playing.`);

    isVideoPlaying = await video.evaluate(async (videoElement: HTMLVideoElement) => {
      // click on play button if video is paused
      if (videoElement.paused) {
        log("Click play.");
        await video.click();
      }
      console.log(
        `Current time: ${videoElement.currentTime}s. Ready state: ${videoElement.readyState}. Paused: ${videoElement.paused}. Ended: ${videoElement.ended}.`
      );
      return !!(
        videoElement.currentTime > 0 &&
        !videoElement.paused &&
        !videoElement.ended &&
        videoElement.readyState > 2
      );
    });

    await page.waitForTimeout(currentAttempt * 10 * 1000);

    if (isVideoPlaying) {
      log(`Video is playable. Video started playing after ${currentAttempt} attempts.`);
      return;
    }
  }

  expect(isVideoPlaying).toBeTruthy();
};
