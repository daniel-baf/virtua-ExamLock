import React from 'react'
import { useApp } from '../store/AppContext.jsx'

const FLOW_STEPS = [
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
    shieldActive: false,
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
    shieldActive: false,
  },
  {
    title: 'Paso 3: Persistencia en Firestore',
    desc: "El servidor escribe el estado `admitted` del alumno en Firestore Native. Este registro habilita el control de sesión y la auditoría en tiempo real del catedrático.",
    proto: 'Firestore SDK (gRPC)',
    payload: "students/{ip}: { status: 'admitted', timestamp }",
    advantage: 'Consistencia eventual + listeners en tiempo real sin polling.',
    activeNodes: ['node-server'],
    activeNodeAlt: ['node-firestore'],
    activePaths: [],
    altPaths: ['path-server-firestore'],
    shieldActive: false,
  },
  {
    title: 'Paso 4: Activación de Firewall Local (iptables)',
    desc: "El servidor emite el evento WebSocket `server:admitted`. El daemon escucha y aplica las reglas iptables al kernel local: solo tráfico a ExamLock + dominios de la whitelist.",
    proto: 'WebSocket (wss://) + iptables',
    payload: "emit('server:admitted', { whitelist: [...] })",
    advantage: 'Filtrado a nivel kernel — imposible bypassear desde userspace.',
    activeNodes: ['node-agent', 'node-server'],
    activeNodeAlt: [],
    activePaths: ['path-agent-server'],
    altPaths: [],
    shieldActive: true,
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
    shieldActive: true,
  },
  {
    title: 'Paso 6: Monitoreo en Dashboard Docente',
    desc: "El servidor retransmite los frames y eventos de telemetría al Dashboard del docente mediante WebSocket. El catedrático ve el aula en vivo y puede expulsar alumnos con un clic.",
    proto: 'WebSocket (wss://) — Server Push',
    payload: "emit('student:monitor-frame', binaryBuffer)",
    advantage: 'Buffer binario nativo — 25% menos egress vs base64.',
    activeNodes: ['node-server'],
    activeNodeAlt: ['node-dashboard'],
    activePaths: [],
    altPaths: ['path-server-dashboard'],
    shieldActive: true,
  },
]

const ALL_NODES   = ['node-agent', 'node-firebase', 'node-server', 'node-firestore', 'node-buckets', 'node-dashboard']
const ALL_PATHS   = ['path-agent-firebase', 'path-agent-server', 'path-server-firestore', 'path-agent-buckets', 'path-server-dashboard']

function buildAccumulated(stepIdx) {
  const nodes = new Set()
  const nodesAlt = new Set()
  const paths = new Set()
  const pathsAlt = new Set()
  const limit = typeof stepIdx === 'number' ? stepIdx : 0
  for (let i = 0; i <= limit && i < FLOW_STEPS.length; i++) {
    FLOW_STEPS[i].activeNodes.forEach(n => nodes.add(n))
    FLOW_STEPS[i].activeNodeAlt.forEach(n => nodesAlt.add(n))
    FLOW_STEPS[i].activePaths.forEach(p => paths.add(p))
    FLOW_STEPS[i].altPaths.forEach(p => pathsAlt.add(p))
  }
  return { nodes, nodesAlt, paths, pathsAlt }
}

function nodeClass(nodeId, step, acc) {
  if (step.activeNodes.includes(nodeId))   return 'node-group node-active'
  if (acc.nodes.has(nodeId))               return 'node-group node-active'
  if (step.activeNodeAlt.includes(nodeId)) return 'node-group node-active-alt'
  if (acc.nodesAlt.has(nodeId))            return 'node-group node-active-alt'
  return 'node-group'
}

function pathClass(pathId, step, acc) {
  if (step.activePaths.includes(pathId) || acc.paths.has(pathId)) return 'conn-path conn-path-active'
  if (step.altPaths.includes(pathId)    || acc.pathsAlt.has(pathId)) return 'conn-path conn-path-active-purple'
  return 'conn-path'
}

