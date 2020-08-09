#!/bin/bash

# Sets up the terraform back end

rg_exists="$(az group exists --name preprod_terraform_resource_group)"
if [[ "$rg_exists" == "false" ]]; then
  echo "Creating resource group 'preprod_terraform_resource_group'"
  az group create \
    --location "West Europe" \
    --name preprod_terraform_resource_group \
    --subscription 009e0a99-8c4c-49fb-8efb-e79bdaeb58d0
fi

sa_exists="$(az storage account show --name preprodtf)"
if [[ "$sa_exists" == "$x" ]]; then
  echo "Creating storage account for terraform'"
  az storage account create \
    --location "West Europe" \
    --name preprodtf \
    --subscription 009e0a99-8c4c-49fb-8efb-e79bdaeb58d0 \
    --resource-group preprod_terraform_resource_group
fi

sc_exists="$(az storage container exists --name preprodscoparellatfstate --account-name preprodtf -o tsv)"
if [[ "$sc_exists" == "False" ]]; then
  echo "Creating storage container for terraform storage account preprodtf"
  az storage container create \
    --name preprodscoparellatfstate \
    --account-name preprodtf
fi

sci_exists="$(az storage container exists --name preprodinitscoparellatfstate --account-name preprodtf -o tsv)"
if [[ "$sci_exists" == "False" ]]; then
  echo "Creating storage container for terraform storage account preprodtf"
  az storage container create \
    --name preprodinitscoparellatfstate \
    --account-name preprodtf
fi
