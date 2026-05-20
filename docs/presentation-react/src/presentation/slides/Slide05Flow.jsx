import React from 'react'
import FlowAnimator from '../FlowAnimator.jsx'

export default function Slide05Flow() {
  return (
    <div className="slide-card">
      <div className="slide-header">
        <div>
          <h2 className="slide-title">Flujo de Ejecución e Interconexión</h2>
          <p className="slide-subtitle">Simulador animado paso a paso de flujos de datos y controles de seguridad</p>
        </div>
        <span className="badge badge-cyan">ANIMACIÓN</span>
      </div>
      <div className="slide-body">
        <FlowAnimator />
      </div>
    </div>
  )
}
