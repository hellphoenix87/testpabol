#!/usr/bin/env bash
set -euo pipefail

source .env
source .env.ci
GIT_SHA_SHORT=$(git rev-parse --short=7 HEAD)

get_key () {
    gcloud secrets versions access latest --secret=$1 --project $GOOGLE_CLOUD_PROJECT
}

# do not hardcode the path to the gcloud config directory for Windows compatibility
gcloud_config_location=`gcloud info --format='value(config. paths. global_config_dir)'`
local_credentials=$gcloud_config_location/application_default_credentials.json
# defined in Dockerfile as $APP_HOME/application_default_credentials.json
mounted_credentials=/app/application_default_credentials.json

docker_run () {
    local image=$1
    local revision=$2

    echo "starting docker container..."
    # handle multi-line json of the INFERENCE_KEY with quotes
    docker run \
        --name "py_backend-$revision" \
        --interactive \
        --tty \
        --rm \
        --volume "$local_credentials:$mounted_credentials" \
        --security-opt label=disable \
        --publish 8081:8081 \
        --env PORT=8081 \
        --env GOOGLE_APPLICATION_CREDENTIALS=$mounted_credentials \
        --env GOOGLE_CLOUD_PROJECT="$GOOGLE_CLOUD_PROJECT" \
        --env OPENAI_API_KEY="`get_key openai`" \
        --env INFERENCE_KEY="`get_key inference_key`" \
        --env INFERENCE_CLIENT_ID="`get_key inference_client_id`" \
        --env INFERENCE_DOMAIN="$INFERENCE_DOMAIN" \
        --env PRECOMPUTE_ASSET_VER="$PRECOMPUTE_ASSET_VER" \
        --env PRECOMPUTE_MUSICDB_VER="$PRECOMPUTE_MUSICDB_VER" \
        --env PRECOMPUTE_SOUND_VER="$PRECOMPUTE_SOUND_VER" \
        --env PRECOMPUTE_VOICEDB_VER="$PRECOMPUTE_VOICEDB_VER" \
        --env PRMX_PROFILE="${PRMX_PROFILE:-default}" \
        "$image"
}
