#!/bin/bash

# do not set u flag to allow unbound variables looking up if resources already exist
set -eo pipefail

help () { echo "
example usage: ./deploy.sh -e stage -r function  # deploy main cloud function
               ./deploy.sh -e stage -r cluster --region europe-west4 -z a,b  # europe cluster
               ./deploy.sh -e stage -r cluster --region us-central1 -z a,b  # us cluster

-e|--environment)
    gcp project alias 'stage' or 'prod'

-h|--help)
    print this help message

 -p|--pulumi-project)
    required for 'stack' resource, ignored otherwise (see -r stack below):
        pulumi project in env/pulumi folder, like 'auth', 'data', or 'infra'

-r|--resource)
    supported resource type to deploy, must be one of...
    - buckets: storage buckets
    - cluster: regional kubernetes cluster
    - key: Pulumi encryption key
    - stack: initialize a Pulumi stack for the environment in the Pulumi project, use with -p

 -s|--pulumi-stack-suffix)
    optional for 'stack' resource, ignored otherwise (see -r stack above):
        pulumi stack name suffix, only '.bis' is supported for now

--region)
    required for 'cluster' resource, ignored otherwise (see REGION below):
        strategic cloud region for GPUs
    shortlisted regions from https://cloud.google.com/compute/docs/gpus/gpu-regions-zones
    - us-central1: same region as Firebase apps & data bucket, great GPU selection in the US
    - europe-west4: the default region for GPUs in Europe

-z|--zones)
    required for 'cluster' resource, typically letters from a to f, comma separated:
        strategic datacenters for GPUs, will be appended to --region
";}

# parse flags and arguments
while (( $# )); do
    case $1 in
        -e|--environment) shift; environment=$1;;
        -h|--help) help; exit;;
        -p|--pulumi-project) shift; pulumi_project=$1;;
        -r|--resource) shift; resource=$1;;
        -s|--pulumi-stack-suffix) shift; pulumi_stack_suffix=$1;;
        --region) shift; region=$1;;
        -z|--zones) shift; zones=$1;;
        -*) echo "unknown $1 option" >&2; help; exit 1;;
    esac
    shift
done

# environment validation
active_project=`gcloud config get project`
case $environment in
    stage|prod)
        expected_project=`cat env/gcp/$environment/project-id.txt`
        if [ $active_project != $expected_project ]; then
            echo "Active GCP project $active_project does not match Paramax $environment ($expected_project)." >&2
            echo "1) look up your configurations: gcloud config configurations list"
            echo "2) activate the corresponding environment: gcloud config configurations activate CONF_NAME"
            exit 1
        fi;;
    *) echo "unknown $environment environment" >&2; help; exit 1;;
esac

# resource deployment
REGION=us-central1
case $resource in
    buckets)
        . env/gcp/deploy/buckets.sh
        deploy_buckets $REGION $active_project $environment;;

    cluster)
        # central point of control for Ingress across the project's fleet
        CONFIG_CLUSTER=prmx-us
        . env/gcp/deploy/cluster.sh
        deploy_cluster $active_project $region $zones $environment;;

    key)
        keyring=projects/$active_project/locations/global/keyRings/pulumi
        keyring_name=`gcloud kms keyrings list --location global --filter name=$keyring --format "get(name)"`
        if [ -z $keyring_name ]; then
            gcloud kms keyrings create pulumi --location global --project $active_project
        fi
        gcloud kms keys create $environment --location global --keyring pulumi --purpose=encryption
        ;;

    stack)
        pulumi login gs://prmx-$environment-pulumi
        pulumi stack select \
            --create \
            --secrets-provider gcpkms://projects/$active_project/locations/global/keyRings/pulumi/cryptoKeys/$environment \
            --cwd env/pulumi/$pulumi_project \
            ${environment}${pulumi_stack_suffix}
        ;;

    *) echo "unknown $resource resource" >&2; help; exit 1;;
esac
