#!/usr/bin/env bash
# Initialize pulumi
set -euo pipefail

if [ ! -f "Pulumi.yaml" ]; then
    echo "[ERROR] Pulumi.yaml file not find"
    exit 1
fi

# Manual create the stack file as it is created only on the stack creation, not subsequent `pulumi stack select`
cat >"Pulumi.${PULUMI_STACK}.yaml" <<EOF
secretsprovider: $PULUMI_SECRET
config:
  gcp:project: $GCLOUD_PROJECT
  gcp:region: $GCP_REGION
EOF

pulumi login "gs://${PULUMI_STATE}"

pulumi stack select \
    --create \
    --secrets-provider "$PULUMI_SECRET" \
    --stack "${PULUMI_STACK}"
