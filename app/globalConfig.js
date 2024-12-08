import childProcess from "child_process";

const BACKEND_REV = "c39de0f";

const envToDefaultBackend = {
  // keys must match the ENV environment variable
  dev: `https://pybackend-${BACKEND_REV}-default-2nvkerc2uq-uc.a.run.app/`,
  prod: `https://pybackend-${BACKEND_REV}-default-6iizmm5lzq-uc.a.run.app/`,
  stage: `https://pybackend-${BACKEND_REV}-default-iti5qvlpaq-uc.a.run.app/`,
};

const envToMockBackend = {
  // keys must match the ENV environment variable
  dev: `https://pybackend-${BACKEND_REV}-mock-2nvkerc2uq-uc.a.run.app/`,
  prod: `https://pybackend-${BACKEND_REV}-mock-6iizmm5lzq-uc.a.run.app/`,
  stage: `https://pybackend-${BACKEND_REV}-mock-iti5qvlpaq-uc.a.run.app/`,
};

const getBackendURL = (mapper, defautURL) => {
  if (process.env.CI) return mapper[process.env.ENV];
  return defautURL;
};

export const defaultBackendUrl = getBackendURL(envToDefaultBackend, envToDefaultBackend["dev"]);
export const mockBackendUrl = getBackendURL(envToMockBackend, envToMockBackend["dev"]);

export const backendUrl = () => {
  if (process.env.npm_config_mock == "true") {
    return mockBackendUrl;
  }
  return defaultBackendUrl;
};

// hardcoded default values must match the Firebase/GCP project of local urls above (not CI)
export const commitHash = childProcess.execSync("git rev-parse --short=7 HEAD").toString().replace(/\n/, "");
