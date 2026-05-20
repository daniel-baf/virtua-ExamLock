import React from 'react'

export default function SensitivityTable({ modes }) {
  return (
    <table className="data-table sensitivity-table">
      <thead>
        <tr>
          <th>Modo</th><th>KB/frame</th><th>Intervalo</th>
          <th>GiB/alumno 2h</th><th>Egreso/alumno</th><th>Total/alumno 2h</th>
        </tr>
      </thead>
      <tbody>
        {modes.map((m, i) => {
          const heat = m.total2h <= 0.030 ? 'heat-low' : m.total2h <= 0.065 ? 'heat-mid' : 'heat-high'
          const isDefault = m.label.includes('base')
          return (
            <tr key={i} className={isDefault ? 'row-default' : ''}>
              <td>{m.label}</td>
              <td>{m.kbFrame} KB</td>
              <td>{m.intervalS}s</td>
              <td>{m.gib2h.toFixed(3)} GiB</td>
              <td>${m.egress2h.toFixed(3)}</td>
              <td className={heat}><strong>${m.total2h.toFixed(3)}</strong></td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
