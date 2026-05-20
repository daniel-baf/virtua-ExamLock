import React, { useMemo } from 'react'
import { useApp } from '../store/AppContext.jsx'
import { calcExamCost, calcMargin, modeToParams } from './costModel.js'

const MODES = ['480p/5s', '480p/2s', '720p/2s', '720p/1s', '1080p/2s']

export default function BudgetSimulator() {
  const { state, dispatch } = useApp()
  const { students, hours, intervalS, teachers } = state.costs.budget
  const price = 0.30

  const modeIdx = MODES.findIndex(m => {
    const { intervalS: is } = modeToParams(m)
    return is === intervalS
  }) || 2
  const mode = MODES[Math.max(0, modeIdx)]
  const { kbFrame } = modeToParams(mode)

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
      fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
      {v}{unit}
    </b>
  )

  return (
    <div className="budget-simulator">
      <div className="bs-controls">
        <label>
          <span>Alumnos: {val(students)}</span>
          <input type="range" min="5" max="500" step="5" value={students} onChange={set('students')} id="bs-students"/>
        </label>
        <label>
          <span>Duración: {val(hours.toFixed(1), 'h')}</span>
          <input type="range" min="0.5" max="6" step="0.5" value={hours} onChange={set('hours')} id="bs-hours"/>
        </label>
        <label>
          <span>Intervalo: {val(intervalS, 's')}</span>
          <input type="range" min="1" max="10" step="1" value={intervalS} onChange={set('intervalS')} id="bs-interval"/>
        </label>
        <label>
          <span>Docentes: {val(teachers)}</span>
          <input type="range" min="1" max="10" step="1" value={teachers} onChange={set('teachers')} id="bs-teachers"/>
        </label>
      </div>

      <div className="bs-results">
        {[
          ['Total examen',       `$${result.total.toFixed(2)}`,          'var(--cyan)'],
          ['Egreso stream',      `$${result.egress.toFixed(2)}`,         null],
          ['Cloud Run',          `$${result.cr.toFixed(2)}`,             null],
          ['Firestore',          `$${result.fs.toFixed(2)}`,             null],
          ['Por alumno',         `$${result.perStudent.toFixed(4)}`,     null],
          ['Por alumno·hora',    `$${result.perStudentHour.toFixed(4)}`, null],
          [`Revenue @$${price}/al·h`, `$${marg.revenue.toFixed(2)}`,    '#4ade80'],
          ['Margen bruto',       `${marg.marginPct.toFixed(1)}%`,        marginColor],
        ].map(([label, value, color]) => (
          <div key={label} className="bs-result-row">
            <span>{label}</span>
            <span style={{ color: color || 'var(--text-1)', fontVariantNumeric: 'tabular-nums',
              fontFamily: 'var(--font-mono)', fontSize: '0.78rem', minWidth: '5.5em', textAlign: 'right' }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '0.75rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '0.3rem' }}>
          Dominancia del egreso: {egressPct}%
        </div>
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
          <div id="bs-egress-bar" style={{ height: '100%', width: `${egressPct}%`, background: '#00e5ff', transition: 'width 0.3s' }}/>
        </div>
      </div>
    </div>
  )
}
