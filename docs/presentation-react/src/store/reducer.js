import { createStudents } from '../simulator/students.js'

export const SLIDE_TITLES = [
  'Portada', 'Planteamiento del Problema', 'Enfoque de la Solución', 'Arquitectura Propuesta',
  'Flujo de Ejecución (Animado)', 'Demostración en Vivo', 'Modos de Despliegue',
  'Hardening del SO', 'Control de Red', 'Monitoreo y Proctoring',
  'Auditoría de Teclado con IA', 'Metodología Pentesting', 'Dashboard Docente',
  'Vectores Residuales', 'Ciclo de Vida del Examen',
  'Análisis de Costos GCP', 'Sensibilidad y Escenarios', 'Simulador de Presupuesto',
  'Valor Estratégico', 'Conclusiones'
]

export const SLIDE_IDS = [
  'cover', 'problem', 'approach', 'architecture',
  'flow', 'demo', 'deploy-modes',
  'hardening', 'network', 'monitoring',
  'keyboard-ai', 'pentesting', 'dashboard',
  'residual', 'lifecycle',
  'costs-gcp', 'sensitivity', 'budget',
  'strategic', 'conclusions'
]

export const TOTAL_SLIDES = 20

export const initialState = {
  activeTab: 'presentation',
  presentation: {
    slideIdx: 0,
    flowStep: 0,
    sidebarOpen: false,
    costMode: 1,
  },
  simulator: {
    stepIdx: -1,
    simTime: null,
    running: false,
    students: createStudents(),
    telemetryCount: 0,
    cloudRunInstances: 0,
    cloudRunLabel: null,
    logs: [],
    currentStepCpuTarget: null,
  },
  costs: {
    sensitivityMode: 2,
    budget: {
      students: 100,
      hours: 2,
      intervalS: 10,
      teachers: 2,
    },
  },
  audio: { active: false },
}

export function reducer(state, action) {
  switch (action.type) {

    case 'SET_TAB':
      return { ...state, activeTab: action.tab }

    case 'SET_SLIDE':
      return {
        ...state,
        presentation: {
          ...state.presentation,
          slideIdx: action.idx,
          flowStep: action.idx === (state.presentation.slideIdx) ? state.presentation.flowStep : 0,
        },
      }

    case 'SET_FLOW_STEP':
      return {
        ...state,
        presentation: { ...state.presentation, flowStep: action.step },
      }

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        presentation: { ...state.presentation, sidebarOpen: !state.presentation.sidebarOpen },
      }

    case 'SET_COST_MODE':
      return {
        ...state,
        presentation: { ...state.presentation, costMode: action.mode },
      }

    case 'SET_SENSITIVITY_MODE':
      return {
        ...state,
        costs: { ...state.costs, sensitivityMode: action.mode },
      }

    case 'SET_BUDGET':
      return {
        ...state,
        costs: {
          ...state.costs,
          budget: { ...state.costs.budget, ...action.budget },
        },
      }

    case 'AUDIO_TOGGLE':
      return { ...state, audio: { active: !state.audio.active } }

    case 'SIM_SET_STEP':
      return {
        ...state,
        simulator: { ...state.simulator, stepIdx: action.stepIdx },
      }

    case 'SIM_SET_RUNNING':
      return {
        ...state,
        simulator: { ...state.simulator, running: action.running },
      }

    case 'SIM_SET_TIME':
      return {
        ...state,
        simulator: { ...state.simulator, simTime: action.simTime },
      }

    case 'SIM_UPDATE_STUDENT': {
      const students = state.simulator.students.map(s =>
        s.id === action.id ? { ...s, ...action.patch } : s
      )
      return { ...state, simulator: { ...state.simulator, students } }
    }

    case 'SIM_UPDATE_STUDENTS': {
      const students = state.simulator.students.map(s => {
        const patch = action.patches[s.id]
        return patch ? { ...s, ...patch } : s
      })
      return { ...state, simulator: { ...state.simulator, students } }
    }

    case 'SIM_ADD_LOG': {
      const logs = [...state.simulator.logs, action.entry].slice(-200)
      return { ...state, simulator: { ...state.simulator, logs } }
    }

    case 'SIM_SET_TELEMETRY':
      return {
        ...state,
        simulator: { ...state.simulator, telemetryCount: action.count },
      }

    case 'SIM_SET_CLOUD_RUN':
      return {
        ...state,
        simulator: {
          ...state.simulator,
          cloudRunInstances: action.instances,
          cloudRunLabel: action.label ?? null,
          currentStepCpuTarget: action.stepId ?? null,
        },
      }

    case 'SIM_RESET':
      return {
        ...state,
        simulator: {
          ...initialState.simulator,
          students: createStudents(),
        },
      }

    default:
      return state
  }
}
