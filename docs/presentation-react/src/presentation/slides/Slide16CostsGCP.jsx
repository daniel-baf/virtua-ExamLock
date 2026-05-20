import React, { useState } from 'react'

const CARD_COLORS = ['#10b981', '#06b6d4', '#8b5cf6']
const CARD_BORDER_COLORS = ['rgba(16,185,129,0.3)', 'rgba(6,182,212,0.3)', 'rgba(139,92,246,0.3)']

const COST_DETAILS = [
  // Card 0 — Costo fijo mensual
  (
    <div className="grid-2" style={{ gap:'1rem', width:'100%' }}>
      <div className="code-block" style={{ fontSize:'0.78rem', lineHeight:1.8 }}>
        {'Cloud Run server:    '}
        <b style={{ color:'var(--emerald)' }}>$0.00/mes</b>{'  (minScale=0, no cobra sin tráfico)'}<br/>
        {'Cloud Run dashboard: '}
        <b style={{ color:'var(--emerald)' }}>$0.00/mes</b>{'  (minScale=0)'}<br/>
        {'Firestore:           '}
        <b style={{ color:'var(--emerald)' }}>$0.00/mes</b>{'  (dentro del free tier diario sin carga)'}<br/>
        {'GCS screenshots:     '}
        <b style={{ color:'var(--amber)' }}>~$0–$1/mes</b>{'   (retención 90 días)'}<br/>
        {'Cloud Build:         '}
        <b style={{ color:'var(--amber)' }}>~$0–$5/mes</b>{'   (según frecuencia de builds)'}<br/>
        <span style={{ color:'var(--border)' }}>{'─'.repeat(44)}</span><br/>
        {'Total fijo esperado: '}
        <b style={{ color:'var(--text-1)' }}>~$0–$7/mes</b>
      </div>
      <div className="highlight-box" style={{ fontSize:'0.78rem', lineHeight:1.8 }}>
        <div style={{ color:'var(--amber)', fontFamily:'var(--font-mono)', fontSize:'0.72rem', marginBottom:'0.5rem' }}>Si se activa minScale=1 (instancia caliente):</div>
        <div style={{ fontFamily:'var(--font-mono)', color:'var(--text-2)' }}>
          CPU:  1 vCPU × 2,592,000s × $0.000024 = <b style={{ color:'var(--text-1)' }}>$62.21/mes</b><br/>
          RAM:  0.5 GiB × 2,592,000s × $0.0000025 = <b style={{ color:'var(--text-1)' }}>$3.24/mes</b><br/>
          <span style={{ color:'var(--border)' }}>{'─'.repeat(33)}</span><br/>
          Total: <b style={{ color:'var(--amber)' }}>~+$65/mes</b>
        </div>
        <div style={{ fontSize:'0.72rem', color:'var(--text-3)', marginTop:'0.6rem' }}>Recomendado solo si se necesita eliminar cold starts</div>
      </div>
    </div>
  ),
  // Card 1 — $0.058 por alumno · examen 2h
  (
    <div className="grid-2" style={{ gap:'1rem', width:'100%' }}>
      <div className="code-block" style={{ fontSize:'0.75rem', lineHeight:1.9 }}>
        <b style={{ color:'var(--cyan)' }}>Egreso stream</b>{' (720p/2s, 1 docente):'}<br/>
        {'  115 KB/frame × 0.5 fps × 7200s = 0.395 GiB'}<br/>
        {'  0.395 GiB × $0.12/GiB = '}
        <b style={{ color:'var(--cyan)' }}>$0.047</b>{'  (81%)'}<br/><br/>
        <b style={{ color:'var(--purple)' }}>Cloud Run</b>{'  :'}<br/>
        {'  CPU: 0.05 vCPU × 7200s × $0.000024 = $0.00864'}<br/>
        {'  RAM: 0.0488 GiB × 7200s × $0.0000025 = $0.00088'}<br/>
        {'  subtotal = '}
        <b style={{ color:'var(--purple)' }}>$0.0095</b>{'  (16%)'}<br/><br/>
        <b style={{ color:'var(--amber)' }}>Firestore</b>{'  :'}<br/>
        {'  505 writes / 100k × $0.09 = $0.00045'}<br/>
        {'  480 reads  / 100k × $0.03 = $0.00014'}<br/>
        {'  subtotal = '}
        <b style={{ color:'var(--amber)' }}>$0.0006</b>{'  (1%)'}<br/><br/>
        {'GCS screenshots:  '}<b>$0.0001</b>{'  (<1%)'}<br/>
        {'Firebase Auth:    '}<b>$0.00</b><br/>
        <span style={{ color:'var(--border)' }}>{'─'.repeat(36)}</span><br/>
        {'Total variable:   '}
        <b style={{ color:'var(--text-1)' }}>~$0.058 / alumno · examen</b>
      </div>
      <div className="highlight-box" style={{ fontSize:'0.78rem' }}>
        <div style={{ color:'var(--text-2)', fontFamily:'var(--font-mono)', fontSize:'0.72rem', marginBottom:'0.5rem' }}>Fuentes de los supuestos:</div>
        <div style={{ fontSize:'0.75rem', color:'var(--text-2)', lineHeight:1.7 }}>
          • Frame 720p q70: <span className="mono">115 KB</span> medido<br/>
          • Intervalo default: <span className="mono">2000ms</span> → <span className="mono">monitoringConfig.js</span><br/>
          • Transporte: <span className="mono">Buffer binario</span> (sin overhead base64)<br/>
          • Egreso: <span className="mono">$0.12/GiB</span> Premium Tier NA
        </div>
        <div style={{ marginTop:'0.8rem', fontSize:'0.75rem', color:'var(--text-2)' }}>Con free tier el primer examen del mes baja a <b style={{ color:'var(--text-1)' }}>~$0.048</b></div>
      </div>
    </div>
  ),
  // Card 2 — $1.16 por alumno · semestre
  (
    <div className="grid-2" style={{ gap:'1rem', width:'100%' }}>
      <div className="code-block" style={{ fontSize:'0.78rem', lineHeight:1.9 }}>
        <b style={{ color:'var(--text-2)' }}>Supuesto académico:</b><br/>
        {'  5 cursos / semestre'}<br/>
        {'  × 4 exámenes / curso'}<br/>
        {'  = '}
        <b style={{ color:'var(--text-1)' }}>20 exámenes / semestre</b><br/>
        {'  × 2h / examen = 40 alumno-horas'}<br/><br/>
        <b style={{ color:'var(--text-2)' }}>Cálculo:</b><br/>
        {'  20 exámenes × $0.058       = '}
        <b style={{ color:'var(--purple)' }}>$1.16</b><br/>
        {'  40 horas    × $0.029/h     = '}
        <b style={{ color:'var(--purple)' }}>$1.16</b>
      </div>
      <div className="highlight-box" style={{ fontSize:'0.78rem' }}>
        <div style={{ color:'var(--text-2)', fontFamily:'var(--font-mono)', fontSize:'0.72rem', marginBottom:'0.5rem' }}>Escala por universidad:</div>
        <table className="data-table" style={{ fontSize:'0.75rem' }}>
          <thead><tr><th>Alumnos/semestre</th><th className="num">Costo variable</th></tr></thead>
          <tbody>
            <tr><td>100</td><td className="num">~$116</td></tr>
            <tr><td>500</td><td className="num">~$580</td></tr>
            <tr className="highlight-row"><td>1,000</td><td className="num">~$1,160</td></tr>
            <tr><td>5,000</td><td className="num">~$5,800</td></tr>
          </tbody>
        </table>
        <div style={{ fontSize:'0.7rem', color:'var(--text-3)', marginTop:'0.5rem' }}>No incluye costo fijo mensual ni infraestructura adicional para &gt;200 alumnos simultáneos</div>
      </div>
    </div>
  ),
]

