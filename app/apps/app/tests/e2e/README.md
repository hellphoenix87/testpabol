## End-to-end (E2E) Testing

We use Playwright to run browser tests. Currently, tests verify the movie-making workflow using mock api calls from login up to the creation of a movie on multiple browsers.

Commands to run test:

1. Install test browsers with `npx playwright install`.
2. Generate a service account key on https://console.firebase.google.com/u/0/project/{projectID}/settings/serviceaccounts/adminsdk and place it under the path `apps/app/paramax-firebase-adminsdk.json`. Don't forget to replace the {projectID} with the actual projectID. You can find the projectID in the firebase console.
 > **IMPORTANT:** Don't commit the paramax-firebase-adminsdk.json file to the repo.
3. Your CLI must already be authenticated with `firebase login`. Run `npm run serve:functions` to run firebase functions and `npm run test:e2e:app` from this repo to run the end to end workflow test for all browsers. Run both simultanously.

### Writing tests

1. If you need to specify device type (mobile or desktop) for your test, add the `desktop only` or `mobile only` to the test name. For example:
```ts
// run only for mobiles
it("login successfully for mobile only", async () => {
  // test code
});

// run only for desktops
it("login successfully for desktop only", async () => {
  // test code
});

// run for both mobiles and desktops
it("login successfully", async () => {
  // test code
});
```
Or you can create `mobile` and `desktop` test directories and put your tests there. For example:

```ts
// tests/e2e/login/desktop/Login.test.ts
// run only for desktops
it("login successfully", async () => {
  // test code
});
```
```
// tests/e2e/login/mobile/Login.test.ts
// run only for mobiles
it("login successfully", async () => {
  // test code
});
```
```ts
// tests/e2e/login/Login.test.ts
// run for both mobiles and desktops
it("login successfully", async () => {
  // test code
});
```
2. If your tests should make api calls to firebase, use `generateRandomEmail`, `createTestUser`, and `removeTestUser` from `tests/e2e/utils.ts` to create and remove test users. For example:
```ts
test.describe("Authentication", () => {   // Create a new user. append a albhabet at beginning to make sure it is a valid email
  let userUID;
  let email;
  let password;

  test.beforeAll(async () => {
    email = generateRandomEmail(6);
    password = "Test1234";
    userUID = await createTestUser(email, password);
  });

  it("login successfully", async () => {
    // test code
  });

  test.afterAll(async () => {
    await removeTestUser(userUID);

    email = null;
    password = null;
    userUID = null;
  });
});
```
If you need to login a user, use `clickSignInButtonFillTheLoginFormAndClickLogin(page, email, password)` function from the `tests/e2e/login/successAuthTests.ts`. For example:
```ts
test.describe("Authentication", () => {   // Create a new user.
  let userUID;
  let email;
  let password;

  test.beforeAll(async () => {
    email = generateRandomEmail(6);
    password = "Test1234";
    userUID = await createTestUser(email, password);
  });

  it("login successfully", async (page) => {
    await clickSignInButtonFillTheLoginFormAndClickLogin(page, email, password);
    // test code
  });

  test.afterAll(async () => {
    await removeTestUser(userUID);

    email = null;
    password = null;
    userUID = null;
  });
});
```
3. If you see that tests are failing on `page.waitForResponse(process.env.BACKEND_URL!);` with the message
```
Test timeout of 50000ms exceeded.
Error: page.waitForResponse: Page closed
=========================== logs ===========================
waiting for response `process.env.BACKEND_URL`
============================================================
```
check the Cloud Run service logs of the `process.env.BACKEND_URL` in GCP (see `vite.config.ts` for the configured value) or/and inform platform developers.

4. Architecture and code organisation.

To split big tests flow into smaller scenarios, use `e2e/{YOUR TEST FOLDER}/test-cases` and `e2e/{YOUR TEST FOLDER}/actions` folders.

 - `actions` folder contains functions that perform some actions on the page and small cases. For example:
```ts
// tests/e2e/login/actions/registration.ts
export const clickSignInButton = async (page: Page) => {
  await page.click("text=Sign in");
};

export const fillAndCheckLoginForm = async (page: Page, email: string) => {
  await page.getByRole("textbox").fill(email);
  await expect(page.getByRole("textbox")).toHaveSelector(email);
  await page.getByText("Invalid email!").not.toBeVisible();
};
```

 - `test-cases` folder contains functions that perform combinations of actions and small cases from the `actions` folder. For example:
```ts
// tests/e2e/login/test-cases/successAuthTests.ts
import * as registrationActions from "@e2e/login/actions/registration";

export const clickSignInButtonFillTheLoginFormAndClickLogin = async (page: Page, email: string, password: string) => {
  await registrationActions.clickSignInButton(page);
  await registrationActions.fillAndCheckLoginForm(page, email);
  await page.getByRole("textbox").fill(password);
  await page.click("text=Login");
};
```

And then use these functions in your tests. For example:
```ts
// tests/e2e/login/Login.test.ts
import * as successAuthTests from "@e2e/login/test-cases/successAuthTests";

test.describe("Authentication", () => {
  let userUID;
  let email;
  let password;

  test.beforeAll(async () => {
    email = generateRandomEmail(6);
    password = "Test1234";
    userUID = await createTestUser(email, password);
  });

  it("login successfully", async (page) => {
    await successAuthTests.clickSignInButtonFillTheLoginFormAndClickLogin(page, email, password);
  });

  test.afterAll(async () => {
    await removeTestUser(userUID);

    email = null;
    password = null;
    userUID = null;
  });
});
```
