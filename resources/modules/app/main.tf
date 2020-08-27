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
  aks_resource_group           = module.cluster.aks_resource_group
}
