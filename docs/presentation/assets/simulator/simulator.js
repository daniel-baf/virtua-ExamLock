// simulator.js — orquestador principal (modo step-by-step)

import { createStudents, PEDRO_ID, VALENTINA_ID, RODRIGO_ID, ANDREA_ID, CARLOS_ID } from './students.js';
import { STEPS, getStepStartSimTime } from './steps.js';
import { initPlayback, startStep, cancelStep, getSimTime, isRunning, getCurrentStepIdx, jumpToStep } from './playbackController.js';
import { initNetworkCanvas, positionInfraNodes, spawnStudentNode, syncNodeStyle, flashAuthAnimation, triggerConnectAnimation, getStudentPosition, getCenter } from './networkCanvas.js';
import { initTerminal, printLog, clearTerminal } from './terminalLog.js';
import { initCloudRunPanel, setCloudRunInstances, setStepCpuTarget, resetPanel as resetCR } from './cloudRunPanel.js';
import { playSound, setAudioActive, isAudioActive } from '../js/shared/audio.js';

let students = [];
let currentStep = -1;  // paso actualmente jugado/completado (−1 = no iniciado)
let stepDone = false;  // true cuando el paso en curso completó su animación

export function initSimulator() {
    const root = document.getElementById('simulator-root');
    if (!root) return;
    root.innerHTML = buildSimulatorHTML();

    students = createStudents();

    const canvasEl = document.getElementById('network-canvas');
    const svgEl    = document.getElementById('cables-svg');
    initNetworkCanvas(canvasEl, svgEl, students, showPopover);

    const termEl = document.getElementById('terminal-body');
    initTerminal(termEl, getClockStr);

    initPlayback({ onTick: handleTick, onStepComplete: handleStepComplete });
    initCloudRunPanel('cr-panel');

    positionInfraNodes();
    students.forEach(s => spawnStudentNode(s));

    renderStudentGrid();
    updateStepPanel();

    bindControls();

    window.addEventListener('resize', repositionNodes);

    printLog('SISTEMA', 'purple', 'ExamLock Simulador listo. Presiona NEXT para iniciar.');
}

