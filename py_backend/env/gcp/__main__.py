import pulumi_gcp as gcp
from pulumi import Config, ResourceOptions, export
from os import environ

ENV = environ["ENV"]
GCP_ARTIFACT_REPO = environ["GCP_ARTIFACT_REPO"]
GIT_BRANCH = environ["GIT_BRANCH"]
GIT_SHA_SHORT = environ["GIT_SHA_SHORT"]
NAME = f"pybackend-{GIT_SHA_SHORT}"

SECRETS = {
    "OPENAI_API_KEY": environ["OPENAI_API_KEY"],
    "INFERENCE_KEY": environ["INFERENCE_KEY"],
    "INFERENCE_CLIENT_ID": environ["INFERENCE_CLIENT_ID"],
}

OBJECT_ADMIN_BUCKETS = {
    "BUCKET_MEDIA": environ["BUCKET_MEDIA"],
}
READ_ONLY_BUCKETS = {
    "BUCKET_MUSICDB": environ["BUCKET_MUSICDB"],
    "BUCKET_SOUND": environ["BUCKET_SOUND"],
}

conf = Config("gcp")
project = conf.get("project")
location = conf.get("region")

service_account = gcp.serviceaccount.Account(
    NAME,
    account_id=NAME,
    display_name=NAME,
)

# Secrets
secret_objs = {}
secret_iam_objs = {}
for key, value in SECRETS.items():
    secret_objs[key] = secret = gcp.secretmanager.Secret(
        key,
        secret_id=f"{NAME}-{key}",
        replication=gcp.secretmanager.SecretReplicationArgs(
            auto=gcp.secretmanager.SecretReplicationAutoArgs(),
        ),
    )

    gcp.secretmanager.SecretVersion(
        key,
        secret=secret.id,
        secret_data=value,
    )

    secret_iam_objs[key] = gcp.secretmanager.SecretIamMember(
        f"{key}-accessor",
        secret_id=secret.id,
        member=service_account.member,
        role="roles/secretmanager.secretAccessor",
    )

# IAM - Artifact Registry - allow pull images
gcp.artifactregistry.RepositoryIamMember(
    "artifact-reader",
    location=location,
    repository=environ["GCP_ARTIFACT_NAME"],
    member=service_account.member,
    role="roles/artifactregistry.reader",
)

# IAM - Bucket - allow read + write
for _, bucket in OBJECT_ADMIN_BUCKETS.items():
    gcp.storage.BucketIAMMember(
        f"{bucket}-write",
        bucket=bucket,
        member=service_account.member,
        role="roles/storage.objectAdmin",
    )

# IAM - Bucket - allow read only
for _, bucket in READ_ONLY_BUCKETS.items():
    gcp.storage.BucketIAMMember(
        f"{bucket}-read",
        bucket=bucket,
        member=service_account.member,
        role="roles/storage.objectViewer",
    )

# IAM - Firestore
gcp.projects.IAMMember(
    "datastore-user",
    project=project,
    member=service_account.member,
    role="roles/datastore.user",
)

