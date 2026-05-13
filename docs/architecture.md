# ExamLock — Arquitectura del sistema

## Componentes

| Componente | Runtime | Dónde corre |
|---|---|---|
| **server** | Node.js + Express + Socket.io | Cloud Run |
| **dashboard** | React + Vite (SPA) | Cloud Run |
| **agent/daemon** | Node.js + Express | Máquina del alumno (ISO / BYOD / Lab) |
| **Firestore** | Firebase | GCP (mismo proyecto) |
| **Artifact Registry** | Docker | GCP |

---

## Diagrama general

```mermaid
graph TB
    subgraph GCP["GCP — copper-axiom-496204-b2"]
        SERVER["server\nCloud Run :8080\nExpress + Socket.io"]
        DASHBOARD["dashboard\nCloud Run\nReact SPA"]
        FS[("Firestore")]
        AR["Artifact Registry\nexamlock/server\nexamlock/dashboard\nexamlock/agent"]
        FB["Firebase Auth"]
    end

    subgraph ALUMNO["Máquina del alumno"]
        DAEMON["agent/daemon\n127.0.0.1:7878"]
        BROWSER["Chromium kiosk\nlocalhost:7878"]
        CAGE["Cage (Wayland)"]
    end

    TEACHER["Docente\nNavegador"]

    TEACHER -->|HTTPS| DASHBOARD
    DASHBOARD -->|REST + WS| SERVER
    SERVER <-->|Admin SDK| FS
    SERVER <-->|Admin SDK| FB

    BROWSER -->|HTTP local| DAEMON
    DAEMON -->|REST + Socket.io\nHTTPS| SERVER
    DAEMON -->|Firebase REST API| FB

    CAGE --> BROWSER
```

---

## Flujo de sesión de examen

```mermaid
sequenceDiagram
    actor Docente
    actor Alumno
    participant Dashboard
    participant Server
    participant Firestore
    participant Daemon

    Docente->>Dashboard: Login (Firebase Auth)
    Docente->>Dashboard: Crear sesión
    Dashboard->>Server: POST /api/session
    Server->>Firestore: sessions/{id} {code, active:true}
    Server-->>Dashboard: {sessionId, code}
    Dashboard-->>Docente: Código de sesión (ej: CALC-B7X2)

    Note over Alumno,Daemon: Alumno arranca ISO/VM/Lab
    Alumno->>Daemon: Login en UI (email + pwd + código)
    Daemon->>Firebase REST: signInWithPassword
    Firebase REST-->>Daemon: idToken
    Daemon->>Server: POST /api/session/{code}/join  [Bearer token]
    Server->>Firestore: Valida role=student, code activo
    Server->>Firestore: students/{uid} {sessionId, status:waiting}
    Server-->>Daemon: {sessionId}
    Daemon->>Server: WS connect (auth: idToken, query: sessionCode)
    Server-->>Daemon: socket conectado

    Note over Docente,Dashboard: Docente ve alumno en lista "esperando"
    Docente->>Dashboard: Admitir alumno
    Dashboard->>Server: POST /api/session/{id}/admit/{uid}
    Server->>Firestore: students/{uid} status:admitted
    Server-->>Daemon: socket event server:admitted {whitelist, blockInternet}
    Daemon->>Daemon: applyWhitelist (iptables)
    Daemon-->>Browser: SSE event "admitted"
    Browser->>Browser: Navega a /exam

    loop Cada 10s
        Daemon-->>Server: student:heartbeat
        Server->>Firestore: logEvent heartbeat
    end

    loop On-demand
        Docente->>Dashboard: Capturar pantalla
        Dashboard->>Server: POST /api/session/{id}/capture/{uid}
        Server-->>Daemon: socket event server:capture-now {requestId}
        Daemon->>Daemon: screenshot.js (scrot/grim)
        Daemon-->>Server: student:screenshot {jpegB64, requestId}
        Server->>Firestore: screenshots/{id}
        Server-->>Dashboard: socket event screenshot
    end

    Docente->>Dashboard: Finalizar examen
    Dashboard->>Server: POST /api/session/{id}/end
    Server->>Firestore: sessions/{id} active:false
    Server-->>Daemon: socket event server:exam-ended
    Daemon-->>Browser: SSE event "exam-ended"
    Browser->>Browser: Navega a /ended
    Daemon->>Daemon: loginctl terminate-user examuser (5s)
```

---

## Firestore — Colecciones