// ──────────────────────────────────────────────────────────────────
// HTML builder
// ──────────────────────────────────────────────────────────────────
function buildSimulatorHTML() {
    return `
<div class="sim-header">
  <div class="sim-title-block">
    <div class="sim-logo-icon">🔒</div>
    <div>
      <div class="sim-title">ExamLock Live Session</div>
      <div class="sim-subtitle">25 alumnos · Step-by-step</div>
    </div>
    <span class="session-badge">URL-EXAM-101</span>
  </div>
  <div class="sim-clock-block">
    <span class="sim-clock-label">Tiempo simulado</span>
    <span id="sim-clock" class="sim-clock-value">08:00:00</span>
  </div>
  <div class="sim-header-actions">
    <button id="btn-audio" class="sim-btn" onclick="window.simToggleAudio()" title="Audio">🔊</button>
    <button class="sim-btn" onclick="window.simReset()">🔄</button>
  </div>
</div>

<div class="sim-workspace">
  <!-- Left: network canvas + Cloud Run -->
  <div class="sim-left">
    <div class="sim-panel-hdr">
      <div><div class="sim-panel-title">📡 Red de Daemons</div><div class="sim-panel-sub">25 nodos · GCP infraestructura</div></div>
      <div style="font-size:0.65rem;color:var(--cyan);font-family:var(--font-mono)">● WSS ● HTTPS</div>
    </div>
    <div class="network-canvas" id="network-canvas">
      <svg class="cables-svg" id="cables-svg">
        <path id="cable-srv-fb"  class="svg-cable cable-infra"/>
        <path id="cable-srv-gcs" class="svg-cable cable-infra"/>
      </svg>
      <div class="net-node infra node-firebase" id="net-node-fb">
        <span class="node-icon">🔑</span><span class="node-label">Firebase Auth</span>
      </div>
      <div class="net-node infra node-server" id="net-node-srv">
        <span class="node-icon">☁️</span><span class="node-label">Cloud Run</span>
      </div>
      <div class="net-node infra node-gcs" id="net-node-gcs">
        <span class="node-icon">🪣</span><span class="node-label">GCS</span>
      </div>
      <div class="node-popover" id="node-popover"></div>
      <div class="cost-counter">
        <span class="cost-label">Costo acumulado</span>
        <span id="cost-value" class="cost-value">$0.000</span>
        <span id="cost-detail" class="cost-detail">0 alumnos</span>
      </div>
    </div>

    <!-- Cloud Run panel debajo del canvas -->
    <div class="cr-panel-wrap">
      <div class="cr-panel-title">☁️ Cloud Run — escalado</div>
      <div id="cr-panel" class="cr-panel"></div>
    </div>
  </div>

  <!-- Right: meta + grid + terminal -->
  <div class="sim-right">
    <div class="teacher-meta">
      <div class="meta-stat"><div class="meta-label">Docente</div><div class="meta-val" style="font-size:0.78rem">Daniel Baf</div></div>
      <div class="meta-stat"><div class="meta-label">Nodos</div><div id="meta-nodes" class="meta-val">0/25</div></div>
      <div class="meta-stat"><div class="meta-label">Estado</div><div id="meta-status" class="meta-val" style="color:var(--emerald)">🔒 OK</div></div>
    </div>
    <div class="triggers-bar">
      <span class="trigger-label">Manual:</span>
      <button id="trig-evasion" class="trig-btn trig-evasion" onclick="window.simTriggerEvasion()" disabled>💥 DNS</button>
      <button id="trig-wifi"    class="trig-btn trig-wifi"    onclick="window.simTriggerWifi()"   disabled>🔌 Wi-Fi</button>
      <button id="trig-usb"     class="trig-btn trig-usb"     onclick="window.simTriggerUSB()"    disabled>💾 USB</button>
    </div>
    <div class="student-grid" id="student-grid"></div>
    <div class="terminal-section">
      <div class="terminal-hdr">
        <span class="terminal-title">🗲 Terminal de Auditoría</span>
        <span class="terminal-badge">Live</span>
      </div>
      <div class="terminal-body" id="terminal-body"></div>
    </div>
  </div>
</div>

<!-- Step navigation panel -->
<div class="step-panel" id="step-panel">
  <div class="step-dots" id="step-dots"></div>

  <div class="step-content">
    <div class="step-icon-wrap" id="step-icon">🔒</div>
    <div class="step-text">
      <div class="step-num" id="step-num">Paso 0 / ${STEPS.length}</div>
      <div class="step-label" id="step-label">Listo para iniciar</div>
      <div class="step-desc"  id="step-desc">Presiona NEXT para comenzar la simulación</div>
    </div>
  </div>

  <div class="step-progress-wrap">
    <div class="step-progress-track" id="step-prog-track">
      <div class="step-progress-fill" id="step-prog-fill"></div>
      <div class="step-progress-bell" id="step-prog-bell"><!-- bell speed indicator --></div>
    </div>
    <div class="step-speed-label" id="step-speed-label"></div>
  </div>

  <div class="step-nav-btns">
    <button class="step-nav-btn step-prev-btn" id="btn-step-prev" onclick="window.simStepPrev()">⏮ Anterior</button>
    <button class="step-nav-btn step-next-btn" id="btn-step-next" onclick="window.simStepNext()">NEXT →</button>
  </div>
</div>
`;
}

// ──────────────────────────────────────────────────────────────────
// Tick handler (llamado por playbackController cada rAF)
// ──────────────────────────────────────────────────────────────────
function handleTick(simTime, progress, speed) {
    updateClock(simTime);
    updateCostCounter(simTime);
    updateProgressBar(progress, speed);
    // Telemetría periódica si hay alumnos activos
    if (students.some(s => s.state === 'active')) simulateTelemetry(simTime, progress);
}

function handleStepComplete(stepIdx) {
    stepDone = true;
    updateProgressBar(1, 0);
    const nextStep = STEPS[stepIdx + 1];
    const nextBtn = document.getElementById('btn-step-next');
    if (nextBtn) {
        nextBtn.textContent = nextStep ? `NEXT → ${nextStep.icon}` : '✓ Fin';
        nextBtn.classList.add('step-next-ready');
        nextBtn.disabled = !nextStep;
    }
}

// ──────────────────────────────────────────────────────────────────
// Step navigation
// ──────────────────────────────────────────────────────────────────
function goToStep(idx) {
    if (idx < 0 || idx >= STEPS.length) return;
    cancelStep();
    currentStep = idx;
    stepDone    = false;
    updateStepPanel();

    const step = STEPS[idx];
    // Trigger handler (animations, logs)
    STEP_HANDLERS[step.handlerKey]?.();
    // Cloud Run
    if (step.crInstances !== undefined) {
        const simT = formatTime(getStepStartSimTime(idx));
        setCloudRunInstances(step.crInstances, step.crLabel, simT);
    }
    setStepCpuTarget(idx);
    // Start bell-curve playback
    startStep(idx);

    const nextBtn = document.getElementById('btn-step-next');
    if (nextBtn) { nextBtn.textContent = 'En progreso...'; nextBtn.disabled = true; nextBtn.classList.remove('step-next-ready'); }
    const prevBtn = document.getElementById('btn-step-prev');
    if (prevBtn) prevBtn.disabled = idx === 0;

    updateDots();
}

