import React from 'react'

export default function Slide07DeployModes() {
  return (
    <div className="slide-card">
      <div className="slide-header">
        <div>
          <h2 className="slide-title">Modos de Despliegue Adaptables</h2>
          <p className="slide-subtitle">Tres estrategias para distintas realidades de infraestructura</p>
        </div>
        <span className="badge badge-emerald">INFRAESTRUCTURA</span>
      </div>
      <div className="slide-body">
        <div className="grid-3" style={{width:'100%'}}>
          <div className="card-item" style={{borderColor:'rgba(6,182,212,0.2)'}}>
            <h3 className="card-title" style={{color:'var(--cyan)'}}>ISO Booteable (Debian Live)</h3>
            <p className="card-desc">El método más seguro. Arranca desde USB, ignorando el disco del host. Todo el SO corre en RAM (tmpfs). Creado con <span className="mono">live-build</span>.</p>
            <div style={{marginTop:'0.8rem', fontSize:'0.75rem', color:'var(--text-3)', fontFamily:'var(--font-mono)'}}>✓ BYOD / Laboratorios<br/>✓ Sin tocar el disco del host<br/>✓ Máxima seguridad</div>
          </div>
          <div className="card-item" style={{borderColor:'rgba(139,92,246,0.2)'}}>
            <h3 className="card-title" style={{color:'var(--purple)'}}>BYOD VM (Ubuntu OVA)</h3>
            <p className="card-desc">Máquina virtual lista para importar en VirtualBox o VMware. Ideal cuando no se puede reiniciar el equipo del estudiante.</p>
            <div style={{marginTop:'0.8rem', fontSize:'0.75rem', color:'var(--text-3)', fontFamily:'var(--font-mono)'}}>✓ BYOD desde casa<br/>✓ Sin reinstalar nada<br/>⚠ Vector: escape de VM</div>
          </div>
          <div className="card-item" style={{borderColor:'rgba(16,185,129,0.2)'}}>
            <h3 className="card-title" style={{color:'var(--emerald)'}}>Modo Laboratorio (Docker + Kiosk)</h3>
            <p className="card-desc">Contenedor Docker con <span className="mono">--read-only</span>, aislamiento de red física y compositor gráfico Cage. Despliegue ultra rápido en PCs del laboratorio.</p>
            <div style={{marginTop:'0.8rem', fontSize:'0.75rem', color:'var(--text-3)', fontFamily:'var(--font-mono)'}}>✓ Universidades<br/>✓ Despliegue en minutos<br/>✓ Sin alterar el host</div>
          </div>
        </div>
      </div>
    </div>
  )
}
