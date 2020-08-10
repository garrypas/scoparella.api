resource "null_resource" "script-jwks" {
  provisioner "local-exec" {
    command = <<EOF
ENV="${var.environment}" bash create-keys.sh
    EOF
  }
}
