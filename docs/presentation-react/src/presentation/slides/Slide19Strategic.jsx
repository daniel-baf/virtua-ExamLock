import React from 'react'

export default function Slide19Strategic() {
  return (
    <div className="slide-card">
      <div className="slide-header">
        <div>
          <h2 className="slide-title">Valor Estratégico para la Universidad</h2>
          <p className="slide-subtitle">Cuatro pilares de beneficio institucional con respaldo económico real</p>
        </div>
        <span className="badge badge-purple">VALOR</span>
      </div>
      <div className="slide-body">
        <div className="grid-2" style={{width:'100%', gap:'1.2rem', alignItems:'stretch'}}>
          <div className="card-item" style={{borderColor:'rgba(6,182,212,0.2)'}}>
            <h3 className="card-title" style={{color:'var(--cyan)', fontSize:'1.45rem'}}>Protección del <i>Prestigio</i></h3>
            <p className="card-desc">Garantiza que los graduados posean las habilidades reales evaluadas. Elimina colusión e IA generativa ilegal durante pruebas críticas.</p>
          </div>
          <div className="card-item" style={{borderColor:'rgba(16,185,129,0.2)'}}>
            <h3 className="card-title" style={{color:'var(--emerald)', fontSize:'1.45rem'}}>Costo-Eficiente</h3>
            <p className="card-desc">Cloud Run con <span className="mono">minScale=0</span>: costo fijo <b>~$0/mes</b> fuera de examenes. Variable: <b>$0.058/alumno·examen</b>.<br/><span style={{ color:'var(--text-3)', fontSize:'0.95em' }}>Nota: estimacion referencial; no incluye mantenimiento operativo, soporte ni costos administrativos.</span></p>
          </div>
          <div className="card-item" style={{borderColor:'rgba(139,92,246,0.2)'}}>
            <h3 className="card-title" style={{color:'var(--purple)', fontSize:'1.45rem'}}>Sin Fricción</h3>
            <p className="card-desc">Docker + USB booteables. No requiere formatear ni alterar los laboratorios existentes. Técnico sin experiencia puede desplegar en &lt;10 minutos.</p>
          </div>
          <div className="card-item" style={{borderColor:'rgba(245,158,11,0.2)'}}>
            <h3 className="card-title" style={{color:'var(--amber)', fontSize:'1.45rem'}}>Auditoría <b>Irrefutable</b></h3>
            <p className="card-desc">Registro detallado de logs, capturas de infracciones, actividad de teclado con IA y telemetría GCS inmutable por 90 días para justificar acciones disciplinarias.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
