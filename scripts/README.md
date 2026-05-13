# Scripts de desarrollo

## Flujo completo

### Primera vez — construir ISO

```bash
./scripts/build-iso.sh
```

Tarda 10–20 min. Usa Docker automáticamente en Arch (no necesita `live-build` nativo).

Para construir **y** arrancar la VM directo al terminar:

```bash
./scripts/build-iso.sh --watch
```

Para limpiar caché del build anterior (si cambiaste `config/` o el package list):

```bash
./scripts/build-iso.sh --clean
```

---

### Dev diario — VM con hot-reload

```bash
./scripts/dev-vm.sh
```

- Arranca QEMU con el ISO en background
- Espera que SSH esté disponible
- Empuja los archivos actuales del agente a la VM
- Inicia watcher: cualquier cambio en `agent/daemon/*.js` o `agent/ui/*.html` → copia automática + reinicio del daemon

**Requisito:** instalar `entr` para hot-reload instantáneo:

```bash
sudo pacman -S entr
```

Sin `entr` cae a `inotifywait` (`inotify-tools`), y sin eso a poll de 5s.

#### Comandos extra (con la VM ya corriendo)

```bash
./scripts/dev-vm.sh --logs    # tail de /var/log/examlock/agent.log + journalctl
./scripts/dev-vm.sh --shell   # SSH directo a la VM
./scripts/dev-vm.sh --push    # push manual sin arrancar watcher
```

---

## Variables de entorno

Todos los scripts leen de `.env.examlock` en la raíz del repo:

```bash
SERVER_URL=https://tu-servidor.com
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=....firebaseapp.com
FIREBASE_PROJECT_ID=...
```

Copia `.env.examlock.example` como base si existe.

---

## Scripts existentes

| Script | Qué hace |
|--------|----------|
| `build-iso.sh` | Construye el ISO de producción con Docker |
| `dev-vm.sh` | QEMU + hot-reload del agente |
| `dev-agent.sh` | Corre el daemon directo en el host (sin VM, sin firewall) |
| `dev-iso.sh` | Wrapper legacy de `iso/build.sh` |
| `dev-lab.sh` | Lanza el agente en contenedor Docker con `launcher/lab.sh` |
