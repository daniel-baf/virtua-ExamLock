import React from 'react'
import { useApp } from '../../store/AppContext.jsx'

export default function Slide06Demo() {
  const { dispatch } = useApp()
  return (
    <div className="slide-card">
      <div className="slide-header">
        <div>
          <h2 className="slide-title">Demostración en Vivo</h2>
          <p className="slide-subtitle">Simulador paso a paso de una sesión de examen completa con 25 alumnos</p>
        </div>
        <span className="badge badge-purple">DEMO EN VIVO</span>
      </div>
      <div className="slide-body">
        <div className="grid-2" style={{width:'100%', alignItems:'center', gap:'2rem'}}>
          <div>
            <p style={{color:'var(--text-1)', fontSize:'1rem', lineHeight:'1.7', marginBottom:'1rem'}}>El simulador recorre <b>9 etapas discretas</b> de una sesión real. Cada paso avanza con velocidad logarítmica (lento → rápido → lento), visualizando el escalado de Cloud Run y los flujos de auth en detalle.</p>
            <div className="highlight-box" style={{marginBottom:'1.2rem'}}>
              <h4 style={{color:'var(--text-1)', fontFamily:'var(--font-title)', fontSize:'0.95rem', marginBottom:'0.5rem'}}>Etapas del simulador:</h4>
              <ul style={{fontSize:'0.82rem', color:'var(--text-2)', listStyle:'none', display:'flex', flexDirection:'column', gap:'0.35rem'}}>
                <li>• Servidor arranca → Cloud Run escala <b>0 → 1</b> instancia</li>
                <li>• <b>25 PCs</b> pop-in uno a uno con flujo auth animado (JWT → Firestore → iptables)</li>
                <li>• Telemetría fluye a GCS — frames JPEG cifrados cada 2s</li>
                <li>• Incidentes: DNS evasion, Wi-Fi cut, USB, keylogger IA</li>
                <li>• Expulsión animada → Cloud Run escala <b>2 → 0</b> al cerrar</li>
              </ul>
            </div>
            <button className="btn btn-primary btn-lg" onClick={() => dispatch({ type: 'SET_TAB', tab: 'simulator' })}>Abrir Simulador en Vivo</button>
          </div>
          <div style={{background:'rgba(17,24,39,0.5)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1.2rem', display:'flex', flexDirection:'column', gap:'0.7rem'}}>
            <div style={{fontFamily:'var(--font-mono)', fontSize:'0.68rem', color:'var(--purple)', textTransform:'uppercase', fontWeight:'bold'}}>[ Etapas del Simulador ]</div>
            <div style={{display:'flex', flexDirection:'column', gap:'0.5rem', fontSize:'0.82rem'}}>
              <div style={{display:'flex', gap:'0.6rem', alignItems:'flex-start'}}><span style={{color:'var(--cyan)', fontFamily:'var(--font-mono)', width:'20px', flexShrink:'0'}}>1</span><span>Servidor arranca — Cloud Run activo</span></div>
              <div style={{display:'flex', gap:'0.6rem', alignItems:'flex-start'}}><span style={{color:'var(--cyan)', fontFamily:'var(--font-mono)', width:'20px', flexShrink:'0'}}>2</span><span><b>25 alumnos se conectan</b> — JWT + iptables</span></div>
              <div style={{display:'flex', gap:'0.6rem', alignItems:'flex-start'}}><span style={{color:'var(--cyan)', fontFamily:'var(--font-mono)', width:'20px', flexShrink:'0'}}>3</span><span>Examen en curso — telemetría a GCS</span></div>
              <div style={{display:'flex', gap:'0.6rem', alignItems:'flex-start'}}><span style={{color:'var(--amber)', fontFamily:'var(--font-mono)', width:'20px', flexShrink:'0'}}>4</span><span>Valentina: intento DNS bypass → autocurado</span></div>
              <div style={{display:'flex', gap:'0.6rem', alignItems:'flex-start'}}><span style={{color:'var(--amber)', fontFamily:'var(--font-mono)', width:'20px', flexShrink:'0'}}>5</span><span>Rodrigo: Wi-Fi cortado → modo contingencia</span></div>
              <div style={{display:'flex', gap:'0.6rem', alignItems:'flex-start'}}><span style={{color:'var(--red)', fontFamily:'var(--font-mono)', width:'20px', flexShrink:'0'}}>7</span><span><b>Pedro: USB → EXPULSIÓN</b> (animación completa)</span></div>
              <div style={{display:'flex', gap:'0.6rem', alignItems:'flex-start'}}><span style={{color:'var(--emerald)', fontFamily:'var(--font-mono)', width:'20px', flexShrink:'0'}}>9</span><span>Fin seguro — iptables -F, loginctl, scale=0</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
