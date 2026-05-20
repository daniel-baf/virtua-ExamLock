import Slide01Cover from './Slide01Cover.jsx'
import Slide02Problem from './Slide02Problem.jsx'
import Slide03Approach from './Slide03Approach.jsx'
import Slide04Architecture from './Slide04Architecture.jsx'
import Slide05Flow from './Slide05Flow.jsx'
import Slide06Demo from './Slide06Demo.jsx'
import Slide07DeployModes from './Slide07DeployModes.jsx'
import Slide08Hardening from './Slide08Hardening.jsx'
import Slide09Network from './Slide09Network.jsx'
import Slide10Monitoring from './Slide10Monitoring.jsx'
import Slide11KeyboardAI from './Slide11KeyboardAI.jsx'
import Slide12Pentesting from './Slide12Pentesting.jsx'
import Slide13Dashboard from './Slide13Dashboard.jsx'
import Slide14Residual from './Slide14Residual.jsx'
import Slide15Lifecycle from './Slide15Lifecycle.jsx'
import Slide16CostsGCP from './Slide16CostsGCP.jsx'
import Slide17Sensitivity from './Slide17Sensitivity.jsx'
import Slide18Budget from './Slide18Budget.jsx'
import Slide19Strategic from './Slide19Strategic.jsx'
import Slide20Conclusions from './Slide20Conclusions.jsx'

export const slides = [
  { id: 'cover',        title: 'Portada',                           component: Slide01Cover },
  { id: 'problem',      title: 'Planteamiento del Problema',        component: Slide02Problem },
  { id: 'approach',     title: 'Enfoque de la Solución',            component: Slide03Approach },
  { id: 'architecture', title: 'Arquitectura Propuesta',            component: Slide04Architecture },
  { id: 'flow',         title: 'Flujo de Ejecución (Animado)',      component: Slide05Flow },
  { id: 'demo',         title: 'Demostración en Vivo',              component: Slide06Demo },
  { id: 'deploy-modes', title: 'Modos de Despliegue',               component: Slide07DeployModes },
  { id: 'hardening',    title: 'Hardening del SO',                  component: Slide08Hardening },
  { id: 'network',      title: 'Control de Red',                    component: Slide09Network },
  { id: 'monitoring',   title: 'Monitoreo y Proctoring',            component: Slide10Monitoring },
  { id: 'keyboard-ai',  title: 'Auditoría de Teclado con IA',       component: Slide11KeyboardAI },
  { id: 'pentesting',   title: 'Metodología Pentesting',            component: Slide12Pentesting },
  { id: 'dashboard',    title: 'Dashboard Docente',                 component: Slide13Dashboard },
  { id: 'residual',     title: 'Vectores Residuales',               component: Slide14Residual },
  { id: 'lifecycle',    title: 'Ciclo de Vida del Examen',          component: Slide15Lifecycle },
  { id: 'costs-gcp',    title: 'Análisis de Costos GCP',            component: Slide16CostsGCP },
  { id: 'sensitivity',  title: 'Sensibilidad y Escenarios',         component: Slide17Sensitivity },
  { id: 'budget',       title: 'Simulador de Presupuesto',          component: Slide18Budget },
  { id: 'strategic',    title: 'Valor Estratégico',                 component: Slide19Strategic },
  { id: 'conclusions',  title: 'Conclusiones',                      component: Slide20Conclusions },
]
