import React from 'react'
import { useApp } from '../../store/AppContext.jsx'

export default function Slide06Demo() {
  const { dispatch } = useApp()
  return (
    <div className="slide-card">
      <div className="slide-header" style={{ marginBottom: '1rem' }}>
        <div>
          <h2 className="slide-title" style={{ fontSize: 'clamp(2.5rem, 4vw, 5rem)' }}>Demostración en Vivo</h2>
          <p className="slide-subtitle">Simulador paso a paso de una sesión de examen completa con 25 alumnos</p>
        </div>
        <span className="badge badge-purple">DEMO EN VIVO</span>
      </div>
      <div className="slide-body">
        <div className="grid-2" style={{width:'100%', alignItems:'center', gap:'4rem'}}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <p style={{color:'var(--text-1)', fontSize:'clamp(1.15rem, 1.4vw, 1.35rem)', lineHeight:'1.7', marginBottom:'0'}}>El simulador recorre <b>9 etapas discretas</b> de una sesión real. Cada paso avanza con velocidad logarítmica (lento → rápido → lento), visualizando el escalado de Cloud Run y los flujos de auth en detalle.</p>
            <div className="highlight-box" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{color:'var(--text-1)', fontFamily:'var(--font-title)', fontSize:'1.1rem', marginBottom:'1rem'}}>Etapas del simulador:</h4>
              <ul style={{fontSize:'1.05rem', color:'var(--text-2)', listStyle:'none', display:'flex', flexDirection:'column', gap:'0.8rem'}}>
                <li>• Servidor arranca → Cloud Run escala <b>0 → 1</b> instancia</li>
                <li>• <b>25 PCs</b> pop-in uno a uno con flujo auth animado</li>
                <li>• Telemetría fluye a GCS — frames JPEG cifrados</li>
                <li>• Incidentes: DNS evasion, Wi-Fi cut, USB, keylogger</li>
                <li>• Expulsión animada → Cloud Run escala <b>2 → 0</b> al cerrar</li>
              </ul>
            </div>
            <button className="btn btn-primary btn-lg" style={{ alignSelf: 'flex-start', fontSize: '1.1rem', padding: '0.8rem 1.8rem' }} onClick={() => dispatch({ type: 'SET_TAB', tab: 'simulator' })}>Abrir Simulador en Vivo</button>
          </div>
          <div style={{background:'rgba(17,24,39,0.7)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'var(--radius-lg)', padding:'2rem', display:'flex', flexDirection:'column', gap:'1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'}}>
            <div style={{fontFamily:'var(--font-mono)', fontSize:'1rem', color:'var(--purple)', textTransform:'uppercase', fontWeight:'bold', letterSpacing:'1px'}}>[ Secuencia del Simulador ]</div>
            <div style={{display:'flex', flexDirection:'column', gap:'1.1rem', fontSize:'1.05rem', color:'var(--text-2)'}}>
              <div style={{display:'flex', gap:'1rem', alignItems:'flex-start'}}><span style={{color:'var(--cyan)', fontFamily:'var(--font-mono)', fontWeight:'bold', width:'25px', flexShrink:'0'}}>1</span><span>Servidor arranca — Cloud Run activo</span></div>
              <div style={{display:'flex', gap:'1rem', alignItems:'flex-start'}}><span style={{color:'var(--cyan)', fontFamily:'var(--font-mono)', fontWeight:'bold', width:'25px', flexShrink:'0'}}>2</span><span><b>25 alumnos se conectan</b> — JWT + iptables</span></div>
              <div style={{display:'flex', gap:'1rem', alignItems:'flex-start'}}><span style={{color:'var(--cyan)', fontFamily:'var(--font-mono)', fontWeight:'bold', width:'25px', flexShrink:'0'}}>3</span><span>Examen en curso — telemetría a GCS</span></div>
              <div style={{display:'flex', gap:'1rem', alignItems:'flex-start'}}><span style={{color:'var(--amber)', fontFamily:'var(--font-mono)', fontWeight:'bold', width:'25px', flexShrink:'0'}}>4</span><span>Valentina: intento DNS bypass → autocurado</span></div>
              <div style={{display:'flex', gap:'1rem', alignItems:'flex-start'}}><span style={{color:'var(--amber)', fontFamily:'var(--font-mono)', fontWeight:'bold', width:'25px', flexShrink:'0'}}>5</span><span>Rodrigo: Wi-Fi cortado → modo contingencia</span></div>
              <div style={{display:'flex', gap:'1rem', alignItems:'flex-start'}}><span style={{color:'var(--red)', fontFamily:'var(--font-mono)', fontWeight:'bold', width:'25px', flexShrink:'0'}}>7</span><span><b>Pedro: USB → NO PERMITIDO</b> (animación)</span></div>
              <div style={{display:'flex', gap:'1rem', alignItems:'flex-start'}}><span style={{color:'var(--emerald)', fontFamily:'var(--font-mono)', fontWeight:'bold', width:'25px', flexShrink:'0'}}>9</span><span>Fin seguro — iptables -F, loginctl, scale=0</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