// ──────────────────────────────────────────────────────────────────
// Step handlers (animaciones y logs de cada paso)
// ──────────────────────────────────────────────────────────────────
const STEP_HANDLERS = {
    teacherLogin() {
        printLog('ADMIN-WEB', 'purple', 'Docente Daniel Baf inició sesión en Dashboard.');
        printLog('GCP', 'info', 'Cloud Run exam-server: cold start → 1 instancia activa.');
        printLog('SERVER', 'info', 'WebSocket Server iniciado en puerto 443 (WSS/TLS).');
        printLog('FIREBASE', 'success', 'Auth service conectado. Endpoint /join habilitado.');
        playSound('connect');
    },

    connectStudents() {
        printLog('SERVER', 'success', 'Admisión abierta. Validando JWT de 25 daemons...');
        printLog('GCP', 'warning', 'Carga en aumento → escalando a 2 instancias...');
        playSound('connect');

        students.forEach((s, idx) => {
            setTimeout(() => {
                if (s.state !== 'offline') return;
                s.state = 'active'; s.shield = true;
                syncNodeStyle(s);
                triggerConnectAnimation(s);
                flashAuthAnimation(s);
                updateStudentCard(s);
                updateMetaStats();
                playSound('ping');
                printLog('FIREBASE:AUTH', 'success', `JWT: ${s.name} (${s.ip}) → admitted`);
                if (idx === 12) {
                    printLog('GCP', 'success', 'exam-server: 1 → 2 instancias. CPU > 60%.');
                }
                if (idx === 24) {
                    printLog('SERVER', 'success', `25/25 daemons admitidos. Firestore: todos admitted.`);
                    printLog('DASHBOARD', 'success', 'Monitoreo WSS activo. 25 nodos asegurados.');
                    enableTriggers();
                    playSound('success');
                }
            }, idx * 380);
        });
    },

    examRunning() {
        printLog('SERVER', 'success', 'session:started enviado a todos los nodos.');
        printLog('GCS', 'info', 'Flujo de screenshots iniciado. Intervalo: 2s. Resolución: 720p.');
        printLog('IA', 'info', 'Monitor de patrones activo. Análisis de frames JPEG en curso.');
        playSound('success');
        simulateGcsUploads();
    },

    wifiCut() {
        const s = students.find(st => st.id === RODRIGO_ID);
        if (!s || s.state !== 'active') return;
        s.state = 'offline'; s.shield = false;
        syncNodeStyle(s); updateStudentCard(s); updateMetaStats();
        playSound('warning');
        printLog('DASHBOARD', 'warning', 'Canal WSS caído: Rodrigo López. Heartbeat timeout.');
        printLog('AGENTE:rodrigo', 'warning', 'Red desconectada. Modo offline. Capturas cacheadas en /tmp.');
        setTimeout(() => {
            if (s.state !== 'offline') return;
            s.state = 'active'; s.shield = true;
            syncNodeStyle(s); updateStudentCard(s); updateMetaStats();
            playSound('success');
            printLog('AGENTE:rodrigo', 'success', 'Red restablecida. Reconexión WSS exitosa.');
            printLog('GCS', 'success', 'Burst upload: 4 evidencias cacheadas → gs://examlock-telemetry/');
        }, 2800);
    },

    dnsEvasion() {
        const s = students.find(st => st.id === VALENTINA_ID);
        if (!s || s.state !== 'active') return;
        s.state = 'warning'; syncNodeStyle(s); updateStudentCard(s); updateMetaStats();
        playSound('warning');
        printLog('AGENTE:valentina', 'warning', 'Modificación /etc/resolv.conf detectada. DNS externo: 1.1.1.1');
        printLog('KERNEL:valentina', 'error', 'iptables DROP paquetes → 1.1.1.1, 8.8.8.8.');
        printLog('SERVER', 'warning', 'Valentina García — bypass DNS mitigado automáticamente.');
        setTimeout(() => {
            if (s.state !== 'warning') return;
            s.state = 'active'; syncNodeStyle(s); updateStudentCard(s); updateMetaStats();
            printLog('AGENTE:valentina', 'success', 'DNS flushed. Reglas auditadas. Estado: Seguro.');
        }, 3000);
    },

    camBlocked() {
        const s = students.find(st => st.id === ANDREA_ID);
        if (!s || s.state !== 'active') return;
        s.state = 'warning'; syncNodeStyle(s); updateStudentCard(s); updateMetaStats();
        playSound('warning');
        printLog('IA', 'warning', 'Frame negro detectado: Andrea Pérez. Posible obstrucción.');
        printLog('SERVER', 'warning', 'Alerta: cámara inaccesible en 192.168.1.103.');
        printLog('DASHBOARD', 'warning', '⚠️ Andrea Pérez — 3 frames negros consecutivos.');
        setTimeout(() => {
            if (s.state !== 'warning') return;
            s.state = 'active'; syncNodeStyle(s); updateStudentCard(s); updateMetaStats();
            printLog('AGENTE:andrea', 'success', 'Cámara restablecida. Captura resumida.');
        }, 3500);
    },

    usbExpulsion() {
        const s = students.find(st => st.id === PEDRO_ID);
        if (!s || s.state !== 'active') return;
        s.state = 'danger'; syncNodeStyle(s); updateStudentCard(s); updateMetaStats();
        playSound('critical');
        printLog('KERNEL:pedro', 'error', '🔴 CRÍTICO: USB storage montado (udev event: /dev/sdb1).');
        printLog('AGENTE:pedro', 'error', 'Inyección keylogger detectada. Patrón heurístico activado.');
        printLog('SERVER', 'error', 'ALERTA: Pedro González — Evasión USB confirmada.');
        printLog('DASHBOARD', 'error', '🚨 Pedro González montó USB. Docente expulsando...');
        setTimeout(() => {
            window.simExpel(PEDRO_ID);
        }, 2200);
    },

    keylogger() {
        const s = students.find(st => st.id === CARLOS_ID);
        if (!s || s.state !== 'active') return;
        s.state = 'warning'; syncNodeStyle(s); updateStudentCard(s); updateMetaStats();
        playSound('warning');
        printLog('IA', 'warning', 'Keylogger: 1247 chars en 1.2s. Ritmo de escritura sobrehumano.');
        printLog('AGENTE:carlos', 'warning', 'Paste masivo detectado. Posible IA generativa.');
        printLog('DASHBOARD', 'warning', '⚠️ Carlos Mendoza — alerta copy-paste IA (ChatGPT?).');
    },

    examEnd() {
        printLog('DASHBOARD', 'success', 'Daniel Baf finalizó la sesión URL-EXAM-101.');
        printLog('SERVER', 'success', 'Emitiendo session:finished a todos los nodos activos.');
        disableTriggers();
        students.forEach((s, i) => {
            setTimeout(() => {
                if (s.state === 'expelled') { printLog(`AGENTE:${s.name.split(' ')[0].toLowerCase()}`, 'warning', 'Nodo expulsado. Requiere reinicio.'); return; }
                s.state = 'offline'; s.shield = false;
                syncNodeStyle(s); updateStudentCard(s);
                printLog(`AGENTE:${s.name.split(' ')[0].toLowerCase()}`, 'success', 'iptables -F. Kiosk cerrado. Cage liberado.');
            }, i * 120);
        });
        setTimeout(() => {
            updateMetaStats();
            printLog('GCP', 'info', 'exam-server: sin tráfico activo → escalando a 0 instancias.');
            playSound('success');
        }, 25 * 120 + 500);
    },
};

