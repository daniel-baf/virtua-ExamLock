import React from 'react'

export default function Slide15Lifecycle() {
  return (
    <div className="slide-card">
      <div className="slide-header">
        <div>
          <h2 className="slide-title">Ciclo de Vida del Examen</h2>
          <p className="slide-subtitle">Cuatro fases automatizadas de operación para docentes y estudiantes</p>
        </div>
        <span className="badge badge-cyan">OPERACIÓN</span>
      </div>
      <div className="slide-body">
        <div style={{width:'100%', display:'flex', flexDirection:'column', gap:'1.2rem'}}>
          <div className="grid-4" style={{width:'100%'}}>
            <div className="card-item" style={{borderColor:'rgba(6,182,212,0.2)', textAlign:'center'}}>
              <h3 className="card-title" style={{fontSize:'0.95rem', textAlign:'center', color:'var(--cyan)'}}>Fase 1: Preparación</h3>
              <p className="card-desc" style={{fontSize:'0.78rem', textAlign:'center'}}>Docente crea sesión, configura whitelist, preguntas y duración desde el Dashboard React.</p>
            </div>
            <div className="card-item" style={{borderColor:'rgba(139,92,246,0.2)', textAlign:'center'}}>
              <h3 className="card-title" style={{fontSize:'0.95rem', textAlign:'center', color:'var(--purple)'}}>Fase 2: Admisión</h3>
              <p className="card-desc" style={{fontSize:'0.78rem', textAlign:'center'}}>Alumno arranca ISO/VM, ingresa credenciales y código. JWT firmado → bloqueo local automático.</p>
            </div>
            <div className="card-item" style={{borderColor:'rgba(16,185,129,0.2)', textAlign:'center'}}>
              <h3 className="card-title" style={{fontSize:'0.95rem', textAlign:'center', color:'var(--emerald)'}}>Fase 3: Ejecución</h3>
              <p className="card-desc" style={{fontSize:'0.78rem', textAlign:'center'}}>Estudiante resuelve la prueba. Daemon transmite telemetría silenciosamente. Docente monitorea en vivo.</p>
            </div>
            <div className="card-item" style={{borderColor:'rgba(245,158,11,0.2)', textAlign:'center'}}>
              <h3 className="card-title" style={{fontSize:'0.95rem', textAlign:'center', color:'var(--amber)'}}>Fase 4: Cierre</h3>
              <p className="card-desc" style={{fontSize:'0.78rem', textAlign:'center'}}>Docente finaliza la sesión. Daemon ejecuta <span className="mono">loginctl terminate-user</span> y borra la sesión de RAM.</p>
            </div>
          </div>
          <div className="highlight-box" style={{textAlign:'center'}}>
            <p style={{fontSize:'0.9rem', color:'var(--text-2)'}}>Preparación del docente: <b style={{color:'white'}}>&lt; 2 minutos</b> · Admisión del alumno: <b style={{color:'white'}}>&lt; 30 segundos</b> · Destrucción segura de sesión: <b style={{color:'white'}}>automática</b></p>
          </div>
        </div>
      </div>
    </div>
  )
}
