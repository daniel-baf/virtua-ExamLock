#!/bin/bash
# ExamLock — Setup para VM Ubuntu 22.04 (BYOD)
# Corre UNA sola vez dentro de la VM, como el usuario 'alumno' con sudo.
# Instala dependencias, configura autologin, registra el servicio systemd.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXAMLOCK_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
USER="${SUDO_USER:-$(whoami)}"
HOME_DIR="/home/$USER"

echo "=== ExamLock BYOD Setup ==="
echo "Usuario: $USER"
echo "Directorio: $EXAMLOCK_ROOT"

# ── Dependencias ──────────────────────────────────────────────────────────────

echo "Instalando dependencias…"
apt-get update -qq
apt-get install -y --no-install-recommends \
  docker.io \
  cage \
  chromium-browser \
  grim \
  ffmpeg \
  curl \
  xwayland

# Usuario al grupo docker
usermod -aG docker "$USER"

# ── Autologin en TTY1 (Getty) ─────────────────────────────────────────────────

mkdir -p /etc/systemd/system/getty@tty1.service.d
cat > /etc/systemd/system/getty@tty1.service.d/autologin.conf << EOF
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin $USER --noclear %I \$TERM
EOF

# ── Servicio systemd usuario ──────────────────────────────────────────────────

SYSTEMD_USER_DIR="$HOME_DIR/.config/systemd/user"
mkdir -p "$SYSTEMD_USER_DIR"

# Copia el service y el wrapper
cp "$SCRIPT_DIR/examlock.service" "$SYSTEMD_USER_DIR/examlock.service"
sed "s|EXAMLOCK_ROOT_PLACEHOLDER|$EXAMLOCK_ROOT|g" \
  "$SCRIPT_DIR/examlock-launch.sh.tpl" > "$HOME_DIR/.local/bin/examlock-launch.sh"
chmod +x "$HOME_DIR/.local/bin/examlock-launch.sh"
mkdir -p "$HOME_DIR/.local/bin"

# Activa lingering para que el servicio de usuario inicie sin sesión gráfica
loginctl enable-linger "$USER"

# Habilita el servicio
sudo -u "$USER" systemctl --user daemon-reload
sudo -u "$USER" systemctl --user enable examlock.service

# ── Bash profile: arranca Cage automáticamente en TTY1 ───────────────────────

cat >> "$HOME_DIR/.bash_profile" << 'EOF'

# ExamLock: arranca Cage en TTY1 si no hay sesión gráfica activa
if [ "$(tty)" = "/dev/tty1" ] && [ -z "$DISPLAY" ] && [ -z "$WAYLAND_DISPLAY" ]; then
  systemctl --user start examlock.service
fi
EOF

echo ""
echo "=== Setup completo ==="
echo "Al reiniciar la VM → autologin → examlock.service inicia."
echo "El alumno verá la pantalla de login del examen directamente."
