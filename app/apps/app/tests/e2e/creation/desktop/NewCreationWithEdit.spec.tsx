import { test } from "@playwright/experimental-ct-react";
import { createTestUser, generateRandomEmail, removeTestUser } from "@e2e/utils";
import * as successAuthTests from "@e2e/login/successAuthTests";
import * as successCreationTests from "@e2e/creation/successCreationTests";
import * as titleAndPlotTests from "@e2e/creation/test-cases/titleAndPlotTests";
import * as finishCreationTest from "@e2e/creation/test-cases/finishCreationTest";
import * as videoPageTests from "@e2e/creation/test-cases/videoPageTests";

test.describe("New creation with edit", () => {
  let userUID: string | null;
  let email: string | null;
  let password: string | null;

  test.beforeAll(async () => {
    email = generateRandomEmail();
    password = "Test1234";

    userUID = await createTestUser(email, password, true, true);
  });

  test("should pass all steps and create the new creation successfuly", async ({ page }) => {
    await successAuthTests.clickSignInButtonFillTheLoginFormAndClickLogin(page, email!, password!);

    await successCreationTests.provideUserToCreationListPage(page);
    await successCreationTests.provideUserFromCreationListPageToNewCreation(page);
    await successCreationTests.fillInAttributesStepFieldsAndGoToTitleAndPlotStep(page);

    const { title } = await titleAndPlotTests.applyTitleAndPlotTests(page);

    await finishCreationTest.applyFinishCreationTests(page, title);

    await successCreationTests.waitForVideoToBeGenerated(page, title);

    await videoPageTests.openVideoPlayerAndCheckVideoIsPlaying(page, title);

    await page.close();
  });

  test.afterAll(async () => {
    await removeTestUser(userUID!);

    email = null;
    password = null;
    userUID = null;
  });
});