resource "kubernetes_pod" "scoparella-api" {
  metadata {
    name = "scoparella-api"
  }

  spec {
    container {
      image = "nginx:1.7.9"
      name  = "scoparella-api"

      env {
        name  = "environment"
        value = var.environment
      }

      port {
        container_port = 8080
      }

      liveness_probe {
        http_get {
          path = "/ping"
          port = 80
        }

        initial_delay_seconds = 3
        period_seconds        = 3
      }
    }

    dns_config {
      nameservers = ["1.1.1.1", "8.8.8.8", "9.9.9.9"]

      option {
        name  = "ndots"
        value = 1
      }

      option {
        name = "use-vc"
      }
    }

    dns_policy = "None"
  }
}
