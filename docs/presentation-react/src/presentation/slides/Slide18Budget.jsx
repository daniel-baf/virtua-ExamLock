import React from 'react'
import BudgetSimulator from '../../costs/BudgetSimulator.jsx'

export default function Slide18Budget() {
  return (
    <div className="slide-card">
      <div className="slide-header">
        <div>
          <h2 className="slide-title">Simulador de Presupuesto Interactivo</h2>
          <p className="slide-subtitle">Calcula el costo GCP en tiempo real según tus parámetros de examen</p>
        </div>
        <span className="badge badge-amber">INTERACTIVO</span>
      </div>
      <div className="slide-body">
        <BudgetSimulator />
      </div>
    </div>
  )
}
