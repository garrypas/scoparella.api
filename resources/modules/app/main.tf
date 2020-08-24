module "cluster" {
  source              = "../kubernetes_cluster"
  name                = "${var.environment}-${var.name}-cluster"
  environment         = var.environment
  location            = var.location
  resource_group_name = local.resource_group_name
}

module "identity-pod" {
  source                       = "../identity_pod"
  name                         = "${var.environment}-${var.name}-identity-pod"
  environment                  = var.environment
  location                     = var.location
  resource_group_name          = local.resource_group_name
  aks_node_resource_group_name = module.cluster.aks_node_resource_group_name
  agentpool_id                 = module.cluster.agentpool_id
}

module "app-pod" {
  source              = "../app_pod"
  name                = "${var.environment}-${var.name}-apppod"
  environment         = var.environment
  location            = var.location
  resource_group_name = local.resource_group_name
  sql_server_port     = 1433
  cluster             = module.cluster.cluster
}
