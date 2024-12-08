import { test, expect } from "@playwright/experimental-ct-react";
import { createTestUser, generateRandomEmail, removeTestUser } from "../../utils";
import * as successAuthTests from "../successAuthTests";

test.describe("Authentication", () => {
  // Create a new user. append a albhabet at beginning to make sure it is a valid email
  let userUID: string | null;
  let email: string | null;
  let password: string | null;

  test.beforeAll(async () => {
    email = generateRandomEmail();
    password = "Test1234";
    userUID = await createTestUser(email, password);
  });

  test("should login successfuly", async ({ page }) => {
    const burgerMenuBtn = await successAuthTests.clickSignInButtonFillTheLoginFormAndClickLoginOnMobile(
      page,
      email!,
      password!
    );

    // Click on "Let's go!" button in welcome modal
    await page.locator("text=Let's go!").click();

    // When user is logged in, user email should be visible
    await burgerMenuBtn.click();
    await expect(page.locator(`text=${email!}`)).toBeVisible();
  });

  test.afterAll(async () => {
    await removeTestUser(userUID!);

    email = null;
    password = null;
    userUID = null;
  });
});
