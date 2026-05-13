#!/bin/bash
# Corre UNA sola vez antes del primer terraform apply.
# Crea el bucket de GCS para el estado de Terraform.
# Requiere: gcloud autenticado con roles/owner o roles/storage.admin

set -euo pipefail

PROJECT_ID="${1:-copper-axiom-496204-b2}"
REGION="${2:-us-central1}"
STATE_BUCKET="${PROJECT_ID}-tfstate"

echo "=== ExamLock Bootstrap ==="
echo "Proyecto: $PROJECT_ID"
echo "Bucket de estado: $STATE_BUCKET"

# Habilita APIs mínimas necesarias para el bootstrap
gcloud services enable storage.googleapis.com \
  cloudresourcemanager.googleapis.com \
  --project="$PROJECT_ID"

# Crea bucket de estado si no existe
if gsutil ls "gs://${STATE_BUCKET}" &>/dev/null; then
  echo "Bucket $STATE_BUCKET ya existe — ok"
else
  echo "Creando bucket $STATE_BUCKET…"
  gsutil mb -p "$PROJECT_ID" -l "$REGION" -b on "gs://${STATE_BUCKET}"
  gsutil versioning set on "gs://${STATE_BUCKET}"
fi

echo ""
echo "=== Listo. Ahora corre: ==="
echo "  cd infra"
echo "  cp terraform.tfvars.example terraform.tfvars"
echo "  # Edita terraform.tfvars con tu github_repo"
echo "  terraform init"
echo "  terraform apply -var='jwt_secret=TU_SECRET'"
