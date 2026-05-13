terraform {
  required_version = ">= 1.6"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  # Remote state in GCS — bucket created by bootstrap.sh before first apply
  backend "gcs" {
    bucket = "copper-axiom-496204-b2-tfstate"
    prefix = "examlock"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}
