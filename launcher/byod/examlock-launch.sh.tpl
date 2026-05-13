#!/bin/bash
# Lanzador dentro de la VM — generado por setup-vm.sh
# ExamLock root: EXAMLOCK_ROOT_PLACEHOLDER

EXAMLOCK_ROOT="EXAMLOCK_ROOT_PLACEHOLDER"
CODE_FILE="/tmp/examlock_session_code"
PICKER_PORT=9998

rm -f "$CODE_FILE"

# ── Paso 1: captura el código de sesión con una página local ─────────────────

# Servidor HTTP mínimo que sirve el formulario y guarda el código
python3 - "$CODE_FILE" "$PICKER_PORT" << 'PYEOF' &
import http.server, sys, os, urllib.parse

code_file = sys.argv[1]
port = int(sys.argv[2])

FORM = b"""<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8">
<title>ExamLock</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,sans-serif;background:#0a0a0f;color:#e5e7eb;
  min-height:100vh;display:flex;align-items:center;justify-content:center}
.card{background:#111118;border:1px solid #1f2030;border-radius:16px;
  padding:2.5rem;width:100%;max-width:360px;text-align:center}
h1{font-size:1.5rem;margin-bottom:.5rem}
p{color:#6b7280;font-size:.9rem;margin-bottom:1.5rem}
input{width:100%;background:#1a1a24;border:1px solid #2d2d3d;border-radius:8px;
  padding:.75rem;color:#e5e7eb;font-size:1.25rem;text-align:center;
  letter-spacing:.15em;outline:none;margin-bottom:1rem;text-transform:uppercase}
input:focus{border-color:#7c3aed}
button{width:100%;background:#7c3aed;color:#fff;border:none;border-radius:8px;
  padding:.75rem;font-size:1rem;cursor:pointer}
button:hover{background:#6d28d9}
</style></head>
<body>
<div class="card">
  <h1>ExamLock</h1>
  <p>Ingresa el código que te dio tu docente</p>
  <form method="POST" action="/submit">
    <input name="code" placeholder="XXXXXXXX" autofocus required maxlength=16>
    <button type="submit">Continuar</button>
  </form>
</div>
</body></html>"""

class H(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(FORM)
    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length).decode()
        params = urllib.parse.parse_qs(body)
        code = params.get('code', [''])[0].strip().upper()
        if code:
            open(code_file, 'w').write(code)
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(b'<script>window.close()</script><p style="color:#fff;font-family:sans-serif;padding:2rem">Iniciando examen...</p>')
        # Shutdown after response
        import threading
        threading.Thread(target=httpd.shutdown).start()

httpd = http.server.HTTPServer(('127.0.0.1', port), H)
httpd.serve_forever()
PYEOF

PICKER_PID=$!

# Abre Cage con Chromium apuntando al picker
cage -- chromium-browser \
  --kiosk \
  --no-sandbox \
  --disable-infobars \
  --app="http://localhost:${PICKER_PORT}" 2>/dev/null || true

wait "$PICKER_PID" 2>/dev/null || true

# ── Paso 2: lanza el examen con el código obtenido ────────────────────────────

SESSION_CODE=$(cat "$CODE_FILE" 2>/dev/null)
rm -f "$CODE_FILE"

if [ -z "$SESSION_CODE" ]; then
  echo "[examlock] Sin código. Abortando."
  exit 1
fi

exec "$EXAMLOCK_ROOT/launcher/lab.sh" "$SESSION_CODE"
