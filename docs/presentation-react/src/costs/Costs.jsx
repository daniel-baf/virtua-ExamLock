import React, { useRef, useState } from 'react'
import { SCENARIOS, SENSITIVITY_MODES } from '../shared/pricing.js'
import BarChart from './charts/BarChart.jsx'
import StackedBarChart from './charts/StackedBarChart.jsx'
import DonutChart from './charts/DonutChart.jsx'
import SensitivityTable from './charts/SensitivityTable.jsx'
import BudgetSimulator from './BudgetSimulator.jsx'
import { useApp } from '../store/AppContext.jsx'

const NAV_ITEMS = [
  { id: 'costs-s16', label: 'Modelo de costos' },
  { id: 'costs-s17', label: 'Sensibilidad' },
  { id: 'costs-s18', label: 'Simulador de presupuesto' },
  { id: 'costs-s19', label: 'Escenarios comparados' },
]

const DONUT_SLICES = [
  { label: 'Egreso stream', value: 82, color: '#00e5ff' },
  { label: 'Cloud Run',     value: 16, color: '#818cf8' },
  { label: 'FS + GCS',      value:  2, color: '#34d399' },
]

const SCENARIO_ROWS = [
  [45,   2, '$2.60',  '$27.00',  '90%'],
  [100,  2, '$5.77',  '$60.00',  '90%'],
  [300,  2, '$17.29', '$180.00', '90%'],
  [500,  2, '$28.81', '$300.00', '90%'],
  [1000, 2, '$57.62', '$600.00', '90%'],
]

