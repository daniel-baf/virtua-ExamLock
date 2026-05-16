# ExamLock

ExamLock es una plataforma para tomar exámenes en un entorno controlado. El docente crea una sesión desde el dashboard, el alumno entra desde una ISO/VM/kiosk con acceso restringido, y el backend centraliza autenticación, monitoreo, respuestas, capturas y auditoría.

## Qué hacemos hoy

- `server/`: API Node.js + Express + Socket.IO. Autentica con Firebase, guarda datos en Firestore y sube capturas a Cloud Storage.
- `dashboard/`: panel React/Vite para docentes. Permite crear sesiones, configurar red, monitorear alumnos, pedir capturas, ver stream, enviar mensajes y revisar auditoría/resultados.
- `agent/`: daemon local del alumno. Sirve la UI en `127.0.0.1:7878`, conecta con el server y aplica restricciones de red.
- `iso/`: configuración Debian Live para generar el USB booteable.
- `scripts/`: wrappers para compilar ISO y probarla en QEMU con hot reload.
- `infra/`: Terraform para GCP.
- `launcher/` y `proctor/`: modos alternos/lanzadores y scripts de captura.

## Documentación

La documentación operativa vive en `docs/`:

| Documento | Contenido |
|---|---|
| [docs/app.md](docs/app.md) | Cómo funciona la app, roles, sesiones, pantallas, datos y endpoints principales. |
| [docs/build.md](docs/build.md) | Cómo compilar la ISO, flujo de build y diagramas Mermaid. |
| [docs/scripts.md](docs/scripts.md) | Scripts disponibles, variables, uso diario y limpieza de artefactos locales. |
| [docs/network.md](docs/network.md) | Modelo de red, whitelist, firewall, Docker/Lab/BYOD e ISO. |
| [docs/infrastructure.md](docs/infrastructure.md) | Infraestructura GCP, Terraform, CI/CD, secrets y despliegue. |
| [docs/operations.md](docs/operations.md) | Operación diaria: crear usuarios, cambiar roles, borrar datos, borrar usuarios y troubleshooting. |
| [docs/architecture.md](docs/architecture.md) | Diagramas de arquitectura y flujos técnicos. |
| [docs/byod-setup.md](docs/byod-setup.md) | Guía corta para alumnos usando VM BYOD. |
| [docs/pentest/](docs/pentest/) | Pruebas de seguridad y checklist de pentest. |

## Arranque local con Docker + VM

Este es el flujo recomendado para desarrollo: levanta `server` y `dashboard` en Docker, y configura la VM para hablar con el server local sin reconstruir ISO.

```bash
cp server/.env.example server/.env
cp dashboard/.env.example dashboard/.env
gcloud auth application-default login

./scripts/dev-local.sh --dev
```

URLs locales:

- Dashboard docente: `http://localhost:5173`
- Server API: `http://localhost:8080`
- Server visto desde QEMU: `http://10.0.2.2:8080`

Comandos útiles:

```bash
./scripts/dev-local.sh --logs
./scripts/dev-local.sh --down
./scripts/dev-local.sh --dev --no-vm
```

## Arranque local manual

Backend:

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Dashboard:

```bash
cd dashboard
cp .env.example .env
npm install
npm run dev
```

ISO de desarrollo:

```bash
cp .env.examlock.example .env.examlock
./scripts/build-iso.sh --dev
./scripts/dev-vm.sh --dev
```

## Nota sobre carpetas pesadas

Las carpetas `node_modules/`, `dashboard/dist`, `infra/.terraform` e `iso/build` son artefactos regenerables. El código fuente y la documentación están versionados; esos artefactos se pueden limpiar cuando solo necesitas liberar espacio.
