variable "project_id" {
  description = "GCP project ID"
  type        = string
  default     = "copper-axiom-496204-b2"
}

variable "region" {
  description = "GCP region for Cloud Run and Artifact Registry"
  type        = string
  default     = "us-central1"
}

variable "server_image" {
  description = "Full image URL for the exam server (e.g. us-central1-docker.pkg.dev/PROJECT/examlock/server:SHA)"
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"  # placeholder for first terraform apply
}

variable "server_domain" {
  description = "Custom domain for Cloud Run server (e.g. exam.tuuniversidad.com). Leave empty to use auto URL."
  type        = string
  default     = ""
}

variable "cors_origins" {
  description = "Allowed CORS origins (comma-separated)"
  type        = string
  default     = "https://copper-axiom-496204-b2.web.app"
}

variable "github_repo" {
  description = "GitHub repo in 'owner/repo' format — used for Workload Identity"
  type        = string
  default     = "your-org/examlock"
}

variable "public_access" {
  description = "Allow allUsers on Cloud Run + GCS. Set false if org policy blocks it (university/corporate GCP orgs)."
  type        = bool
  default     = true
}
