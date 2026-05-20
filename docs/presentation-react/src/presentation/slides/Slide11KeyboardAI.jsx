import React from 'react'

export default function Slide11KeyboardAI() {
  return (
    <div className="slide-card">
      <div className="slide-header">
        <div>
          <h2 className="slide-title">Auditoría de Teclado con IA</h2>
          <p className="slide-subtitle">Detección de patrones adversariales mediante análisis heurístico de pulsaciones</p>
        </div>
        <span className="badge badge-purple">INNOVACIÓN</span>
      </div>
      <div className="slide-body">
        <div className="grid-2-1" style={{width:'100%'}}>
          <div className="steps-container">
            <div className="step-row">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4 className="step-heading">Captura a Nivel de Sistema</h4>
                <p className="step-text">Pulsaciones capturadas directamente desde el hardware gráfico usando <span className="mono">xinput</span>. No se pueden evadir desde el navegador.</p>
              </div>
            </div>
            <div className="step-row">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4 className="step-heading">Auditoría Local Cifrada</h4>
                <p className="step-text">Registro en base de datos <span className="mono">SQLite</span> local cifrada del agente. Los datos sensibles permanecen protegidos en el dispositivo.</p>
              </div>
            </div>
            <div className="step-row">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4 className="step-heading">Detección de Patrones IA</h4>
                <p className="step-text">Análisis de chunks de texto para detectar comandos prohibidos, atajos inusuales y <b>copy-paste masivo</b> que indica código copiado de otro dispositivo.</p>
              </div>
            </div>
            <div className="step-row">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4 className="step-heading">Alertas Automáticas</h4>
                <p className="step-text">Si el ritmo de escritura es "sobrehumano" (&gt;500 caracteres en &lt;2s) o el patrón sugiere IA, se genera alerta roja en el dashboard del docente.</p>
              </div>
            </div>
          </div>
          <div className="highlight-box">
            <h4 className="highlight-title">Señales Detectadas</h4>
            <div style={{display:'flex', flexDirection:'column', gap:'0.5rem', marginTop:'0.5rem', fontSize:'0.82rem'}}>
              <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}><span className="badge badge-red">CRÍTICO</span><span style={{color:'var(--text-2)'}}>Paste masivo &gt;500 chars/2s</span></div>
              <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}><span className="badge badge-red">CRÍTICO</span><span style={{color:'var(--text-2)'}}>Comandos shell en campo de texto</span></div>
              <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}><span className="badge badge-amber">ALERTA</span><span style={{color:'var(--text-2)'}}>Pausa larga + escritura súbita</span></div>
              <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}><span className="badge badge-amber">ALERTA</span><span style={{color:'var(--text-2)'}}>Atajos F12, Ctrl+Shift+I</span></div>
              <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}><span className="badge badge-cyan">INFO</span><span style={{color:'var(--text-2)'}}>Velocidad de escritura anómala</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
