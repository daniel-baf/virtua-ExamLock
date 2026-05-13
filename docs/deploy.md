# ExamLock — Guía de Deploy

## Primera vez (setup manual, una sola vez)

### 1. Bootstrap: bucket de estado de Terraform

```bash
bash infra/bootstrap.sh copper-axiom-496204-b2
```

### 2. Primer apply local (crea la infraestructura)

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
# Edita terraform.tfvars: pon tu github_repo (owner/nombre-repo)

gcloud auth application-default login
terraform init
terraform apply -var="jwt_secret=$(openssl rand -hex 32)"
```

Guarda los outputs — los necesitas para GitHub Secrets:

```
workload_identity_provider  → WIF_PROVIDER
github_actions_sa            → WIF_SA_EMAIL
```

### 3. Importar Firestore (si ya existe en el proyecto)

```bash
terraform import google_firestore_database.default \
  "projects/copper-axiom-496204-b2/databases/(default)"
```

### 4. Configurar GitHub Secrets

En tu repo: **Settings → Secrets → Actions → New repository secret**

| Secret | Valor |
|--------|-------|
| `WIF_PROVIDER` | output de `terraform output workload_identity_provider` |
| `WIF_SA_EMAIL` | output de `terraform output github_actions_sa` |
| `JWT_SECRET` | el mismo valor que usaste en `terraform apply` |
| `VITE_FIREBASE_API_KEY` | `AIzaSyCUyT-GKhhil9yo4pchrbpOcIzNKhzlC44` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `428536852281` |
| `VITE_FIREBASE_APP_ID` | `1:428536852281:web:d50ffc44519a80d86c42e8` |

> Firebase y GCP son el mismo proyecto (`copper-axiom-496204-b2`). El WIF service account tiene `roles/firebase.admin` — no necesitas un service account JSON separado para Firebase Hosting.

### 5. Primer push

```bash
git add .
git commit -m "init: ExamLock full stack"
git push origin main
```

El workflow detecta todos los cambios y despliega todo.

---

## Flujo continuo (deploys automáticos)

```mermaid
flowchart TD
    PUSH["Push a deploy/dev\n(Cloud Build trigger)"]

    PUSH --> BS["build-server\ndocker build ./server"]
    PUSH --> BD["build-dashboard\ndocker build ./dashboard\n(VITE_* bakeadas)"]

    BS --> PS["push → Artifact Registry\nexamlock/server:SHA + :latest"]
    BD --> PD["push → Artifact Registry\nexamlock/dashboard:SHA + :latest"]

    PS --> DS["gcloud run deploy\nexam-server"]
    PD --> DD["gcloud run deploy\nexam-dashboard"]
```

> Ver diagrama completo en [architecture.md](./architecture.md#cicd--cloud-build).

---

## Deploy manual (forzar)

```
GitHub → Actions → Deploy ExamLock → Run workflow
  □ Forzar terraform apply  ← marca si cambió infra sin push a infra/
  □ Forzar deploy dashboard
```

---

## Actualizar el JWT_SECRET

```bash
cd infra
terraform apply -var="jwt_secret=NUEVO_SECRET"
```

Terraform actualiza Secret Manager. Cloud Run toma el nuevo valor en el próximo cold start.

---

## Imagen del agente (launcher)

La imagen `examlock/agent` se publica en Artifact Registry, no Docker Hub.
El launcher debe actualizar `EXAMLOCK_IMAGE` en `launcher/lab.sh`:

```bash
EXAMLOCK_IMAGE="us-central1-docker.pkg.dev/copper-axiom-496204-b2/examlock/agent:latest"
```

Para que el técnico pueda hacer `docker pull`, necesita auth:

```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

O hacer la imagen pública en Artifact Registry:
```bash
gcloud artifacts repositories add-iam-policy-binding examlock \
  --location=us-central1 \
  --member="allUsers" \
  --role="roles/artifactregistry.reader"
```
