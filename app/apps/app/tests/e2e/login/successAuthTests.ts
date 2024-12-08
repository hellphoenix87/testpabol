import { expect } from "@playwright/experimental-ct-react";
import { Page } from "playwright-core";

export const clickSignInButtonFillTheLoginFormAndClickLogin = async (page: Page, email: string, password: string) => {
  // Wait for the response from getUserProfile
  const signInBtn = page.getByRole("button", { name: "Sign In", exact: true });

  await page.waitForLoadState("domcontentloaded");

  // When user is not logged in, sign in button should be visible
  await expect(signInBtn).toBeVisible();

  await signInBtn.click();

  const emailField = page.getByRole("textbox", { name: "email" });
  const passwordField = page.getByRole("textbox", { name: "password" });

  // When user clicks on sign in button, email and password fields should appear
  await expect(emailField).toBeVisible();
  await expect(passwordField).toBeVisible();

  await emailField.fill(email);
  await passwordField.fill(password);

  await page.getByRole("button", { name: "Sign in", exact: true }).click();

  const getUserProfileResponse = await page.waitForResponse(response => {
    return response.url().includes("getUserProfile") && response.ok();
  });

  // After user logs in, getUserProfile should return 200 status code
  expect(getUserProfileResponse.ok()).toBeTruthy();

  const getUserProfileResponseJSON = await getUserProfileResponse.json();
  // After user logs in, getUserProfile should return the correct email
  expect(getUserProfileResponseJSON).toMatchObject({
    email: email.toLowerCase(),
  });

  await page.waitForLoadState("networkidle");
  await page.waitForLoadState("domcontentloaded");

  // After user logs in, the SignIn modal should be closed, and email and password fields should be hidden
  await Promise.all([
    signInBtn.waitFor({ state: "hidden" }),
    emailField.waitFor({ state: "hidden" }),
    passwordField.waitFor({ state: "hidden" }),
  ]);
};

export const clickSignInButtonFillTheLoginFormAndClickLoginOnMobile = async (
  page: Page,
  email: string,
  password: string
) => {
  // On mobile, the burger menu button should be visible
  const burgerMenuBtn = page.getByTestId("mobile-disclosure-button");
  await expect(burgerMenuBtn).toBeVisible();
  await burgerMenuBtn.click();

  await clickSignInButtonFillTheLoginFormAndClickLogin(page, email, password);

  return burgerMenuBtn;
};
