import { e2eLogger } from "@e2e/utils";
import { Page } from "playwright-core";

export const waitForProgressBarToDisappear = async (page: Page) => {
  e2eLogger("Wait for progressbar to disappear.");

  const remainingTime = page.getByText("seconds remaining...");
  let remainingTimeCount = await remainingTime.count();

  // While the "seconds remaining..."" text exists - the progress bar is still visible.
  while (remainingTimeCount > 0) {
    await page.waitForTimeout(1000);
    remainingTimeCount = await remainingTime.count();
  }

  await page.waitForLoadState("domcontentloaded");
};
