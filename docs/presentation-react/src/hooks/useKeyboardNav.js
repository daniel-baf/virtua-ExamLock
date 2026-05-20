import { useEffect } from 'react'
import { useApp } from '../store/AppContext.jsx'
import { TOTAL_SLIDES } from '../store/reducer.js'

const FLOW_SLIDE_IDX = 4
const FLOW_TOTAL_STEPS = 6

export function useKeyboardNav() {
  const { state, dispatch } = useApp()

  useEffect(() => {
    function onKey(e) {
      if (state.activeTab !== 'presentation') return

      const { slideIdx, flowStep, sidebarOpen } = state.presentation

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault()
          if (slideIdx === FLOW_SLIDE_IDX && flowStep < FLOW_TOTAL_STEPS - 1) {
            dispatch({ type: 'SET_FLOW_STEP', step: flowStep + 1 })
          } else {
            if (slideIdx < TOTAL_SLIDES - 1)
              dispatch({ type: 'SET_SLIDE', idx: slideIdx + 1 })
          }
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault()
          if (slideIdx === FLOW_SLIDE_IDX && flowStep > 0) {
            dispatch({ type: 'SET_FLOW_STEP', step: flowStep - 1 })
          } else {
            if (slideIdx > 0)
              dispatch({ type: 'SET_SLIDE', idx: slideIdx - 1 })
          }
          break
        case 'f':
        case 'F':
          dispatch({ type: 'TOGGLE_SIDEBAR' })
          break
        case 'Escape':
          if (sidebarOpen) dispatch({ type: 'TOGGLE_SIDEBAR' })
          break
      }
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [state.activeTab, state.presentation, dispatch])
}