```mermaid
erDiagram
    sessions {
        string code
        boolean active
        string teacherId
        timestamp createdAt
    }
    students {
        string sessionId
        string status
        string email
        timestamp joinedAt
    }
    events {
        string sessionId
        string uid
        string type
        timestamp ts
    }
    screenshots {
        string sessionId
        string uid
        string jpegB64
        timestamp takenAt
        string requestId
    }
    questions {
        string sessionId
        number order
        string type
        string text
        array options
        string correctAnswer
    }
    answers {
        string sessionId
        string studentId
        string questionId
        any answer
        number savedAt
        string nonce
    }

    sessions ||--o{ students : "tiene"
    sessions ||--o{ events : "registra"
    sessions ||--o{ screenshots : "acumula"
    sessions ||--o{ questions : "define"
    questions ||--o{ answers : "recibe"
    students ||--o{ answers : "envía"
```

**Colecciones activas:**
- `sessions`, `students`, `events`, `screenshots` — en producción
- `questions`, `answers` — implementadas en `server/src/routes/exams.js` + `agent/answers.js`, montadas en `/api/exam`

---

## Modos de despliegue del agente

```mermaid
graph LR
    A[ISO — Debian live]:::iso -->|dd a USB| USB[USB booteable]
    A -->|boot en VM| QEMU[QEMU / Boxes]

    B[BYOD — Ubuntu VM]:::byod -->|setup-vm.sh| SVC[systemd service\nautologin TTY1]

    C[Lab — Docker]:::lab -->|lab.sh| DOCK[container\nexam-net\nread-only]

    classDef iso fill:#7c3aed,color:#fff
    classDef byod fill:#0369a1,color:#fff
    classDef lab fill:#047857,color:#fff
```

### ISO (kiosk dedicado)
- Debian bookworm live, construido con `live-build` dentro de Docker
- Agente bakeado en `/opt/examlock/`, arranca como servicio systemd
- Cage (Wayland) + Chromium kiosk apuntando a `localhost:7878`
- `examuser` sin contraseña, autologin

### BYOD (VM del alumno)
- Ubuntu 22.04 importada como `.ova` en VirtualBox
- `setup-vm.sh` instala deps, configura autologin, registra `examlock.service`
- Mismo flujo que ISO una vez arrancada

### Lab (Linux existente)
- `launcher/lab.sh <SESSION_CODE>` lanza container Docker
- Red `exam-net` bridge aislada, `--cap-drop ALL`, filesystem read-only
- Cage + Chromium en kiosk sobre el escritorio existente

---

## CI/CD — Cloud Build

```mermaid
flowchart TD
    PUSH["Push a deploy/dev"]
    PUSH --> BS["build-server\ngcr.io/cloud-builders/docker build ./server"]
    PUSH --> BD["build-dashboard\ndocker build ./dashboard\n(VITE_* vars bakeadas)"]

    BS --> PS["push-server\n→ Artifact Registry :SHORT_SHA + :latest"]
    BD --> PD["push-dashboard\n→ Artifact Registry :SHORT_SHA + :latest"]

    PS --> DS["deploy-server\ngcloud run deploy exam-server\n(imagen nueva)"]
    PD --> DD["deploy-dashboard\ngcloud run deploy exam-dashboard\n(imagen nueva)"]
```

Variables de sustitución configuradas en el trigger de Cloud Build (no en YAML):
- `_SERVER_URL` — URL del Cloud Run del server
- `_VITE_FIREBASE_*` — credenciales Firebase para el dashboard

---

## Agent interno — Máquina de estados

```mermaid
stateDiagram-v2
    [*] --> idle : arranque
    idle --> waiting : POST /api/login OK\n+ socket conectado
    waiting --> admitted : server:admitted\n→ applyWhitelist()
    admitted --> kicked : server:kicked\n→ killSession(3s)
    admitted --> ended : server:exam-ended\n→ killSession(5s)
    waiting --> idle : error / disconnect
    kicked --> [*] : loginctl terminate-user
    ended --> [*] : loginctl terminate-user
```

---

## Puertos y comunicación

| Origen | Destino | Puerto | Protocolo |
|---|---|---|---|
| Chromium (kiosk) | agent/daemon | 7878 (loopback) | HTTP |
| agent/daemon | server (Cloud Run) | 443 | HTTPS + WSS |
| agent/daemon | Firebase Auth REST | 443 | HTTPS |
| Dashboard (browser) | server (Cloud Run) | 443 | HTTPS + WSS |
| Dashboard (browser) | Firebase Auth | 443 | HTTPS |
| Cloud Build | Artifact Registry | 443 | HTTPS |
| Cloud Build | Cloud Run | 443 | HTTPS (gcloud) |
