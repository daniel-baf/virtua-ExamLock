import React from 'react'

export default function BarChart({ labels, values, color = '#00e5ff', w = 520, h = 200, yLabel = 'USD', yFmt = v => `$${v.toFixed(0)}` }) {
  const padL = 54, padB = 36, padT = 16, padR = 12
  const cw = w - padL - padR
  const ch = h - padT - padB
  const maxV = Math.max(...values) * 1.1 || 1
  const bw = (cw / labels.length) * 0.6
  const gap = cw / labels.length

  const yTicks = Array.from({ length: 5 }, (_, i) => i)

  return (
    <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: w }}>
      <text x={padL - 44} y={padT + ch / 2} textAnchor="middle" fill="#64748b" fontSize="9"
        transform={`rotate(-90,${padL - 44},${padT + ch / 2})`}>{yLabel}</text>
      {yTicks.map(i => {
        const yv = (maxV / 4) * i
        const y = padT + ch - (ch * i / 4)
        return (
          <g key={i}>
            <line x1={padL} x2={padL + cw} y1={y} y2={y} stroke="#ffffff18" strokeDasharray="4 3"/>
            <text x={padL - 6} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="10">{yFmt(yv)}</text>
          </g>
        )
      })}
      {labels.map((lbl, i) => {
        const bh = ch * (values[i] / maxV)
        const x = padL + i * gap + (gap - bw) / 2
        const y = padT + ch - bh
        return (
          <g key={i}>
            <rect x={x.toFixed(1)} y={y.toFixed(1)} width={bw.toFixed(1)} height={bh.toFixed(1)} rx="3" fill={color} opacity="0.85"/>
            <text x={(x + bw / 2).toFixed(1)} y={(y - 4).toFixed(1)} textAnchor="middle" fill={color} fontSize="9" fontWeight="bold">{yFmt(values[i])}</text>
            <text x={(padL + i * gap + gap / 2).toFixed(1)} y={(h - 6).toFixed(1)} textAnchor="middle" fill="#94a3b8" fontSize="9">{lbl}</text>
          </g>
        )
      })}
      <line x1={padL} x2={padL + cw} y1={padT + ch} y2={padT + ch} stroke="#334155"/>
      <line x1={padL} x2={padL} y1={padT} y2={padT + ch} stroke="#334155"/>
    </svg>
  )
}
