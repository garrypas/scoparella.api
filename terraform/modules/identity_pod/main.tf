// Main pods depend on this having happened.
data "azurerm_subscription" "current" {}

resource "null_resource" "identity-pod-deploy" {
  provisioner "local-exec" {
    command = <<EOF
      kubectl apply -f https://raw.githubusercontent.com/Azure/aad-pod-identity/master/deploy/infra/deployment.yaml
      kubectl apply -f https://raw.githubusercontent.com/Azure/aad-pod-identity/master/deploy/infra/mic-exception.yaml
    EOF
  }
}

resource "azurerm_user_assigned_identity" "preprodkubepod" {
  resource_group_name = var.resource_group_name
  location            = var.location
  name                = "preprodkubepod"
  depends_on          = [null_resource.identity-pod-deploy]
}

resource "azurerm_role_assignment" "preprodkubepod" {
  name                 = "3CC708CD-07C3-4913-B4DD-D0372F4526DC"
  principal_id         = azurerm_user_assigned_identity.preprodkubepod.principal_id
  role_definition_name = "Reader"
  scope                = data.azurerm_subscription.current.id
}

resource "null_resource" "identity-pod-add-identity" {
  depends_on = [azurerm_user_assigned_identity.preprodkubepod]
  provisioner "local-exec" {
    command = <<EOF
cat << ${local.eof} | kubectl apply -f -
apiVersion: "aadpodidentity.k8s.io/v1"
kind: AzureIdentity
metadata:
  name: ${azurerm_user_assigned_identity.preprodkubepod.name}
spec:
  type: 0
  resourceID: ${azurerm_user_assigned_identity.preprodkubepod.id}
  clientID: ${azurerm_user_assigned_identity.preprodkubepod.client_id}
${local.eof}
    EOF
  }
}

resource "null_resource" "identity-pod-bind-identity" {
  depends_on = [null_resource.identity-pod-add-identity]
  provisioner "local-exec" {
    command = <<EOF
cat << ${local.eof} | kubectl apply -f -
apiVersion: "aadpodidentity.k8s.io/v1"
kind: AzureIdentityBinding
metadata:
  name: ${azurerm_user_assigned_identity.preprodkubepod.name}-binding
spec:
  azureIdentity: ${azurerm_user_assigned_identity.preprodkubepod.name}
  selector: ${azurerm_user_assigned_identity.preprodkubepod.name}
${local.eof}
    EOF
  }
}
