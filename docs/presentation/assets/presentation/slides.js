// slides.js — HTML de cada slide (20 slides total)

export function getSlides() {
    return [

/* 1 — Portada */
`<div class="slide-card">
  <div class="portada-content">
    <svg class="portada-logo" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="url(#pg1)" stroke-width="5" stroke-dasharray="10 5"/>
      <rect x="35" y="45" width="30" height="25" rx="6" stroke="#06b6d4" stroke-width="4"/>
      <path d="M40 45V36C40 30.5 44.5 26 50 26C55.5 26 60 30.5 60 36V45" stroke="#8b5cf6" stroke-width="4" stroke-linecap="round"/>
      <circle cx="50" cy="57" r="3" fill="#06b6d4"/>
      <defs><linearGradient id="pg1" x1="5" y1="5" x2="95" y2="95" gradientUnits="userSpaceOnUse"><stop stop-color="#8b5cf6"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs>
    </svg>
    <h1 class="portada-title">ExamLock</h1>
    <p class="portada-sub">Entorno Seguro y Controlado para Evaluaciones Académicas Prácticas</p>
    <div class="portada-meta">
      <span><b>✓</b> Pila de Red Aislada</span>
      <span><b>✓</b> Hardening a nivel Kernel</span>
      <span><b>✓</b> Proctoring en Tiempo Real</span>
    </div>
  </div>
</div>`,

/* 2 — Problema */
`<div class="slide-card">
  <div class="slide-header">
    <div><h2 class="slide-title">Planteamiento del Problema</h2><p class="slide-subtitle">La vulnerabilidad académica y técnica en laboratorios de Guatemala</p></div>
    <span class="badge badge-red">CONTEXTO</span>
  </div>
  <div class="slide-body">
    <div class="grid-3" style="width:100%">
      <div class="card-item"><h3 class="card-title">Pérdida de Integridad</h3><p class="card-desc">Complejidad crítica para validar el aprendizaje real en pruebas prácticas. Los resultados no reflejan la competencia del estudiante.</p></div>
      <div class="card-item"><h3 class="card-title">Internet Irrestricto</h3><p class="card-desc">Acceso sin filtrar a motores de búsqueda, IA generativa (ChatGPT/Copilot), mensajería instantánea y dispositivos USB externos.</p></div>
      <div class="card-item"><h3 class="card-title">Host No Controlado</h3><p class="card-desc">Desde la óptica de seguridad, el host no controlado expone múltiples vectores de evasión física y lógica sin detección posible.</p></div>
    </div>
  </div>
</div>`,

/* 3 — Objetivos */
`<div class="slide-card">
  <div class="slide-header">
    <div><h2 class="slide-title">Enfoque de la Solución</h2><p class="slide-subtitle">Objetivos de la plataforma para blindar las evaluaciones prácticas</p></div>
    <span class="badge badge-cyan">OBJETIVOS</span>
  </div>
  <div class="slide-body">
    <div class="grid-2-1" style="width:100%">
      <div class="steps-container">
        <div class="step-row"><div class="step-number">1</div><div class="step-content"><h4 class="step-heading">Aislamiento Total del Entorno</h4><p class="step-text">Controlar la pila de red, el SO y restringir al estudiante únicamente a la interfaz de su examen. Sin excepciones.</p></div></div>
        <div class="step-row"><div class="step-number">2</div><div class="step-content"><h4 class="step-heading">Hardening Multi-Capa</h4><p class="step-text">Políticas de seguridad en SO, Red, Usuario y Aplicaciones para mitigar bypasses, exploits y evasiones USB.</p></div></div>
        <div class="step-row"><div class="step-number">3</div><div class="step-content"><h4 class="step-heading">Despliegue de Baja Fricción</h4><p class="step-text">Distribución sencilla para técnicos mediante llaves USB, máquinas virtuales OVA o contenedores Docker.</p></div></div>
        <div class="step-row"><div class="step-number">4</div><div class="step-content"><h4 class="step-heading">Proctoring y Telemetría Activa</h4><p class="step-text">Monitoreo continuo en tiempo real: capturas de pantalla, stream de video, keylogger y heartbeat de red.</p></div></div>
      </div>
      <div class="highlight-box">
        <h4 class="highlight-title">Objetivo General</h4>
        <p style="font-size:0.875rem; color:var(--text-2); line-height:1.6;">Diseñar e implementar una infraestructura segura, virtualizada y altamente endurecida basada en principios de seguridad de la información, permitiendo evaluar competencias prácticas en un entorno 100% controlado e íntegro.</p>
      </div>
    </div>
  </div>
</div>`,

/* 4 — Arquitectura */
`<div class="slide-card">
  <div class="slide-header">
    <div><h2 class="slide-title">Arquitectura Propuesta</h2><p class="slide-subtitle">La sinergia de las tres piezas de ExamLock</p></div>
    <span class="badge badge-purple">TECNOLOGÍA</span>
  </div>
  <div class="slide-body" style="flex-direction:column; gap:1rem;">
    <div class="grid-3" style="width:100%">
      <div class="card-item" style="border-color:rgba(6,182,212,0.2)"><h3 class="card-title" style="color:var(--cyan)">1. Dashboard Docente</h3><p class="card-desc" style="font-size:0.83rem">React SPA en Firebase Hosting. Permite crear sesiones, gestionar whitelists dinámicas y monitorear el aula en tiempo real.</p></div>
      <div class="card-item" style="border-color:rgba(139,92,246,0.2)"><h3 class="card-title" style="color:var(--purple)">2. Servidor Central</h3><p class="card-desc" style="font-size:0.83rem">Node.js + Socket.io en GCP Cloud Run serverless. Centraliza tokens JWT, sesiones, persistencia Firestore y almacenamiento GCS.</p></div>
      <div class="card-item" style="border-color:rgba(16,185,129,0.2)"><h3 class="card-title" style="color:var(--emerald)">3. Agente / Daemon</h3><p class="card-desc" style="font-size:0.83rem">Daemon Node.js local con privilegios de sistema. Aplica iptables al kernel y levanta la UI del examen en localhost:7878.</p></div>
    </div>
    <div class="arch-svg-container" style="height:175px">
      <svg width="640" height="140" viewBox="0 0 640 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="45" width="145" height="50" rx="8" fill="rgba(6,182,212,0.1)" stroke="#06b6d4" stroke-width="1.5"/>
        <text x="92" y="73" fill="white" font-size="11" font-family="Outfit,sans-serif" text-anchor="middle" font-weight="bold">DASHBOARD (React)</text>
        <text x="92" y="88" fill="#9ca3af" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="middle">Firebase Hosting</text>
        <rect x="248" y="45" width="145" height="50" rx="8" fill="rgba(139,92,246,0.1)" stroke="#8b5cf6" stroke-width="1.5"/>
        <text x="320" y="73" fill="white" font-size="11" font-family="Outfit,sans-serif" text-anchor="middle" font-weight="bold">SERVER (Cloud Run)</text>
        <text x="320" y="88" fill="#9ca3af" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="middle">Node + Socket.io</text>
        <rect x="476" y="45" width="145" height="50" rx="8" fill="rgba(16,185,129,0.1)" stroke="#10b981" stroke-width="1.5"/>
        <text x="548" y="73" fill="white" font-size="11" font-family="Outfit,sans-serif" text-anchor="middle" font-weight="bold">AGENTE (Daemon)</text>
        <text x="548" y="88" fill="#9ca3af" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="middle">Node.js + iptables</text>
        <path d="M165 70H248" stroke="#a78bfa" stroke-width="1.5" stroke-dasharray="4 4"/>
        <polygon points="248,70 240,66 240,74" fill="#a78bfa"/>
        <text x="206" y="62" fill="#a78bfa" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="middle">REST + WSS</text>
        <path d="M476 70H393" stroke="#a78bfa" stroke-width="1.5" stroke-dasharray="4 4"/>
        <polygon points="393,70 401,66 401,74" fill="#a78bfa"/>
        <text x="434" y="62" fill="#a78bfa" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="middle">WSS + HTTPS</text>
        <rect x="260" y="108" width="120" height="24" rx="5" fill="rgba(245,158,11,0.1)" stroke="#f59e0b" stroke-width="1"/>
        <text x="320" y="124" fill="#fbbf24" font-size="9" font-family="JetBrains Mono,monospace" text-anchor="middle">Firestore + GCS Buckets</text>
        <path d="M320 95 V108" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3 3"/>
      </svg>
    </div>
  </div>
</div>`,

/* 5 — Flow Animator */
`<div class="slide-card">
  <div class="slide-header">
    <div><h2 class="slide-title">Flujo de Ejecución e Interconexión</h2><p class="slide-subtitle">Simulador animado paso a paso de flujos de datos y controles de seguridad</p></div>
    <span class="badge badge-cyan">ANIMACIÓN</span>
  </div>
  <div class="slide-body">
    <div class="flow-container" style="width:100%;height:100%">
      <div class="flow-visual">
        <svg width="100%" height="100%" viewBox="0 0 500 320" fill="none" xmlns="http://www.w3.org/2000/svg" id="flow-svg">
          <path id="path-agent-firebase" d="M70 160 Q160 100 250 50" class="conn-path"/>
          <path id="path-agent-server"   d="M70 160 H250"             class="conn-path"/>
          <path id="path-server-firestore" d="M250 160 Q340 120 430 90" class="conn-path"/>
          <path id="path-agent-buckets"  d="M70 160 Q250 160 430 230" class="conn-path"/>
          <path id="path-server-dashboard" d="M250 160 Q250 215 250 270" class="conn-path"/>
          <g id="node-agent" class="node-group">
            <circle cx="70" cy="160" r="28" fill="#1e293b" stroke="#64748b" stroke-width="2" class="node-circle"/>
            <rect x="58" y="152" width="24" height="15" rx="2" fill="none" stroke="white" stroke-width="2"/>
            <line x1="53" y1="168" x2="87" y2="168" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <text x="70" y="205" text-anchor="middle" class="node-label">Agente Alumno</text>
          </g>
          <g id="agent-shield-el" class="agent-shield">
            <circle cx="70" cy="160" r="36" fill="rgba(16,185,129,0.08)" stroke="#10b981" stroke-width="2" stroke-dasharray="3 3"/>
            <path d="M70 134 L82 139 V150 C82 157 77 163 70 166 C63 163 58 157 58 150 V139 Z" fill="rgba(16,185,129,0.4)" stroke="#10b981" stroke-width="1.5"/>
          </g>
          <g id="node-firebase" class="node-group">
            <circle cx="250" cy="50" r="24" fill="#1e293b" stroke="#64748b" stroke-width="2" class="node-circle"/>
            <circle cx="250" cy="46" r="5" fill="none" stroke="white" stroke-width="2"/>
            <path d="M250 51 V58 H254 M250 55 H253" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <text x="250" y="88" text-anchor="middle" class="node-label">Firebase Auth</text>
          </g>
          <g id="node-server" class="node-group">
            <circle cx="250" cy="160" r="28" fill="#1e293b" stroke="#64748b" stroke-width="2" class="node-circle"/>
            <rect x="238" y="148" width="24" height="6" rx="1" fill="none" stroke="white" stroke-width="2"/>
            <rect x="238" y="157" width="24" height="6" rx="1" fill="none" stroke="white" stroke-width="2"/>
            <rect x="238" y="166" width="24" height="6" rx="1" fill="none" stroke="white" stroke-width="2"/>
            <text x="250" y="205" text-anchor="middle" class="node-label">Server Cloud Run</text>
          </g>
          <g id="node-firestore" class="node-group">
            <circle cx="430" cy="90" r="24" fill="#1e293b" stroke="#64748b" stroke-width="2" class="node-circle"/>
            <ellipse cx="430" cy="82" rx="10" ry="4" fill="none" stroke="white" stroke-width="2"/>
            <path d="M420 82 V90 C420 93 424 95 430 95 C436 95 440 93 440 90 V82" stroke="white" stroke-width="2"/>
            <text x="430" y="128" text-anchor="middle" class="node-label">Firestore DB</text>
          </g>
          <g id="node-buckets" class="node-group">
            <circle cx="430" cy="230" r="24" fill="#1e293b" stroke="#64748b" stroke-width="2" class="node-circle"/>
            <path d="M418 220 H442 L438 242 H422 Z" fill="none" stroke="white" stroke-width="2"/>
            <path d="M424 220 Q430 212 436 220" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <text x="430" y="268" text-anchor="middle" class="node-label">GCS Buckets</text>
          </g>
          <g id="node-dashboard" class="node-group">
            <circle cx="250" cy="270" r="24" fill="#1e293b" stroke="#64748b" stroke-width="2" class="node-circle"/>
            <rect x="238" y="258" width="24" height="16" rx="2" fill="none" stroke="white" stroke-width="2"/>
            <line x1="244" y1="274" x2="244" y2="280" stroke="white" stroke-width="2"/>
            <line x1="240" y1="280" x2="260" y2="280" stroke="white" stroke-width="2"/>
            <text x="315" y="274" text-anchor="start" class="node-label">Dashboard Docente</text>
          </g>
        </svg>
      </div>
      <div class="flow-description-card">
        <div>
          <h4 id="flow-step-title" style="color:var(--cyan);font-size:1.2rem;margin-bottom:0.5rem">Paso 1: Autenticación Segura</h4>
          <p id="flow-step-desc" style="color:var(--text-1);font-size:0.9rem;line-height:1.6;margin-bottom:1rem">El daemon de ExamLock invoca la REST API de Firebase Auth para obtener un token JWT firmado directamente desde la máquina local.</p>
          <div class="highlight-box" style="padding:1rem">
            <h5 style="color:white;font-family:var(--font-title);font-size:0.9rem;margin-bottom:0.4rem">Ficha Técnica:</h5>
            <ul style="font-size:0.82rem;color:var(--text-2);list-style:none;display:flex;flex-direction:column;gap:0.3rem">
              <li>• <b>Protocolo:</b> <span id="flow-tech-proto" class="mono">HTTPS (REST API)</span></li>
              <li>• <b>Payload:</b> <span id="flow-tech-payload" class="mono">email, password, secureCode</span></li>
              <li>• <b>Ventaja:</b> <span id="flow-tech-advantage">Token JWT firmado y auto-expirable.</span></li>
            </ul>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:1rem">
          <button class="btn btn-sm" onclick="prevFlowStep()" id="flow-btn-prev">« Anterior</button>
          <span id="flow-step-counter" class="nav-counter">1 / 6</span>
          <button class="btn btn-sm btn-cyan" onclick="nextFlowStep()" id="flow-btn-next">Siguiente »</button>
        </div>
      </div>
    </div>
  </div>
</div>`,

/* 6 — Demo / Simulador */
`<div class="slide-card">
  <div class="slide-header">
    <div><h2 class="slide-title">Demostración en Vivo</h2><p class="slide-subtitle">Simulador paso a paso de una sesión de examen completa con 25 alumnos</p></div>
    <span class="badge badge-purple">DEMO EN VIVO</span>
  </div>
  <div class="slide-body">
    <div class="grid-2" style="width:100%;align-items:center;gap:2rem">
      <div>
        <p style="color:var(--text-1);font-size:1rem;line-height:1.7;margin-bottom:1rem">El simulador recorre <b>9 etapas discretas</b> de una sesión real. Cada paso avanza con velocidad logarítmica (lento → rápido → lento), visualizando el escalado de Cloud Run y los flujos de auth en detalle.</p>
        <div class="highlight-box" style="margin-bottom:1.2rem">
          <h4 style="color:white;font-family:var(--font-title);font-size:0.95rem;margin-bottom:0.5rem">Etapas del simulador:</h4>
          <ul style="font-size:0.82rem;color:var(--text-2);list-style:none;display:flex;flex-direction:column;gap:0.35rem">
            <li>• Servidor arranca → Cloud Run escala <b>0 → 1</b> instancia</li>
            <li>• <b>25 PCs</b> pop-in uno a uno con flujo auth animado (JWT → Firestore → iptables)</li>
            <li>• Telemetría fluye a GCS — frames JPEG cifrados cada 2s</li>
            <li>• Incidentes: DNS evasion, Wi-Fi cut, USB, keylogger IA</li>
            <li>• Expulsión animada → Cloud Run escala <b>2 → 0</b> al cerrar</li>
          </ul>
        </div>
        <button class="btn btn-primary btn-lg" onclick="openSimTab()">Abrir Simulador en Vivo</button>
      </div>
      <div style="background:rgba(17,24,39,0.5);border:1px solid var(--border);border-radius:var(--radius-md);padding:1.2rem;display:flex;flex-direction:column;gap:0.7rem">
        <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--purple);text-transform:uppercase;font-weight:bold">[ Etapas del Simulador ]</div>
        <div style="display:flex;flex-direction:column;gap:0.5rem;font-size:0.82rem">
          <div style="display:flex;gap:0.6rem;align-items:flex-start"><span style="color:var(--cyan);font-family:var(--font-mono);width:20px;flex-shrink:0">1</span><span>Servidor arranca — Cloud Run activo</span></div>
          <div style="display:flex;gap:0.6rem;align-items:flex-start"><span style="color:var(--cyan);font-family:var(--font-mono);width:20px;flex-shrink:0">2</span><span><b>25 alumnos se conectan</b> — JWT + iptables</span></div>
          <div style="display:flex;gap:0.6rem;align-items:flex-start"><span style="color:var(--cyan);font-family:var(--font-mono);width:20px;flex-shrink:0">3</span><span>Examen en curso — telemetría a GCS</span></div>
          <div style="display:flex;gap:0.6rem;align-items:flex-start"><span style="color:var(--amber);font-family:var(--font-mono);width:20px;flex-shrink:0">4</span><span>Valentina: intento DNS bypass → autocurado</span></div>
          <div style="display:flex;gap:0.6rem;align-items:flex-start"><span style="color:var(--amber);font-family:var(--font-mono);width:20px;flex-shrink:0">5</span><span>Rodrigo: Wi-Fi cortado → modo contingencia</span></div>
          <div style="display:flex;gap:0.6rem;align-items:flex-start"><span style="color:var(--red);font-family:var(--font-mono);width:20px;flex-shrink:0">7</span><span><b>Pedro: USB → EXPULSIÓN</b> (animación completa)</span></div>
          <div style="display:flex;gap:0.6rem;align-items:flex-start"><span style="color:var(--emerald);font-family:var(--font-mono);width:20px;flex-shrink:0">9</span><span>Fin seguro — iptables -F, loginctl, scale=0</span></div>
        </div>
      </div>
    </div>
  </div>
</div>`,

/* 7 — Despliegue */
`<div class="slide-card">
  <div class="slide-header">
    <div><h2 class="slide-title">Modos de Despliegue Adaptables</h2><p class="slide-subtitle">Tres estrategias para distintas realidades de infraestructura</p></div>
    <span class="badge badge-emerald">INFRAESTRUCTURA</span>
  </div>
  <div class="slide-body">
    <div class="grid-3" style="width:100%">
      <div class="card-item" style="border-color:rgba(6,182,212,0.2)">
        <h3 class="card-title" style="color:var(--cyan)">ISO Booteable (Debian Live)</h3>
        <p class="card-desc">El método más seguro. Arranca desde USB, ignorando el disco del host. Todo el SO corre en RAM (tmpfs). Creado con <span class="mono">live-build</span>.</p>
        <div style="margin-top:0.8rem;font-size:0.75rem;color:var(--text-3);font-family:var(--font-mono)">✓ BYOD / Laboratorios<br>✓ Sin tocar el disco del host<br>✓ Máxima seguridad</div>
      </div>
      <div class="card-item" style="border-color:rgba(139,92,246,0.2)">
        <h3 class="card-title" style="color:var(--purple)">BYOD VM (Ubuntu OVA)</h3>
        <p class="card-desc">Máquina virtual lista para importar en VirtualBox o VMware. Ideal cuando no se puede reiniciar el equipo del estudiante.</p>
        <div style="margin-top:0.8rem;font-size:0.75rem;color:var(--text-3);font-family:var(--font-mono)">✓ BYOD desde casa<br>✓ Sin reinstalar nada<br>⚠ Vector: escape de VM</div>
      </div>
      <div class="card-item" style="border-color:rgba(16,185,129,0.2)">
        <h3 class="card-title" style="color:var(--emerald)">Modo Laboratorio (Docker + Kiosk)</h3>
        <p class="card-desc">Contenedor Docker con <span class="mono">--read-only</span>, aislamiento de red física y compositor gráfico Cage. Despliegue ultra rápido en PCs del laboratorio.</p>
        <div style="margin-top:0.8rem;font-size:0.75rem;color:var(--text-3);font-family:var(--font-mono)">✓ Universidades<br>✓ Despliegue en minutos<br>✓ Sin alterar el host</div>
      </div>
    </div>
  </div>
</div>`,

/* 8 — OS Hardening */
`<div class="slide-card">
  <div class="slide-header">
    <div><h2 class="slide-title">Hardening del Sistema Operativo</h2><p class="slide-subtitle">Entorno de ejecución endurecido que elimina superficies de ataque desde la raíz</p></div>
    <span class="badge badge-red">SEGURIDAD</span>
  </div>
  <div class="slide-body">
    <div class="grid-2" style="width:100%;gap:1.5rem;align-items:start">
      <div class="steps-container">
        <div class="step-row"><div class="step-number" style="background:linear-gradient(135deg,#ef4444,#f59e0b)">A</div><div class="step-content"><h4 class="step-heading">Cage (Wayland Compositor)</h4><p class="step-text">Elimina barra de tareas, atajos de sistema (Ctrl+Alt+T, Alt+F2) y menú contextual. Solo una ventana a pantalla completa es posible.</p></div></div>
        <div class="step-row"><div class="step-number" style="background:linear-gradient(135deg,#3b82f6,#06b6d4)">B</div><div class="step-content"><h4 class="step-heading">Daemon en Segundo Plano</h4><p class="step-text">El daemon corre silenciosamente en background, aplicando las reglas de red y enviando telemetría. El alumno solo ve la interfaz del examen.</p></div></div>
        <div class="step-row"><div class="step-number" style="background:linear-gradient(135deg,#8b5cf6,#ec4899)">C</div><div class="step-content"><h4 class="step-heading">Usuario Sin Privilegios</h4><p class="step-text">Interacción bajo usuario <span class="mono">user</span> sin capacidad de <span class="mono">sudo</span>, sin acceso a <span class="mono">/sbin</span> ni herramientas de red.</p></div></div>
        <div class="step-row"><div class="step-number" style="background:linear-gradient(135deg,#10b981,#06b6d4)">D</div><div class="step-content"><h4 class="step-heading">Filesystem Read-Only + noexec</h4><p class="step-text">Todo el FS es inmutable. Solo <span class="mono">/tmp</span> en RAM con flag <span class="mono">noexec</span>: no se puede ejecutar ningún binario descargado.</p></div></div>
      </div>
      <div class="highlight-box">
        <h4 class="highlight-title">Capas de Defensa</h4>
        <div style="display:flex;flex-direction:column;gap:0.5rem;margin-top:0.5rem">
          <div style="display:flex;justify-content:space-between;font-size:0.82rem"><span style="color:var(--text-2)">Compositor gráfico</span><span class="badge badge-emerald">Cage (Wayland)</span></div>
          <div style="display:flex;justify-content:space-between;font-size:0.82rem"><span style="color:var(--text-2)">Daemon</span><span class="badge badge-cyan">background service</span></div>
          <div style="display:flex;justify-content:space-between;font-size:0.82rem"><span style="color:var(--text-2)">Usuarios</span><span class="badge badge-purple">cap-drop + nologin</span></div>
          <div style="display:flex;justify-content:space-between;font-size:0.82rem"><span style="color:var(--text-2)">Filesystem</span><span class="badge badge-red">read-only + noexec</span></div>
          <div style="display:flex;justify-content:space-between;font-size:0.82rem"><span style="color:var(--text-2)">Red kernel</span><span class="badge badge-amber">iptables OUTPUT DROP</span></div>
        </div>
      </div>
    </div>
  </div>
</div>`,

/* 9 — Red */
`<div class="slide-card">
  <div class="slide-header">
    <div><h2 class="slide-title">Control de Red y Whitelisting</h2><p class="slide-subtitle">Filtrado a nivel kernel — imposible evadir desde userspace</p></div>
    <span class="badge badge-red">SEGURIDAD</span>
  </div>
  <div class="slide-body">
    <div class="grid-2-1" style="width:100%">
      <div class="steps-container">
        <div class="step-row"><div class="step-number">1</div><div class="step-content"><h4 class="step-heading">Cero Confianza en el Navegador</h4><p class="step-text">El filtrado ocurre a nivel kernel mediante <span class="mono">iptables</span>/<span class="mono">nftables</span>. No extensiones web — inútiles para el estudiante.</p></div></div>
        <div class="step-row"><div class="step-number">2</div><div class="step-content"><h4 class="step-heading">Whitelisting Dinámico</h4><p class="step-text">Solo se permite tráfico hacia el servidor de ExamLock, Firebase Auth y los dominios cargados en caliente por el docente desde su dashboard.</p></div></div>
        <div class="step-row"><div class="step-number">3</div><div class="step-content"><h4 class="step-heading">Bloqueo de Bypass</h4><p class="step-text">Denegación explícita de DNS externos (1.1.1.1, 8.8.8.8), puertos alternativos, túneles VPN y proxies locales.</p></div></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:1rem">
        <div class="code-block">iptables -P OUTPUT DROP<br>iptables -A OUTPUT -d examlock.server -j ACCEPT<br>iptables -A OUTPUT -d firebase.googleapis.com -j ACCEPT<br># Whitelist dinámica del docente...</div>
        <div class="highlight-box">
          <h4 class="highlight-title">¿Por qué kernel-level?</h4>
          <p style="font-size:0.82rem;color:var(--text-2);line-height:1.5">Cualquier filtrado en userspace (extensiones, proxies locales) puede ser desactivado por el usuario. Las reglas de iptables solo pueden modificarse con privilegios root — el alumno no los tiene.</p>
        </div>
      </div>
    </div>
  </div>
</div>`,

/* 10 — Monitoreo */
`<div class="slide-card">
  <div class="slide-header">
    <div><h2 class="slide-title">Monitoreo Activo y Proctoring</h2><p class="slide-subtitle">Supervisión continua y en tiempo real durante toda la sesión de examen</p></div>
    <span class="badge badge-cyan">PROCTORING</span>
  </div>
  <div class="slide-body">
    <div class="grid-2" style="width:100%;gap:1.5rem;align-items:start">
      <div class="grid-2" style="gap:1rem">
        <div class="card-item"><h3 class="card-title" style="font-size:1rem">Heartbeat</h3><p class="card-desc" style="font-size:0.82rem">Latido constante cada 15s. Si el agente pierde conexión >30s, el docente recibe alerta inmediata en el dashboard.</p></div>
        <div class="card-item"><h3 class="card-title" style="font-size:1rem">Screenshots</h3><p class="card-desc" style="font-size:0.82rem">Capturas periódicas y bajo demanda transmitidas instantáneamente mediante WebSocket binario al grid del docente.</p></div>
        <div class="card-item"><h3 class="card-title" style="font-size:1rem">Stream de Pantalla</h3><p class="card-desc" style="font-size:0.82rem">Transmisión eficiente de frames JPEG 720p@0.5fps como Buffer binario nativo — 25% menos egress que base64.</p></div>
        <div class="card-item" style="opacity:0.45;border-style:dashed"><h3 class="card-title" style="font-size:1rem">Webcam <span style="font-size:0.7rem;color:var(--red);font-weight:400">(no implementado)</span></h3><p class="card-desc" style="font-size:0.82rem">Capturas aleatorias del rostro del estudiante — pendiente de implementación.</p></div>
      </div>
      <div class="highlight-box">
        <h4 class="highlight-title">Métricas por Alumno (2h)</h4>
        <table class="data-table" style="margin-top:0.5rem">
          <thead><tr><th>Evento</th><th class="num">Cant.</th></tr></thead>
          <tbody>
            <tr><td>Heartbeats (15s)</td><td class="num">480</td></tr>
            <tr><td>Frames stream (2s)</td><td class="num">3,600</td></tr>
            <tr><td>Screenshots on-demand</td><td class="num">~5</td></tr>
            <tr><td>Eventos Firestore</td><td class="num">~500</td></tr>
            <tr><td>Egreso GCP total</td><td class="num">~0.4 GiB</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>`,

/* 11 — Keylogger IA */
`<div class="slide-card">
  <div class="slide-header">
    <div><h2 class="slide-title">Auditoría de Teclado con IA</h2><p class="slide-subtitle">Detección de patrones adversariales mediante análisis heurístico de pulsaciones</p></div>
    <span class="badge badge-purple">INNOVACIÓN</span>
  </div>
  <div class="slide-body">
    <div class="grid-2-1" style="width:100%">
      <div class="steps-container">
        <div class="step-row"><div class="step-number">1</div><div class="step-content"><h4 class="step-heading">Captura a Nivel de Sistema</h4><p class="step-text">Pulsaciones capturadas directamente desde el hardware gráfico usando <span class="mono">xinput</span>. No se pueden evadir desde el navegador.</p></div></div>
        <div class="step-row"><div class="step-number">2</div><div class="step-content"><h4 class="step-heading">Auditoría Local Cifrada</h4><p class="step-text">Registro en base de datos <span class="mono">SQLite</span> local cifrada del agente. Los datos sensibles permanecen protegidos en el dispositivo.</p></div></div>
        <div class="step-row"><div class="step-number">3</div><div class="step-content"><h4 class="step-heading">Detección de Patrones IA</h4><p class="step-text">Análisis de chunks de texto para detectar comandos prohibidos, atajos inusuales y <b>copy-paste masivo</b> que indica código copiado de otro dispositivo.</p></div></div>
        <div class="step-row"><div class="step-number">4</div><div class="step-content"><h4 class="step-heading">Alertas Automáticas</h4><p class="step-text">Si el ritmo de escritura es "sobrehumano" (>500 caracteres en <2s) o el patrón sugiere IA, se genera alerta roja en el dashboard del docente.</p></div></div>
      </div>
      <div class="highlight-box">
        <h4 class="highlight-title">Señales Detectadas</h4>
        <div style="display:flex;flex-direction:column;gap:0.5rem;margin-top:0.5rem;font-size:0.82rem">
          <div style="display:flex;gap:0.5rem;align-items:center"><span class="badge badge-red">CRÍTICO</span><span style="color:var(--text-2)">Paste masivo &gt;500 chars/2s</span></div>
          <div style="display:flex;gap:0.5rem;align-items:center"><span class="badge badge-red">CRÍTICO</span><span style="color:var(--text-2)">Comandos shell en campo de texto</span></div>
          <div style="display:flex;gap:0.5rem;align-items:center"><span class="badge badge-amber">ALERTA</span><span style="color:var(--text-2)">Pausa larga + escritura súbita</span></div>
          <div style="display:flex;gap:0.5rem;align-items:center"><span class="badge badge-amber">ALERTA</span><span style="color:var(--text-2)">Atajos F12, Ctrl+Shift+I</span></div>
          <div style="display:flex;gap:0.5rem;align-items:center"><span class="badge badge-cyan">INFO</span><span style="color:var(--text-2)">Velocidad de escritura anómala</span></div>
        </div>
      </div>
    </div>
  </div>
</div>`,

/* 12 — Pentest Metodología */
`<div class="slide-card">
  <div class="slide-header">
    <div><h2 class="slide-title">Metodología de Pentesting</h2><p class="slide-subtitle">Pruebas adversariales contra cada capa del entorno de seguridad</p></div>
    <span class="badge badge-amber">PENTESTING</span>
  </div>
  <div class="slide-body" style="flex-direction:column;gap:1rem">
    <p style="color:var(--text-2);font-size:0.9rem;text-align:center">12 vectores de ataque diseñados asumiendo un estudiante con conocimientos avanzados de redes y sistemas operativos</p>
    <div class="pentest-matrix">
      <div class="matrix-cell"><div class="matrix-title">sudo / Escalada</div><span class="status-ok">BLOQUEADO</span></div>
      <div class="matrix-cell"><div class="matrix-title">Internet Bypass</div><span class="status-ok">BLOQUEADO</span></div>
      <div class="matrix-cell"><div class="matrix-title">Binario en /tmp</div><span class="status-ok">BLOQUEADO</span></div>
      <div class="matrix-cell"><div class="matrix-title">DNS Spoofing</div><span class="status-ok">BLOQUEADO</span></div>
      <div class="matrix-cell"><div class="matrix-title">Escalada Root</div><span class="status-ok">BLOQUEADO</span></div>
      <div class="matrix-cell"><div class="matrix-title">Kill del Agente</div><span class="status-ok">BLOQUEADO</span></div>
      <div class="matrix-cell"><div class="matrix-title">USB con Scripts</div><span class="status-ok">BLOQUEADO</span></div>
      <div class="matrix-cell"><div class="matrix-title">VPN/Proxy</div><span class="status-ok">BLOQUEADO</span></div>
      <div class="matrix-cell warning"><div class="matrix-title">DevTools F12</div><span class="status-warn">MITIGADO</span></div>
      <div class="matrix-cell"><div class="matrix-title">Modificar /etc</div><span class="status-ok">BLOQUEADO</span></div>
      <div class="matrix-cell warning"><div class="matrix-title">Teléfono Externo</div><span class="status-warn">MITIGADO</span></div>
      <div class="matrix-cell warning"><div class="matrix-title">Escape VM (BYOD)</div><span class="status-warn">MITIGADO</span></div>
    </div>
  </div>
</div>`,

/* 13 — Dashboard Docente */
`<div class="slide-card">
  <div class="slide-header">
    <div><h2 class="slide-title">Dashboard Docente</h2><p class="slide-subtitle">React SPA en Firebase Hosting — cuatro módulos de gestión y control</p></div>
    <span class="badge badge-cyan">DASHBOARD</span>
  </div>
  <div class="slide-body">
    <div class="grid-2" style="width:100%;gap:1.5rem;align-items:start">
      <div class="steps-container">
        <div class="step-row"><div class="step-number" style="background:linear-gradient(135deg,#06b6d4,#8b5cf6)">1</div><div class="step-content"><h4 class="step-heading">Sesiones — Crear y Configurar</h4><p class="step-text">El docente crea una sesión con código único (<span class="mono">secureCode</span>), configura la whitelist de dominios permitidos (con presets reutilizables), duración y número máximo de alumnos.</p></div></div>
        <div class="step-row"><div class="step-number" style="background:linear-gradient(135deg,#8b5cf6,#ec4899)">2</div><div class="step-content"><h4 class="step-heading">Monitor en Vivo — Grid de Alumnos</h4><p class="step-text">Vista en tiempo real de todos los alumnos conectados: último frame de pantalla, estado de heartbeat, alertas de IA. Clic en alumno abre stream de video en vivo. Botón de expulsión inmediata.</p></div></div>
        <div class="step-row"><div class="step-number" style="background:linear-gradient(135deg,#10b981,#06b6d4)">3</div><div class="step-content"><h4 class="step-heading">Auditoría — Registro Inmutable</h4><p class="step-text">Historial completo de eventos por alumno: timestamps de conexión/desconexión, alertas de keylogger, capturas de infracción descargables. Almacenado 90 días en GCS.</p></div></div>
        <div class="step-row"><div class="step-number" style="background:linear-gradient(135deg,#f59e0b,#ef4444)">4</div><div class="step-content"><h4 class="step-heading">Admin — Usuarios y Configuración</h4><p class="step-text">Gestión de roles (docente/admin), presets de dominios de whitelist reutilizables, parámetros de monitoreo configurables (intervalo, resolución, umbral de alertas).</p></div></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:1rem">
        <div class="highlight-box">
          <h4 class="highlight-title">Flujo del Docente</h4>
          <div style="display:flex;flex-direction:column;gap:0.5rem;margin-top:0.5rem;font-size:0.82rem">
            <div style="display:flex;gap:0.5rem;align-items:center"><span class="badge badge-cyan">1</span><span style="color:var(--text-2)">Crear sesión → copiar <span class="mono">secureCode</span></span></div>
            <div style="display:flex;gap:0.5rem;align-items:center"><span class="badge badge-purple">2</span><span style="color:var(--text-2)">Distribuir código a alumnos (email/chat)</span></div>
            <div style="display:flex;gap:0.5rem;align-items:center"><span class="badge badge-emerald">3</span><span style="color:var(--text-2)">Ver grid: <b>alumnos admitidos en vivo</b></span></div>
            <div style="display:flex;gap:0.5rem;align-items:center"><span class="badge badge-amber">4</span><span style="color:var(--text-2)">Responder alertas o expulsar</span></div>
            <div style="display:flex;gap:0.5rem;align-items:center"><span class="badge badge-red">5</span><span style="color:var(--text-2)">Finalizar → auditoría disponible inmediatamente</span></div>
          </div>
        </div>
        <div class="highlight-box">
          <h4 class="highlight-title">Acciones en Tiempo Real</h4>
          <div style="display:flex;flex-direction:column;gap:0.3rem;margin-top:0.4rem;font-size:0.82rem;color:var(--text-2)">
            <div>• Stream en vivo por alumno (WebSocket binario)</div>
            <div>• Enviar mensaje al agente del alumno</div>
            <div>• Expulsión con un clic (<span class="mono">loginctl terminate-user</span>)</div>
            <div>• Modificar whitelist en caliente</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,

/* 14 — Vectores Residuales */
`<div class="slide-card">
  <div class="slide-header">
    <div><h2 class="slide-title">Análisis de Riesgo Residual</h2><p class="slide-subtitle">Vectores conocidos con controles compensatorios activos</p></div>
    <span class="badge badge-amber">RIESGO RESIDUAL</span>
  </div>
  <div class="slide-body">
    <div class="grid-3" style="width:100%">
      <div class="card-item" style="border-color:rgba(245,158,11,0.3)">
        <h3 class="card-title" style="color:var(--amber)">Escape de VM (BYOD)</h3>
        <p class="card-desc" style="font-size:0.82rem"><b>Vector:</b> Minimizar la VM y abrir el navegador host.</p>
        <p style="font-size:0.8rem;color:var(--emerald);margin-top:0.5rem"><b>Mitigación:</b> Monitoreo de desconexiones + capturas de pantalla por heartbeat.</p>
      </div>
      <div class="card-item" style="border-color:rgba(245,158,11,0.3)">
        <h3 class="card-title" style="color:var(--amber)">DevTools Abierto</h3>
        <p class="card-desc" style="font-size:0.82rem"><b>Vector:</b> El estudiante puede abrir DevTools y explorar la interfaz del examen.</p>
        <p style="font-size:0.8rem;color:var(--emerald);margin-top:0.5rem"><b>Mitigación:</b> Red bloqueada a nivel kernel — sin acceso externo aunque ejecute JS en consola.</p>
      </div>
      <div class="card-item" style="border-color:rgba(245,158,11,0.3)">
        <h3 class="card-title" style="color:var(--amber)">Dispositivo Externo (Teléfono)</h3>
        <p class="card-desc" style="font-size:0.82rem"><b>Vector:</b> Ningún software puede bloquear un teléfono secundario físico.</p>
        <p style="font-size:0.8rem;color:var(--emerald);margin-top:0.5rem"><b>Mitigación:</b> Keylogger IA detecta pausas + paste súbito. Supervisión presencial como capa final.</p>
      </div>
    </div>
  </div>
</div>`,

/* 15 — Ciclo de vida */
`<div class="slide-card">
  <div class="slide-header">
    <div><h2 class="slide-title">Ciclo de Vida del Examen</h2><p class="slide-subtitle">Cuatro fases automatizadas de operación para docentes y estudiantes</p></div>
    <span class="badge badge-cyan">OPERACIÓN</span>
  </div>
  <div class="slide-body">
    <div style="width:100%;display:flex;flex-direction:column;gap:1.2rem">
      <div class="grid-4" style="width:100%">
        <div class="card-item" style="border-color:rgba(6,182,212,0.2);text-align:center">
          <h3 class="card-title" style="font-size:0.95rem;text-align:center;color:var(--cyan)">Fase 1: Preparación</h3>
          <p class="card-desc" style="font-size:0.78rem;text-align:center">Docente crea sesión, configura whitelist, preguntas y duración desde el Dashboard React.</p>
        </div>
        <div class="card-item" style="border-color:rgba(139,92,246,0.2);text-align:center">
          <h3 class="card-title" style="font-size:0.95rem;text-align:center;color:var(--purple)">Fase 2: Admisión</h3>
          <p class="card-desc" style="font-size:0.78rem;text-align:center">Alumno arranca ISO/VM, ingresa credenciales y código. JWT firmado → bloqueo local automático.</p>
        </div>
        <div class="card-item" style="border-color:rgba(16,185,129,0.2);text-align:center">
          <h3 class="card-title" style="font-size:0.95rem;text-align:center;color:var(--emerald)">Fase 3: Ejecución</h3>
          <p class="card-desc" style="font-size:0.78rem;text-align:center">Estudiante resuelve la prueba. Daemon transmite telemetría silenciosamente. Docente monitorea en vivo.</p>
        </div>
        <div class="card-item" style="border-color:rgba(245,158,11,0.2);text-align:center">
          <h3 class="card-title" style="font-size:0.95rem;text-align:center;color:var(--amber)">Fase 4: Cierre</h3>
          <p class="card-desc" style="font-size:0.78rem;text-align:center">Docente finaliza la sesión. Daemon ejecuta <span class="mono">loginctl terminate-user</span> y borra la sesión de RAM.</p>
        </div>
      </div>
      <div class="highlight-box" style="text-align:center">
        <p style="font-size:0.9rem;color:var(--text-2)">Preparación del docente: <b style="color:white">&lt; 2 minutos</b> · Admisión del alumno: <b style="color:white">&lt; 30 segundos</b> · Destrucción segura de sesión: <b style="color:white">automática</b></p>
      </div>
    </div>
  </div>
</div>`,

/* 16 — Análisis de Costos GCP (NUEVA) */
`<div class="slide-card">
  <div class="slide-header">
    <div><h2 class="slide-title">Análisis de Costos GCP</h2><p class="slide-subtitle">Modelo económico detallado — serverless, costos variables por alumno</p></div>
    <span class="badge badge-amber">COSTOS GCP</span>
  </div>
  <div class="slide-body" style="flex-direction:column;gap:0.8rem">
    <p style="font-size:0.75rem;color:var(--text-3);text-align:center;font-family:var(--font-mono)">Selecciona una card para ver el cálculo detallado</p>
    <div class="grid-3" style="width:100%">
      <div class="card-item cost-kpi-card" id="cost-kpi-0" onclick="selectCostCard(0)" style="border-color:rgba(16,185,129,0.3);text-align:center;cursor:pointer;transition:all 0.2s">
        <div style="font-size:2rem;font-family:var(--font-title);font-weight:800;color:var(--emerald)">~$0/mes</div>
        <div style="font-size:0.8rem;color:var(--text-2);margin-top:0.3rem">Costo fijo mensual</div>
        <div style="font-size:0.68rem;color:var(--text-3);margin-top:0.2rem;font-family:var(--font-mono)">(minScale=0)</div>
      </div>
      <div class="card-item cost-kpi-card" id="cost-kpi-1" onclick="selectCostCard(1)" style="border-color:rgba(6,182,212,0.3);text-align:center;cursor:pointer;transition:all 0.2s">
        <div style="font-size:2rem;font-family:var(--font-title);font-weight:800;color:var(--cyan)">$0.058</div>
        <div style="font-size:0.8rem;color:var(--text-2);margin-top:0.3rem">Por alumno · examen</div>
        <div style="font-size:0.68rem;color:var(--text-3);margin-top:0.2rem;font-family:var(--font-mono)">(720p/2s · 2h · 1 docente)</div>
      </div>
      <div class="card-item cost-kpi-card" id="cost-kpi-2" onclick="selectCostCard(2)" style="border-color:rgba(139,92,246,0.3);text-align:center;cursor:pointer;transition:all 0.2s">
        <div style="font-size:2rem;font-family:var(--font-title);font-weight:800;color:var(--purple)">$1.16</div>
        <div style="font-size:0.8rem;color:var(--text-2);margin-top:0.3rem">Por alumno · semestre</div>
        <div style="font-size:0.68rem;color:var(--text-3);margin-top:0.2rem;font-family:var(--font-mono)">(5 cursos × 4 exámenes × 2h)</div>
      </div>
    </div>
    <div id="cost-detail-panel" style="display:none;width:100%"></div>
    <div id="cost-default-panel" class="grid-2" style="width:100%;gap:1rem">
      <div>
        <table class="data-table">
          <thead><tr><th>Componente</th><th class="num">Costo/alumno·2h</th><th class="num">%</th></tr></thead>
          <tbody>
            <tr class="highlight-row"><td>Egreso stream 720p/2s</td><td class="num">$0.047</td><td class="num">81%</td></tr>
            <tr><td>Cloud Run (CPU + RAM)</td><td class="num">$0.0095</td><td class="num">16%</td></tr>
            <tr><td>Firestore</td><td class="num">$0.0006</td><td class="num">1%</td></tr>
            <tr><td>GCS Screenshots</td><td class="num">$0.0001</td><td class="num">&lt;1%</td></tr>
            <tr><td>Firebase Auth</td><td class="num">$0.00</td><td class="num">0%</td></tr>
            <tr style="font-weight:700"><td>TOTAL</td><td class="num">$0.058</td><td class="num">100%</td></tr>
          </tbody>
        </table>
      </div>
      <div>
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:200px;display:block;margin:0 auto">
          <circle cx="100" cy="100" r="70" fill="none" stroke="#06b6d4" stroke-width="40" stroke-dasharray="356.5 439.6" stroke-dashoffset="0" transform="rotate(-90 100 100)"/>
          <circle cx="100" cy="100" r="70" fill="none" stroke="#8b5cf6" stroke-width="40" stroke-dasharray="70.4 439.6" stroke-dashoffset="-356.5" transform="rotate(-90 100 100)"/>
          <circle cx="100" cy="100" r="70" fill="none" stroke="#f59e0b" stroke-width="40" stroke-dasharray="13.2 439.6" stroke-dashoffset="-427" transform="rotate(-90 100 100)"/>
          <circle cx="100" cy="100" r="50" fill="#030712"/>
          <text x="100" y="96" text-anchor="middle" fill="white" font-size="14" font-family="Outfit,sans-serif" font-weight="800">82%</text>
          <text x="100" y="112" text-anchor="middle" fill="#9ca3af" font-size="9" font-family="Plus Jakarta Sans,sans-serif">egreso</text>
        </svg>
        <div style="display:flex;flex-direction:column;gap:0.3rem;margin-top:0.5rem;font-size:0.75rem">
          <div style="display:flex;align-items:center;gap:0.4rem"><span style="width:10px;height:10px;border-radius:2px;background:var(--cyan);flex-shrink:0"></span><span style="color:var(--text-2)">Egreso stream (81%)</span></div>
          <div style="display:flex;align-items:center;gap:0.4rem"><span style="width:10px;height:10px;border-radius:2px;background:var(--purple);flex-shrink:0"></span><span style="color:var(--text-2)">Cloud Run (16%)</span></div>
          <div style="display:flex;align-items:center;gap:0.4rem"><span style="width:10px;height:10px;border-radius:2px;background:var(--amber);flex-shrink:0"></span><span style="color:var(--text-2)">Firestore+GCS (3%)</span></div>
        </div>
      </div>
    </div>
  </div>
</div>`,

/* 17 — Sensibilidad y Escenarios (NUEVA) */
`<div class="slide-card">
  <div class="slide-header">
    <div><h2 class="slide-title">Sensibilidad y Escenarios de Escala</h2><p class="slide-subtitle">Cómo varía el costo según resolución, intervalo y número de alumnos</p></div>
    <span class="badge badge-amber">COSTOS GCP</span>
  </div>
  <div class="slide-body" style="flex-direction:column;gap:1rem">
    <div class="grid-2" style="width:100%;gap:1.5rem">
      <div>
        <p style="font-size:0.8rem;color:var(--text-2);margin-bottom:0.5rem;font-weight:600">SENSIBILIDAD POR RESOLUCIÓN / INTERVALO <span style="font-weight:400;font-size:0.72rem;opacity:0.7">— clic para actualizar gráfica</span></p>
        <table class="data-table">
          <thead><tr><th>Modo</th><th class="num">GiB/alumno</th><th class="num">Egreso</th><th class="num">Total</th></tr></thead>
          <tbody>
            <tr id="s17-row-0" style="cursor:pointer" onclick="window.s17SelectMode(0)"><td>480p / 5s</td><td class="num">0.056</td><td class="num">$0.007</td><td class="num">$0.017</td></tr>
            <tr id="s17-row-1" style="cursor:pointer" onclick="window.s17SelectMode(1)"><td>480p / 2s</td><td class="num">0.141</td><td class="num">$0.017</td><td class="num">$0.027</td></tr>
            <tr id="s17-row-2" class="highlight-row" style="cursor:pointer" onclick="window.s17SelectMode(2)"><td>720p / 2s ★ default</td><td class="num">0.395</td><td class="num">$0.047</td><td class="num">$0.058</td></tr>
            <tr id="s17-row-3" style="cursor:pointer" onclick="window.s17SelectMode(3)"><td>720p / 1s</td><td class="num">0.790</td><td class="num">$0.095</td><td class="num">$0.105</td></tr>
            <tr id="s17-row-4" style="cursor:pointer" onclick="window.s17SelectMode(4)"><td>1080p / 2s</td><td class="num">0.772</td><td class="num">$0.093</td><td class="num">$0.103</td></tr>
          </tbody>
        </table>
      </div>
      <div>
        <p id="s17-chart-title" style="font-size:0.8rem;color:var(--text-2);margin-bottom:0.5rem;font-weight:600">ESCENARIOS POR NÚMERO DE ALUMNOS (2h · 720p/2s · 1 docente)</p>
        <svg id="s17-svg" viewBox="0 0 280 140" xmlns="http://www.w3.org/2000/svg" style="width:100%">
          <line x1="30" y1="10" x2="30" y2="120" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
          <line x1="30" y1="120" x2="275" y2="120" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
          <text id="s17-y-0" x="25" y="14" fill="#6b7280" font-size="7" text-anchor="end" font-family="JetBrains Mono">$58</text>
          <text id="s17-y-1" x="25" y="44" fill="#6b7280" font-size="7" text-anchor="end" font-family="JetBrains Mono">$29</text>
          <text id="s17-y-2" x="25" y="74" fill="#6b7280" font-size="7" text-anchor="end" font-family="JetBrains Mono">$12</text>
          <text id="s17-y-3" x="25" y="104" fill="#6b7280" font-size="7" text-anchor="end" font-family="JetBrains Mono">$3</text>
          <rect id="s17-bar-0" x="38" y="119" width="22" height="1" fill="#06b6d4" rx="2"/>
          <rect id="s17-bar-1" x="70" y="115" width="22" height="5" fill="#06b6d4" rx="2"/>
          <rect id="s17-bar-2" x="102" y="110" width="22" height="10" fill="#06b6d4" rx="2"/>
          <rect id="s17-bar-3" x="134" y="100" width="22" height="20" fill="#8b5cf6" rx="2"/>
          <rect id="s17-bar-4" x="166" y="71" width="22" height="49" fill="#8b5cf6" rx="2"/>
          <rect id="s17-bar-5" x="198" y="21" width="22" height="99" fill="#f59e0b" rx="2"/>
          <text x="49" y="130" fill="#9ca3af" font-size="7" text-anchor="middle" font-family="JetBrains Mono">10</text>
          <text x="81" y="130" fill="#9ca3af" font-size="7" text-anchor="middle" font-family="JetBrains Mono">45</text>
          <text x="113" y="130" fill="#9ca3af" font-size="7" text-anchor="middle" font-family="JetBrains Mono">100</text>
          <text x="145" y="130" fill="#9ca3af" font-size="7" text-anchor="middle" font-family="JetBrains Mono">200</text>
          <text x="177" y="130" fill="#9ca3af" font-size="7" text-anchor="middle" font-family="JetBrains Mono">500</text>
          <text x="209" y="130" fill="#9ca3af" font-size="7" text-anchor="middle" font-family="JetBrains Mono">1000</text>
          <text id="s17-lbl-0" x="49" y="117" fill="white" font-size="6" text-anchor="middle">$0.58</text>
          <text id="s17-lbl-1" x="81" y="113" fill="white" font-size="6" text-anchor="middle">$2.60</text>
          <text id="s17-lbl-2" x="113" y="108" fill="white" font-size="6" text-anchor="middle">$5.77</text>
          <text id="s17-lbl-3" x="145" y="98" fill="white" font-size="6" text-anchor="middle">$11.53</text>
          <text id="s17-lbl-4" x="177" y="69" fill="white" font-size="6" text-anchor="middle">$28.81</text>
          <text id="s17-lbl-5" x="209" y="19" fill="white" font-size="6" text-anchor="middle">$57.62</text>
          <text x="155" y="140" fill="#6b7280" font-size="8" text-anchor="middle">Número de alumnos simultáneos</text>
        </svg>
        <div class="highlight-box" style="padding:0.7rem;margin-top:0.5rem">
          <p id="s17-scenario" style="font-size:0.78rem;color:var(--text-2)"><b>Escenario A (45 alumnos, 2h):</b> <span style="color:white">$2.60</span> · <b>Escenario B (500 alumnos, 2h):</b> <span style="color:white">$28.81</span></p>
          <p style="font-size:0.78rem;color:var(--text-2);margin-top:0.3rem">500 alumnos requiere <b>subir maxScale</b> del Cloud Run + session affinity WebSocket</p>
        </div>
      </div>
    </div>
  </div>
</div>`,

/* 18 — Simulador de Presupuesto (NUEVA) */
`<div class="slide-card">
  <div class="slide-header">
    <div><h2 class="slide-title">Simulador de Presupuesto Interactivo</h2><p class="slide-subtitle">Calcula el costo GCP en tiempo real según tus parámetros de examen</p></div>
    <span class="badge badge-amber">INTERACTIVO</span>
  </div>
  <div class="slide-body" style="flex-direction:column;gap:1rem">
    <div class="grid-2" style="width:100%;gap:2rem;align-items:start">
      <div style="display:flex;flex-direction:column;gap:1rem">
        <div>
          <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:0.3rem"><span style="color:var(--text-2)">Alumnos</span><b id="bs-val-students">45</b></div>
          <input type="range" id="bs-students" min="1" max="500" value="45" style="width:100%" oninput="window.budgetSliderUpdate()">
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:0.3rem"><span style="color:var(--text-2)">Duración del examen</span><b id="bs-val-hours">2 horas</b></div>
          <input type="range" id="bs-hours" min="0.5" max="4" step="0.5" value="2" style="width:100%" oninput="window.budgetSliderUpdate()">
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:0.3rem"><span style="color:var(--text-2)">Intervalo stream</span><b id="bs-val-interval">2s (720p)</b></div>
          <input type="range" id="bs-interval" min="1" max="5" step="1" value="2" style="width:100%" oninput="window.budgetSliderUpdate()">
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:0.3rem"><span style="color:var(--text-2)">Docentes mirando</span><b id="bs-val-teachers">1</b></div>
          <input type="range" id="bs-teachers" min="1" max="5" value="1" style="width:100%" oninput="window.budgetSliderUpdate()">
        </div>
        <button class="btn btn-cyan btn-sm" onclick="openSimTab()">→ Ver en simulador</button>
      </div>
      <div>
        <div class="card-item" style="border-color:rgba(6,182,212,0.3);text-align:center;padding:1.5rem;margin-bottom:1rem">
          <div style="font-size:0.75rem;color:var(--text-2);text-transform:uppercase;font-weight:700;margin-bottom:0.3rem">Costo Total del Examen</div>
          <div id="bs-total" style="font-size:3rem;font-family:var(--font-title);font-weight:800;color:var(--cyan)">$2.60</div>
          <div id="bs-per-student" style="font-size:0.85rem;color:var(--text-2);margin-top:0.2rem">$0.058 por alumno</div>
        </div>
        <div class="grid-2" style="gap:0.7rem">
          <div style="background:var(--bg-card-alt);border:1px solid var(--border);border-radius:var(--radius-sm);padding:0.8rem;text-align:center">
            <div style="font-size:0.7rem;color:var(--text-3);text-transform:uppercase">Egreso stream</div>
            <div id="bs-egress" style="font-family:var(--font-mono);color:var(--cyan);font-weight:700">$2.13</div>
          </div>
          <div style="background:var(--bg-card-alt);border:1px solid var(--border);border-radius:var(--radius-sm);padding:0.8rem;text-align:center">
            <div style="font-size:0.7rem;color:var(--text-3);text-transform:uppercase">Cloud Run</div>
            <div id="bs-cr" style="font-family:var(--font-mono);color:var(--purple);font-weight:700">$0.44</div>
          </div>
          <div style="background:var(--bg-card-alt);border:1px solid var(--border);border-radius:var(--radius-sm);padding:0.8rem;text-align:center">
            <div style="font-size:0.7rem;color:var(--text-3);text-transform:uppercase">Margen @$0.30/h</div>
            <div id="bs-margin" style="font-family:var(--font-mono);color:var(--emerald);font-weight:700">90%</div>
          </div>
          <div style="background:var(--bg-card-alt);border:1px solid var(--border);border-radius:var(--radius-sm);padding:0.8rem;text-align:center">
            <div style="font-size:0.7rem;color:var(--text-3);text-transform:uppercase">Revenue</div>
            <div id="bs-revenue" style="font-family:var(--font-mono);color:var(--amber);font-weight:700">$27.00</div>
          </div>
        </div>
        <div style="font-size:0.7rem;color:var(--text-3);margin-top:0.6rem;font-family:var(--font-mono);text-align:center">
          costo = alumnos × horas × ($0.029 + $0.024 × (docentes−1))
        </div>
      </div>
    </div>
  </div>
</div>`,

/* 19 — Valor estratégico */
`<div class="slide-card">
  <div class="slide-header">
    <div><h2 class="slide-title">Valor Estratégico para la Universidad</h2><p class="slide-subtitle">Cuatro pilares de beneficio institucional con respaldo económico real</p></div>
    <span class="badge badge-purple">VALOR</span>
  </div>
  <div class="slide-body">
    <div class="grid-2" style="width:100%;gap:1.2rem;align-items:start">
      <div class="card-item" style="border-color:rgba(6,182,212,0.2)">
        <h3 class="card-title" style="color:var(--cyan)">Protección del Prestigio</h3>
        <p class="card-desc">Garantiza que los graduados posean las habilidades reales evaluadas. Elimina colusión e IA generativa ilegal durante pruebas críticas.</p>
      </div>
      <div class="card-item" style="border-color:rgba(16,185,129,0.2)">
        <h3 class="card-title" style="color:var(--emerald)">Arquitectura Costo-Eficiente</h3>
        <p class="card-desc">Cloud Run con <span class="mono">minScale=0</span>: costo fijo <b>~$0/mes</b> fuera de examenes. Variable: <b>$0.058/alumno·examen</b>. Margen bruto a $0.30/h: <b>90%</b>.</p>
      </div>
      <div class="card-item" style="border-color:rgba(139,92,246,0.2)">
        <h3 class="card-title" style="color:var(--purple)">Despliegue Sin Fricción</h3>
        <p class="card-desc">Docker + USB booteables. No requiere formatear ni alterar los laboratorios existentes. Técnico sin experiencia puede desplegar en &lt;10 minutos.</p>
      </div>
      <div class="card-item" style="border-color:rgba(245,158,11,0.2)">
        <h3 class="card-title" style="color:var(--amber)">Auditoría Irrefutable</h3>
        <p class="card-desc">Registro detallado de logs, capturas de infracciones, actividad de teclado con IA y telemetría GCS inmutable por 90 días para justificar acciones disciplinarias.</p>
      </div>
    </div>
  </div>
</div>`,

/* 20 — Conclusiones */
`<div class="slide-card">
  <div class="slide-header">
    <div><h2 class="slide-title">Conclusiones</h2><p class="slide-subtitle">ExamLock — Defensa en profundidad, viable y económicamente sostenible</p></div>
    <span class="badge badge-emerald">FIN</span>
  </div>
  <div class="slide-body">
    <div style="width:100%;display:flex;flex-direction:column;gap:1.5rem;align-items:center">
      <div class="highlight-box" style="width:100%;text-align:center">
        <p style="font-size:1.1rem;color:white;font-weight:600;line-height:1.7">"La combinación de <b style="color:var(--cyan)">hardening de SO</b>, <b style="color:var(--purple)">aislamiento de red a nivel kernel</b> y <b style="color:var(--emerald)">monitoreo proactivo</b> anula la gran mayoría de técnicas de fraude conocidas."</p>
      </div>
      <div class="grid-4" style="width:100%">
        <div class="card-item" style="text-align:center">
          <div style="font-size:0.8rem;color:var(--cyan);font-weight:700">Multi-Capa</div>
          <div style="font-size:0.72rem;color:var(--text-2)">12 vectores bloqueados</div>
        </div>
        <div class="card-item" style="text-align:center">
          <div style="font-size:0.8rem;color:var(--purple);font-weight:700">Fácil Adopción</div>
          <div style="font-size:0.72rem;color:var(--text-2)">Usable sin expertise</div>
        </div>
        <div class="card-item" style="text-align:center">
          <div style="font-size:0.8rem;color:var(--emerald);font-weight:700">$0.058/examen</div>
          <div style="font-size:0.72rem;color:var(--text-2)">90% margen bruto</div>
        </div>
        <div class="card-item" style="text-align:center">
          <div style="font-size:0.8rem;color:var(--amber);font-weight:700">Listo para Prod.</div>
          <div style="font-size:0.72rem;color:var(--text-2)">Backend en GCP activo</div>
        </div>
      </div>
      <div style="display:flex;gap:1rem">
        <button class="btn btn-primary" onclick="openSimTab()">Ver Simulador en Vivo</button>
        <button class="btn btn-cyan" onclick="openCostsTab()">Explorar Costos</button>
      </div>
    </div>
  </div>
</div>`

    ];
}