// ──────────────────────────────────────────────────────────────────
// UI helpers
// ──────────────────────────────────────────────────────────────────
function updateStepPanel() {
    const step = STEPS[currentStep];
    document.getElementById('step-num')?.let?.(el => el.textContent = step
        ? `Paso ${currentStep + 1} / ${STEPS.length}` : `Paso 0 / ${STEPS.length}`);
    const numEl = document.getElementById('step-num');
    if (numEl) numEl.textContent = step ? `Paso ${currentStep + 1} / ${STEPS.length}` : `Paso 0 / ${STEPS.length}`;
    const iconEl = document.getElementById('step-icon');
    if (iconEl) iconEl.textContent = step?.icon ?? '🔒';
    const labelEl = document.getElementById('step-label');
    if (labelEl) labelEl.textContent = step?.label ?? 'Listo para iniciar';
    const descEl = document.getElementById('step-desc');
    if (descEl) descEl.textContent = step?.desc ?? 'Presiona NEXT para comenzar la simulación';
    const panel = document.getElementById('step-panel');
    if (panel) panel.style.setProperty('--step-color', step?.color ?? '#64748b');

    // Update icon color on panel
    if (iconEl && step) iconEl.style.background = step.color + '22';

    updateProgressBar(step ? 0 : 0, 0);
    updateDots();

    const nextBtn = document.getElementById('btn-step-next');
    if (nextBtn) {
        if (!step) { nextBtn.textContent = 'NEXT →'; nextBtn.disabled = false; nextBtn.classList.remove('step-next-ready'); }
    }
    const prevBtn = document.getElementById('btn-step-prev');
    if (prevBtn) prevBtn.disabled = currentStep <= 0;
}

