data "azurerm_client_config" "current" {}

resource "azurerm_sql_server" "instance" {
  name                         = "${var.name}-instance"
  resource_group_name          = var.resource_group_name
  location                     = var.location
  version                      = "12.0"
  administrator_login          = "scoparella_admin"
  administrator_login_password = var.database_password

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

resource "azurerm_sql_database" "database" {
  name                = "scoparella"
  resource_group_name = var.resource_group_name
  location            = var.location
  server_name         = azurerm_sql_server.instance.name
  edition             = "Free"

  tags = {
    environment = var.environment
  }
}

resource "azurerm_sql_firewall_rule" "example" {
  name                = "sql-open-to-azure"
  resource_group_name = var.resource_group_name
  server_name         = azurerm_sql_server.instance.name
  # Allow Azure services and resources to access this server
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Ensure there is an application-level login ready when the app comes up
# resource "null_resource" "setup-database" {
#   provisioner "local-exec" {
#     command = <<EOF
# ENV="${var.environment}"
# MODULE_PATH="${path.module}"
# ${file("${path.module}/setup-database.sh")}
#     EOF
#   }
# }
