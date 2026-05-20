import React from 'react'
import FlowAnimator from '../FlowAnimator.jsx'

export default function Slide05Flow() {
  return (
    <div className="slide-card">
      <div className="slide-header" style={{ marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 className="slide-title" style={{ fontSize: 'clamp(2rem, 3.5vw, 4rem)' }}>Flujo de Ejecución e Interconexión</h2>
            <span className="badge badge-cyan" style={{ margin: 0 }}>ANIMACIÓN</span>
          </div>
          <p className="slide-subtitle" style={{ marginTop: '0.5rem' }}>Simulador animado paso a paso de flujos de datos y controles de seguridad</p>
        </div>
      </div>
      <div className="slide-body" style={{ overflow: 'visible' }}>
        <FlowAnimator />
      </div>
    </div>
  )
}
