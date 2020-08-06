# module "database" {
#   source = "../database"
#   name = "${var.environment}-${var.name}-database"
#   environment = var.environment
#   location = var.location
#   resource_group_name = local.resource_group_name
#   password_uri = "https://preprodscoparellavault.vault.azure.net/secrets/dbpassword/"
# }

module "cluster" {
  source = "../kubernetes_cluster"
  name = "${var.environment}-${var.name}-cluster"
  environment = var.environment
  location = var.location
  resource_group_name = local.resource_group_name
}

# module "pod" {
#   source = "../pod"
#   name = "${var.environment}-${var.name}-pod"
#   environment = var.environment
#   location = var.location
#   resource_group_name = local.resource_group_name
# }

module "identity-pod" {
  source = "../identity_pod"
  name = "${var.environment}-${var.name}-identity-pod"
  environment = var.environment
  location = var.location
  resource_group_name = local.resource_group_name
}
