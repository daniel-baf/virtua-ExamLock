# virtua-ExamLock

Sistema de virtualización para exámenes controlados. Usa Docker + Cage (Wayland kiosk) para aislar el entorno del alumno durante un examen, con monitoreo en tiempo real desde un dashboard del docente.

## Arquitectura

- **server/** — Backend Node.js + Express + Socket.IO (Cloud Run / GCP)
- **dashboard/** — React + Vite + Tailwind (Firebase Hosting)
- **agent/** — Agente Node.js dentro del container Docker
- **container/** — Dockerfile del agente (node:18-alpine, 46 MB)
- **proctor/** — Scripts de captura de pantalla y cámara (host/VM)
- **launcher/** — Scripts de arranque para laboratorio Linux y BYOD
- **infra/** — Terraform IaC (GCP: Cloud Run, Firestore, GCS, Artifact Registry, WIF)

## Deploy

Ver [docs/deploy.md](docs/deploy.md).

## Seguridad

Ver [docs/pentest/](docs/pentest/) para el informe de pruebas de penetración.
