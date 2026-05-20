import React, { useState, useMemo, useRef } from 'react'

const MODES = [
  { label: '480p / 5s',  total2h: 0.017 },
  { label: '480p / 2s',  total2h: 0.027 },
  { label: '720p / 2s',  total2h: 0.058 },
  { label: '720p / 1s',  total2h: 0.105 },
  { label: '1080p / 2s', total2h: 0.103 },
]
const TABLE_ROWS = [
  ['480p / 5s',    0.056, 0.007, 0.017],
  ['480p / 2s',    0.141, 0.017, 0.027],
  ['720p / 2s ★',  0.395, 0.047, 0.058],
  ['720p / 1s',    0.790, 0.095, 0.105],
  ['1080p / 2s',   0.772, 0.093, 0.103],
]
const STUDENTS  = [10, 45, 100, 200, 500, 1000]
const BAR_XS    = [49, 81, 113, 145, 177, 209]
const BASELINE  = 120
const MAX_H     = 100

export default function Slide17Sensitivity() {
  const [modeIdx, setModeIdx] = useState(2)
  const barsKey = useRef(0)
  const flashKey = useRef(0)

  function handleMode(i) {
    if (i === modeIdx) return
    barsKey.current += 1
    flashKey.current += 1
    setModeIdx(i)
  }

  const mode = MODES[modeIdx]
  const costs = useMemo(() => STUDENTS.map(s => parseFloat((s * mode.total2h).toFixed(2))), [modeIdx])
  const maxCost = Math.max(...costs)

  const bars = useMemo(() => costs.map((cost, i) => {
    const h = Math.max(1, Math.round((cost / maxCost) * MAX_H))
    const y = BASELINE - h
    const ratio = cost / maxCost
    const color = ratio < 0.35 ? '#06b6d4' : ratio < 0.7 ? '#8b5cf6' : '#f59e0b'
    return { h, y, color, cost }
  }), [costs, maxCost])

  const yLabels = useMemo(() => {
    const stops = [maxCost, maxCost * 0.66, maxCost * 0.33, maxCost * 0.1]
    return stops.map(v => v >= 10 ? '$' + Math.round(v) : '$' + v.toFixed(1))
  }, [maxCost])

  const yPositions = [14, 44, 74, 104]

  return (
    <div className="slide-card">
      <div className="slide-header">
        <div>
          <h2 className="slide-title">Sensibilidad y Escenarios de Escala</h2>
          <p className="slide-subtitle">Cómo varía el costo según resolución, intervalo y número de alumnos</p>
        </div>
        <span className="badge badge-amber">COSTOS GCP</span>
      </div>
      <div className="slide-body" style={{ flexDirection:'column', gap:'1rem' }}>
        <div className="grid-2" style={{ width:'100%', gap:'1.5rem' }}>

          {/* tabla */}
          <div>
            <p style={{ fontSize:'0.8rem', color:'var(--text-2)', marginBottom:'0.5rem', fontWeight:'600' }}>
              SENSIBILIDAD POR RESOLUCIÓN / INTERVALO{' '}
              <span style={{ fontWeight:'400', fontSize:'0.72rem', opacity:0.7 }}>— clic para actualizar gráfica</span>
            </p>
            <table className="data-table">
              <thead>
                <tr><th>Modo</th><th className="num">GiB/alumno</th><th className="num">Egreso</th><th className="num">Total</th></tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map(([label, gib, eg, tot], i) => (
                  <tr
                    key={i}
                    className={`sens-row-enter${i === modeIdx ? ' highlight-row' : ''}`}
                    style={{ cursor:'pointer', animationDelay: `${i * 0.06}s` }}
                    onClick={() => handleMode(i)}
                  >
                    <td>{label}</td>
                    <td className="num">{gib}</td>
                    <td className="num">${eg.toFixed(3)}</td>
                    <td className="num">${tot.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* gráfica */}
          <div>
            <p style={{ fontSize:'0.8rem', color:'var(--text-2)', marginBottom:'0.5rem', fontWeight:'600' }}>
              ESCENARIOS POR NÚMERO DE ALUMNOS (2h · {mode.label} · 1 docente)
            </p>
            <svg viewBox="0 0 280 140" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%' }}>
              <line x1="30" y1="10" x2="30" y2="120" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
              <line x1="30" y1="120" x2="275" y2="120" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
              {yLabels.map((lbl, i) => (
                <text key={i} x="25" y={yPositions[i]} fill="#6b7280" fontSize="7" textAnchor="end" fontFamily="JetBrains Mono">{lbl}</text>
              ))}
              {/* key forces re-mount → re-triggers animation on modeIdx change */}
              <g key={barsKey.current}>
                {bars.map((bar, i) => (
                  <g key={i}>
                    <rect
                      className="sens-bar-rect"
                      x={BAR_XS[i] - 11} y={bar.y} width="22" height={bar.h}
                      fill={bar.color} rx="2"
                      style={{ animationDelay: `${i * 0.06}s` }}
                    />
                    <text
                      x={BAR_XS[i]} y={bar.y - 2}
                      fill="#f8fafc" fontSize="6" textAnchor="middle"
                      style={{ animation: `value-flash 0.35s ${i * 0.06 + 0.3}s ease both` }}
                    >
                      ${bar.cost.toFixed(2)}
                    </text>
                    <text x={BAR_XS[i]} y="130" fill="#9ca3af" fontSize="7" textAnchor="middle" fontFamily="JetBrains Mono">
                      {STUDENTS[i]}
                    </text>
                  </g>
                ))}
              </g>
              <text x="155" y="140" fill="#6b7280" fontSize="8" textAnchor="middle">Número de alumnos simultáneos</text>
            </svg>
            <div className="highlight-box" style={{ padding:'0.7rem', marginTop:'0.5rem' }}>
              <p style={{ fontSize:'0.78rem', color:'var(--text-2)' }}>
                <b>Escenario A (45 alumnos, 2h):</b>{' '}
                <span key={`a-${flashKey.current}`} className="sens-value-flash" style={{ color:'var(--text-1)', display:'inline-block' }}>
                  ${(45 * mode.total2h).toFixed(2)}
                </span>
                {' · '}
                <b>Escenario B (500 alumnos, 2h):</b>{' '}
                <span key={`b-${flashKey.current}`} className="sens-value-flash" style={{ color:'var(--text-1)', display:'inline-block', animationDelay:'0.1s' }}>
                  ${(500 * mode.total2h).toFixed(2)}
                </span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
