import { expect } from "@playwright/experimental-ct-react";
import { Page } from "playwright-core";
import { firebaseMethods } from "@app/utils/callFirebaseFunction";
import { waitForResponseFromServer } from "@e2e/utils";
import * as finishCreationStepCases from "@e2e/creation/actions/finishCreationStep";
import * as progressBar from "@e2e/creation/actions/progressBar";

export const applyFinishCreationTests = async (page: Page, movieName: string) => {
  finishCreationStepCases.log("Start the Finish Creation step tests.");

  const { summary } = await waitForResponseFromServer<{ summary: string }>(page, firebaseMethods.GENERATE_SUMMARY);

  await finishCreationStepCases.checkSummaryIsPrefilledEditableAndRequired(page, summary);
  await finishCreationStepCases.checkMoreInformationModalIsDisplayedAndCanBeClosed(page);
  await finishCreationStepCases.checkAgeRestrictionCheckboxIsEditable(page);
  await finishCreationStepCases.checkPublishButtonMovesToCreationsPageAndPublishesMovie(page, movieName);
};

export const fillInFinishStepFieldsAndCompleteMovie = async (page: Page, movieName: string) => {
  finishCreationStepCases.log("Fill in finish step fields and complete movie.");

  // Wait for the API call to finish.
  const { summary } = await waitForResponseFromServer<{ summary: string }>(page, firebaseMethods.GENERATE_SUMMARY);

  await progressBar.waitForProgressBarToDisappear(page);

  const previewField = page.getByLabel("Preview description");

  await previewField.waitFor({ state: "visible" });

  // The preview field should be visible and filled in with the data from the API.
  await expect(previewField).toBeVisible();
  await expect(previewField).toHaveValue(summary);

  const completeMovieBtn = page.getByRole("button", { name: "Publish Movie" });
  await completeMovieBtn.waitFor({ state: "visible" });
  const adultContentCheckBox = page.getByRole("checkbox");
  await adultContentCheckBox.click();

  await finishCreationStepCases.checkPublishButtonMovesToCreationsPageAndPublishesMovie(page, movieName);
};
