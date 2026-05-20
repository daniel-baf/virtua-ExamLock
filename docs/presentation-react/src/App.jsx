import React, { Suspense, lazy } from 'react'
import { AppProvider, useApp } from './store/AppContext.jsx'
import { useHashTab } from './hooks/useHashTab.js'
import Header from './components/Header.jsx'

const Presentation = lazy(() => import('./presentation/Presentation.jsx'))
const Simulator = lazy(() => import('./simulator/Simulator.jsx'))
const Costs = lazy(() => import('./costs/Costs.jsx'))

function AppShell() {
  useHashTab()
  const { state } = useApp()

  return (
    <>
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />
      <Header />
      <main className="tab-content" id="main-content">
        <div className={`tab-panel${state.activeTab === 'presentation' ? ' active' : ''}`} id="tab-presentation" role="tabpanel">
          <Suspense fallback={null}>
            {state.activeTab === 'presentation' && <Presentation />}
          </Suspense>
        </div>
        <div className={`tab-panel${state.activeTab === 'simulator' ? ' active' : ''}`} id="tab-simulator" role="tabpanel">
          <Suspense fallback={null}>
            {state.activeTab === 'simulator' && <Simulator />}
          </Suspense>
        </div>
        <div className={`tab-panel${state.activeTab === 'costs' ? ' active' : ''}`} id="tab-costs" role="tabpanel">
          <Suspense fallback={null}>
            {state.activeTab === 'costs' && <Costs />}
          </Suspense>
        </div>
      </main>
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