function updateProgressBar(progress, speed) {
    const fill = document.getElementById('step-prog-fill');
    if (fill) fill.style.width = `${(progress * 100).toFixed(1)}%`;

    const speedEl = document.getElementById('step-speed-label');
    if (speedEl && speed > 0) {
        speedEl.textContent = speed < 1 ? `${speed.toFixed(2)}×` : speed < 10 ? `${speed.toFixed(1)}×` : `${Math.round(speed)}×`;
        const intensity = Math.min(1, Math.log10(Math.max(1, speed)) / Math.log10(80));
        speedEl.style.color = `hsl(${190 - intensity * 80}, 90%, ${50 + intensity * 20}%)`;
    } else if (speedEl) {
        speedEl.textContent = '';
    }
}

function updateDots() {
    const wrap = document.getElementById('step-dots');
    if (!wrap) return;
    wrap.innerHTML = STEPS.map((s, i) => {
        const cls = i < currentStep ? 'dot-done' : i === currentStep ? 'dot-active' : 'dot-pending';
        return `<div class="step-dot ${cls}" title="${s.label}" onclick="window.simGoToStep(${i})" style="${i === currentStep ? `background:${s.color}` : ''}"></div>`;
    }).join('');
}

function updateClock(simTime) {
    const el = document.getElementById('sim-clock');
    if (el) el.textContent = formatTime(simTime);
}

function formatTime(d) {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function pad(n) { return String(n).padStart(2, '0'); }
function getClockStr() { return formatTime(getSimTime()); }

function updateCostCounter(simTime) {
    const active = students.filter(s => ['active','warning','danger'].includes(s.state));
    const examStart = new Date(2026, 4, 20, 8, 2, 0);
    const hours = Math.max(0, (simTime - examStart) / 3_600_000);
    const cost = active.length * hours * 0.029;
    const costEl = document.getElementById('cost-value');
    const detEl  = document.getElementById('cost-detail');
    if (costEl) costEl.textContent = `$${cost.toFixed(3)}`;
    if (detEl)  detEl.textContent  = `${active.length} al · $0.029/al·h`;
}

function updateMetaStats() {
    const active = students.filter(s => s.state !== 'offline' && s.state !== 'expelled').length;
    const nodesEl = document.getElementById('meta-nodes');
    if (nodesEl) nodesEl.textContent = `${active}/25`;
    const statusEl = document.getElementById('meta-status');
    if (statusEl) {
        const hasDanger = students.some(s => s.state === 'danger');
        const hasWarn   = students.some(s => s.state === 'warning');
        statusEl.textContent = hasDanger ? '🚨 ALERTA' : hasWarn ? '⚠️ Aviso' : '🔒 OK';
        statusEl.style.color = hasDanger ? 'var(--red)' : hasWarn ? 'var(--amber)' : 'var(--emerald)';
    }
}

function enableTriggers() {
    ['trig-evasion','trig-wifi','trig-usb'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = false;
    });
}
function disableTriggers() {
    ['trig-evasion','trig-wifi','trig-usb'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = true;
    });
}

// ──────────────────────────────────────────────────────────────────
// Telemetría simulada
// ──────────────────────────────────────────────────────────────────
let telemetryCount = 0;
function simulateTelemetry(simTime, progress) {
    telemetryCount++;
    if (telemetryCount % 60 !== 0) return; // throttle
    const active = students.filter(s => s.state === 'active');
    if (!active.length) return;
    const s = active[Math.floor(Math.random() * active.length)];
    s.uploadCount = (s.uploadCount || 0) + 1;
    const cable = document.getElementById(`scable-${s.id}`);
    if (cable) {
        cable.style.strokeWidth = '3.5';
        setTimeout(() => { if (cable) cable.style.strokeWidth = ''; }, 300);
    }
    if (Math.random() < 0.12) {
        printLog(`GCS`, 'success', `Upload: frame_${s.uploadCount}.jpg ← ${s.name.split(' ')[0]} (${s.ip})`);
    }
}

