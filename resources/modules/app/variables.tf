variable location {}
variable name {}
variable environment {}
variable subscription_id {}
locals {
  resource_group_name = "${var.environment}-${var.name}-resource-group"
}
