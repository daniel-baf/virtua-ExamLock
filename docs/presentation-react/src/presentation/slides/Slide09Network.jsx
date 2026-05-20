import React from 'react'

export default function Slide09Network() {
  return (
    <div className="slide-card">
      <div className="slide-header">
        <div>
          <h2 className="slide-title">Control de Red y Whitelisting</h2>
          <p className="slide-subtitle">Filtrado a nivel kernel — imposible evadir desde userspace</p>
        </div>
        <span className="badge badge-red">SEGURIDAD</span>
      </div>
      <div className="slide-body">
        <div className="grid-2-1" style={{width:'100%'}}>
          <div className="steps-container">
            <div className="step-row">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4 className="step-heading">Cero Confianza en el Navegador</h4>
                <p className="step-text">El filtrado ocurre a nivel kernel mediante <span className="mono">iptables</span>/<span className="mono">nftables</span>. No extensiones web — inútiles para el estudiante.</p>
              </div>
            </div>
            <div className="step-row">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4 className="step-heading">Whitelisting Dinámico</h4>
                <p className="step-text">Solo se permite tráfico hacia el servidor de ExamLock, Firebase Auth y los dominios cargados en caliente por el docente desde su dashboard.</p>
              </div>
            </div>
            <div className="step-row">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4 className="step-heading">Bloqueo de Bypass</h4>
                <p className="step-text">Denegación explícita de DNS externos (1.1.1.1, 8.8.8.8), puertos alternativos, túneles VPN y proxies locales.</p>
              </div>
            </div>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
            <div className="code-block">
              iptables -P OUTPUT DROP<br/>
              iptables -A OUTPUT -d examlock.server -j ACCEPT<br/>
              iptables -A OUTPUT -d firebase.googleapis.com -j ACCEPT<br/>
              # Whitelist dinámica del docente...
            </div>
            <div className="highlight-box">
              <h4 className="highlight-title">¿Por qué kernel-level?</h4>
              <p style={{fontSize:'0.82rem', color:'var(--text-2)', lineHeight:'1.5'}}>Cualquier filtrado en userspace (extensiones, proxies locales) puede ser desactivado por el usuario. Las reglas de iptables solo pueden modificarse con privilegios root — el alumno no los tiene.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
