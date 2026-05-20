// flowAnimator.js — animador SVG step-by-step para slide 5

const flowSteps = [
    {
        title: 'Paso 1: Autenticación con Firebase',
        desc: 'El daemon de ExamLock toma las credenciales ingresadas por el alumno e invoca la REST API de Firebase Auth para obtener un token JWT firmado directamente desde la máquina local.',
        proto: 'HTTPS (REST API)',
        payload: 'email, password, secureCode',
        advantage: 'Token JWT firmado criptográficamente, expira automáticamente.',
        activeNodes: ['node-agent', 'node-firebase'],
        activeNodeAlt: [],
        activePaths: ['path-agent-firebase'],
        altPaths: [],
        shieldActive: false
    },
    {
        title: 'Paso 2: Registro en el Servidor GCP',
        desc: 'El daemon envía el JWT en cabeceras Bearer al endpoint `/join` del servidor en Cloud Run. El servidor valida la firma criptográfica y registra al alumno en la sesión.',
        proto: 'HTTPS + Bearer JWT',
        payload: 'Authorization: Bearer <token>, sessionCode',
        advantage: 'Sin contraseñas en tránsito, solo tokens firmados por Firebase.',
        activeNodes: ['node-agent', 'node-server'],
        activeNodeAlt: [],
        activePaths: ['path-agent-server'],
        altPaths: [],
        shieldActive: false
    },
    {
        title: 'Paso 3: Persistencia en Firestore',
        desc: 'El servidor escribe el estado `admitted` del alumno en Firestore Native. Este registro habilita el control de sesión y la auditoría en tiempo real del catedrático.',
        proto: 'Firestore SDK (gRPC)',
        payload: `students/{ip}: { status: 'admitted', timestamp }`,
        advantage: 'Consistencia eventual + listeners en tiempo real sin polling.',
        activeNodes: ['node-server'],
        activeNodeAlt: ['node-firestore'],
        activePaths: [],
        altPaths: ['path-server-firestore'],
        shieldActive: false
    },
    {
        title: 'Paso 4: Activación de Firewall Local (iptables)',
        desc: 'El servidor emite el evento WebSocket `server:admitted`. El daemon escucha y aplica las reglas iptables al kernel local: solo tráfico a ExamLock + dominios de la whitelist.',
        proto: 'WebSocket (wss://) + iptables',
        payload: `emit('server:admitted', { whitelist: [...] })`,
        advantage: 'Filtrado a nivel kernel — imposible bypassear desde userspace.',
        activeNodes: ['node-agent', 'node-server'],
        activeNodeAlt: [],
        activePaths: ['path-agent-server'],
        altPaths: [],
        shieldActive: true
    },
    {
        title: 'Paso 5: Telemetría a GCS Buckets',
        desc: 'El daemon captura screenshots y video del agente a intervalos regulares. Las evidencias se suben cifradas a Google Cloud Storage para auditoría posterior y monitoreo en vivo.',
        proto: 'HTTPS multipart/GCS API',
        payload: 'frame_{n}.jpg + metadata JSON',
        advantage: 'Evidencia inmutable, almacenada 90 días, accesible solo al docente.',
        activeNodes: ['node-agent'],
        activeNodeAlt: ['node-buckets'],
        activePaths: [],
        altPaths: ['path-agent-buckets'],
        shieldActive: true
    },
    {
        title: 'Paso 6: Monitoreo en Dashboard Docente',
        desc: 'El servidor retransmite los frames y eventos de telemetría al Dashboard del docente mediante WebSocket. El catedrático ve el aula en vivo y puede expulsar alumnos con un clic.',
        proto: 'WebSocket (wss://) — Server Push',
        payload: `emit('student:monitor-frame', binaryBuffer)`,
        advantage: 'Buffer binario nativo — 25% menos egress vs base64.',
        activeNodes: ['node-server'],
        activeNodeAlt: ['node-dashboard'],
        activePaths: [],
        altPaths: ['path-server-dashboard'],
        shieldActive: true
    }
];

let currentStep = 0;

export function initFlowAnimator() {
    currentStep = 0;
    renderStep(0);
}

export function nextFlowStep() {
    if (currentStep < flowSteps.length - 1) {
        currentStep++;
        renderStep(currentStep);
    }
}

export function prevFlowStep() {
    if (currentStep > 0) {
        currentStep--;
        renderStep(currentStep);
    }
}

export function isFlowAtEnd()   { return currentStep >= flowSteps.length - 1; }
export function isFlowAtStart() { return currentStep <= 0; }

function renderStep(idx) {
    const step = flowSteps[idx];
    const svg = document.getElementById('flow-svg');
    if (!svg) return;

    // Reset all nodes
    svg.querySelectorAll('.node-group').forEach(n => {
        n.classList.remove('node-active', 'node-active-alt');
    });
    // Reset all paths
    svg.querySelectorAll('.conn-path, .conn-path-active, .conn-path-active-purple').forEach(p => {
        p.className.baseVal = 'conn-path';
    });

    // Activate nodes
    step.activeNodes.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('node-active');
    });
    step.activeNodeAlt.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('node-active-alt');
    });
    // Activate paths
    step.activePaths.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.className.baseVal = 'conn-path conn-path-active';
    });
    step.altPaths.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.className.baseVal = 'conn-path conn-path-active-purple';
    });

    // Shield
    const shield = document.getElementById('agent-shield-el');
    if (shield) shield.classList.toggle('shield-active', step.shieldActive);

    // Update description panel
    const titleEl = document.getElementById('flow-step-title');
    const descEl  = document.getElementById('flow-step-desc');
    const protoEl = document.getElementById('flow-tech-proto');
    const payEl   = document.getElementById('flow-tech-payload');
    const advEl   = document.getElementById('flow-tech-advantage');
    const counterEl = document.getElementById('flow-step-counter');
    const btnPrev = document.getElementById('flow-btn-prev');
    const btnNext = document.getElementById('flow-btn-next');

    if (titleEl)   titleEl.textContent   = step.title;
    if (descEl)    descEl.textContent    = step.desc;
    if (protoEl)   protoEl.textContent   = step.proto;
    if (payEl)     payEl.textContent     = step.payload;
    if (advEl)     advEl.textContent     = step.advantage;
    if (counterEl) counterEl.textContent = `${idx + 1} / ${flowSteps.length}`;
    if (btnPrev)   btnPrev.disabled      = idx === 0;
    if (btnNext)   btnNext.disabled      = idx === flowSteps.length - 1;
}
