import { expect } from "@playwright/experimental-ct-react";
import { Page } from "playwright-core";
import { firebaseMethods } from "@app/utils/callFirebaseFunction";
import { LoggerPage, e2eLogger, waitForResponseFromServer } from "@e2e/utils";

export const log = (message: string) => {
  e2eLogger(message, LoggerPage.FINISH);
};

export const checkSummaryIsPrefilledEditableAndRequired = async (page: Page, summary: string) => {
  log("Check that the preview field is visible and filled in with the data from the API.");
  const completeMovieBtn = page.getByRole("button", { name: "Publish Movie" });
  const previewField = page.getByLabel("Preview description");

  await previewField.waitFor({ state: "visible" });

  await expect(previewField).toBeVisible();
  await expect(previewField).toHaveValue(summary);
  await expect(previewField).not.toBeDisabled();

  log("Check that the preview field is required.");
  await previewField.focus();
  await previewField.selectText();
  await previewField.press("Backspace");

  await expect(previewField).toHaveValue("");
  await expect(page.getByText("Preview description is required")).toBeVisible();
  await expect(completeMovieBtn).toBeDisabled();

  log("Check that the preview field is editable.");
  await previewField.fill(summary);

  await expect(previewField).toHaveValue(summary);
  await expect(completeMovieBtn).not.toBeDisabled();
};

export const checkMoreInformationModalIsDisplayedAndCanBeClosed = async (page: Page) => {
  log('Check that the modal is displayed after clicking on the "More Information" button');
  const moreInformationButton = page.getByText("More Information");
  await moreInformationButton.click();

  const modal = page.getByTestId("legal-preview-modal");
  await modal.waitFor({ state: "visible" });
  await expect(modal).toBeVisible();

  log("Check that the modal can be closed.");
  const closeButton = page.getByRole("button", { name: "Close" });
  await closeButton.click();
  await modal.waitFor({ state: "hidden" });
  await expect(modal).not.toBeVisible();
};

export const checkAgeRestrictionCheckboxIsEditable = async (page: Page) => {
  log("Check that the Age restriction checkbox is editable.");
  const adultContentCheckBox = page.getByRole("checkbox", { name: "Age restriction" });

  await expect(adultContentCheckBox).not.toBeDisabled();
  await adultContentCheckBox.click();
  await expect(adultContentCheckBox).toBeChecked();
  await expect(adultContentCheckBox).not.toBeDisabled();
};

export const checkPublishButtonMovesToCreationsPageAndPublishesMovie = async (page: Page, movieName: string) => {
  log("Check that the Publish button is clickable and sends request to finish creation.");
  const completeMovieBtn = page.getByRole("button", { name: "Publish Movie" });
  await completeMovieBtn.waitFor({ state: "visible" });
  await completeMovieBtn.dispatchEvent("click");

  await page.waitForLoadState("networkidle");
  await page.waitForLoadState("domcontentloaded");

  await waitForResponseFromServer(page, firebaseMethods.FINISH_CREATION);

  log("Check that the Creations page is displayed.");
  await page.waitForURL("/creations");
  await expect(page).toHaveURL("/creations");

  log("Check that the movie is displayed in the Creations page.");
  const movieNameElement = page.getByRole("link", { name: movieName });
  await movieNameElement.waitFor({ state: "visible" });
  await expect(movieNameElement).toBeVisible();
};
