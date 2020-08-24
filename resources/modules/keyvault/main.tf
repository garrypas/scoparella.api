provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy = true
    }
  }
}

data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "keyvault" {
  name                        = var.name
  location                    = var.location
  resource_group_name         = var.resource_group_name
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  soft_delete_enabled         = false
  purge_protection_enabled    = false

  sku_name = "standard"

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    key_permissions = [
      "get", "list", "update", "delete", "create"
    ]

    secret_permissions = [
      "get", "list", "set", "delete"
    ]

    storage_permissions = [
      "get"
    ]
  }

  tags = {
    environment = var.environment
  }
}

resource "azurerm_key_vault_secret" "database_password" {
  name         = "dbpassword"
  value        = random_password.database_password.result
  key_vault_id = azurerm_key_vault.keyvault.id

  tags = {
    environment = var.environment
  }
}

resource "azurerm_key_vault_secret" "database_app_password" {
  name         = "dbapppassword"
  value        = random_password.database_app_password.result
  key_vault_id = azurerm_key_vault.keyvault.id

  tags = {
    environment = var.environment
  }
}

resource "random_password" "database_password" {
  length           = 12
  special          = true
  override_special = "_%@"
}

resource "random_password" "database_app_password" {
  length           = 12
  special          = true
  override_special = "_%@"
}

resource "azurerm_key_vault_secret" "pubkey" {
  name         = "public-key"
  value        = ""
  key_vault_id = azurerm_key_vault.keyvault.id

  tags = {
    environment = var.environment
  }
}

resource "azurerm_key_vault_secret" "privkey" {
  name         = "private-key"
  value        = ""
  key_vault_id = azurerm_key_vault.keyvault.id

  tags = {
    environment = var.environment
  }
}

resource "azurerm_key_vault_secret" "authgoog" {
  name         = "google-client-id"
  value        = ""
  key_vault_id = azurerm_key_vault.keyvault.id

  tags = {
    environment = var.environment
  }
}

resource "azurerm_key_vault_secret" "authfb" {
  name         = "facebook-client-id"
  value        = ""
  key_vault_id = azurerm_key_vault.keyvault.id

  tags = {
    environment = var.environment
  }
}

output "database_password" {
  value = random_password.database_password.result
}
