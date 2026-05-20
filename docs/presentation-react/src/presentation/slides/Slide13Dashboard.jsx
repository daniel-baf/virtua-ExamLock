import React from 'react'

export default function Slide13Dashboard() {
  return (
    <div className="slide-card">
      <div className="slide-header">
        <div>
          <h2 className="slide-title">Dashboard Docente</h2>
          <p className="slide-subtitle">React SPA en Firebase Hosting — cuatro módulos de gestión y control</p>
        </div>
        <span className="badge badge-cyan">DASHBOARD</span>
      </div>
      <div className="slide-body">
        <div className="grid-2" style={{width:'100%', gap:'1.5rem', alignItems:'start'}}>
          <div className="steps-container">
            <div className="step-row">
              <div className="step-number" style={{background:'linear-gradient(135deg,#06b6d4,#8b5cf6)'}}>1</div>
              <div className="step-content">
                <h4 className="step-heading">Sesiones — Crear y Configurar</h4>
                <p className="step-text">El docente crea una sesión con código único (<span className="mono">secureCode</span>), configura la whitelist de dominios permitidos (con presets reutilizables), duración y número máximo de alumnos.</p>
              </div>
            </div>
            <div className="step-row">
              <div className="step-number" style={{background:'linear-gradient(135deg,#8b5cf6,#ec4899)'}}>2</div>
              <div className="step-content">
                <h4 className="step-heading">Monitor en Vivo — Grid de Alumnos</h4>
                <p className="step-text">Vista en tiempo real de todos los alumnos conectados: último frame de pantalla, estado de heartbeat, alertas de IA. Clic en alumno abre stream de video en vivo. Botón de expulsión inmediata.</p>
              </div>
            </div>
            <div className="step-row">
              <div className="step-number" style={{background:'linear-gradient(135deg,#10b981,#06b6d4)'}}>3</div>
              <div className="step-content">
                <h4 className="step-heading">Auditoría — Registro Inmutable</h4>
                <p className="step-text">Historial completo de eventos por alumno: timestamps de conexión/desconexión, alertas de keylogger, capturas de infracción descargables. Almacenado 90 días en GCS.</p>
              </div>
            </div>
            <div className="step-row">
              <div className="step-number" style={{background:'linear-gradient(135deg,#f59e0b,#ef4444)'}}>4</div>
              <div className="step-content">
                <h4 className="step-heading">Admin — Usuarios y Configuración</h4>
                <p className="step-text">Gestión de roles (docente/admin), presets de dominios de whitelist reutilizables, parámetros de monitoreo configurables (intervalo, resolución, umbral de alertas).</p>
              </div>
            </div>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
            <div className="highlight-box">
              <h4 className="highlight-title">Flujo del Docente</h4>
              <div style={{display:'flex', flexDirection:'column', gap:'0.5rem', marginTop:'0.5rem', fontSize:'0.82rem'}}>
                <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}><span className="badge badge-cyan">1</span><span style={{color:'var(--text-2)'}}>Crear sesión → copiar <span className="mono">secureCode</span></span></div>
                <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}><span className="badge badge-purple">2</span><span style={{color:'var(--text-2)'}}>Distribuir código a alumnos (email/chat)</span></div>
                <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}><span className="badge badge-emerald">3</span><span style={{color:'var(--text-2)'}}>Ver grid: <b>alumnos admitidos en vivo</b></span></div>
                <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}><span className="badge badge-amber">4</span><span style={{color:'var(--text-2)'}}>Responder alertas o expulsar</span></div>
                <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}><span className="badge badge-red">5</span><span style={{color:'var(--text-2)'}}>Finalizar → auditoría disponible inmediatamente</span></div>
              </div>
            </div>
            <div className="highlight-box">
              <h4 className="highlight-title">Acciones en Tiempo Real</h4>
              <div style={{display:'flex', flexDirection:'column', gap:'0.3rem', marginTop:'0.4rem', fontSize:'0.82rem', color:'var(--text-2)'}}>
                <div>• Stream en vivo por alumno (WebSocket binario)</div>
                <div>• Enviar mensaje al agente del alumno</div>
                <div>• Expulsión con un clic (<span className="mono">loginctl terminate-user</span>)</div>
                <div>• Modificar whitelist en caliente</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
