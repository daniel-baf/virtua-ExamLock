import React from 'react'

export default function Slide02Problem() {
  return (
    <div className="slide-card">
      <div className="slide-header">
        <div>
          <h2 className="slide-title">Planteamiento del Problema</h2>
          <p className="slide-subtitle">La vulnerabilidad académica y técnica en laboratorios de Guatemala</p>
        </div>
        <span className="badge badge-red">CONTEXTO</span>
      </div>
      <div className="slide-body">
        <div className="grid-3" style={{width:'100%'}}>
          <div className="card-item">
            <h3 className="card-title">Pérdida de Integridad</h3>
            <p className="card-desc">Complejidad crítica para validar el aprendizaje real en pruebas prácticas. Los resultados no reflejan la competencia del estudiante.</p>
          </div>
          <div className="card-item">
            <h3 className="card-title">Internet Irrestricto</h3>
            <p className="card-desc">Acceso sin filtrar a motores de búsqueda, IA generativa (ChatGPT/Copilot), mensajería instantánea y dispositivos USB externos.</p>
          </div>
          <div className="card-item">
            <h3 className="card-title">Host No Controlado</h3>
            <p className="card-desc">Desde la óptica de seguridad, el host no controlado expone múltiples vectores de evasión física y lógica sin detección posible.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
