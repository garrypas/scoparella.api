resource "kubernetes_pod" "scoparella-api" {
  metadata {
    name = "scoparella-api"
    labels = {
      "group" = "app"
    }
  }

  spec {
    container {
      image = "garrypassarella/scoparella:tagname"
      name  = "scoparella-api"

      env {
        name  = "environment"
        value = var.environment
      }

      env {
        name  = "DB_HOST"
        value = var.sql_server_host
      }

      env {
        name  = "DB_PORT"
        value = var.sql_server_port
      }

      port {
        container_port = 3000
      }

      liveness_probe {
        http_get {
          path = "/ping"
          port = 3000
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

resource "kubernetes_service" "scoparella-api-lb" {
  metadata {
    name = "scoparella-api-service"
  }
  spec {
    selector = {
      app = kubernetes_pod.scoparella-api.metadata.0.labels.group
    }
    port {
      port        = 80
      target_port = 80
    }

    type = "LoadBalancer"
  }
}
