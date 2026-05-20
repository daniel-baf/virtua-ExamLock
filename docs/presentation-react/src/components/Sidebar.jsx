import React from 'react'
import { useApp } from '../store/AppContext.jsx'
import { SLIDE_TITLES } from '../store/reducer.js'

export default function Sidebar() {
  const { state, dispatch } = useApp()
  const { slideIdx, sidebarOpen } = state.presentation

  return (
    <aside className={`sidebar${sidebarOpen ? ' open' : ''}`} id="sidebar" aria-hidden={!sidebarOpen}>
      <h3 className="sidebar-title">📑 Índice de Slides</h3>
      <ul className="sidebar-list">
        {SLIDE_TITLES.map((title, i) => (
          <li
            key={i}
            className={`sidebar-item${i === slideIdx ? ' active' : ''}`}
            onClick={() => {
              dispatch({ type: 'SET_SLIDE', idx: i })
              dispatch({ type: 'TOGGLE_SIDEBAR' })
            }}
          >
            {String(i + 1).padStart(2, '0')}. {title}
          </li>
        ))}
      </ul>
    </aside>
  )
}
