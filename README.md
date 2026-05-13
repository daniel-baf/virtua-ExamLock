# ExamLock

Sistema de examen supervisado para laboratorios Linux. El alumno bootea desde un USB controlado por el docente — no tiene acceso a su SO, no tiene sudo, el firewall bloquea todo excepto la whitelist definida por sesión.

## Por qué Live USB y no instalar en el equipo del alumno

Si el alumno corre el software en su propio SO, tiene root y puede matar cualquier proceso de vigilancia. El modelo Live USB cierra ese vector:

- El alumno **no bootea su OS** — bootea desde un USB que tú preparaste
- Tú eres root del live OS → firewall real, sin sudo cacheado
- El docente supervisa presencialmente → resuelve teléfono/segundo monitor/papelitos
- Screenshots + cámara quedan como evidencia y deterrente, no como control primario

## Arquitectura

```
┌─────────────────────────────────┐     ┌──────────────────────────────┐
│  USB Live (por alumno)          │     │  Cloud (GCP)                 │
│                                 │     │                              │
│  nftables (default-drop)        │     │  server/   Node + Socket.IO  │
│  examlock-firewall.service      │────▶│  Firestore  sesiones/alumnos │
│                                 │     │  GCS        screenshots      │
│  examlock-daemon.service        │     │                              │
│  Node.js en :7878               │     └──────────────────────────────┘
│                                 │              ▲
│  cage + Chromium kiosk          │              │
│  localhost:7878                 │     ┌────────┴─────────────────────┐
└─────────────────────────────────┘     │  Dashboard (Firebase Hosting) │
                                        │  React — panel del docente   │
                                        │  Monitor / Sesiones / Notas  │
                                        └──────────────────────────────┘
```

### Componentes

| Directorio | Qué hace |
|---|---|
| `server/` | Backend Node.js + Express + Socket.IO. REST + WebSocket. Corre en Cloud Run. |
| `dashboard/` | Panel docente React + Vite + Tailwind. Firebase Hosting. |
| `agent/` | App de examen Node.js. Corre dentro del Live USB. Sirve la UI al Chromium kiosk. |
| `proctor/` | Scripts de captura de pantalla y cámara (grim + ffmpeg). Corren en el live OS. |
| `infra/` | Terraform IaC para GCP (Cloud Run, Firestore, GCS, Artifact Registry). |
| `live-image/` | Config de `live-build` para generar la ISO booteable. |

---

## Levantar el servidor (único servicio a correr)

```bash
cd server
cp .env.example .env   # completar con credenciales GCP
npm install
npm start              # escucha en 0.0.0.0:8080
```

Variables requeridas en `server/.env`:

```
PORT=8080
JWT_SECRET=<secreto para tokens de container>
GCP_PROJECT_ID=<tu-proyecto>
GCS_BUCKET=<bucket-para-screenshots>
FIRESTORE_DATABASE=(default)
CORS_ORIGINS=http://localhost:5173,https://<tu-firebase-app>.web.app
```

El servidor autentica docentes con Firebase ID tokens (RS256) y alumnos con JWT firmados con `JWT_SECRET` (HS256). No hay base de datos separada — todo en Firestore.

---

## Dashboard (panel del docente)

```bash
cd dashboard
cp .env.example .env   # VITE_SERVER_URL + Firebase config
npm install
npm run dev            # http://localhost:5173
```

El docente se loguea con Firebase Auth (Google), crea sesiones, sube preguntas, y monitorea alumnos en tiempo real via Socket.IO.

---

## Live ISO — Construir el USB del alumno

### Requisitos

- Docker con privilegios (para `lb build`)
- ~5 GB de espacio libre

### 1. Preparar el container de build

```bash
mkdir -p ~/live-image
docker run -it --rm \
  --privileged \
  -v ~/live-image:/work \
  --name examlock-build \
  debian:trixie bash
```

### 2. Instalar live-build dentro del container

```bash
apt-get update && apt-get install -y live-build
```

### 3. Copiar el agente al chroot

```bash
# Desde el host (en otra terminal):
docker cp ./agent examlock-build:/work/config/includes.chroot/opt/examlock-agent
```

O si el volumen ya está montado:

```bash
cp -r ./agent ~/live-image/config/includes.chroot/opt/examlock-agent
```

### 4. Configurar SERVER_URL

Editar `~/live-image/config/includes.chroot/etc/systemd/system/examlock-agent.service` y cambiar:

```ini
Environment=SERVER_URL=http://<IP-DEL-SERVER>:8080
```

- En QEMU (pruebas): `http://10.0.2.2:8080` (el host es `10.0.2.2` en user-mode networking)
- En producción: URL pública del servidor Cloud Run

### 5. Buildear la ISO

```bash
# Dentro del container:
cd /work
lb config \
  --distribution trixie \
  --binary-images iso-hybrid \
  --bootloaders grub-efi,syslinux \
  --debian-installer none \
  --archive-areas "main contrib non-free non-free-firmware"

lb build 2>&1 | tee /work/build.log
```

Tarda ~15-20 min. Resultado: `~/live-image/live-image-amd64.hybrid.iso`

Para rebuild limpio:

```bash
lb clean --all
lb config [opciones de arriba]
lb build 2>&1 | tee /work/build.log
```

### 6. Grabar en USB

