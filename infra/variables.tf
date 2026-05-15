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
  description = "Full image URL for the exam server"
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}

variable "dashboard_image" {
  description = "Full image URL for the dashboard"
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
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

variable "github_owner" {
  description = "GitHub org or user (e.g. 'vantumst')"
  type        = string
  default     = ""
}

variable "github_repo_name" {
  description = "GitHub repo name only (e.g. 'ExamLock')"
  type        = string
  default     = "ExamLock"
}

variable "firebase_api_key" {
  description = "Firebase web API key (public)"
  type        = string
  default     = ""
}

variable "firebase_auth_domain" {
  description = "Firebase auth domain"
  type        = string
  default     = ""
}

variable "firebase_messaging_sender_id" {
  description = "Firebase messaging sender ID"
  type        = string
  default     = ""
}

variable "firebase_app_id" {
  description = "Firebase app ID"
  type        = string
  default     = ""
}

variable "public_access" {
  description = "Allow allUsers on Cloud Run + GCS. Set false if org policy blocks it (university/corporate GCP orgs)."
  type        = bool
  default     = true
}
