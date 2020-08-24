// Main pods depend on this having happened.
data "azurerm_subscription" "current" {}
data "azurerm_client_config" "current" {}

resource "azurerm_user_assigned_identity" "preprodkubepod" {
  resource_group_name = var.resource_group_name
  location            = var.location
  name                = "preprodkubepod"
}

data "azurerm_key_vault" "keyvault" {
  name                = "${var.environment}scoparellavault"
  resource_group_name = var.resource_group_name
}

resource "azurerm_key_vault_access_policy" "identity-pod" {
  key_vault_id = data.azurerm_key_vault.keyvault.id

  tenant_id = data.azurerm_client_config.current.tenant_id
  object_id = azurerm_user_assigned_identity.preprodkubepod.principal_id

  key_permissions = [
    "get", "list"
  ]

  secret_permissions = [
    "get", "list"
  ]
}

resource "azurerm_role_assignment" "preprodkubepod" {
  name                 = var.environment == "preprod" ? "3cc708cd-07c3-4913-b4dd-d0372f4526dc" : "4dd819de-18d4-5a24-c5ee-e148305637ed"
  principal_id         = azurerm_user_assigned_identity.preprodkubepod.principal_id
  role_definition_name = "Reader"
  scope                = "${data.azurerm_subscription.current.id}/resourceGroups/${var.resource_group_name}"
}

# The agent pool needs this access in order to write to the underlying nodes, auto-generated resource group referenced
resource "azurerm_role_assignment" "agentpool" {
  name                 = var.environment == "preprod" ? "0662f0f5-5c93-47cc-bacc-2f7d49f5fbb0" : "2b06db48-df00-4f64-b492-0b44109666fd"
  principal_id         = var.agentpool_id
  role_definition_name = "Virtual Machine Contributor"
  scope                = "${data.azurerm_subscription.current.id}/resourceGroups/${var.resource_group_name}"
}

resource "null_resource" "aad-pod-identity" {
  depends_on = [
    azurerm_role_assignment.preprodkubepod,
    var.agentpool_id
  ]
  provisioner "local-exec" {
    command = <<EOF
    ENV="${var.environment}" bash ${path.module}/setup.sh
  EOF
  }
}
