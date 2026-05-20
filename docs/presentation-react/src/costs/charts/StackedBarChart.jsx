import React from 'react'

const COLORS = ['#00e5ff', '#818cf8', '#34d399']
const LEGEND = ['Egreso', 'Cloud Run', 'FS+GCS']

export default function StackedBarChart({ labels, seriesEgress, seriesCR, seriesOther, w = 520, h = 220 }) {
  const padL = 54, padB = 36, padT = 16, padR = 80
  const cw = w - padL - padR
  const ch = h - padT - padB
  const totals = labels.map((_, i) => (seriesEgress[i] || 0) + (seriesCR[i] || 0) + (seriesOther[i] || 0))
  const maxV = Math.max(...totals) * 1.1 || 1
  const bw = (cw / labels.length) * 0.55
  const gap = cw / labels.length

  return (
    <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: w }}>
      {Array.from({ length: 5 }, (_, i) => {
        const yv = (maxV / 4) * i
        const y = padT + ch - (ch * i / 4)
        return (
          <g key={i}>
            <line x1={padL} x2={padL + cw} y1={y} y2={y} stroke="#ffffff18" strokeDasharray="4 3"/>
            <text x={padL - 6} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="10">${yv.toFixed(1)}</text>
          </g>
        )
      })}
      {labels.map((lbl, i) => {
        const x = padL + i * gap + (gap - bw) / 2
        let y0 = padT + ch
        const series = [seriesEgress[i] || 0, seriesCR[i] || 0, seriesOther[i] || 0]
        const rects = series.map((v, ci) => {
          const bh = ch * (v / maxV)
          y0 -= bh
          return <rect key={ci} x={x.toFixed(1)} y={y0.toFixed(1)} width={bw.toFixed(1)} height={bh.toFixed(1)} fill={COLORS[ci]} opacity="0.85"/>
        })
        return (
          <g key={i}>
            {rects}
            <text x={(padL + i * gap + gap / 2).toFixed(1)} y={(h - 6).toFixed(1)} textAnchor="middle" fill="#94a3b8" fontSize="9">{lbl}</text>
          </g>
        )
      })}
      {COLORS.map((c, i) => (
        <g key={i}>
          <rect x={padL + cw + 6} y={padT + 4 + i * 18} width="10" height="10" rx="2" fill={c}/>
          <text x={padL + cw + 20} y={padT + 13 + i * 18} fill="#94a3b8" fontSize="10">{LEGEND[i]}</text>
        </g>
      ))}
      <line x1={padL} x2={padL + cw} y1={padT + ch} y2={padT + ch} stroke="#334155"/>
      <line x1={padL} x2={padL} y1={padT} y2={padT + ch} stroke="#334155"/>
    </svg>
  )
}
