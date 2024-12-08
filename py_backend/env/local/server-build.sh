#!/bin/bash
set -euo pipefail

SCRIPT_DIR=$(dirname -- "${BASH_SOURCE[0]}")
source "${SCRIPT_DIR}/docker-run.sh"

docker build -t "py_backend:$GIT_SHA_SHORT" \
    --secret "id=creds,src=$local_credentials" \
    --build-arg "GOOGLE_CLOUD_PROJECT=$GOOGLE_CLOUD_PROJECT" \
    --build-arg "BUCKET_ASSET=$BUCKET_ASSET" \
    .

# args: image, revision appended to container name
docker_run "py_backend:$GIT_SHA_SHORT" "$GIT_SHA_SHORT"