let gcsUploadInterval = null;
function simulateGcsUploads() {
    if (gcsUploadInterval) clearInterval(gcsUploadInterval);
    gcsUploadInterval = setInterval(() => {
        if (currentStep < 2 || currentStep > 7) { clearInterval(gcsUploadInterval); gcsUploadInterval = null; return; }
        const active = students.filter(s => s.state === 'active');
        if (!active.length) return;
        const batch = active.slice(0, 3 + Math.floor(Math.random() * 3));
        batch.forEach(s => {
            s.uploadCount = (s.uploadCount || 0) + 1;
            const cable = document.getElementById(`scable-${s.id}`);
            if (cable) { cable.style.strokeWidth = '3'; setTimeout(() => { if (cable) cable.style.strokeWidth = ''; }, 350); }
        });
        printLog('GCS', 'success', `Batch upload: ${batch.length} frames → gs://examlock-telemetry/`);
    }, 1800);
}

// ──────────────────────────────────────────────────────────────────
// Student grid
// ──────────────────────────────────────────────────────────────────
function renderStudentGrid() {
    const grid = document.getElementById('student-grid');
    if (!grid) return;
    grid.innerHTML = '';
    students.forEach(s => {
        const card = document.createElement('div');
        card.id = `scard-${s.id}`;
        card.className = `student-card card-${s.state}`;
        const isOnline = ['active','warning','danger'].includes(s.state);
        card.innerHTML = `
        <div class="sc-header">
          <span class="sc-name" title="${s.name}">${s.name.split(' ')[0]}</span>
          <span class="sc-status s-${s.state}">${s.state}</span>
        </div>
        <canvas id="sscreen-${s.id}" class="sc-screen" width="100" height="38"></canvas>
        <div class="sc-footer">
          <span class="sc-fw">FW:${s.shield ? 'ON' : 'OFF'}</span>
          <button class="sc-expel" id="sexpel-${s.id}" onclick="window.simExpel(${s.id})" ${(s.state==='expelled'||!isOnline)?'disabled':''}>Expulsar</button>
        </div>
        <div class="sc-lock-overlay${s.state==='expelled'?' visible':''}" id="slock-${s.id}">
          <span class="sc-lock-icon">🔒</span><span class="sc-lock-text">Expulsado</span>
        </div>`;
        grid.appendChild(card);
        drawScreenCanvas(document.getElementById(`sscreen-${s.id}`), s);
    });
}

function updateStudentCard(student) {
    const card = document.getElementById(`scard-${student.id}`);
    if (!card) { renderStudentGrid(); return; }
    card.className = `student-card card-${student.state}`;
    const statusEl = card.querySelector('.sc-status');
    if (statusEl) { statusEl.textContent = student.state; statusEl.className = `sc-status s-${student.state}`; }
    const fwEl = card.querySelector('.sc-fw');
    if (fwEl) fwEl.textContent = `FW:${student.shield ? 'ON' : 'OFF'}`;
    const isOnline = ['active','warning','danger'].includes(student.state);
    const expelBtn = document.getElementById(`sexpel-${student.id}`);
    if (expelBtn) expelBtn.disabled = student.state === 'expelled' || !isOnline;
    const lockEl = document.getElementById(`slock-${student.id}`);
    if (lockEl) lockEl.classList.toggle('visible', student.state === 'expelled');
    const canvas = document.getElementById(`sscreen-${student.id}`);
    if (canvas) drawScreenCanvas(canvas, student);
}

