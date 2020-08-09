resource "azurerm_container_registry" "acr" {
  name                     = "${var.environment}scoparellaacr"
  resource_group_name      = var.resource_group_name
  location                 = var.location
  sku                      = "Basic"
  admin_enabled            = false
  tags = {
    environment = var.environment
  }
  lifecycle {
    prevent_destroy = true
  }
}

output "name" {
  value = azurerm_container_registry.acr.name
}
