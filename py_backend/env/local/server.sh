#!/bin/bash
set -euo pipefail

SCRIPT_DIR=$(dirname -- "${BASH_SOURCE[0]}")
source "${SCRIPT_DIR}/docker-run.sh"
REGION="us-central1"

echo "logging docker registry..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev"

image="${REGION}-docker.pkg.dev/${GOOGLE_CLOUD_PROJECT}/stage/py_backend:${GIT_SHA_SHORT}"
docker_run "$image" main
