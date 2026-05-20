import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../store/AppContext.jsx'
import { useKeyboardNav } from '../hooks/useKeyboardNav.js'
import Sidebar from '../components/Sidebar.jsx'
import FooterNav from '../components/FooterNav.jsx'
import { slides } from './slides/index.js'

export default function Presentation() {
  useKeyboardNav()
  const { state, dispatch } = useApp()
  const { slideIdx, sidebarOpen } = state.presentation

  const current = slides[slideIdx]
  const SlideComponent = current?.component

  // Trigger side-effects on slide change
  useEffect(() => {
    if (slideIdx === 4) {
      dispatch({ type: 'SET_FLOW_STEP', step: 0 })
    }
    if (slideIdx === 16) {
      dispatch({ type: 'SET_SENSITIVITY_MODE', mode: 2 })
    }
  }, [slideIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="presentation-viewport" id="presentation-container">
      <div className="slides-area">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={slideIdx}
            className="slide"
            initial={{ opacity: 0, scale: 0.985, y: 24, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.99, y: -18, filter: 'blur(5px)' }}
            transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
          >
            {SlideComponent && <SlideComponent />}
          </motion.div>
        </AnimatePresence>

        <Sidebar />

        {sidebarOpen && (
          <div
            style={{ position: 'absolute', inset: 0, zIndex: 5 }}
            onClick={(e) => {
              if (!e.target.closest('.sidebar') && !e.target.closest('.sidebar-toggle-btn')) {
                dispatch({ type: 'TOGGLE_SIDEBAR' })
              }
            }}
          />
        )}

        <div className="kb-help">
          <span><span className="kb-key">←</span><span className="kb-key">→</span> Navegar</span>
          <span><span className="kb-key">F</span> Índice</span>
          <span><span className="kb-key">Esc</span> Cerrar</span>
        </div>
      </div>

      <FooterNav />
    </div>
  )
}
