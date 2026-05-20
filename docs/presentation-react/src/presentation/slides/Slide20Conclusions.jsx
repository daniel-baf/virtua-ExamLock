import React from 'react'
import { useApp } from '../../store/AppContext.jsx'

export default function Slide20Conclusions() {
  const { dispatch } = useApp()

  return (
    <div className="slide-card">
      <div className="slide-header">
        <div><h2 className="slide-title">Conclusiones</h2><p className="slide-subtitle">ExamLock — Defensa en profundidad, viable y económicamente sostenible</p></div>
        <span className="badge badge-emerald">FIN</span>
      </div>
      <div className="slide-body">
        <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:'1.5rem', alignItems:'center' }}>
          <div className="highlight-box" style={{ width:'100%', textAlign:'left' }}>
            <p style={{ fontSize:'clamp(1.6rem, 3.6vw, 4.2rem)', color:'var(--text-1)', fontWeight:800, lineHeight:1.03, textWrap:'balance' }}>
              Integridad académica con <i>defensa en profundidad</i>, costo realista y evidencia verificable.
            </p>
          </div>
          <div className="grid-4" style={{ width:'100%' }}>
            <div className="card-item" style={{ textAlign:'center' }}>
              <div style={{ fontSize:'0.8rem', color:'var(--cyan)', fontWeight:700 }}>Multi-Capa</div>
              <div style={{ fontSize:'0.72rem', color:'var(--text-2)' }}>12 vectores bloqueados</div>
            </div>
            <div className="card-item" style={{ textAlign:'center' }}>
              <div style={{ fontSize:'0.8rem', color:'var(--purple)', fontWeight:700 }}>Fácil Adopción</div>
              <div style={{ fontSize:'0.72rem', color:'var(--text-2)' }}>Usable sin expertise</div>
            </div>
            <div className="card-item" style={{ textAlign:'center' }}>
              <div style={{ fontSize:'0.8rem', color:'var(--emerald)', fontWeight:700 }}>$0.058/examen</div>
              <div style={{ fontSize:'0.72rem', color:'var(--text-2)' }}>90% margen bruto</div>
            </div>
            <div className="card-item" style={{ textAlign:'center' }}>
              <div style={{ fontSize:'0.8rem', color:'var(--amber)', fontWeight:700 }}>Listo para Prod.</div>
              <div style={{ fontSize:'0.72rem', color:'var(--text-2)' }}>Backend en GCP activo</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:'1rem' }}>
            <button className="btn btn-primary" onClick={() => dispatch({ type: 'SET_TAB', tab: 'simulator' })}>Ver Simulador en Vivo</button>
            <button className="btn btn-cyan" onClick={() => dispatch({ type: 'SET_TAB', tab: 'costs' })}>Explorar Costos</button>
          </div>
        </div>
      </div>
    </div>
  )
}
