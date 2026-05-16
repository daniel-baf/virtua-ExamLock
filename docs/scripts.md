# Scripts

## Variables comunes

Los scripts de ISO/VM leen `.env.examlock` desde la raíz:

```bash
SERVER_URL=https://tu-servidor.com
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=....firebaseapp.com
FIREBASE_PROJECT_ID=...
```

Base:

```bash
cp .env.examlock.example .env.examlock
```

## Scripts de desarrollo

| Script | Uso |
|---|---|
| `scripts/build-iso.sh` | Compila ISO full/dev, opcionalmente limpiando cache o arrancando VM. |
| `scripts/dev-vm.sh` | Arranca QEMU, empuja cambios del agent y hace hot reload. |
| `scripts/dev-key` | Llave SSH local para la VM de desarrollo. No se versiona. |
| `scripts/dev-key.pub` | Llave pública incluida para acceso root en la VM dev. |

### `build-iso.sh`

```bash
./scripts/build-iso.sh
./scripts/build-iso.sh --dev
./scripts/build-iso.sh --clean
./scripts/build-iso.sh --watch
```

| Flag | Efecto |
|---|---|
| `--dev` | Usa perfil liviano y escribe `iso/examlock-dev.iso`. |
| `--full` | Usa perfil completo y escribe `iso/examlock-live.iso`. |
| `--clean` | Borra `iso/build` antes de compilar. |
| `--watch` | Al terminar, ejecuta `dev-vm.sh`. |

### `dev-vm.sh`

```bash
./scripts/dev-vm.sh
./scripts/dev-vm.sh --dev
./scripts/dev-vm.sh --logs
./scripts/dev-vm.sh --shell
./scripts/dev-vm.sh --push
```

| Flag | Efecto |
|---|---|
| `--dev` | Usa `iso/examlock-dev.iso`. |
| `--logs` | Muestra `journalctl` y `/var/log/examlock/agent.log`. |
| `--shell` | Abre SSH root a la VM en `127.0.0.1:2222`. |
| `--push` | Copia `agent/daemon/*.js` y `agent/ui/*.html` a una VM ya corriendo. |

El hot reload usa `entr` si está disponible, luego `inotifywait`, y como último recurso polling cada 5 segundos.

## Scripts del server

Ejecutar desde `server/` o pasando la ruta completa. Requieren credenciales de Application Default Credentials con permisos sobre Firebase/Auth/Firestore.

| Script | Uso |
|---|---|
| `server/scripts/provision-users.js` | Crea usuarios seed y asigna custom claims. |
| `server/scripts/set-role.js` | Cambia el rol Firebase custom claim de un usuario. |
| `server/scripts/reset-test-data.js` | Borra datos de prueba de Firestore/Storage y opcionalmente usuarios Auth. |

### Crear usuarios seed

```bash
cd server
SEED_USER_PASSWORD='password-temporal' node scripts/provision-users.js
```

El script actual crea los usuarios definidos dentro del archivo y les asigna `teacher` o `student`.

### Cambiar rol

```bash
cd server
node scripts/set-role.js correo@dominio.com teacher
node scripts/set-role.js alumno@dominio.com student
```

Después de cambiar claims, el usuario debe cerrar sesión y volver a entrar para refrescar su token.

### Reset de datos de prueba

Este script exige confirmación explícita:

```bash
cd server
CONFIRM_RESET=RESET_EXAMLOCK_TEST_DATA node scripts/reset-test-data.js
```

Borra estas colecciones:

- `sessions`
- `students`
- `events`
- `screenshots`
- `questions`
- `answers`

También borra objetos del bucket de screenshots.

Para borrar además todos los usuarios de Firebase Auth:

```bash
cd server
CONFIRM_RESET=RESET_EXAMLOCK_TEST_DATA node scripts/reset-test-data.js --auth-users
```

Usar solo en entornos de prueba o cuando quieras reiniciar todo el proyecto.

## Launchers y captura

| Ruta | Uso |
|---|---|
| `launcher/lab.sh` | Lanza modo laboratorio con container Docker. |
| `launcher/byod/setup-vm.sh` | Prepara VM BYOD con systemd/autologin. |
| `launcher/byod/examlock-launch.sh.tpl` | Template del launcher BYOD. |
| `launcher/byod/examlock.service` | Unit systemd para BYOD. |
| `proctor/start.sh` | Orquesta captura. |
| `proctor/capture-screen.sh` | Captura pantalla. |
| `proctor/capture-camera.sh` | Captura cámara. |

## Limpieza local

Artefactos regenerables:

```bash
rm -rf agent/node_modules dashboard/node_modules dashboard/dist server/node_modules infra/.terraform iso/build
```

No borres carpetas fuente como `agent`, `dashboard`, `server`, `infra`, `iso`, `launcher`, `proctor` o `scripts`.

