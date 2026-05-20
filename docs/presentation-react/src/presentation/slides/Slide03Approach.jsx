import React from 'react'

export default function Slide03Approach() {
  return (
    <div className="slide-card">
      <div className="slide-header">
        <div>
          <h2 className="slide-title">Enfoque de la Solución</h2>
          <p className="slide-subtitle">Objetivos de la plataforma para blindar las evaluaciones prácticas</p>
        </div>
        <span className="badge badge-cyan">OBJETIVOS</span>
      </div>
      <div className="slide-body">
        <div className="grid-2-1" style={{width:'100%', gridTemplateColumns:'1.2fr 0.8fr'}}>
          <div className="steps-container">
            <div className="step-row">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4 className="step-heading">Aislamiento Total del Entorno</h4>
                <p className="step-text">Controlar la pila de red, el SO y restringir al estudiante únicamente a la interfaz de su examen. Sin excepciones.</p>
              </div>
            </div>
            <div className="step-row">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4 className="step-heading">Hardening Multi-Capa</h4>
                <p className="step-text">Políticas de seguridad en SO, Red, Usuario y Aplicaciones para mitigar bypasses, exploits y evasiones USB.</p>
              </div>
            </div>
            <div className="step-row">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4 className="step-heading">Despliegue de Baja Fricción</h4>
                <p className="step-text">Distribución sencilla para técnicos mediante llaves USB, máquinas virtuales OVA o contenedores Docker.</p>
              </div>
            </div>
            <div className="step-row">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4 className="step-heading">Proctoring y Telemetría Activa</h4>
                <p className="step-text">Monitoreo continuo en tiempo real: capturas de pantalla, stream de video, keylogger y heartbeat de red.</p>
              </div>
            </div>
          </div>
          <div className="highlight-box" style={{alignSelf:'stretch', display:'flex', flexDirection:'column', justifyContent:'center'}}>
            <h4 className="highlight-title">Objetivo General</h4>
            <p style={{fontSize:'clamp(1.15rem, 2vw, 2.15rem)', color:'var(--text-1)', lineHeight:'1.18', fontWeight:800, textWrap:'balance'}}>
              Diseñar una infraestructura <i>segura</i>, virtualizada y endurecida para evaluar competencias en un entorno <b>100% controlado</b>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