```bash
# Reemplazar /dev/sdX con el dispositivo correcto (cuidado: borra todo)
dd if=~/live-image/live-image-amd64.hybrid.iso of=/dev/sdX bs=4M status=progress
sync
```

O usar balenaEtcher.

---

## Boot flow del Live USB

```
POST → GRUB → kernel/initrd (live-boot)
  └─ systemd arranca examlock.target (default)
       ├─ nftables.service          → carga /etc/nftables.conf (default-drop + loopback)
       ├─ examlock-daemon.service   → node /opt/examlock/daemon/index.js en :7878
       └─ lightdm + XFCE autologin
            └─ autostart examlock.desktop
                 ├─ espera a que :7878 responda
                 └─ exec chromium --kiosk http://localhost:7878
```

El alumno ve directamente el formulario de login. No hay escritorio, no hay terminal accesible, no hay otro proceso que no sea el kiosk.

---

## Firewall (nftables)

`/etc/nftables.conf` en el live OS. Política default-drop de salida, con loopback permitido.

**Estado actual:** al boot, `examuser` queda limitado a loopback (`127.0.0.1:7878`).
El daemon mantiene salida solo a DNS, `SERVER_URL` y Firebase Auth para poder autenticar y sincronizar.
Al admitir al alumno, el daemon abre internet total o solo la whitelist de la sesión según `blockInternet`.

---

## Probar con QEMU (sin grabar USB)

```bash
# Levantar el server primero (terminal separada)
cd server && npm start

# Bootear la ISO
qemu-system-x86_64 -m 2G -enable-kvm \
  -cdrom ~/live-image/live-image-amd64.hybrid.iso \
  -nic user,model=virtio \
  -vga std
```

Criterios de smoke test:
- Grub → kernel arranca
- Autologin a `user` en tty1
- Cage fullscreen → Chromium abre `http://localhost:7878`
- Login con código de sesión → preguntas del examen visibles
- `https://facebook.com` no carga (firewall)
- `http://10.0.2.2:8080/healthz` devuelve `{"ok":true}`

---

## Flujos de desarrollo rapidos

Crear el archivo local de variables una sola vez:

```bash
cp .env.examlock.example .env.examlock
```

Luego usar uno de estos wrappers:

```bash
./scripts/dev-agent.sh          # prueba agent/ui sin reconstruir ISO
./scripts/dev-lab.sh TEST123    # build local + launcher Docker kiosk
./scripts/dev-iso.sh            # build completa de la ISO
```

Notas:
- `dev-agent.sh` actualiza `/etc/examlock.conf` con `sudo` si hace falta.
- `dev-lab.sh` toma `SESSION_CODE` del argumento o de `.env.examlock`.
- `dev-iso.sh` solo evita reescribir variables largas; el build sigue siendo completo.

---

## Estructura de live-image/config/

```
config/
├── package-lists/
│   ├── examlock.list.chroot   # paquetes del live OS (cage, chromium, node, nft, …)
│   └── live.list.chroot       # live-boot, live-config, systemd-sysv
├── hooks/normal/
│   ├── 0010-exam-user.hook.chroot   # configura systemd, deshabilita TTYs 2-6
│   └── 0020-agent-install.hook.chroot  # npm install --omit=dev para el agente
├── includes.chroot/
│   ├── etc/
│   │   ├── nftables.conf              # reglas de firewall
│   │   ├── resolv.conf                # DNS (8.8.8.8 en smoke test)
│   │   ├── live/config.conf           # live-config: grupos de usuario
│   │   ├── unbound/unbound.conf       # DNS local (activo en Fase 1b)
│   │   └── systemd/system/
│   │       ├── examlock.target
│   │       ├── examlock-agent.service
│   │       └── examlock-firewall.service
│   ├── opt/examlock-agent/            # código del agente (copiado desde agent/)
│   └── home/user/.bash_profile        # lanza cage al autologin
```

---

## Flujo de una sesión de examen

1. **Docente** crea sesión en el dashboard → obtiene código de 6 caracteres
2. **Docente** sube preguntas (multiple choice / verdadero-falso / abierta)
3. **Alumno** bootea desde el USB → ve formulario de login
4. **Alumno** ingresa nombre + código de sesión → join al servidor
5. **Servidor** devuelve JWT + timestamp de fin → agente conecta Socket.IO
6. **Alumno** responde preguntas → se guardan en Firestore en tiempo real
7. **Docente** ve grid de alumnos en Monitor: screenshots, cámara, estado de conexión
8. **Docente** puede: bloquear internet individual, enviar mensaje overlay, reactivar alumno, terminar examen global
9. **Alumno** entrega (botón) o el tiempo expira → redirigido a pantalla de cierre
10. **Docente** ve resultados por pregunta/alumno en `/session/:id/results`

---

## Qué NO previene (honesto)

- Teléfono en el bolsillo → lo resuelve el docente presencial
- Segundo monitor conectado al mismo equipo → supervisión visual
- Otro equipo en el mismo escritorio → supervisión visual
- Ataque físico al USB (quitar y reinsertar su propio OS) → tiempo + ruido

Lo que SÍ previene con alta confianza cuando el docente está presente:
- Apps locales (VS Code, ChatGPT desktop, terminal)
- Navegador con tabs libres
- Archivos locales / apuntes digitales
- Acceso a internet fuera de la whitelist
