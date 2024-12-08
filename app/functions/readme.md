## Overview

This repository contains cloud functions for pabolo.

## Installing dependencies

1. Run `npm ci` from the functions folder.

## Debugging

1. Run `npm run build:watch` to run watch mode.
2. Run `npm run serve` to run firebase functions or `firebase emulators:start --only functions --debug` to run firebase functions in debug mode.

## Deploying

1. Run `npm run deploy` to deploy firebase functions.

## Celaning up VertexAI extension

> **IMPORTANT:** Deleting the extension does not delete the index automatically!

1. Undeploy the index endpoint:
   `gcloud ai index-endpoints undeploy-index {index-endpoint-id} --deployed-index-id ext_firestore_semantic_search_index -project={project-id} --region={region}`

Example:
`gcloud ai index-endpoints undeploy-index 4222045485822640128 --deployed-index-id ext_firestore_semantic_search_index --project paramax-9c8cf --region us-central1`

You can find the index endpoint ID in the VertexAI extension page in the console:
https://console.cloud.google.com/vertex-ai/matching-engine/index-endpoints?project={project-id}

2. Delete the index endpoint:
   `gcloud ai index-endpoints delete {index-endpoint-id} --project={project-id} --region={region}`

Example:
`gcloud ai index-endpoints delete 807894755810738176 --project=paramax-9c8cf --region=us-central1`

3. Delete the index:
   `gcloud ai indexes delete {index-id} --project={project-id} --region={region}`

You can find the index ID in the VertexAI extension page in the console:
https://console.cloud.google.com/vertex-ai/matching-engine/indexes?project={project-id}

Example:
`gcloud ai indexes delete 807894755810738176 --project=paramax-9c8cf --region=us-central1`

## Available scripts

- `npm run build` to build firebase functions.
- `npm run build:watch` to build firebase functions in watch mode.
- `npm run serve` to run firebase functions.
- `npm run shell` to run firebase functions shell.
- `npm run deploy` to deploy firebase functions.
- `npm run logs` to view firebase functions logs.
- `npm run test:unit` to run unit tests.
