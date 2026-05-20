import React from 'react'

export default function Slide08Hardening() {
  return (
    <div className="slide-card">
      <div className="slide-header">
        <div>
          <h2 className="slide-title">Hardening del Sistema Operativo</h2>
          <p className="slide-subtitle">Entorno de ejecución endurecido que elimina superficies de ataque desde la raíz</p>
        </div>
        <span className="badge badge-red">SEGURIDAD</span>
      </div>
      <div className="slide-body">
        <div className="grid-2" style={{width:'100%', gap:'1.5rem', alignItems:'start'}}>
          <div className="steps-container">
            <div className="step-row">
              <div className="step-number" style={{background:'linear-gradient(135deg,#ef4444,#f59e0b)'}}>A</div>
              <div className="step-content">
                <h4 className="step-heading">Cage (Wayland Compositor)</h4>
                <p className="step-text">Elimina barra de tareas, atajos de sistema (Ctrl+Alt+T, Alt+F2) y menú contextual. Solo una ventana a pantalla completa es posible.</p>
              </div>
            </div>
            <div className="step-row">
              <div className="step-number" style={{background:'linear-gradient(135deg,#3b82f6,#06b6d4)'}}>B</div>
              <div className="step-content">
                <h4 className="step-heading">Daemon en Segundo Plano</h4>
                <p className="step-text">El daemon corre silenciosamente en background, aplicando las reglas de red y enviando telemetría. El alumno solo ve la interfaz del examen.</p>
              </div>
            </div>
            <div className="step-row">
              <div className="step-number" style={{background:'linear-gradient(135deg,#8b5cf6,#ec4899)'}}>C</div>
              <div className="step-content">
                <h4 className="step-heading">Usuario Sin Privilegios</h4>
                <p className="step-text">Interacción bajo usuario <span className="mono">user</span> sin capacidad de <span className="mono">sudo</span>, sin acceso a <span className="mono">/sbin</span> ni herramientas de red.</p>
              </div>
            </div>
            <div className="step-row">
              <div className="step-number" style={{background:'linear-gradient(135deg,#10b981,#06b6d4)'}}>D</div>
              <div className="step-content">
                <h4 className="step-heading">Filesystem Read-Only + noexec</h4>
                <p className="step-text">Todo el FS es inmutable. Solo <span className="mono">/tmp</span> en RAM con flag <span className="mono">noexec</span>: no se puede ejecutar ningún binario descargado.</p>
              </div>
            </div>
          </div>
          <div className="highlight-box">
            <h4 className="highlight-title">Capas de Defensa</h4>
            <div style={{display:'flex', flexDirection:'column', gap:'0.5rem', marginTop:'0.5rem'}}>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.82rem'}}><span style={{color:'var(--text-2)'}}>Compositor gráfico</span><span className="badge badge-emerald">Cage (Wayland)</span></div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.82rem'}}><span style={{color:'var(--text-2)'}}>Daemon</span><span className="badge badge-cyan">background service</span></div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.82rem'}}><span style={{color:'var(--text-2)'}}>Usuarios</span><span className="badge badge-purple">cap-drop + nologin</span></div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.82rem'}}><span style={{color:'var(--text-2)'}}>Filesystem</span><span className="badge badge-red">read-only + noexec</span></div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.82rem'}}><span style={{color:'var(--text-2)'}}>Red kernel</span><span className="badge badge-amber">iptables OUTPUT DROP</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