function drawScreenCanvas(canvas, student) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = '#090d16'; ctx.fillRect(0, 0, w, h);
    const isOnline = ['active','warning','danger'].includes(student.state);
    if (!isOnline) {
        ctx.fillStyle = '#374151'; ctx.font = '6px monospace'; ctx.fillText('OFFLINE', w/2-13, h/2+2); return;
    }
    if (student.state === 'expelled') {
        ctx.fillStyle = 'rgba(239,68,68,0.1)'; ctx.fillRect(0,0,w,h);
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(w,h); ctx.moveTo(w,0); ctx.lineTo(0,h); ctx.stroke();
        ctx.fillStyle = '#ef4444'; ctx.font = 'bold 6px Arial'; ctx.fillText('BLOQUEADO', w/2-18, h/2+2); return;
    }
    ctx.fillStyle = '#1e293b'; ctx.fillRect(4,4,w-8,h-8);
    ['rgba(255,255,255,0.15)','#60a5fa','#34d399','#fbbf24','#f87171','#a78bfa'].forEach((c,i) => {
        ctx.fillStyle = c;
        ctx.fillRect(6, 6+i*5, w-10-i*4-Math.random()*6, 3);
    });
    ctx.fillStyle = student.state === 'warning' ? '#f59e0b' : '#10b981';
    ctx.beginPath(); ctx.arc(w-6, 6, 2.5, 0, 2*Math.PI); ctx.fill();
}

// ──────────────────────────────────────────────────────────────────
// Popover
// ──────────────────────────────────────────────────────────────────
function showPopover(student, e) {
    const pop = document.getElementById('node-popover');
    if (!pop) return;
    const labels = { active:'Online', offline:'Offline', warning:'Alerta', danger:'Peligro', expelled:'Expulsado' };
    pop.innerHTML = `
    <div class="popover-name">${student.name}</div>
    <div class="popover-row"><span>IP:</span><span style="font-family:var(--font-mono);color:var(--cyan)">${student.ip}</span></div>
    <div class="popover-row"><span>Estado:</span><span>${labels[student.state]||student.state}</span></div>
    <div class="popover-row"><span>Firewall:</span><span style="color:${student.shield?'var(--emerald)':'var(--text-3)'}">${student.shield?'ACTIVO':'NINGUNO'}</span></div>
    <div class="popover-row"><span>Uploads:</span><span>${student.uploadCount||0}</span></div>
    <div class="popover-row"><span>OS:</span><span>Debian Live (RAM)</span></div>`;
    const rect = document.getElementById('network-canvas')?.getBoundingClientRect();
    if (rect) { pop.style.left = `${e.clientX - rect.left + 12}px`; pop.style.top = `${e.clientY - rect.top - 10}px`; }
    pop.style.display = 'block';
}

// ──────────────────────────────────────────────────────────────────
// Node repositioning on resize
// ──────────────────────────────────────────────────────────────────
function repositionNodes() {
    positionInfraNodes();
    students.forEach(s => {
        const node = document.getElementById(`snode-${s.id}`);
        if (!node) return;
        const { sx, sy } = getStudentPosition(s);
        node.style.left = `${sx}px`; node.style.top = `${sy}px`;
        const cable = document.getElementById(`scable-${s.id}`);
        const { cx, cy } = getCenter();
        if (cable) cable.setAttribute('d', `M${sx} ${sy} Q${cx+(sx-cx)*0.25} ${cy+(sy-cy)*0.25} ${cx} ${cy}`);
    });
}

// ──────────────────────────────────────────────────────────────────
// Keyboard controls
// ──────────────────────────────────────────────────────────────────
function bindControls() {
    document.addEventListener('keydown', e => {
        if (!document.getElementById('tab-simulator')?.classList.contains('active')) return;
        if (e.code === 'ArrowRight' || e.code === 'Enter' || e.code === 'Space') {
            e.preventDefault();
            window.simStepNext();
        }
        if (e.code === 'ArrowLeft' || e.key === 'Backspace') {
            e.preventDefault();
            window.simStepPrev();
        }
    });
}

// ──────────────────────────────────────────────────────────────────
// Global API
// ──────────────────────────────────────────────────────────────────
window.simStepNext = function() {
    if (isRunning()) return; // en progreso, esperar
    const next = currentStep + 1;
    if (next >= STEPS.length) return;
    goToStep(next);
};

window.simStepPrev = function() {
    const prev = Math.max(0, currentStep - 1);
    if (prev === currentStep && currentStep !== 0) return;
    // Reset all students to offline, restart from prev
    cancelStep();
    students = createStudents();
    renderStudentGrid();
    students.forEach(s => { spawnStudentNode(s); syncNodeStyle(s); });
    clearTerminal();
    disableTriggers();
    if (gcsUploadInterval) { clearInterval(gcsUploadInterval); gcsUploadInterval = null; }
    resetCR();
    // Replay steps 0..prev-1 instantly, then go to prev
    currentStep = -1;
    for (let i = 0; i < prev; i++) {
        instantStep(i);
    }
    goToStep(prev);
};

