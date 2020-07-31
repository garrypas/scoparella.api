# data "azurerm_resource_group" "resource_group" {
#   name     = var.name
#   location = var.location
# }

module "database" {
  source = "../database"
  name = "${var.environment}-${var.name}-database"
  environment = var.environment
  location = var.location
  resource_group_name = local.resource_group_name
  password_uri = "https://preprodscoparellavault.vault.azure.net/secrets/dbpassword/"
}

# module "vault" {
#   source = "../vault"
#   name = "${var.environment}-${var.name}-vault"
#   environment = var.environment
#   location = var.location
#   resource_group_name = module.resource_group.name
# }

module "registry" {
  source = "../container_registry"
  name = "${var.environment}-${var.name}-registry"
  environment = var.environment
  location = var.location
  resource_group_name = local.resource_group_name
}

# module "cluster" {
#   source = "../kubernetes_cluster"
#   name = "${var.environment}-${var.name}-cluster"
#   environment = var.environment
#   location = var.location
#   resource_group_name = module.resource_group.name
# }

# module "pod" {
#   source = "../pod"
#   name = "${var.environment}-${var.name}-pod"
#   environment = var.environment
#   location = var.location
#   resource_group_name = module.resource_group.name
# }
