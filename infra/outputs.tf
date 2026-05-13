output "server_url" {
  description = "Cloud Run server URL"
  value       = google_cloud_run_v2_service.server.uri
}

output "screenshots_bucket" {
  description = "GCS bucket for screenshots"
  value       = google_storage_bucket.screenshots.name
}

output "artifact_registry" {
  description = "Artifact Registry repository URL"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.examlock.repository_id}"
}

output "workload_identity_provider" {
  description = "Workload Identity Provider — paste into GitHub Actions secret WIF_PROVIDER"
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "github_actions_sa" {
  description = "GitHub Actions service account email — paste into GitHub Actions secret WIF_SA_EMAIL"
  value       = google_service_account.github_actions.email
}

output "server_domain" {
  description = "Custom domain (if configured)"
  value       = var.server_domain != "" ? "https://${var.server_domain}" : "(not configured — use server_url)"
}
