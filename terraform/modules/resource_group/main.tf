data "azurerm_subscription" "current" {}

resource "azurerm_resource_group" "resource_group" {
  name     = var.name
  location = var.location

  tags = {
    environment = var.environment
  }
}

output "name" {
  value = azurerm_resource_group.resource_group.name
}
