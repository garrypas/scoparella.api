module "resource_group" {
  source      = "../resource_group"
  name        = "${var.environment}-${var.name}-resource-group"
  environment = var.environment
  location    = var.location
}

module "vault" {
  source              = "../keyvault"
  name                = "${var.environment}${var.name}vault"
  environment         = var.environment
  location            = var.location
  resource_group_name = module.resource_group.name
}

module "database" {
  source              = "../database"
  name                = "${var.environment}-${var.name}-database"
  environment         = var.environment
  location            = var.location
  resource_group_name = module.resource_group.name
  database_password   = module.vault.database_password
}

module "jwks" {
  source      = "../jwks"
  environment = var.environment
}
