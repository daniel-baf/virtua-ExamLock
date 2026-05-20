import React from 'react'

export default function DonutChart({ slices, r = 70, cx = 95, cy = 85, w = 260, h = 170 }) {
  const total = slices.reduce((s, x) => s + x.value, 0)
  let angle = -Math.PI / 2
  const ri = r - 18

  const paths = slices.map((sl, i) => {
    const frac = sl.value / total
    const startA = angle
    const endA = angle + 2 * Math.PI * frac
    const x1 = cx + r * Math.cos(startA)
    const y1 = cy + r * Math.sin(startA)
    const x2 = cx + r * Math.cos(endA)
    const y2 = cy + r * Math.sin(endA)
    const xi1 = cx + ri * Math.cos(startA)
    const yi1 = cy + ri * Math.sin(startA)
    const xi2 = cx + ri * Math.cos(endA)
    const yi2 = cy + ri * Math.sin(endA)
    const large = frac > 0.5 ? 1 : 0
    angle = endA
    return (
      <path key={i}
        d={`M${xi1.toFixed(1)},${yi1.toFixed(1)} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large},1 ${x2.toFixed(1)},${y2.toFixed(1)} L${xi2.toFixed(1)},${yi2.toFixed(1)} A${ri},${ri} 0 ${large},0 ${xi1.toFixed(1)},${yi1.toFixed(1)} Z`}
        fill={sl.color} opacity="0.9"
      />
    )
  })

  return (
    <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: w }}>
      {paths}
      <circle cx={cx} cy={cy} r="20" fill="#0f172a"/>
      {slices.map((sl, i) => {
        const frac = sl.value / total
        return (
          <g key={i}>
            <rect x={cx + r + 14} y={8 + i * 22} width="10" height="10" rx="2" fill={sl.color}/>
            <text x={cx + r + 28} y={17 + i * 22} fill="#cbd5e1" fontSize="11">
              {sl.label} <tspan fill={sl.color} fontWeight="bold">{(frac * 100).toFixed(0)}%</tspan>
            </text>
          </g>
        )
      })}
    </svg>
  )
}
