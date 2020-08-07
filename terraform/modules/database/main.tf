data "azurerm_key_vault" "keyvault" {
  name                = "${var.environment}scoparellavault"
  resource_group_name = var.resource_group_name
}

data "azurerm_client_config" "current" {}

data "azurerm_key_vault_secret" "database_password" {
  name         = "dbpassword"
  key_vault_id = data.azurerm_key_vault.keyvault.id
}

resource "azurerm_sql_server" "instance" {
  name                         = "${var.name}-instance"
  resource_group_name          = var.resource_group_name
  location                     = var.location
  version                      = "12.0"
  administrator_login          = "scoparella"
  administrator_login_password = data.azurerm_key_vault_secret.database_password.value

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    environment = var.environment
  }
}

# resource "azurerm_storage_account" "account" {
#   name                     = "${var.environment}dbacc"
#   resource_group_name      = var.resource_group_name
#   location                 = var.location
#   account_tier             = ""
#   account_replication_type = "LRS"

#   tags = {
#     environment = var.environment
#   }
# }

resource "azurerm_sql_database" "config" {
  name                = "${var.name}-config"
  resource_group_name = var.resource_group_name
  location            = var.location
  server_name         = azurerm_sql_server.instance.name

  tags = {
    environment = var.environment
  }
}

output "db_host" {
  value = azurerm_sql_server.instance.fully_qualified_domain_name
}
