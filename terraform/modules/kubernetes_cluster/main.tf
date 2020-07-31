resource "azurerm_kubernetes_cluster" "scoparella-kube" {
  name                = "scoparella-aks1"
  location            = var.location
  resource_group_name = var.resource_group_name
  dns_prefix          = "scoparellaaks1"

  default_node_pool {
    name       = "agentpool"
    node_count = 2
    vm_size    = "Standard_B2s"
  }

  identity {
    type = "SystemAssigned"
  }

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    environment = var.environment
  }
}

output "client_certificate" {
  value = azurerm_kubernetes_cluster.scoparella-kube.kube_config.0.client_certificate
}

output "kube_config" {
  value = azurerm_kubernetes_cluster.scoparella-kube.kube_config_raw
}
