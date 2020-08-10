resource "null_resource" "script-jwks" {
  provisioner "local-exec" {
    command = <<EOF
ENV="${var.environment}"
MODULE_PATH=${path.module}
${file("${path.module}/create-keys.sh")}
    EOF
  }
}
