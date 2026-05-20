import React from 'react'

/* viewBox 0 0 900 310 */

const NODES = {
  dashboard: { x: 12,  y: 130, w: 165, h: 52, color: '#06b6d4', icon: '🖥', label: 'Dashboard Docente',  sub: 'React SPA · Firebase Hosting' },
  server:    { x: 330, y: 128, w: 210, h: 56, color: '#8b5cf6', icon: '⚙',  label: 'Server Cloud Run',   sub: 'Node.js · Socket.io · WSS'    },
  agent:     { x: 700, y: 130, w: 165, h: 52, color: '#10b981', icon: '🛡', label: 'Agente / Daemon',    sub: 'Node.js · iptables · kernel'   },
  firebase:  { x: 330, y: 16,  w: 180, h: 46, color: '#f59e0b', icon: '🔑', label: 'Firebase Auth',      sub: 'JWT · OAuth2'                  },
  firestore: { x: 130, y: 256, w: 150, h: 44, color: '#3b82f6', icon: '🗄', label: 'Firestore DB',       sub: 'gRPC · realtime listeners'     },
  gcs:       { x: 596, y: 256, w: 150, h: 44, color: '#0ea5e9', icon: '🪣', label: 'GCS Buckets',        sub: 'HTTPS · 90-day retain'         },
}

function nx(id, side = 'cx') {
  const n = NODES[id]
  if (side === 'cx') return n.x + n.w / 2
  if (side === 'l')  return n.x
  if (side === 'r')  return n.x + n.w
  if (side === 'cy') return n.y + n.h / 2
  if (side === 't')  return n.y
  if (side === 'b')  return n.y + n.h
}

function ArchNode({ id }) {
  const n = NODES[id]
  const cx = n.x + n.w / 2
  return (
    <g>
      <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="8"
        fill={`${n.color}12`} stroke={n.color} strokeWidth="1.5" strokeOpacity="0.5"/>
      <rect x={n.x} y={n.y} width="4" height={n.h} rx="2" fill={n.color} opacity="0.9"/>
      <text x={n.x + 16} y={n.y + n.h / 2 - 5} fill="white" fontSize="11.5"
        fontFamily="Outfit,sans-serif" fontWeight="700">{n.icon} {n.label}</text>
      <text x={n.x + 16} y={n.y + n.h / 2 + 11} fill="#6b7280" fontSize="8.5"
        fontFamily="JetBrains Mono,monospace">{n.sub}</text>
    </g>
  )
}

