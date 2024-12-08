# py_backend

Middleware between [app](https://github.com/ParamaxAi/app) and inference servers.

## [Precomputed data](./docs/precompute.md)

## Local Setup

_Prerequisites_:

1. install [gcloud CLI](https://cloud.google.com/sdk/docs/install)
2. `gcloud auth login` to identify your personal account
3. `gcloud auth application-default login` to authorize applications
4. install `git lfs` to handle committed artifacts

## Develop & Test

By default, we develop in a Python virtual environment outside Docker. Direct access to the host and artifacts ease debugging.

1. Ensure that your installed Python version is at least the version specified at the top of `Dockerfile`.
2. Create a Python virtual environment. In VS Code, we recommend this quick start:
   - Open the Command Palette: Shift + Command + P (Mac) / Ctrl + Shift + P (Windows/Linux).
   - Click "Python: Create Environmnent" -> "Venv" -> "py_backend".
   - Select a Python interpreter as specified in `Dockerfile`.
   - Select "requirements.txt" (and "requirements-dev.txt" for running pytest locally) as dependencies to install.
      - Alongside, run inside .venv `pip3 install torch==2.0.1 --index-url https://download.pytorch.org/whl/cpu`
3. Load the virtual environment, `source .venv/bin/activate` or `source .venv/Scripts/activate` on Windows. If your terminal prompt starts with `(.venv)`, it is already activated.
4. To run local tests outside VS Code or local python scripts, export the environment variables in `.env`:

    ```bash
    set -a; source .env; set +a
    ```

5. Install external dependencies:
   - **ffmpeg** following pydub [README](https://github.com/jiaaro/pydub#getting-ffmpeg-set-up) instructions;
   - download models served locally: `python download.py`.
   - install pitch-shifting library `SoundTouch` by running `./scripts/soundtouch-local-install.sh`
      - note that you need GNU C compiler (gcc - Linux, MacOS) or Visual C++ (Windows)

> Test discovery will fail in VS Code if there is a need to update application credentials with `gcloud auth application-default login`, as documented at the top of the README.

### Test Assets

To regenerate test assets, run the `test_regenerate_test_assets()` function in [api_test](test/api_test.py):

- via the "Testing" pane in Visual Studio Code
- or run `pytest test/api_test.py::Test_TestApi::test_regenerate_test_assets`

To ensure that tests are still passing, run [web_test](test/web_test.py):

```bash
pytest test/web_test.py
```

## Server

Run the server in Docker to emulate the behavior of `py_backend` locally.

It is often used in combination with the frontend emulator to develop in the `app` repo.

1. Install and start [Docker Desktop](https://docs.docker.com/desktop) if it isn't already running.
2. Checkout a `py_backend` commit: `git pull` for the latest.
3. Start the local development server:
   - **Use prebuild image**: run `./env/local/server.sh` or `PRMX_PROFILE=mock ./env/local/server.sh` to replace calls to external apis with mock assets.
   - **Build a new image locally**: run `./env/local/server-build.sh` or `PRMX_PROFILE=mock ./env/local/server-build.sh` to replace calls to external apis with mock assets.

<ins>Note</ins>
If you are on Windows, keep in mind that this script should run in a Bash shell.
