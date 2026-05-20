import React from 'react'
import { useApp } from '../store/AppContext.jsx'
import { TOTAL_SLIDES } from '../store/reducer.js'

export default function FooterNav() {
  const { state, dispatch } = useApp()
  const { slideIdx } = state.presentation

  return (
    <footer className="pres-footer">
      <button
        className="sidebar-toggle-btn"
        aria-label="Abrir índice"
        onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
      >
        ☰ Índice
      </button>

      <div className="nav-progress" role="list" aria-label="Progreso">
        {Array.from({ length: TOTAL_SLIDES }, (_, i) => (
          <div
            key={i}
            className={`progress-dot${i === slideIdx ? ' active' : ''}`}
            role="listitem"
            aria-label={`Slide ${i + 1}`}
            onClick={() => dispatch({ type: 'SET_SLIDE', idx: i })}
          />
        ))}
      </div>

      <div className="nav-controls">
        <button
          className="nav-btn"
          aria-label="Diapositiva anterior"
          onClick={() => { if (slideIdx > 0) dispatch({ type: 'SET_SLIDE', idx: slideIdx - 1 }) }}
        >←</button>
        <span className="nav-counter">{slideIdx + 1} / {TOTAL_SLIDES}</span>
        <button
          className="nav-btn"
          aria-label="Diapositiva siguiente"
          onClick={() => { if (slideIdx < TOTAL_SLIDES - 1) dispatch({ type: 'SET_SLIDE', idx: slideIdx + 1 }) }}
        >→</button>
      </div>
    </footer>
  )
}
