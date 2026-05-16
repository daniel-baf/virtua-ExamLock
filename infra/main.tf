# ── Import existing resources (Terraform 1.5+) ───────────────────────────────
# Si Firestore ya existe en el proyecto, este bloque lo adopta sin recrearlo.

import {
  id = "projects/copper-axiom-496204-b2/databases/(default)"
  to = google_firestore_database.default
}

import {
  id = "projects/copper-axiom-496204-b2/locations/global/workloadIdentityPools/github-pool/providers/github-provider"
  to = google_iam_workload_identity_pool_provider.github
}

import {
  id = "projects/copper-axiom-496204-b2/locations/us-central1/triggers/36bb99b7-5301-4467-8352-74b1b0ce3d11"
  to = google_cloudbuild_trigger.deploy_dev
}

import {
  id = "us-central1/copper-axiom-496204-b2/exam-server"
  to = google_cloud_run_service.server
}

import {
  id = "projects/copper-axiom-496204-b2/locations/global/workloadIdentityPools/github-pool"
  to = google_iam_workload_identity_pool.github
}

# ── APIs ─────────────────────────────────────────────────────────────────────

resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "firestore.googleapis.com",
    "storage.googleapis.com",
    "artifactregistry.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudbuild.googleapis.com",
    "domains.googleapis.com",
  ])
  service            = each.key
  disable_on_destroy = false
}

# ── Artifact Registry ─────────────────────────────────────────────────────────

resource "google_artifact_registry_repository" "examlock" {
  repository_id = "examlock"
  location      = var.region
  format        = "DOCKER"
  description   = "ExamLock Docker images"

  depends_on = [google_project_service.apis]
}

# ── Cloud Storage (screenshots + cámara) ─────────────────────────────────────

resource "google_storage_bucket" "screenshots" {
  name                        = "${var.project_id}-examlock-screenshots"
  location                    = "US"
  force_destroy               = false
  uniform_bucket_level_access = true

  lifecycle_rule {
    action { type = "Delete" }
    condition { age = 90 }  # borra screenshots después de 90 días
  }

  cors {
    origin          = split(",", var.cors_origins)
    method          = ["GET"]
    response_header = ["Content-Type"]
    max_age_seconds = 3600
  }

  depends_on = [google_project_service.apis]
}

# Permite lectura pública (URLs de screenshots sirven directo al dashboard)
resource "google_storage_bucket_iam_member" "screenshots_public" {
  count  = var.public_access ? 1 : 0
  bucket = google_storage_bucket.screenshots.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# ── Firestore (se importa si ya existe, se crea si no) ───────────────────────

resource "google_firestore_database" "default" {
  name        = "(default)"
  location_id = "nam5"
  type        = "FIRESTORE_NATIVE"

  depends_on = [google_project_service.apis]

  lifecycle {
    prevent_destroy = true
    # Ignora location_id en imports — Firestore existente puede tener region distinta
    ignore_changes = [location_id]
  }
}

# ── Service Account para Cloud Run ───────────────────────────────────────────

resource "google_service_account" "server" {
  account_id   = "examlock-server"
  display_name = "ExamLock Server (Cloud Run)"
}

resource "google_project_iam_member" "server_firestore" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.server.email}"
}

resource "google_project_iam_member" "server_storage" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.server.email}"
}

resource "google_project_iam_member" "server_firebase_admin" {
  project = var.project_id
  role    = "roles/firebase.admin"
  member  = "serviceAccount:${google_service_account.server.email}"
}

# ── Cloud Run: servidor (API v1 para soporte de invoker-iam-disabled) ─────────

resource "google_cloud_run_service" "server" {
  name     = "exam-server"
  location = var.region

  metadata {
    annotations = {
      "run.googleapis.com/ingress"              = "all"
      "run.googleapis.com/invoker-iam-disabled" = "true"
    }
  }

  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "0"
        "autoscaling.knative.dev/maxScale" = "2"
      }
    }

    spec {
      service_account_name = google_service_account.server.email

      containers {
        image = var.server_image

        ports {
          container_port = 8080
        }

        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }

        env {
          name  = "NODE_ENV"
          value = "production"
        }
        env {
          name  = "GCP_PROJECT_ID"
          value = var.project_id
        }
        env {
          name  = "GCS_BUCKET"
          value = google_storage_bucket.screenshots.name
        }
        env {
          name  = "CORS_ORIGINS"
          value = var.cors_origins
        }
      }
    }
  }

  depends_on = [google_project_service.apis]

  lifecycle {
    ignore_changes = [
      template[0].spec[0].containers[0].image,
      metadata[0].annotations["client.knative.dev/user-image"],
      metadata[0].annotations["run.googleapis.com/client-name"],
      metadata[0].annotations["run.googleapis.com/client-version"],
      metadata[0].annotations["run.googleapis.com/operation-id"],
      metadata[0].annotations["run.googleapis.com/urls"],
      template[0].metadata[0].annotations["client.knative.dev/user-image"],
      template[0].metadata[0].annotations["run.googleapis.com/client-name"],
      template[0].metadata[0].annotations["run.googleapis.com/client-version"],
    ]
  }
}

