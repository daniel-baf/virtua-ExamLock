import { useEffect } from 'react'
import { useApp } from '../store/AppContext.jsx'

const VALID_TABS = ['presentation', 'simulator', 'costs']

export function useHashTab() {
  const { state, dispatch } = useApp()

  // Read hash on mount
  useEffect(() => {
    const hash = location.hash.replace('#', '')
    if (VALID_TABS.includes(hash) && hash !== state.activeTab) {
      dispatch({ type: 'SET_TAB', tab: hash })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync hash when tab changes
  useEffect(() => {
    history.replaceState(null, '', '#' + state.activeTab)
  }, [state.activeTab])
}
