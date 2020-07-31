//Creates all the things we need when the app is first created, once run we never need this again........
terraform {
  backend "azurerm" {
    resource_group_name =  "preprod_terraform_resource_group"
    storage_account_name = "preprodtf"
    container_name       = "preprodinitscoparellatfstate"
    key                  = "preprodinitscoparellatf.tfstate"
  }
  required_version = "=0.12.29"
}

provider "azurerm" {
  version = "=2.20.0"
  subscription_id = local.subscription_id
  features {}
}

module "app_init" {
  source = "../modules/app_init"
  environment  = local.environment
  location = local.location
  name = local.name
  subscription_id = local.subscription_id
}