export default function FlowAnimator() {
  const { state, dispatch } = useApp()
  const stepIdx = state.presentation.flowStep
  const step = FLOW_STEPS[stepIdx] || FLOW_STEPS[0]
  const acc = buildAccumulated(stepIdx)

  const prev = () => { if (stepIdx > 0) dispatch({ type: 'SET_FLOW_STEP', step: stepIdx - 1 }) }
  const next = () => { if (stepIdx < FLOW_STEPS.length - 1) dispatch({ type: 'SET_FLOW_STEP', step: stepIdx + 1 }) }

  return (
    <div className="flow-container" style={{ width:'100%', height:'100%' }}>
      <div className="flow-visual">
        <svg width="100%" height="100%" viewBox="0 0 500 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Paths */}
          <path id="path-agent-firebase"  d="M70 160 Q160 100 250 50"  className={pathClass('path-agent-firebase', step, acc)}/>
          <path id="path-agent-server"    d="M70 160 H250"              className={pathClass('path-agent-server', step, acc)}/>
          <path id="path-server-firestore" d="M250 160 Q340 120 430 90" className={pathClass('path-server-firestore', step, acc)}/>
          <path id="path-agent-buckets"   d="M70 160 Q250 160 430 230" className={pathClass('path-agent-buckets', step, acc)}/>
          <path id="path-server-dashboard" d="M250 160 Q250 215 250 270" className={pathClass('path-server-dashboard', step, acc)}/>

          {/* Node: Agente Alumno */}
          <g id="node-agent" className={nodeClass('node-agent', step, acc)}>
            <circle cx="70" cy="160" r="28" fill="#1e293b" stroke="#64748b" strokeWidth="2" className="node-circle"/>
            <rect x="58" y="152" width="24" height="15" rx="2" fill="none" stroke="white" strokeWidth="2"/>
            <line x1="53" y1="168" x2="87" y2="168" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <text x="70" y="205" textAnchor="middle" className="node-label">Agente Alumno</text>
          </g>

          {/* Shield */}
          <g id="agent-shield-el" className={`agent-shield${step.shieldActive ? ' shield-active' : ''}`}>
            <circle cx="70" cy="160" r="36" fill="rgba(16,185,129,0.08)" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3"/>
            <path d="M70 134 L82 139 V150 C82 157 77 163 70 166 C63 163 58 157 58 150 V139 Z" fill="rgba(16,185,129,0.4)" stroke="#10b981" strokeWidth="1.5"/>
          </g>

          {/* Node: Firebase Auth */}
          <g id="node-firebase" className={nodeClass('node-firebase', step, acc)}>
            <circle cx="250" cy="50" r="24" fill="#1e293b" stroke="#64748b" strokeWidth="2" className="node-circle"/>
            <circle cx="250" cy="46" r="5" fill="none" stroke="white" strokeWidth="2"/>
            <path d="M250 51 V58 H254 M250 55 H253" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <text x="250" y="88" textAnchor="middle" className="node-label">Firebase Auth</text>
          </g>

          {/* Node: Server Cloud Run */}
          <g id="node-server" className={nodeClass('node-server', step, acc)}>
            <circle cx="250" cy="160" r="28" fill="#1e293b" stroke="#64748b" strokeWidth="2" className="node-circle"/>
            <rect x="238" y="148" width="24" height="6" rx="1" fill="none" stroke="white" strokeWidth="2"/>
            <rect x="238" y="157" width="24" height="6" rx="1" fill="none" stroke="white" strokeWidth="2"/>
            <rect x="238" y="166" width="24" height="6" rx="1" fill="none" stroke="white" strokeWidth="2"/>
            <text x="250" y="205" textAnchor="middle" className="node-label">Server Cloud Run</text>
          </g>

          {/* Node: Firestore */}
          <g id="node-firestore" className={nodeClass('node-firestore', step, acc)}>
            <circle cx="430" cy="90" r="24" fill="#1e293b" stroke="#64748b" strokeWidth="2" className="node-circle"/>
            <ellipse cx="430" cy="82" rx="10" ry="4" fill="none" stroke="white" strokeWidth="2"/>
            <path d="M420 82 V90 C420 93 424 95 430 95 C436 95 440 93 440 90 V82" stroke="white" strokeWidth="2"/>
            <text x="430" y="128" textAnchor="middle" className="node-label">Firestore DB</text>
          </g>

          {/* Node: GCS Buckets */}
          <g id="node-buckets" className={nodeClass('node-buckets', step, acc)}>
            <circle cx="430" cy="230" r="24" fill="#1e293b" stroke="#64748b" strokeWidth="2" className="node-circle"/>
            <rect x="420" y="222" width="20" height="14" rx="3" fill="none" stroke="white" strokeWidth="2"/>
            <line x1="420" y1="227" x2="440" y2="227" stroke="white" strokeWidth="1.5"/>
            <text x="430" y="268" textAnchor="middle" className="node-label">GCS Buckets</text>
          </g>

          {/* Node: Dashboard */}
          <g id="node-dashboard" className={nodeClass('node-dashboard', step, acc)}>
            <circle cx="250" cy="270" r="24" fill="#1e293b" stroke="#64748b" strokeWidth="2" className="node-circle"/>
            <rect x="238" y="261" width="24" height="16" rx="2" fill="none" stroke="white" strokeWidth="2"/>
            <line x1="244" y1="280" x2="256" y2="280" stroke="white" strokeWidth="2"/>
            <text x="250" y="308" textAnchor="middle" className="node-label">Dashboard</text>
          </g>
        </svg>
      </div>

      <div className="flow-info">
        <div className="flow-step-header">
          <span className="flow-step-counter">{stepIdx + 1} / {FLOW_STEPS.length}</span>
          <h3 id="flow-step-title" className="flow-step-title">{step.title}</h3>
        </div>
        <p id="flow-step-desc" className="flow-step-desc">{step.desc}</p>
        <div className="flow-tech-row">
          <div className="flow-tech-item">
            <span className="flow-tech-label">Protocolo</span>
            <span id="flow-tech-proto" className="flow-tech-val">{step.proto}</span>
          </div>
          <div className="flow-tech-item">
            <span className="flow-tech-label">Payload</span>
            <span id="flow-tech-payload" className="flow-tech-val mono">{step.payload}</span>
          </div>
          <div className="flow-tech-item">
            <span className="flow-tech-label">Ventaja de Seguridad</span>
            <span id="flow-tech-advantage" className="flow-tech-val">{step.advantage}</span>
          </div>
        </div>
        <div className="flow-nav">
          <button id="flow-btn-prev" className="flow-nav-btn" onClick={prev} disabled={stepIdx === 0}>← Anterior</button>
          <button id="flow-btn-next" className="flow-nav-btn flow-nav-next" onClick={next} disabled={stepIdx === FLOW_STEPS.length - 1}>Siguiente →</button>
        </div>
      </div>
    </div>
  )
}