# ── Cloud Run: dashboard ──────────────────────────────────────────────────────

resource "google_cloud_run_service" "dashboard" {
  name     = "exam-dashboard"
  location = var.region

  metadata {
    annotations = {
      "run.googleapis.com/ingress"              = "all"
      "run.googleapis.com/invoker-iam-disabled" = "true"
    }
  }

  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "0"
        "autoscaling.knative.dev/maxScale" = "3"
      }
    }

    spec {
      containers {
        image = var.dashboard_image

        ports {
          container_port = 8080
        }

        resources {
          limits = {
            cpu    = "1000m"
            memory = "256Mi"
          }
        }
      }
    }
  }

  depends_on = [google_project_service.apis]

  lifecycle {
    ignore_changes = [
      template[0].spec[0].containers[0].image,
      metadata[0].annotations["client.knative.dev/user-image"],
      metadata[0].annotations["run.googleapis.com/client-name"],
      metadata[0].annotations["run.googleapis.com/client-version"],
      metadata[0].annotations["run.googleapis.com/operation-id"],
      metadata[0].annotations["run.googleapis.com/urls"],
      template[0].metadata[0].annotations["client.knative.dev/user-image"],
      template[0].metadata[0].annotations["run.googleapis.com/client-name"],
      template[0].metadata[0].annotations["run.googleapis.com/client-version"],
    ]
  }
}

# ── Workload Identity Federation (GitHub Actions sin JSON keys) ───────────────

resource "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = "github-pool"
  display_name              = "GitHub Actions Pool"
  depends_on                = [google_project_service.apis]
}

resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider"
  display_name                       = "GitHub OIDC"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
  }

  attribute_condition = "assertion.repository == '${var.github_repo}'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

# Service Account para GitHub Actions CI/CD
resource "google_service_account" "github_actions" {
  account_id   = "examlock-github-actions"
  display_name = "ExamLock GitHub Actions"
}

resource "google_service_account_iam_member" "github_wi_binding" {
  service_account_id = google_service_account.github_actions.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_repo}"
}

# Permisos del SA de GitHub Actions
locals {
  github_sa_roles = [
    "roles/run.admin",
    "roles/artifactregistry.writer",
    "roles/storage.admin",
    "roles/iam.serviceAccountUser",
    "roles/firebase.admin",
    "roles/logging.logWriter",
  ]
}

resource "google_project_iam_member" "github_sa_roles" {
  for_each = toset(local.github_sa_roles)
  project  = var.project_id
  role     = each.key
  member   = "serviceAccount:${google_service_account.github_actions.email}"
}

# ── Cloud Build trigger — push to deploy/dev ─────────────────────────────────
# Prerequisito: conectar el repo GitHub en la consola:
#   Cloud Build → Repositories → Connect repository → GitHub → elegir repo
# Una vez conectado, el trigger se gestiona desde aquí.

resource "google_cloudbuild_trigger" "deploy_dev" {
  name        = "deploy-exam-lock"
  description = "Build y deploy de server + dashboard al push en deploy/dev"
  location    = var.region

  github {
    owner = var.github_owner
    name  = var.github_repo_name
    push {
      branch = "^deploy/dev$"
    }
  }

  filename = "cloudbuild.yaml"

  substitutions = {
    _REGION                         = var.region
    _SERVER_URL                     = google_cloud_run_service.server.status[0].url
    _VITE_FIREBASE_API_KEY          = var.firebase_api_key
    _VITE_FIREBASE_AUTH_DOMAIN      = var.firebase_auth_domain
    _VITE_FIREBASE_PROJECT_ID       = var.project_id
    _VITE_FIREBASE_STORAGE_BUCKET   = "${var.project_id}.appspot.com"
    _VITE_FIREBASE_MESSAGING_SENDER_ID = var.firebase_messaging_sender_id
    _VITE_FIREBASE_APP_ID           = var.firebase_app_id
  }

  service_account = "projects/${var.project_id}/serviceAccounts/${google_service_account.github_actions.email}"

  depends_on = [google_project_service.apis]
}

# ── Custom domain mapping (Cloud Run v1 domain mapping) ───────────────────────
# Requires domain ownership verified in Google Search Console first.
# After apply, point your DNS CNAME/A to the value shown in `terraform output server_domain_target`.

resource "google_cloud_run_domain_mapping" "server" {
  count    = var.server_domain != "" ? 1 : 0
  location = var.region
  name     = var.server_domain

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = google_cloud_run_service.server.name
  }

  depends_on = [google_cloud_run_service.server]
}
