import React from 'react'

export default function Slide14Residual() {
  return (
    <div className="slide-card">
      <div className="slide-header">
        <div>
          <h2 className="slide-title">Análisis de Riesgo Residual</h2>
          <p className="slide-subtitle">Vectores conocidos con controles compensatorios activos</p>
        </div>
        <span className="badge badge-amber">RIESGO RESIDUAL</span>
      </div>
      <div className="slide-body">
        <div className="grid-3" style={{width:'100%'}}>
          <div className="card-item" style={{borderColor:'rgba(245,158,11,0.3)'}}>
            <h3 className="card-title" style={{color:'var(--amber)'}}>Escape de VM (BYOD)</h3>
            <p className="card-desc" style={{fontSize:'0.82rem'}}><b>Vector:</b> Minimizar la VM y abrir el navegador host.</p>
            <p style={{fontSize:'0.8rem', color:'var(--emerald)', marginTop:'0.5rem'}}><b>Mitigación:</b> Monitoreo de desconexiones + capturas de pantalla por heartbeat.</p>
          </div>
          <div className="card-item" style={{borderColor:'rgba(245,158,11,0.3)'}}>
            <h3 className="card-title" style={{color:'var(--amber)'}}>DevTools Abierto</h3>
            <p className="card-desc" style={{fontSize:'0.82rem'}}><b>Vector:</b> El estudiante puede abrir DevTools y explorar la interfaz del examen.</p>
            <p style={{fontSize:'0.8rem', color:'var(--emerald)', marginTop:'0.5rem'}}><b>Mitigación:</b> Red bloqueada a nivel kernel — sin acceso externo aunque ejecute JS en consola.</p>
          </div>
          <div className="card-item" style={{borderColor:'rgba(245,158,11,0.3)'}}>
            <h3 className="card-title" style={{color:'var(--amber)'}}>Dispositivo Externo (Teléfono)</h3>
            <p className="card-desc" style={{fontSize:'0.82rem'}}><b>Vector:</b> Ningún software puede bloquear un teléfono secundario físico.</p>
            <p style={{fontSize:'0.8rem', color:'var(--emerald)', marginTop:'0.5rem'}}><b>Mitigación:</b> Keylogger IA detecta pausas + paste súbito. Supervisión presencial como capa final.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
