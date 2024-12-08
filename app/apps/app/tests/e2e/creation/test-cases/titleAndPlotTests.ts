import { expect } from "@playwright/experimental-ct-react";
import { Page } from "playwright-core";

import Scene from "@app/interfaces/Scene";
import { firebaseMethods } from "@app/utils/callFirebaseFunction";
import { LoggerPage, e2eLogger, waitForResponseFromServer } from "@e2e/utils";

export const log = (message: string) => {
  e2eLogger(message, LoggerPage.TITLE_PLOT);
};

export const applyTitleAndPlotTests = async (page: Page): Promise<{ title: string }> => {
  log("Start Title and Plot step tests.");

  const { title, scenes } = await waitForResponseFromServer<{ title: string; scenes: Scene[] }>(
    page,
    firebaseMethods.GENERATE_TITLE_AND_PLOT
  );

  await removeTitleAndCheckErrorMessageAndButtonThenRefillTitle(page, title);

  await checkAllScenesAreDisplayed(page, scenes);

  // Add and remove paragraph tests
  await removeParagraphAndCheckItIsRemoved(page, 1);
  await addNewParagraphAndCheckItIsAdded(page, 3);

  await clickOnContinueButton(page);

  return { title };
};

const removeTitleAndCheckErrorMessageAndButtonThenRefillTitle = async (page: Page, title: string) => {
  log("Remove title and check error message and button then refill title.");

  const titleField = page.getByRole("textbox", { name: "title" });
  const goToAssetsStep = page.getByRole("button", { name: "Continue" });

  await titleField.waitFor({ state: "visible" });
  await expect(titleField).toBeVisible();
  await expect(titleField).toHaveValue(title);
  await expect(goToAssetsStep).not.toBeDisabled();

  // Select all text in the title field
  await titleField.focus();
  await titleField.selectText();
  // Delete all text in the title field
  await titleField.press("Backspace");

  await expect(titleField).toHaveValue("");

  await expect(goToAssetsStep).toBeDisabled();
  await expect(page.getByText("Title should be at least 3 characters long")).toBeVisible();

  log("Validation error is visible and continue button is disabled if title field is empty.");

  // Fill in the title field with the original text.
  await titleField.fill(title);

  await expect(titleField).toHaveValue(title);
  await expect(goToAssetsStep).not.toBeDisabled();

  log("Title field is refilled.");
};

const checkAllScenesAreDisplayed = async (page: Page, scenes: Scene[]) => {
  log("Check all scenes are displayed.");

  const paragraphsList = page.getByTestId("paragraph-item");

  // check that the number of paragraphs is equal to the number of scenes from the API response.
  await expect(paragraphsList).toHaveCount(scenes.length);

  for (let i = 0; i < scenes.length; i++) {
    log(`Check scene ${i} is displayed.`);

    const scene = scenes[i];

    const selectedParagraph = paragraphsList.nth(i);
    await expect(selectedParagraph).toBeVisible();

    const paragraphTextArea = selectedParagraph.getByRole("textbox");
    await expect(paragraphTextArea).toBeVisible();
    await expect(paragraphTextArea).toHaveValue(scene.desc!);

    log(`Text for scene ${i} is displayed correctly.`);
  }
};

const removeParagraphAndCheckItIsRemoved = async (page: Page, sceneIndex: number) => {
  log(`Remove paragraph ${sceneIndex} and check it is removed.`);

  const paragraphsList = page.getByTestId("paragraph-item");

  const numberOfParagraphs = await paragraphsList.count();

  const selectedParagraph = paragraphsList.nth(sceneIndex);
  await expect(selectedParagraph).toBeVisible();

  // click on the remove button of the selected paragraph.
  await selectedParagraph.hover();
  const removeBtn = selectedParagraph.locator("[name='remove']");
  await removeBtn.waitFor({ state: "visible" });
  await removeBtn.click();

  // check the number of displayed paragraphs is decreased by 1.
  await expect(paragraphsList).toHaveCount(numberOfParagraphs - 1);

  log(`Paragraph ${sceneIndex} is removed.`);
};

const addNewParagraphAndCheckItIsAdded = async (page: Page, sceneIndex: number) => {
  log(`Add new paragraph and check it is added after paragraph ${sceneIndex}.`);

  const paragraphsList = page.getByTestId("paragraph-item");

  const numberOfParagraphs = await paragraphsList.count();

  const selectedParagraph = paragraphsList.nth(sceneIndex);
  await expect(selectedParagraph).toBeVisible();
  const paragraphTextArea = selectedParagraph.getByRole("textbox");
  await expect(paragraphTextArea).toBeVisible();

  // press Enter key to add a new paragraph.
  await paragraphTextArea.focus();
  await paragraphTextArea.selectText();
  await paragraphTextArea.press("ArrowDown"); // move the cursor to the end of the text.
  await paragraphTextArea.press("Enter");

  // check the number of displayed paragraphs is increased by 1.
  await expect(paragraphsList).toHaveCount(numberOfParagraphs + 1);

  // check a new paragraph is added after the selected paragraph with empty text.
  const newParagraph = paragraphsList.nth(sceneIndex + 1);
  await expect(newParagraph).toBeVisible();
  const newParagraphTextArea = newParagraph.getByRole("textbox");
  await expect(newParagraphTextArea).toBeVisible();
  await expect(newParagraphTextArea).toHaveValue("");

  await newParagraphTextArea.fill("This is a new paragraph yoohoo!");

  log(`New paragraph is added after paragraph ${sceneIndex}.`);
};

const clickOnContinueButton = async (page: Page) => {
  log("Click on continue button.");

  const continueBtn = page.getByRole("button", { name: "Continue" });
  await expect(continueBtn).toBeVisible();
  await expect(continueBtn).not.toBeDisabled();
  await continueBtn.click();
};