window.simGoToStep = function(idx) {
    if (idx === currentStep) return;
    window.simReset();
    for (let i = 0; i <= idx; i++) {
        if (i < idx) instantStep(i);
        else goToStep(i);
    }
};

window.simReset = function() {
    cancelStep();
    students = createStudents();
    currentStep = -1;
    stepDone = false;
    if (gcsUploadInterval) { clearInterval(gcsUploadInterval); gcsUploadInterval = null; }
    resetCR();
    disableTriggers();
    clearTerminal();
    renderStudentGrid();
    students.forEach(s => { spawnStudentNode(s); syncNodeStyle(s); });
    updateClock(new Date(2026, 4, 20, 8, 0, 0));
    updateMetaStats();
    updateStepPanel();
    const nextBtn = document.getElementById('btn-step-next');
    if (nextBtn) { nextBtn.textContent = 'NEXT →'; nextBtn.disabled = false; nextBtn.classList.remove('step-next-ready'); }
    printLog('SISTEMA', 'purple', 'Simulador reiniciado. Presiona NEXT para iniciar.');
};

window.simExpel = function(id) {
    const s = students.find(st => st.id === id);
    if (!s || s.state === 'expelled' || s.state === 'offline') return;
    s.state = 'expelled'; s.shield = false;
    syncNodeStyle(s); updateStudentCard(s); updateMetaStats();
    playSound('critical');
    printLog('DASHBOARD', 'admin', `Daniel Baf expulsó a ${s.name}.`);
    printLog('SERVER', 'error', `WebSocket emit 'client:expel' → ${s.ip}`);
    printLog(`AGENTE:${s.name.split(' ')[0].toLowerCase()}`, 'error', 'Bloqueo total: iptables -A OUTPUT -j DROP. Pantalla bloqueada.');
};

window.simTriggerEvasion = () => { if (currentStep < 2) return; STEP_HANDLERS.dnsEvasion(); };
window.simTriggerWifi    = () => { if (currentStep < 2) return; STEP_HANDLERS.wifiCut(); };
window.simTriggerUSB     = () => { if (currentStep < 2) return; STEP_HANDLERS.usbExpulsion(); };

window.simToggleAudio = () => {
    const next = !isAudioActive();
    setAudioActive(next);
    const btn = document.getElementById('btn-audio');
    if (btn) btn.textContent = next ? '🔊' : '🔇';
};

// ──────────────────────────────────────────────────────────────────
// Instant replay (para "Anterior" — sin animaciones)
// ──────────────────────────────────────────────────────────────────
function instantStep(idx) {
    const key = STEPS[idx]?.handlerKey;
    // Solo aplicar cambios de estado, sin animaciones ni logs
    if (idx >= 1) {
        students.forEach(s => { s.state = 'active'; s.shield = true; syncNodeStyle(s); updateStudentCard(s); });
    }
    if (idx >= 3) {
        const r = students.find(s => s.id === RODRIGO_ID);
        if (r) { r.state = 'active'; r.shield = true; syncNodeStyle(r); updateStudentCard(r); }
    }
    if (idx >= 4) {
        const v = students.find(s => s.id === VALENTINA_ID);
        if (v) { v.state = 'active'; v.shield = true; syncNodeStyle(v); updateStudentCard(v); }
    }
    if (idx >= 5) {
        const a = students.find(s => s.id === ANDREA_ID);
        if (a) { a.state = 'active'; a.shield = true; syncNodeStyle(a); updateStudentCard(a); }
    }
    if (idx >= 6) {
        const p = students.find(s => s.id === PEDRO_ID);
        if (p) { p.state = 'expelled'; p.shield = false; syncNodeStyle(p); updateStudentCard(p); }
    }
    if (idx >= 7) {
        const c = students.find(s => s.id === CARLOS_ID);
        if (c) { c.state = 'warning'; syncNodeStyle(c); updateStudentCard(c); }
    }
    const step = STEPS[idx];
    if (step?.crInstances !== undefined) {
        setCloudRunInstances(step.crInstances, step.crLabel, '--');
    }
    currentStep = idx;
    updateMetaStats();
}

// Activa cuando el tab simulator se muestra
document.addEventListener('tab:activated', e => {
    if (e.detail?.tab === 'simulator') {
        positionInfraNodes();
        students.forEach(s => { if (!document.getElementById(`snode-${s.id}`)) spawnStudentNode(s); });
        if (!document.querySelector('.student-card')) renderStudentGrid();
    }
});

setTimeout(() => renderStudentGrid(), 50);
