import React from 'react'

export default function Slide01Cover() {
  return (
    <div className="slide-card">
      <div className="portada-content">
        <svg className="portada-logo" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" stroke="url(#pg1)" strokeWidth="5" strokeDasharray="10 5"/>
          <rect x="35" y="45" width="30" height="25" rx="6" stroke="#06b6d4" strokeWidth="4"/>
          <path d="M40 45V36C40 30.5 44.5 26 50 26C55.5 26 60 30.5 60 36V45" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round"/>
          <circle cx="50" cy="57" r="3" fill="#06b6d4"/>
          <defs>
            <linearGradient id="pg1" x1="5" y1="5" x2="95" y2="95" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8b5cf6"/>
              <stop offset="1" stopColor="#06b6d4"/>
            </linearGradient>
          </defs>
        </svg>
        <h1 className="portada-title">ExamLock</h1>
        <p className="portada-sub">Entorno Seguro y Controlado para Evaluaciones Académicas Prácticas</p>
        <div className="portada-meta">
          <span><b>✓</b> Pila de Red Aislada</span>
          <span><b>✓</b> Hardening a nivel Kernel</span>
          <span><b>✓</b> Proctoring en Tiempo Real</span>
        </div>
        <div className="portada-authors">
          <span>Diego Abdo</span>
          <span className="portada-authors-sep">·</span>
          <span>Daniel Bautista</span>
        </div>
      </div>
    </div>
  )
}
