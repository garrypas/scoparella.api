data "azurerm_key_vault" "keyvault" {
  name                = "${var.environment}scoparellavault"
  resource_group_name = var.resource_group_name
}

data "azurerm_client_config" "current" {}

resource "azurerm_kubernetes_cluster" "scoparella-kube" {
  name                = "scoparella-aks1"
  location            = var.location
  resource_group_name = var.resource_group_name
  dns_prefix          = "scoparellaaks1"

  default_node_pool {
    name       = "agentpool"
    node_count = 1
    vm_size    = "Standard_B2s"
  }

  identity {
    type = "SystemAssigned"
  }

  lifecycle {
    prevent_destroy = false
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

resource "azurerm_key_vault_access_policy" "aks1-agentpool" {
  key_vault_id = data.azurerm_key_vault.keyvault.id

  tenant_id = data.azurerm_client_config.current.tenant_id
  object_id = azurerm_kubernetes_cluster.scoparella-kube.kubelet_identity[0].object_id

  secret_permissions = [
    "get", "list"
  ]
}