*If you're new to this repo, check out the onboarding [doc](/docs/onboarding.md).*

## Overview

This repository contains two projects under `apps`:
- App: main Pabolo web app used to watch and create movies.
- Backoffice: site used by Pabolo team for internal features like moderation.

In addition, Cloud Functions defined under `functions` provide a NodeJS backend to both projects.

## Installing dependencies

1. Run `npm ci` from the root folder.
2. Install dependencies from functions folder:
    - Go to functions folder `cd functions`
    - Run `npm ci`
3. Generate a service account key to use in the functions credentials
**Note:** The Default credentials used is user account key which does not support signing url.
```
gcloud iam service-accounts keys create sa_key.json --iam-account app-firebase-admin@serverless-dev-20231020t00.iam.gserviceaccount.com
```

`Note`: the latest Node version will not work, install Node `16` or `18`.

## Developing

All npm scripts run from this repo root folder.

1. Copy `.env.example` and rename it to `.env`. Update variables in the `.env` if needed:
    - PABOLO_APP_API_KEY - Firebase API key
    - PABOLO_APP_AUTH_DOMAIN - Firebase auth domain
    - PABOLO_PROJECT_ID - Firebase project ID
    - PABOLO_APP_MESSAGING_SENDER_ID - Firebase messaging sender ID
    - PABOLO_APP_ID - Firebase app ID
    - PABOLO_BUCKET_NAME_MEDIA_STORAGE - GCP bucket for media
    - PABOLO_BUCKET_NAME_MUSIC_STORAGE - GCP bucket for musicdb
    - PABOLO_BUCKET_NAME_ASSET_STORAGE - GCP bucket for asset
    - PABOLO_BUCKET_NAME_VOICE_STORAGE - GCP bucket for voicedb
    - PABOLO_BUCKET_NAME_PUBLIC_STORAGE - GCP bucket for public
    - PABOLO_BUCKET_NAME_SOUND_STORAGE - GCP bucket for sound
    - PABOLO_FUNCTIONS_REGION - GCP functions region
    - PABOLO_BUCKET_PUBLIC_CDN - CDN hostname for public bucket
3. Authenticate with `firebase login` (daily) and configure the project `firebase use default` (only once or when the dev environment has been updated). Check the configured project with `firebase projects:list`: the current project should match the default project in `.firebaserc`.
4. (optional) Run `npm run build:watch:functions` in a separate terminal to run firebase cloud functions in watch mode: this mode updates running functions on every code change without restarting the emulator.
5. Run `npm run serve:functions` to run firebase functions emulator or `firebase emulators:start --only functions --debug` for more verbose logging.
6. Run `npm run dev:app` to run pabolo's main app on port 5173 (default). You can run the script with additional parameters:
    - `--mock` to use the mock py_backend API URL;
7. (optional) Run `npm run dev:backoffice` for the backoffice app running on port 3001 (default).
NB: Run the script from the above steps simultanously (firebase functions and a react app).
NB: You can run both app and backoffice simultanously and each app will run on a differant port.

## Unit Testing

Run `npm run test:unit:app` to run unit tests and see the coverage.
Run `npm run test:unit-dev:app` to run unit tests in watch mode.
You can see the coverage report in the `coverage` folder.

## End-to-end Testing

Refer to this [README](/apps/app/tests/e2e) in the e2e test subfolder.

## Configuring Cloud Functions

Since Cloud Functions are deployed by GCP from source, we need to dynamically create a file, which exports the constants:
__COMMIT_HASH__
__MOCKED_GENERATOR_API__
__DEFAULT_GENERATOR_API__
PABOLO_BUCKET_NAME_MEDIA_STORAGE
PABOLO_BUCKET_NAME_PUBLIC_STORAGE
GOOGLE_CLOUD_PROJECT
PABOLO_FUNCTIONS_REGION

The commit hash is necessary to version cloud functions and make sure that parallel PRs do not conflict with each other.

The file `functions/.env` is created automatically by running `npm run serve:functions`.
This command runs the `functions/buildENV.mjs` script, which populate `functions/.env` with the above constants.

## Microservices

We are moving to express microservices with cloud functions, you should follow these notes when you create a microservice:
- All microservices request should be POST request.
- The endpoints routes should be like function's name
- We have 2 middlewares that verify user auth token in `/functions/src/middlewares/validateUser`:
    - `validateUser`: Should be used if authentication is optional, it will validate user token and pass user data to the function
    - `strictValidateUser`: Should be used if authentication is required, it will validate user data and if it is not valid it will return UNAUTHORIZED response error and the function will not be triggered at all
    - Don’t pass middleware if authentication is not needed (like updating video views)
    - If one of the 2 middlewares is used, then user's data can be accessed with `req.user`.
- Make sure alwars to use the custom corsMiddleware to restrict access to the microservice.
- There is an env variable for functions region, it is used to specify in which region the microservices are deployed, in frontend it is used to call the microservice from the right region.

Examples:
```
app.use(corsMiddleware); // Use our custom cors middleware
// Note the routes match functions names
app.post("/getVideos", validateUser, getVideos); // Auth is not optional to get videos
app.post("/deleteVideo", strictValidateUser, deleteVideo); // Auth is required to delete a video
app.post("/updateVideoViews", updateVideoViews); // Auth is not needed to update video views
exports.videos = functions.region(process.env.PABOLO_FUNCTIONS_REGION).https.onRequest(app); // Deployment region is setted here
```

## Available scripts

Each script follows this format `npm run {command}:{app}`, where app could be `app` or `backoffice` project.
These are the available scripts that you can run:

- `npm run install`: to install dependencies
- `npm ci`: to install dependencies with clean cache

- `npm run prettier:apps`: to run prettier for app, backoffice, and frontend projects
- `npm run prettier:functions`: to run prettier for functions folder

- `npm run build:functions`: to build firebase functions
- `npm run build:watch:functions`: to build firebase functions in watch mode
- `npm run serve:functions`: to run firebase functions
- `npm run lint:functions`: to run lint code check for firebase functions

- `npm run dev:app`: to run app project in development mode with default api url
- `npm run dev:app --mock`: to run app project in development mode with mock api url
- `npm run dev:backoffice`: to run backoffice project in development mode

- `npm run stage:app`: to run app project in stage mode
- `npm run stage:backoffice`: to run backoffice project in stage mode

- `npm run build:app`: to build app project
- `npm run build:backoffice`: to build backoffice project

- `npm run preview:app`: to run app project in production mode locally (you have to build the app before this)
- `npm run preview:backoffice`: to run backoffice project in production mode locally (you have to build the app before this)

- `npm run lint:app`: to run lint code check for app project
- `npm run lint:backoffice`: to run lint code check for backoffice project

- `npm run lint:quiet:app`: to run lint code check in quiet mode (show errors only) for app project
- `npm run lint:quiet:backoffice`: to run lint code check in quiet mode (show errors only) for backoffice project

- `npm run lint:fix:app`: to run automatically fix lint errors for app project
- `npm run lint:fix:backoffice`: to run automatically fix lint errors for backoffice project

- `npm run test:unit:app`: to run unit test for app project with code coverage
- `npm run test:unit:backoffice`: to run unit test for backoffice project with code coverage
- `npm run test:unit:frontend`: to run unit test for frontend folder with code coverage


- `npm run test:unit-dev:app`: to run unit test for app project in dev mode
- `npm run test:unit-dev:backoffice`: to run unit test for backoffice project in dev mode
- `npm run test:unit-dev:frontend`: to run unit test for frontend folder in dev mode

- `npm run test:e2e:app`: to run E2E tests for app project

- `npm run storybook`: to run storybook
