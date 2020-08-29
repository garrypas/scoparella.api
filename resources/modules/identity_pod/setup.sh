#!/bin/bash -e
if [ -z "${ENV}" ]
then
  echo "ENV environment variable not specified. Exiting..."
  exit 1
fi

function template() {
  cp $1 _$1
  envsubst < "_$1" > "$1"
  cat $1
  kubectl apply -f ./$1
  mv _$1 $1
}

export SUBSCRIPTION_ID="009e0a99-8c4c-49fb-8efb-e79bdaeb58d0"
export RESOURCE_GROUP="${ENV}-scoparella-resource-group"
export IDENTITY_NAME="${ENV}kubepod"

az aks get-credentials --overwrite-existing --resource-group "$RESOURCE_GROUP" --name "${ENV}-scoparella-aks1"

kubectl apply -f https://raw.githubusercontent.com/Azure/aad-pod-identity/master/deploy/infra/deployment.yaml
kubectl apply -f https://raw.githubusercontent.com/Azure/aad-pod-identity/master/deploy/infra/mic-exception.yaml

export IDENTITY_CLIENT_ID="$(az identity show -g $RESOURCE_GROUP -n $IDENTITY_NAME --subscription $SUBSCRIPTION_ID --query clientId -otsv)"
export IDENTITY_RESOURCE_ID="$(az identity show -g $RESOURCE_GROUP -n $IDENTITY_NAME --subscription $SUBSCRIPTION_ID --query id -otsv)"

template "azure-identity.yaml"
template "azure-identity-binding.yaml"
template "demo.yaml"
