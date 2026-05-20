import React, { useMemo } from 'react'
import { useApp } from '../store/AppContext.jsx'
import { calcExamCost, calcMargin } from './costModel.js'

export default function BudgetSimulator() {
  const { state, dispatch } = useApp()
  const { students, hours, intervalS, teachers } = state.costs.budget
  const price = 0.30

  // Keep resolution fixed for this slider-driven simulation.
  // Otherwise interval changes can accidentally switch frame size and invert costs.
  const kbFrame = 115

  const result = useMemo(
    () => calcExamCost({ students, kbFrame, intervalS, hours, teachers }),
    [students, kbFrame, intervalS, hours, teachers]
  )
  const marg = useMemo(
    () => calcMargin({ totalCost: result.total, students, hours, pricePerStudentHour: price }),
    [result.total, students, hours]
  )

  const marginColor = marg.marginPct >= 80 ? '#34d399' : marg.marginPct >= 50 ? '#fbbf24' : '#f87171'
  const egressPct = result.total > 0 ? (result.egress / result.total * 100).toFixed(0) : 0

  const set = (key) => (e) => dispatch({ type: 'SET_BUDGET', budget: { [key]: Number(e.target.value) } })

  const val = (v, unit = '') => (
    <b style={{ display: 'inline-block', minWidth: '3.8em', textAlign: 'right',
      fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-mono)', fontSize: '1.2rem', color: 'var(--cyan)' }}>
      {v}{unit}
    </b>
  )

  return (
    <div className="grid-2" style={{ width: '100%', height: '100%', gap: '3rem', alignItems: 'center' }}>
      
      {/* Controles (Sliding) */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Parámetros del Examen</div>
        
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem', color: 'var(--text-2)' }}>
            <span>Cantidad de Alumnos</span>
            {val(students)}
          </div>
          <input type="range" min="5" max="1000" step="5" value={students} onChange={set('students')} style={{ width: '100%', cursor: 'pointer' }} />
        </label>
        
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem', color: 'var(--text-2)' }}>
            <span>Duración</span>
            {val(hours.toFixed(1), 'h')}
          </div>
          <input type="range" min="0.5" max="6" step="0.5" value={hours} onChange={set('hours')} style={{ width: '100%', cursor: 'pointer' }} />
        </label>
        
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem', color: 'var(--text-2)' }}>
            <span>Intervalo de Captura <span style={{ fontSize: '0.9rem', color: 'var(--text-3)', marginLeft: '0.5rem' }}>({(1 / intervalS).toFixed(2)} fps)</span></span>
            {val(intervalS, 's')}
          </div>
          <input type="range" min="1" max="10" step="1" value={intervalS} onChange={set('intervalS')} style={{ width: '100%', cursor: 'pointer' }} />
        </label>
        
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem', color: 'var(--text-2)' }}>
            <span>Docentes (Dashboards)</span>
            {val(teachers)}
          </div>
          <input type="range" min="1" max="50" step="1" value={teachers} onChange={set('teachers')} style={{ width: '100%', cursor: 'pointer' }} />
        </label>
      </div>

      {/* Resultados (Tabla) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 'var(--radius-lg)', padding: '2.5rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>Proyección de Costos</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          {[
            ['Cloud Run (CPU/RAM)', `$${result.cr.toFixed(2)}`, 'var(--text-2)', '1.1rem'],
            ['Firestore (Ops)', `$${result.fs.toFixed(2)}`, 'var(--text-2)', '1.1rem'],
            ['Egreso de Red (Stream)', `$${result.egress.toFixed(2)}`, 'var(--text-2)', '1.1rem'],
            ['---', '', '', ''],
            ['Costo Total del Examen', `$${result.total.toFixed(2)}`, 'var(--cyan)', '1.8rem'],
            ['Costo Promedio por Alumno', `$${result.perStudent.toFixed(4)}`, 'var(--emerald)', '1.3rem'],
            ['Costo por Alumno/Hora', `$${result.perStudentHour.toFixed(4)}`, 'var(--emerald)', '1.3rem'],
            ['---', '', '', ''],
            [`Ingreso Estimado (@$${price}/h)`, `$${marg.revenue.toFixed(2)}`, 'var(--text-1)', '1.2rem'],
            ['Margen de Beneficio Bruto', `${marg.marginPct.toFixed(1)}%`, marginColor, '1.4rem'],
          ].map(([label, value, color, size], idx) => {
            if (label === '---') {
              return <div key={`sep-${idx}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>
            }
            return (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem' }}>
                <span style={{ fontSize: '1.1rem', color: 'var(--text-3)' }}>{label}</span>
                <span style={{ borderBottom: '1px dashed rgba(255,255,255,0.15)', flex: 1, margin: '0 1rem' }}></span>
                <span style={{ 
                  color: color, 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: size, 
                  fontWeight: '700',
                  fontVariantNumeric: 'tabular-nums',
                  textShadow: size.includes('1.8') ? '0 0 20px rgba(56,189,248,0.4)' : 'none'
                }}>
                  {value}
                </span>
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: '1.5rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-3)', marginBottom: '0.6rem' }}>
            <span>Impacto de Red en el Costo Total</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>{egressPct}%</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${egressPct}%`, background: 'var(--cyan)', transition: 'width 0.3s' }}/>
          </div>
        </div>
      </div>

    </div>
  )
}