export default function Costs() {
  const [activeNav, setActiveNav] = useState('costs-s16')
  const { dispatch } = useApp()

  const scrollTo = (id) => {
    setActiveNav(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const openSlide18 = (e) => {
    e.preventDefault()
    dispatch({ type: 'SET_TAB', tab: 'presentation' })
    dispatch({ type: 'SET_SLIDE', idx: 17 })
  }

  return (
    <div id="costs-root">
      <nav className="costs-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`costs-nav-btn${activeNav === item.id ? ' active' : ''}`}
            onClick={() => scrollTo(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Slide 16 — Modelo de costos */}
      <section className="costs-slide" id="costs-s16">
        <div className="costs-slide-header">
          <div className="costs-slide-num">16</div>
          <div>
            <div className="costs-slide-title">Análisis de Costos GCP — Modelo</div>
            <div className="costs-slide-subtitle">Stack serverless: egreso del stream es el componente dominante</div>
          </div>
        </div>
        <div className="model-grid">
          <div>
            <table className="cost-breakdown-table">
              <thead><tr><th>Componente</th><th>Costo / alumno·examen 2h</th></tr></thead>
              <tbody>
                <tr><td>Egreso stream 720p/2s</td><td>$0.047</td></tr>
                <tr><td>Cloud Run CPU + RAM</td><td>$0.0095</td></tr>
                <tr><td>Firestore writes/reads</td><td>$0.0006</td></tr>
                <tr><td>GCS screenshots</td><td>~$0.0001</td></tr>
                <tr><td>Firebase Auth</td><td>$0.0000</td></tr>
                <tr className="total-row"><td><strong>Total variable</strong></td><td>~<strong>$0.058</strong></td></tr>
              </tbody>
            </table>
            <div style={{ marginTop: '18px' }} className="exec-highlight">
              <span className="exec-icon">💡</span>
              <div className="exec-text">
                Costo fijo mensual: <strong>~$0 – $7</strong> con <code>minScale=0</code>.
                Sin examenes activos, no hay gasto Cloud Run.
                El costo variable por alumno-hora es <strong>~$0.029</strong>.
              </div>
            </div>
          </div>
          <div className="donut-wrap">
            <div className="chart-wrap" style={{ width: '100%', textAlign: 'center' }}>
              <div className="chart-title">Distribución del costo variable</div>
              <DonutChart slices={DONUT_SLICES} r={64} cx={84} cy={76} w={320} h={170}/>
            </div>
            <div className="donut-caption">1 examen · 1 docente · 2h · 720p/2s</div>
            <div className="chart-wrap" style={{ marginTop: '16px' }}>
              <div className="chart-title">Costo por alumno-semestre</div>
              <div style={{ padding: '8px 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.8 }}>
                5 cursos × 4 exámenes × 2h = <strong style={{ color: '#00e5ff' }}>$1.16</strong>/alumno·semestre<br/>
                500 alumnos × $1.16 = <strong style={{ color: '#34d399' }}>$580</strong>/semestre<br/>
                1 000 alumnos × $1.16 = <strong style={{ color: '#4ade80' }}>$1 160</strong>/semestre
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slide 17 — Sensibilidad */}
      <section className="costs-slide" id="costs-s17">
        <div className="costs-slide-header">
          <div className="costs-slide-num">17</div>
          <div>
            <div className="costs-slide-title">Sensibilidad y Escenarios</div>
            <div className="costs-slide-subtitle">El costo escala casi linealmente con resolución, intervalo y número de alumnos</div>
          </div>
        </div>
        <div className="sensitivity-section">
          <SensitivityTable modes={SENSITIVITY_MODES}/>
          <div className="chart-wrap">
            <div className="chart-title">Costo total nube vs alumnos (2h · 720p/2s · 1 docente)</div>
            <BarChart
              labels={SCENARIOS.map(s => `${s.students}`)}
              values={SCENARIOS.map(s => s.total)}
              color="#00e5ff"
              w={1080} h={230}
              yFmt={v => v < 10 ? `$${v.toFixed(1)}` : `$${v.toFixed(0)}`}
            />
          </div>
          <div className="scenarios-grid">
            <div className="scenario-card">
              <h4>Escenario A — 45 alumnos, 2h</h4>
              <div className="scenario-stat"><span>Egreso stream</span><span className="sval">$2.13</span></div>
              <div className="scenario-stat"><span>Cloud Run</span><span className="sval">$0.43</span></div>
              <div className="scenario-stat"><span>Firestore</span><span className="sval">$0.03</span></div>
              <div className="scenario-stat"><span>GCS</span><span className="sval">$0.01</span></div>
              <div className="scenario-stat"><span><strong>Total</strong></span><span className="sval"><strong>$2.60</strong></span></div>
              <div className="scenario-stat"><span>Revenue @ $0.30/al·h</span><span className="sval green">$27.00</span></div>
              <div className="scenario-stat"><span>Margen bruto</span><span className="sval green">90%</span></div>
            </div>
            <div className="scenario-card">
              <h4>Escenario B — 500 alumnos, 2h</h4>
              <div className="scenario-stat"><span>Egreso stream</span><span className="sval">$23.69</span></div>
              <div className="scenario-stat"><span>Cloud Run</span><span className="sval">$4.76</span></div>
              <div className="scenario-stat"><span>Firestore</span><span className="sval">$0.30</span></div>
              <div className="scenario-stat"><span>GCS</span><span className="sval">$0.05</span></div>
              <div className="scenario-stat"><span><strong>Total</strong></span><span className="sval"><strong>$28.81</strong></span></div>
              <div className="scenario-stat"><span>Revenue @ $0.30/al·h</span><span className="sval green">$300.00</span></div>
              <div className="scenario-stat"><span>Margen bruto</span><span className="sval green">90%</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Slide 18 — Simulador */}
      <section className="costs-slide" id="costs-s18">
        <div className="costs-slide-header">
          <div className="costs-slide-num">18</div>
          <div>
            <div className="costs-slide-title">Simulador de Presupuesto Interactivo</div>
            <div className="costs-slide-subtitle">Cálculo en vivo</div>
          </div>
        </div>
        <div className="exec-highlight" style={{ marginBottom: '20px' }}>
          <span className="exec-icon">🧮</span>
          <div className="exec-text">
            <strong>Fórmula:</strong><br/>
            <code style={{ color: '#34d399' }}>costo = alumnos × horas × $0.029 + alumnos × horas × $0.024 × (docentes − 1)</code><br/><br/>
            El simulador con sliders también está disponible en la{' '}
            <a href="#" onClick={openSlide18} style={{ color: '#00e5ff', textDecoration: 'underline' }}>
              Presentación → Slide 18
            </a>.
          </div>
        </div>
        <BudgetSimulator />
        <table className="data-table" style={{ fontSize: '0.82rem', marginTop: '20px' }}>
          <thead><tr><th>Escenario</th><th>Duración</th><th>Costo nube</th><th>Ingresos @ $0.30/al·h</th><th>Margen</th></tr></thead>
          <tbody>
            {SCENARIO_ROWS.map(([s, h, cost, rev, margin], i) => (
              <tr key={i}>
                <td>{s} alumnos</td><td>{h}h</td>
                <td style={{ color: '#00e5ff' }}><strong>{cost}</strong></td>
                <td style={{ color: '#4ade80' }}><strong>{rev}</strong></td>
                <td style={{ color: '#4ade80' }}><strong>{margin}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Slide 19 — Escenarios comparados */}
      <section className="costs-slide" id="costs-s19">
        <div className="costs-slide-header">
          <div className="costs-slide-num">19</div>
          <div>
            <div className="costs-slide-title">Escenarios Comparados — Hasta 1 000 alumnos</div>
            <div className="costs-slide-subtitle">El costo por alumno permanece constante: $0.058/examen 2h</div>
          </div>
        </div>
        <div className="chart-wrap" style={{ marginBottom: '20px' }}>
          <div className="chart-title">Desglose apilado (Egreso / Cloud Run / FS+GCS)</div>
          <StackedBarChart
            labels={SCENARIOS.map(s => `${s.students}`)}
            seriesEgress={SCENARIOS.map(s => s.egress)}
            seriesCR={SCENARIOS.map(s => s.cr)}
            seriesOther={SCENARIOS.map(s => (s.fs || 0) + (s.gcs || 0))}
            w={1080} h={250}
          />
        </div>
        <table className="data-table" style={{ fontSize: '0.8rem' }}>
          <thead><tr>
            <th>Alumnos</th><th>Egreso</th><th>Cloud Run</th><th>FS+GCS</th>
            <th>Total</th><th>$/alumno</th><th>$/al·hora</th>
          </tr></thead>
          <tbody>
            {SCENARIOS.map((s, i) => (
              <tr key={i}>
                <td>{s.students}</td>
                <td>${s.egress.toFixed(2)}</td>
                <td>${s.cr.toFixed(2)}</td>
                <td>${((s.fs || 0) + (s.gcs || 0)).toFixed(2)}</td>
                <td><strong style={{ color: '#00e5ff' }}>${s.total.toFixed(2)}</strong></td>
                <td>$0.058</td>
                <td>$0.029</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="exec-highlight" style={{ marginTop: '20px' }}>
          <span className="exec-icon">📊</span>
          <div className="exec-text">
            El egreso del stream representa <strong>~82% del costo variable directo</strong>.
            A precio de <strong>$0.30/alumno·hora</strong>, el margen bruto es <strong>90%</strong>
            en todos los escenarios — independiente del tamaño del grupo.
          </div>
        </div>
      </section>
    </div>
  )
}
