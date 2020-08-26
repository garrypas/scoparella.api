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
  cluster                      = module.cluster.cluster
}

module "app-pod" {
  source                     = "../app_pod"
  name                       = "${var.environment}-${var.name}-apppod"
  environment                = var.environment
  location                   = var.location
  resource_group_name        = local.resource_group_name
  sql_server_port            = 1433
  user_assigned_identity_aad = module.identity-pod.user_assigned_identity_aad
  cluster                    = module.cluster.cluster
}
