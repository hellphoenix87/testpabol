# Onboarding

## Product Intro

Here, the goal is to familiarize yourself with the product and get ready to hack. Should you encounter a bug on the way, we encourage you to solve it while pair programming with a team member.

0. Go through the first 2 sections of the main README: make sure that you can successfully install dependencies and develop with default configuration.
1. Create a user in the local app running on your laptop.
2. Log into the backoffice running on your laptop.
3. Find your user in the interface and give yourself access to the creator.
4. Go back to the app and create a movie!
5. Go back to the moderation page in the backoffice, find your movie waiting for review and accept to publish it.
6. Go back to the main app and log out: you should be able to find and watch your movie as an anonymous visitor.

If you encounter any glitch or find that the user experience is suboptimal, update the documentation or create your first issue!

## Firebase Configuration

We don't support manual configuration. Any setting required to run code is captured in a configuration file alongside the source.

### Main Firebase Settings
- See `firebase.json` and `.firebaserc` in the root folder: these files only apply when developing locally because they contain hardcoded values.
- In CI (Continous Integration), `firebase.json.ci` and `.firebaserc.ci` are used to interpolate variables based on the environment.

You should always add changes in one of these files into its `ci` version, most often when adding or upgrading a Firebase extension. Otherwise, this is a bug: your changes won't be deployed. You still need to be able to hack around locally. That's why we need to maintain two versions of the same config.

### Extensions
See the `extensions` folder. Each extension is configured by a dedicated `.env` file. It is usually first generated interactively with a command similar to `firebase ext:install googlecloud/my-extension`. If you already know the key and the value to configure, you can also directly update these files.

## Py_backend

`py_backend` is an internal middleware used to interface between the app and AI models. They are a few tips and tricks you need to be aware of for a smooth ride with this powerful API.

- The `app` is at the top of the dependency chain: it defines which version of `py_backend` it requires in `app/globalConfig.cjg`. The `BACKEND_REV` variable sets the reference `py_backend` commit hash (7 characters). This commit tells which code will run when the app calls `py_backend`.
- The main README already mentions the `--mock` URL. This endpoint does not call generative APIs but forward mock results. Note that this mode relies on a specific set of movie attributes defined in `py_backend/prmx/context.py/MOCK_CONFIG` (the compatible version of this source file is defined by the `py_backend` commit hash set by `BACKEND_REV` variable in `app/globalConfig.cjg`). Selecting any other set of attributes in mock mode will return a 500 error.

## Debugging Logs
All backend errors triggered by the app can be found in GCP logs: select the dev project and navigate to the Cloud Run service defined by `BACKEND_REV` for `py_backend` or to the Cloud Function failing in your browser console.

Note that E2E tests run Cloud Functions in the emulator, their traces are directly available in CI logs.

## Firestore
To interact with firestore, we must use the functions from `/functions/src/utils/creationRepository.ts`, the functions can handle creating nested documents too.
Example: `setScenesData` takes a scene object and if the object has shots it will create the nested shots documents.
You can pass the keys that you want to update, don't update the keys that you don't need to update.
