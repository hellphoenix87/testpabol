import { expect } from "@playwright/experimental-ct-react";
import { Page } from "playwright-core";

import Scene from "@app/interfaces/Scene";

import { firebaseMethods } from "@app/utils/callFirebaseFunction";
import VideosStates from "@app/constants/VideosStates";

import { LoggerPage, calculateElapsedTime, e2eLogger, waitForResponseFromServer } from "@e2e/utils";
import { waitForProgressBarToDisappear } from "@e2e/creation/actions/progressBar";

const VIDEO_GENERATION_TIMEOUT = 26 * 60 * 1000; // 26 minutes

export const provideUserToCreationListPage = async (page: Page) => {
  e2eLogger("Provide user to creation list page.", LoggerPage.HOME);

  // Click on the create movie button. It should be visible and clickable, and it should redirect to the user's creations page.
  const createMovieBtn = page.getByRole("link", { name: "Create Movie" });

  await createMovieBtn.waitFor({ state: "visible" });

  await expect(createMovieBtn).toBeVisible();

  await createMovieBtn.click();

  await expect(page).toHaveURL("/creations");

  await page.waitForLoadState("networkidle");
};

export const provideUserFromCreationListPageToNewCreation = async (page: Page) => {
  e2eLogger("Provide user from creation list page to new creation.", LoggerPage.CREATION_LIST);

  // Click on the create new movie button. It should be visible and clickable, and it should redirect to the new creation page.
  const creatNewMovieLink = page.getByRole("link", { name: "New Creation" });

  await creatNewMovieLink.waitFor({ state: "visible" });
  await expect(creatNewMovieLink).toBeVisible();
  await creatNewMovieLink.click();
  await page.waitForLoadState("networkidle");
  await page.waitForLoadState("domcontentloaded");

  await page.waitForURL("/create/new");
};

export const fillInAttributesStepFieldsAndGoToTitleAndPlotStep = async (page: Page) => {
  e2eLogger("Fill in attributes step fields and go to title and plot step.", LoggerPage.ATTRIBUTES);

  // Fill in the genre and audience fields, and select the attributes.
  const genreField = page.getByLabel("Genre");
  const audienceField = page.getByLabel("Audience");
  const heroAttribute = page.getByText("Hero");

  await expect(genreField).toBeVisible();
  await expect(audienceField).toBeVisible();

  await expect(heroAttribute).toBeVisible();

  await genreField.selectOption({ label: "Crime" });
  await audienceField.selectOption({ label: "Adults" });

  await heroAttribute.click();

  // The original elements of the clicked attributes should be hidden, and they should be visible as new elements with remove button.
  await expect(page.getByRole("button", { name: "Remove Hero option" })).toBeVisible();

  // Click on the save and continue button. It should be visible and clickable, and it should redirect to the Title and Plot step.
  const goToTitleAndPlotStep = page.getByRole("button", { name: "Save and Continue" });
  await expect(goToTitleAndPlotStep).toBeVisible();
  await goToTitleAndPlotStep.click();
};

export const fillInTitleAndPlotStepFieldsAndGoToFinalStep = async (page: Page) => {
  e2eLogger("Fill in title and plot step fields and go to final step.", LoggerPage.TITLE_PLOT);
  // Wait for the API call to finish.
  const { title, scenes } = await waitForResponseFromServer<{ title: string; scenes: Scene[] }>(
    page,
    firebaseMethods.GENERATE_TITLE_AND_PLOT
  );

  await waitForProgressBarToDisappear(page);

  // The title and plot fields should be visible and filled in with the data from the API.
  const titleField = page.getByRole("textbox", { name: "title" });
  const plotFieldList = page.getByTestId("paragraph-input");

  await titleField.waitFor({ state: "visible" });

  await expect(titleField).toBeVisible();
  await expect(titleField).toHaveValue(title);

  await expect(plotFieldList).toHaveCount(scenes.length);

  for (let index = 0; index < scenes.length; index++) {
    const sceneDesc = scenes[index].desc;
    expect(sceneDesc).toBeTruthy();
    await expect(plotFieldList.nth(index)).toHaveValue(sceneDesc!);
  }

  // Click on the save and continue button. It should be visible and clickable, and it should redirect to the Final step.
  const goToFinalStep = page.getByRole("button", { name: "Continue" });
  await goToFinalStep.waitFor({ state: "visible" });
  await goToFinalStep.dispatchEvent("click");

  return title;
};

export const waitForVideoToBeGenerated = async (page: Page, movieName: string) => {
  e2eLogger("Wait for video to be generated.", LoggerPage.CREATION_LIST);

  const startTime = Date.now();

  const movieNameElement = page.getByRole("link", { name: movieName });
  const videoElement = page.locator("li", { has: movieNameElement });
  await videoElement.waitFor({ state: "visible" });
  await expect(videoElement).toBeVisible();
  e2eLogger("Video element is visible.", LoggerPage.CREATION_LIST);

  // Check that the video is being generated.
  const calculatingTag = videoElement.getByText(VideosStates.CALCULATING);
  await calculatingTag.waitFor({ state: "visible" });
  e2eLogger("Video is being generated, video has calculating tag.", LoggerPage.CREATION_LIST);

  // Wait for the video to be generated.
  const waitingForReviewTag = videoElement.getByText(VideosStates.WAITING_FOR_REVIEW);

  await waitingForReviewTag.waitFor({ state: "visible", timeout: VIDEO_GENERATION_TIMEOUT });
  e2eLogger(
    `Video is generated (${calculateElapsedTime(startTime)}). Video has waiting for review tag.`,
    LoggerPage.CREATION_LIST
  );
};
