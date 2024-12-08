# syntax = docker/dockerfile:1.2

# Build soundtouch separately to discard build dependencies in the final image.
FROM docker.io/python:3.10 AS soundtouch

ARG SOUNDTOUCH_VER=2.3.2

WORKDIR /root

RUN wget "https://www.surina.net/soundtouch/soundtouch-${SOUNDTOUCH_VER}.tar.gz" -O - \
    | tar xz --strip-components 1 \
 && ./bootstrap \
 && ./configure \
 && make \
 && make install

FROM docker.io/python:3.10-slim

# download.py args: do not set as ENV variable in the image, they're tied to a project.
ARG BUCKET_ASSET
ARG GOOGLE_CLOUD_PROJECT

# Allow statements and log messages to immediately appear in logs.
ENV PYTHONUNBUFFERED True

ENV APP_HOME /app
WORKDIR $APP_HOME

# Install system dependencies.
RUN apt-get update \
 && apt-get install --no-install-recommends -y \
        git \
        ffmpeg \
        libsndfile1 \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# Install CPU-only pytorch: must be kept in sync with the tests workflow's dependency step.
RUN pip3 install torch==2.0.1 --index-url https://download.pytorch.org/whl/cpu

# First, copy only requirements.txt to cache dependencies for source files changes.
COPY requirements.txt .
# Install dependencies.
RUN pip install --no-cache-dir -r requirements.txt

# Copy the download script earlier not to download models on every code change.
COPY download.py .
# Add util dependency: a change to this file would also trigger a model download.
COPY prmx/util.py prmx/util.py
# hardcode credential target in working directory: variables are not interpolated in --mount flag
RUN --mount=type=secret,id=creds,target=application_default_credentials.json \
    GOOGLE_APPLICATION_CREDENTIALS=$APP_HOME/application_default_credentials.json \
    python download.py

# Copy local code to the container image.
COPY . .

COPY --from=soundtouch /usr/local/lib/libSoundTouch* /usr/lib/
COPY --from=soundtouch /usr/local/bin/soundstretch /usr/local/bin/

# Run the web service on container startup.
# Here we use the gunicorn webserver, with 1 worker process and 1 thread.
# Timeout is set to 0 to disable worker timeouts and allow Cloud Run to handle instance scaling.
CMD exec gunicorn --bind :$PORT --workers 1 --threads 1 --timeout 0 main:app