export default function Slide16CostsGCP() {
  const [selectedCard, setSelectedCard] = useState(-1)

  const selectCard = (idx) => {
    setSelectedCard(prev => prev === idx ? -1 : idx)
  }

  return (
    <div className="slide-card">
      <div className="slide-header">
        <div>
          <h2 className="slide-title">Análisis de Costos GCP</h2>
          <p className="slide-subtitle">Modelo económico detallado — serverless, costos variables por alumno</p>
        </div>
        <span className="badge badge-amber">COSTOS GCP</span>
      </div>
      <div className="slide-body" style={{ flexDirection:'column', gap:'0.8rem' }}>
        <p style={{ fontSize:'0.75rem', color:'var(--text-3)', textAlign:'center', fontFamily:'var(--font-mono)' }}>Selecciona una card para ver el cálculo detallado</p>
        <div className="grid-3" style={{ width:'100%' }}>
          {[
            { value: '~$0/mes',   label: 'Costo fijo mensual',    sub: '(minScale=0)',               color: 'var(--emerald)' },
            { value: '$0.058',    label: 'Por alumno · examen',   sub: '(720p/2s · 2h · 1 docente)', color: 'var(--cyan)' },
            { value: '$1.16',     label: 'Por alumno · semestre', sub: '(5 cursos × 4 exámenes × 2h)', color: 'var(--purple)' },
          ].map((card, i) => (
            <div
              key={i}
              className="card-item cost-kpi-card"
              onClick={() => selectCard(i)}
              style={{
                borderColor: CARD_BORDER_COLORS[i],
                textAlign:'center',
                cursor:'pointer',
                transition:'all 0.2s',
                outline: selectedCard === i ? `2px solid ${CARD_COLORS[i]}` : 'none',
                transform: selectedCard === i ? 'scale(1.03)' : 'none',
              }}
            >
              <div style={{ fontSize:'2rem', fontFamily:'var(--font-title)', fontWeight:'800', color: card.color }}>{card.value}</div>
              <div style={{ fontSize:'0.8rem', color:'var(--text-2)', marginTop:'0.3rem' }}>{card.label}</div>
              <div style={{ fontSize:'0.68rem', color:'var(--text-3)', marginTop:'0.2rem', fontFamily:'var(--font-mono)' }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {selectedCard >= 0 ? (
          <div className="cost-detail-panel">{COST_DETAILS[selectedCard]}</div>
        ) : (
          <div id="cost-default-panel" className="grid-2" style={{ width:'100%', gap:'1rem' }}>
            <div>
              <table className="data-table">
                <thead>
                  <tr><th>Componente</th><th className="num">Costo/alumno·2h</th><th className="num">%</th></tr>
                </thead>
                <tbody>
                  <tr className="highlight-row"><td>Egreso stream 720p/2s</td><td className="num">$0.047</td><td className="num">81%</td></tr>
                  <tr><td>Cloud Run (CPU + RAM)</td><td className="num">$0.0095</td><td className="num">16%</td></tr>
                  <tr><td>Firestore</td><td className="num">$0.0006</td><td className="num">1%</td></tr>
                  <tr><td>GCS Screenshots</td><td className="num">$0.0001</td><td className="num">&lt;1%</td></tr>
                  <tr><td>Firebase Auth</td><td className="num">$0.00</td><td className="num">0%</td></tr>
                  <tr style={{ fontWeight:'700' }}><td>TOTAL</td><td className="num">$0.058</td><td className="num">100%</td></tr>
                </tbody>
              </table>
            </div>
            <div>
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', maxWidth:'200px', display:'block', margin:'0 auto' }}>
                <circle cx="100" cy="100" r="70" fill="none" stroke="#06b6d4" strokeWidth="40" strokeDasharray="356.5 439.6" strokeDashoffset="0" transform="rotate(-90 100 100)"/>
                <circle cx="100" cy="100" r="70" fill="none" stroke="#8b5cf6" strokeWidth="40" strokeDasharray="70.4 439.6" strokeDashoffset="-356.5" transform="rotate(-90 100 100)"/>
                <circle cx="100" cy="100" r="70" fill="none" stroke="#f59e0b" strokeWidth="40" strokeDasharray="13.2 439.6" strokeDashoffset="-427" transform="rotate(-90 100 100)"/>
                <circle cx="100" cy="100" r="50" fill="#0b1020"/>
                <text x="100" y="96" textAnchor="middle" fill="#f8fafc" fontSize="14" fontFamily="Outfit,sans-serif" fontWeight="800">82%</text>
                <text x="100" y="112" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontFamily="Plus Jakarta Sans,sans-serif">egreso</text>
              </svg>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem', marginTop:'0.5rem', fontSize:'0.75rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}><span style={{ width:'10px', height:'10px', borderRadius:'2px', background:'var(--cyan)', flexShrink:'0' }}></span><span style={{ color:'var(--text-2)' }}>Egreso stream (81%)</span></div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}><span style={{ width:'10px', height:'10px', borderRadius:'2px', background:'var(--purple)', flexShrink:'0' }}></span><span style={{ color:'var(--text-2)' }}>Cloud Run (16%)</span></div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}><span style={{ width:'10px', height:'10px', borderRadius:'2px', background:'var(--amber)', flexShrink:'0' }}></span><span style={{ color:'var(--text-2)' }}>Firestore+GCS (3%)</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
