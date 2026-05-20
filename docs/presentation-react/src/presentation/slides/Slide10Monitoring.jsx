import React from 'react'

export default function Slide10Monitoring() {
  return (
    <div className="slide-card">
      <div className="slide-header">
        <div>
          <h2 className="slide-title">Monitoreo Activo y Proctoring</h2>
          <p className="slide-subtitle">Supervisión continua y en tiempo real durante toda la sesión de examen</p>
        </div>
        <span className="badge badge-cyan">PROCTORING</span>
      </div>
      <div className="slide-body">
        <div className="grid-2" style={{width:'100%', gap:'1.5rem', alignItems:'start'}}>
          <div className="grid-2" style={{gap:'1rem'}}>
            <div className="card-item">
              <h3 className="card-title" style={{fontSize:'1rem'}}>Heartbeat</h3>
              <p className="card-desc" style={{fontSize:'0.82rem'}}>Latido constante cada 15s. Si el agente pierde conexión &gt;30s, el docente recibe alerta inmediata en el dashboard.</p>
            </div>
            <div className="card-item">
              <h3 className="card-title" style={{fontSize:'1rem'}}>Screenshots</h3>
              <p className="card-desc" style={{fontSize:'0.82rem'}}>Capturas periódicas y bajo demanda transmitidas instantáneamente mediante WebSocket binario al grid del docente.</p>
            </div>
            <div className="card-item">
              <h3 className="card-title" style={{fontSize:'1rem'}}>Stream de Pantalla</h3>
              <p className="card-desc" style={{fontSize:'0.82rem'}}>Transmisión eficiente de frames JPEG 720p@0.5fps como Buffer binario nativo — 25% menos egress que base64.</p>
            </div>
            <div className="card-item" style={{opacity:'0.45', borderStyle:'dashed'}}>
              <h3 className="card-title" style={{fontSize:'1rem'}}>Webcam <span style={{fontSize:'0.7rem', color:'var(--red)', fontWeight:'400'}}>(no implementado)</span></h3>
              <p className="card-desc" style={{fontSize:'0.82rem'}}>Capturas aleatorias del rostro del estudiante — pendiente de implementación.</p>
            </div>
          </div>
          <div className="highlight-box">
            <h4 className="highlight-title">Métricas por Alumno (2h)</h4>
            <table className="data-table" style={{marginTop:'0.5rem'}}>
              <thead>
                <tr><th>Evento</th><th className="num">Cant.</th></tr>
              </thead>
              <tbody>
                <tr><td>Heartbeats (15s)</td><td className="num">480</td></tr>
                <tr><td>Frames stream (2s)</td><td className="num">3,600</td></tr>
                <tr><td>Screenshots on-demand</td><td className="num">~5</td></tr>
                <tr><td>Eventos Firestore</td><td className="num">~500</td></tr>
                <tr><td>Egreso GCP total</td><td className="num">~0.4 GiB</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
