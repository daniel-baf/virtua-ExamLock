import React from 'react'
import { useApp } from '../store/AppContext.jsx'

const TABS = [
  { id: 'presentation', icon: '📊', label: 'Presentación' },
  { id: 'simulator',    icon: '🖥️', label: 'Simulador en Vivo' },
  { id: 'costs',        icon: '💰', label: 'Análisis de Costos GCP' },
]

export default function Header() {
  const { state, dispatch } = useApp()

  return (
    <header className="app-header">
      <div className="app-brand">
        <div className="brand-logo">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" stroke="url(#hdr_grad)" strokeWidth="5" strokeDasharray="10 5"/>
            <rect x="35" y="45" width="30" height="25" rx="6" stroke="#06b6d4" strokeWidth="4"/>
            <path d="M40 45V36C40 30.5 44.5 26 50 26C55.5 26 60 30.5 60 36V45" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="50" cy="57" r="3" fill="#06b6d4"/>
            <defs>
              <linearGradient id="hdr_grad" x1="5" y1="5" x2="95" y2="95" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8b5cf6"/><stop offset="1" stopColor="#06b6d4"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div>
          <span className="brand-name">ExamLock</span>
          <span className="brand-sub">Entorno Seguro para Evaluaciones</span>
        </div>
      </div>

      <nav className="tab-nav" role="tablist">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn${state.activeTab === t.id ? ' active' : ''}`}
            role="tab"
            aria-selected={state.activeTab === t.id}
            onClick={() => dispatch({ type: 'SET_TAB', tab: t.id })}
          >
            <span className="tab-icon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      <div className="header-actions">
        <span className="session-badge">ExamLock v2.0</span>
      </div>
    </header>
  )
}