export default function Slide04Architecture() {
  return (
    <div className="slide-card">
      <style>{`
        @keyframes flow-dash { to { stroke-dashoffset: -12; } }
        .fd { stroke-dasharray: 5 3; animation: flow-dash 1.2s linear infinite; fill: none; }
        .fd-slow { stroke-dasharray: 5 3; animation: flow-dash 2s linear infinite; fill: none; }
      `}</style>

      <div className="slide-header">
        <div>
          <h2 className="slide-title">Arquitectura Propuesta</h2>
          <p className="slide-subtitle">6 componentes interconectados — serverless, event-driven, cifrado extremo a extremo</p>
        </div>
        <span className="badge badge-purple">TECNOLOGÍA</span>
      </div>

      <div className="slide-body" style={{ padding: '0.3rem 0', overflow: 'hidden' }}>
        <svg viewBox="0 0 900 310" style={{ width: '100%', height: '100%', maxHeight: '400px' }}
          fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="arr-cyan"    markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><polygon points="0 0,7 3.5,0 7" fill="#06b6d4" opacity="0.9"/></marker>
            <marker id="arr-purple"  markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><polygon points="0 0,7 3.5,0 7" fill="#8b5cf6" opacity="0.9"/></marker>
            <marker id="arr-emerald" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><polygon points="0 0,7 3.5,0 7" fill="#10b981" opacity="0.9"/></marker>
            <marker id="arr-amber"   markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><polygon points="0 0,7 3.5,0 7" fill="#f59e0b" opacity="0.9"/></marker>
            <marker id="arr-blue"    markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><polygon points="0 0,7 3.5,0 7" fill="#3b82f6" opacity="0.9"/></marker>
            <marker id="arr-sky"     markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><polygon points="0 0,7 3.5,0 7" fill="#0ea5e9" opacity="0.9"/></marker>
          </defs>

          {/* ── BIDIRECCIONAL: Dashboard ↔ Server ── dos líneas paralelas */}
          {/* Dashboard → Server (top) */}
          <line x1={nx('dashboard','r')} y1={nx('dashboard','cy')-5}
                x2={nx('server','l')}    y2={nx('server','cy')-5}
                stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.2"/>
          <line className="fd" x1={nx('dashboard','r')} y1={nx('dashboard','cy')-5}
                x2={nx('server','l')-7}  y2={nx('server','cy')-5}
                stroke="#06b6d4" strokeWidth="1.8" markerEnd="url(#arr-cyan)"
                style={{ animationDelay: '0s' }}/>
          {/* Server → Dashboard (bottom) */}
          <line x1={nx('server','l')}    y1={nx('server','cy')+5}
                x2={nx('dashboard','r')} y2={nx('dashboard','cy')+5}
                stroke="#8b5cf6" strokeWidth="1.5" strokeOpacity="0.2"/>
          <line className="fd" x1={nx('server','l')} y1={nx('server','cy')+5}
                x2={nx('dashboard','r')+7} y2={nx('dashboard','cy')+5}
                stroke="#8b5cf6" strokeWidth="1.8" markerEnd="url(#arr-purple)"
                style={{ animationDelay: '0.4s' }}/>
          {/* label */}
          <text x={(nx('dashboard','r') + nx('server','l')) / 2} y={nx('dashboard','cy') - 12}
            fill="#a78bfa" fontSize="8" fontFamily="JetBrains Mono,monospace" textAnchor="middle">WSS · REST  ⇄</text>

          {/* ── BIDIRECCIONAL: Server ↔ Agent ── */}
          {/* Server → Agent (top) */}
          <line x1={nx('server','r')}    y1={nx('server','cy')-5}
                x2={nx('agent','l')}     y2={nx('agent','cy')-5}
                stroke="#8b5cf6" strokeWidth="1.5" strokeOpacity="0.2"/>
          <line className="fd" x1={nx('server','r')} y1={nx('server','cy')-5}
                x2={nx('agent','l')-7}   y2={nx('agent','cy')-5}
                stroke="#8b5cf6" strokeWidth="1.8" markerEnd="url(#arr-purple)"
                style={{ animationDelay: '0.2s' }}/>
          {/* Agent → Server (bottom) */}
          <line x1={nx('agent','l')}     y1={nx('agent','cy')+5}
                x2={nx('server','r')}    y2={nx('server','cy')+5}
                stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.2"/>
          <line className="fd" x1={nx('agent','l')} y1={nx('agent','cy')+5}
                x2={nx('server','r')+7}  y2={nx('server','cy')+5}
                stroke="#10b981" strokeWidth="1.8" markerEnd="url(#arr-emerald)"
                style={{ animationDelay: '0.6s' }}/>
          <text x={(nx('server','r') + nx('agent','l')) / 2} y={nx('server','cy') - 12}
            fill="#34d399" fontSize="8" fontFamily="JetBrains Mono,monospace" textAnchor="middle">WSS + HTTPS  ⇄</text>

          {/* ── Agent → Firebase Auth ── */}
          <path d={`M ${nx('agent','cx')} ${nx('agent','t')} Q ${nx('agent','cx')} 60 ${nx('firebase','r')} ${nx('firebase','cy')}`}
            stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.2"/>
          <path className="fd-slow"
            d={`M ${nx('agent','cx')} ${nx('agent','t')} Q ${nx('agent','cx')} 60 ${nx('firebase','r')+6} ${nx('firebase','cy')}`}
            stroke="#f59e0b" strokeWidth="1.8" markerEnd="url(#arr-amber)"
            style={{ animationDelay: '0.5s' }}/>
          <text x={nx('agent','cx') + 10} y="70" fill="#fbbf24" fontSize="7.5"
            fontFamily="JetBrains Mono,monospace" textAnchor="start">HTTPS · get JWT</text>

          {/* ── Server → Firebase Auth ── */}
          <path d={`M ${nx('firebase','cx')} ${nx('firebase','b')} V ${nx('server','t')}`}
            stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.2"/>
          <path className="fd-slow"
            d={`M ${nx('firebase','cx')} ${nx('firebase','b')} V ${nx('server','t')+6}`}
            stroke="#f59e0b" strokeWidth="1.8" markerEnd="url(#arr-amber)"
            style={{ animationDelay: '0.9s' }}/>
          <text x={nx('firebase','cx') + 6} y="96" fill="#fbbf24" fontSize="7.5"
            fontFamily="JetBrains Mono,monospace">validate JWT</text>

          {/* ── Server → Firestore ── */}
          <path d={`M ${nx('server','cx') - 20} ${nx('server','b')} Q ${nx('server','cx') - 60} 230 ${nx('firestore','cx')} ${nx('firestore','t')}`}
            stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.2"/>
          <path className="fd-slow"
            d={`M ${nx('server','cx') - 20} ${nx('server','b')} Q ${nx('server','cx') - 60} 230 ${nx('firestore','cx')} ${nx('firestore','t')+6}`}
            stroke="#3b82f6" strokeWidth="1.8" markerEnd="url(#arr-blue)"
            style={{ animationDelay: '0.3s' }}/>
          <text x={nx('server','cx') - 50} y="242" fill="#60a5fa" fontSize="7.5"
            fontFamily="JetBrains Mono,monospace" textAnchor="middle">gRPC SDK</text>

          {/* ── Firestore → Dashboard (realtime listener) ── */}
          <path d={`M ${nx('firestore','l')} ${nx('firestore','cy')} Q 60 260 ${nx('dashboard','cx')} ${nx('dashboard','b')}`}
            stroke="#6366f1" strokeWidth="1.5" strokeOpacity="0.2"/>
          <path className="fd-slow"
            d={`M ${nx('firestore','l')} ${nx('firestore','cy')} Q 60 260 ${nx('dashboard','cx')} ${nx('dashboard','b')+6}`}
            stroke="#6366f1" strokeWidth="1.8" markerEnd="url(#arr-purple)"
            style={{ animationDelay: '1.1s' }}/>
          <text x="72" y="290" fill="#818cf8" fontSize="7.5"
            fontFamily="JetBrains Mono,monospace">realtime listener</text>

          {/* ── Agent → GCS Buckets ── */}
          <path d={`M ${nx('agent','cx') + 10} ${nx('agent','b')} Q ${nx('agent','cx')} 240 ${nx('gcs','cx')} ${nx('gcs','t')}`}
            stroke="#0ea5e9" strokeWidth="1.5" strokeOpacity="0.2"/>
          <path className="fd-slow"
            d={`M ${nx('agent','cx') + 10} ${nx('agent','b')} Q ${nx('agent','cx')} 240 ${nx('gcs','cx')} ${nx('gcs','t')+6}`}
            stroke="#0ea5e9" strokeWidth="1.8" markerEnd="url(#arr-sky)"
            style={{ animationDelay: '0.7s' }}/>
          <text x={nx('gcs','cx')} y="245" fill="#38bdf8" fontSize="7.5"
            fontFamily="JetBrains Mono,monospace" textAnchor="middle">HTTPS upload</text>

          {/* Nodes */}
          {Object.keys(NODES).map(id => <ArchNode key={id} id={id} />)}

          {/* Legend */}
          <g transform="translate(10, 300)">
            {[['#06b6d4','⇄ Bidireccional'],['#f59e0b','→ Unidireccional'],['#3b82f6','Persistencia'],['#0ea5e9','Telemetría/Storage']].map(([c,l],i) => (
              <g key={l} transform={`translate(${i * 215}, 0)`}>
                <circle cx="5" cy="0" r="3.5" fill={c} opacity="0.8"/>
                <text x="13" y="4" fill="#6b7280" fontSize="8" fontFamily="Plus Jakarta Sans,sans-serif">{l}</text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
}
