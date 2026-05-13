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

variable "jwt_secret" {
  description = "JWT secret for container session tokens"
  type        = string
  sensitive   = true
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
