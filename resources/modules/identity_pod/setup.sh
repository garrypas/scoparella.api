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
# IDENTITY_ASSIGNMENT_ID="$(az role assignment create --role Reader --assignee $IDENTITY_CLIENT_ID --scope /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP --query id -otsv)"
# Created this
# /subscriptions/009e0a99-8c4c-49fb-8efb-e79bdaeb58d0/resourceGroups/preprod-scoparella-resource-group/providers/Microsoft.Authorization/roleAssignments/3cc708cd-07c3-4913-b4dd-d0372f4526dc

# ERROR
# ailed to apply binding default/preprodkubepod-binding node aks-agentpool-11618058-vmss000001 for
# pod default/demo, error: failed to update identities for aks-agentpool-11618058-vmss in
# MC_preprod-scoparella-resource-group_preprod-scoparella-aks1_westeurope,
# error: compute.VirtualMachineScaleSetsClient#Update: Failure sending request:
# StatusCode=403 -- Original Error: Code="LinkedAuthorizationFailed"
# Message="The client '843c49f6-2fa0-44b9-8a13-552e011b2bd3' (agent pool identity) with object id
# '843c49f6-2fa0-44b9-8a13-552e011b2bd3' has permission to perform action
# 'Microsoft.Compute/virtualMachineScaleSets/write' on scope
# '/subscriptions/009e0a99-8c4c-49fb-8efb-e79bdaeb58d0/resourceGroups/MC_preprod-scoparella-resource-group_preprod-scoparella-aks1_westeurope/providers/Microsoft.Compute/virtualMachineScaleSets/aks-agentpool-11618058-vmss';
# however, it does not have permission to perform action 'Microsoft.ManagedIdentity/userAssignedIdentities/assign/action'
# on the linked scope(s) '/subscriptions/009e0a99-8c4c-49fb-8efb-e79bdaeb58d0/resourcegroups/preprod-scoparella-resource-group/providers/microsoft.managedidentity/userassignedidentities/preprodkubepod'
# or the linked scope(s) are invalid."

# It's looking for this: /subscriptions/009e0a99-8c4c-49fb-8efb-e79bdaeb58d0/resourcegroups/preprod-scoparella-resource-group/providers/microsoft.managedidentity/userassignedidentities/preprodkubepod

# Did this:
# az role assignment create --role Contributor --assignee <agent pool object id> --scope /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/microsoft.managedidentity/userassignedidentities/preprodkubepod --query id -otsv
# Try Managed Identity Contributor

template "azure-identity.yaml"
template "azure-identity-binding.yaml"
template "demo.yaml"


# cat << EOF | kubectl apply -f -
# apiVersion: "aadpodidentity.k8s.io/v1"
# kind: AzureIdentity
# metadata:
#   name: $IDENTITY_NAME
# spec:
#   type: 0
#   resourceID: $IDENTITY_RESOURCE_ID
#   clientID: $IDENTITY_CLIENT_ID
# EOF

# cat <<EOF | kubectl apply -f -
# apiVersion: "aadpodidentity.k8s.io/v1"
# kind: AzureIdentityBinding
# metadata:
#   name: $IDENTITY_NAME-binding
# spec:
#   azureIdentity: $IDENTITY_NAME
#   selector: $IDENTITY_NAME
# EOF

# cat << EOF | kubectl apply -f -
# apiVersion: v1
# kind: Pod
# metadata:
#   name: demo
#   labels:
#     aadpodidbinding: $IDENTITY_NAME
# spec:
#   containers:
#   - name: demo
#     image: mcr.microsoft.com/k8s/aad-pod-identity/demo:1.2
#     args:
#       - --subscriptionid=009e0a99-8c4c-49fb-8efb-e79bdaeb58d0
#       - --clientid=$IDENTITY_CLIENT_ID
#       - --resourcegroup=$RESOURCE_GROUP
#     env:
#       - name: MY_POD_NAME
#         valueFrom:
#           fieldRef:
#             fieldPath: metadata.name
#       - name: MY_POD_NAMESPACE
#         valueFrom:
#           fieldRef:
#             fieldPath: metadata.namespace
#       - name: MY_POD_IP
#         valueFrom:
#           fieldRef:
#             fieldPath: status.podIP
#   nodeSelector:
#     kubernetes.io/os: linux
# EOF
