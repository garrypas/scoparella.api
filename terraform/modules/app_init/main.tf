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