# Cloud Run Service
for profile in ["default", "mock"]:
    service_name = f"{NAME}-{profile}"
    service = gcp.cloudrunv2.Service(
        service_name,
        name=service_name,
        location=location,
        ingress="INGRESS_TRAFFIC_ALL",
        template=gcp.cloudrunv2.ServiceTemplateArgs(
            max_instance_request_concurrency=1,
            service_account=service_account.email,
            containers=[
                gcp.cloudrunv2.ServiceTemplateContainerArgs(
                    image=f"{GCP_ARTIFACT_REPO}:{GIT_SHA_SHORT}",
                    envs=[
                        gcp.cloudrunv2.ServiceTemplateContainerEnvArgs(
                            name=key,
                            value_source=gcp.cloudrunv2.ServiceTemplateContainerEnvValueSourceArgs(
                                secret_key_ref=gcp.cloudrunv2.ServiceTemplateContainerEnvValueSourceSecretKeyRefArgs(
                                    version="latest",
                                    secret=secret.id,
                                ),
                            ),
                        )
                        for key, secret in secret_objs.items()
                    ]
                    + [
                        gcp.cloudrunv2.ServiceTemplateContainerEnvArgs(
                            name=key,
                            value=value,
                        )
                        for key, value in OBJECT_ADMIN_BUCKETS.items()
                    ]
                    + [
                        gcp.cloudrunv2.ServiceTemplateContainerEnvArgs(
                            name=key,
                            value=value,
                        )
                        for key, value in READ_ONLY_BUCKETS.items()
                    ]
                    + [
                        gcp.cloudrunv2.ServiceTemplateContainerEnvArgs(
                            name="PRMX_PROFILE",
                            value=profile,
                        ),
                        gcp.cloudrunv2.ServiceTemplateContainerEnvArgs(
                            name="INFERENCE_DOMAIN",
                            value=environ["INFERENCE_DOMAIN"],
                        ),
                        gcp.cloudrunv2.ServiceTemplateContainerEnvArgs(
                            name="GOOGLE_CLOUD_PROJECT",
                            value=project,
                        ),
                        gcp.cloudrunv2.ServiceTemplateContainerEnvArgs(
                            name="PRECOMPUTE_ASSET_VER",
                            value=environ["PRECOMPUTE_ASSET_VER"],
                        ),
                        gcp.cloudrunv2.ServiceTemplateContainerEnvArgs(
                            name="PRECOMPUTE_MUSICDB_VER",
                            value=environ["PRECOMPUTE_MUSICDB_VER"],
                        ),
                        gcp.cloudrunv2.ServiceTemplateContainerEnvArgs(
                            name="PRECOMPUTE_SOUND_VER",
                            value=environ["PRECOMPUTE_SOUND_VER"],
                        ),
                        gcp.cloudrunv2.ServiceTemplateContainerEnvArgs(
                            name="PRECOMPUTE_VOICEDB_VER",
                            value=environ["PRECOMPUTE_VOICEDB_VER"],
                        ),
                    ],
                    ports=[
                        gcp.cloudrunv2.ServiceTemplateContainerPortArgs(
                            container_port=8080,
                        ),
                    ],
                    resources=gcp.cloudrunv2.ServiceTemplateContainerResourcesArgs(
                        limits={
                            "cpu": "2000m",
                            "memory": "8Gi",
                        },
                        cpu_idle=True,  # Allocate CPU only during request processing
                        startup_cpu_boost=True,
                    ),
                    startup_probe=gcp.cloudrunv2.ServiceTemplateContainerStartupProbeArgs(
                        initial_delay_seconds=0,
                        period_seconds=5,
                        timeout_seconds=1,
                        failure_threshold=3,
                        tcp_socket=gcp.cloudrunv2.ServiceTemplateContainerStartupProbeTcpSocketArgs(
                            port=8080,
                        ),
                    ),
                    # disable liveness probe for now as py_backend cannot handle concurrent requests
                    # liveness_probe=gcp.cloudrunv2.ServiceTemplateContainerLivenessProbeArgs(
                    #     initial_delay_seconds=60,
                    #     period_seconds=30,
                    #     timeout_seconds=10,
                    #     failure_threshold=5,
                    #     http_get=gcp.cloudrunv2.ServiceTemplateContainerLivenessProbeHttpGetArgs(
                    #         path="/health",
                    #         port=8080,
                    #     ),
                    # ),
                )
            ],
        ),
        # Possible workaround: sometimes Cloud Run creation starts too soon
        # and Secret roles are not yet applied to Service Account
        opts=ResourceOptions(depends_on=[s for s in secret_iam_objs.values()]),
    )

    export(f"service.{profile}.url", service.uri)

    # Cloud Run Service - make it public
    gcp.cloudrunv2.ServiceIamMember(
        service_name,
        name=service.name,
        location=service.location,
        project=service.project,
        member="allUsers",
        role="roles/run.invoker",
    )
