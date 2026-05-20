import React, { useEffect, useRef, useCallback, useState } from 'react'
import { useApp } from '../store/AppContext.jsx'
import { useAudio } from '../hooks/useAudio.js'
import { createStudents, PEDRO_ID, VALENTINA_ID, RODRIGO_ID, ANDREA_ID, CARLOS_ID } from './students.js'
import { STEPS, getStepStartSimTime } from './steps.js'
import { initPlayback, startStep, cancelStep, getSimTime, isRunning } from './playback.js'
import {
  initNetworkCanvas, positionInfraNodes, spawnStudentNode,
  syncNodeStyle, flashAuthAnimation, triggerConnectAnimation,
  getStudentPosition, getCenter
} from './networkCanvas.js'
import { initTerminal, printLog, clearTerminal } from './terminalLog.js'
import { initCloudRunPanel, setCloudRunInstances, setStepCpuTarget, resetPanel as resetCR } from './cloudRunPanel.js'
import { playSound } from '../shared/audio.js'

function formatTime(d) {
  const pad = n => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function drawScreenCanvas(canvas, student) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width, h = canvas.height
  ctx.fillStyle = '#090d16'; ctx.fillRect(0, 0, w, h)
  const isOnline = ['active','warning','danger'].includes(student.state)
  if (!isOnline) {
    ctx.fillStyle = '#374151'; ctx.font = '6px monospace'; ctx.fillText('OFFLINE', w/2-13, h/2+2); return
  }
  if (student.state === 'expelled') {
    ctx.fillStyle = 'rgba(239,68,68,0.1)'; ctx.fillRect(0,0,w,h)
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(w,h); ctx.moveTo(w,0); ctx.lineTo(0,h); ctx.stroke()
    ctx.fillStyle = '#ef4444'; ctx.font = 'bold 6px Arial'; ctx.fillText('BLOQUEADO', w/2-18, h/2+2); return
  }
  ctx.fillStyle = '#1e293b'; ctx.fillRect(4,4,w-8,h-8)
  ;['rgba(255,255,255,0.15)','#60a5fa','#34d399','#fbbf24','#f87171','#a78bfa'].forEach((c, i) => {
    ctx.fillStyle = c
    ctx.fillRect(6, 6+i*5, w-10-i*4-Math.random()*6, 3)
  })
  ctx.fillStyle = student.state === 'warning' ? '#f59e0b' : '#10b981'
  ctx.beginPath(); ctx.arc(w-6, 6, 2.5, 0, 2*Math.PI); ctx.fill()
}

export default function Simulator() {
  const { state, dispatch } = useApp()
  const audioCtxRef = useRef(null)
  const audioActiveRef = useRef(state.audio.active)

  const studentsRef = useRef(createStudents())
  const currentStepRef = useRef(-1)
  const stepDoneRef = useRef(false)
  const gcsIntervalRef = useRef(null)
  const telCountRef = useRef(0)
  const mountedRef = useRef(false)

  const [audioIcon, setAudioIcon] = useState('🔊')

  useEffect(() => { audioActiveRef.current = state.audio.active }, [state.audio.active])

  const doPlaySound = useCallback((type) => {
    if (!audioActiveRef.current) return
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume()
      playSound(audioCtxRef.current, type)
    } catch (_) {}
  }, [])

  const updateStudentCard = useCallback((student) => {
    const card = document.getElementById(`scard-${student.id}`)
    if (!card) return
    card.className = `student-card card-${student.state}`
    const statusEl = card.querySelector('.sc-status')
    if (statusEl) { statusEl.textContent = student.state; statusEl.className = `sc-status s-${student.state}` }
    const fwEl = card.querySelector('.sc-fw')
    if (fwEl) fwEl.textContent = `FW:${student.shield ? 'ON' : 'OFF'}`
    const isOnline = ['active','warning','danger'].includes(student.state)
    const expelBtn = document.getElementById(`sexpel-${student.id}`)
    if (expelBtn) expelBtn.disabled = student.state === 'expelled' || !isOnline
    const lockEl = document.getElementById(`slock-${student.id}`)
    if (lockEl) lockEl.classList.toggle('visible', student.state === 'expelled')
    const canvas = document.getElementById(`sscreen-${student.id}`)
    if (canvas) drawScreenCanvas(canvas, student)
  }, [])

  const updateMetaStats = useCallback(() => {
    const active = studentsRef.current.filter(s => s.state !== 'offline' && s.state !== 'expelled').length
    const nodesEl = document.getElementById('meta-nodes')
    if (nodesEl) nodesEl.textContent = `${active}/25`
    const statusEl = document.getElementById('meta-status')
    if (statusEl) {
      const hasDanger = studentsRef.current.some(s => s.state === 'danger')
      const hasWarn   = studentsRef.current.some(s => s.state === 'warning')
      statusEl.textContent = hasDanger ? '🚨 ALERTA' : hasWarn ? '⚠️ Aviso' : '🔒 OK'
      statusEl.style.color = hasDanger ? 'var(--red)' : hasWarn ? 'var(--amber)' : 'var(--emerald)'
    }
  }, [])

  const enableTriggers = useCallback(() => {
    ;['trig-evasion','trig-wifi','trig-usb'].forEach(id => {
      const el = document.getElementById(id)
      if (el) el.disabled = false
    })
  }, [])

  const disableTriggers = useCallback(() => {
    ;['trig-evasion','trig-wifi','trig-usb'].forEach(id => {
      const el = document.getElementById(id)
      if (el) el.disabled = true
    })
  }, [])

  const renderStudentGrid = useCallback(() => {
    const grid = document.getElementById('student-grid')
    if (!grid) return
    grid.innerHTML = ''
    studentsRef.current.forEach(s => {
      const card = document.createElement('div')
      card.id = `scard-${s.id}`
      card.className = `student-card card-${s.state}`
      const isOnline = ['active','warning','danger'].includes(s.state)
      card.innerHTML = `
        <div class="sc-header">
          <span class="sc-name" title="${s.name}">${s.name.split(' ')[0]}</span>
          <span class="sc-status s-${s.state}">${s.state}</span>
        </div>
        <canvas id="sscreen-${s.id}" class="sc-screen" width="100" height="38"></canvas>
        <div class="sc-footer">
          <span class="sc-fw">FW:${s.shield ? 'ON' : 'OFF'}</span>
          <button class="sc-expel" id="sexpel-${s.id}" ${(s.state==='expelled'||!isOnline)?'disabled':''}>Expulsar</button>
        </div>
        <div class="sc-lock-overlay${s.state==='expelled'?' visible':''}" id="slock-${s.id}">
          <span class="sc-lock-icon">🔒</span><span class="sc-lock-text">Expulsado</span>
        </div>`
      card.querySelector('.sc-expel').addEventListener('click', () => simExpel(s.id))
      grid.appendChild(card)
      drawScreenCanvas(document.getElementById(`sscreen-${s.id}`), s)
    })
  }, [])

  const updateStepPanel = useCallback(() => {
    const step = STEPS[currentStepRef.current]
    const numEl = document.getElementById('step-num')
    if (numEl) numEl.textContent = step ? `Paso ${currentStepRef.current + 1} / ${STEPS.length}` : `Paso 0 / ${STEPS.length}`
    const iconEl = document.getElementById('step-icon')
    if (iconEl) { iconEl.textContent = step?.icon ?? '🔒'; if (step) iconEl.style.background = step.color + '22' }
    const labelEl = document.getElementById('step-label')
    if (labelEl) labelEl.textContent = step?.label ?? 'Listo para iniciar'
    const descEl = document.getElementById('step-desc')
    if (descEl) descEl.textContent = step?.desc ?? 'Presiona NEXT para comenzar la simulación'
    const panel = document.getElementById('step-panel')
    if (panel) panel.style.setProperty('--step-color', step?.color ?? '#64748b')
    updateDots()
    const nextBtn = document.getElementById('btn-step-next')
    if (nextBtn && !step) { nextBtn.textContent = 'NEXT →'; nextBtn.disabled = false; nextBtn.classList.remove('step-next-ready') }
    const prevBtn = document.getElementById('btn-step-prev')
    if (prevBtn) prevBtn.disabled = currentStepRef.current <= 0
  }, [])

  const updateDots = useCallback(() => {
    const wrap = document.getElementById('step-dots')
    if (!wrap) return
    wrap.innerHTML = STEPS.map((s, i) => {
      const cls = i < currentStepRef.current ? 'dot-done' : i === currentStepRef.current ? 'dot-active' : 'dot-pending'
      return `<div class="step-dot ${cls}" title="${s.label}" data-idx="${i}" style="${i === currentStepRef.current ? `background:${s.color}` : ''}"></div>`
    }).join('')
    wrap.querySelectorAll('.step-dot').forEach(el => {
      el.addEventListener('click', () => simGoToStep(parseInt(el.dataset.idx)))
    })
  }, [])

  const handleTick = useCallback((simTime, progress, speed) => {
    const clockEl = document.getElementById('sim-clock')
    if (clockEl) clockEl.textContent = formatTime(simTime)
    const active = studentsRef.current.filter(s => ['active','warning','danger'].includes(s.state))
    const examStart = new Date(2026, 4, 20, 8, 2, 0)
    const hours = Math.max(0, (simTime - examStart) / 3_600_000)
    const cost = active.length * hours * 0.029
    const costEl = document.getElementById('cost-value')
    if (costEl) costEl.textContent = `$${cost.toFixed(3)}`
    const detEl = document.getElementById('cost-detail')
    if (detEl) detEl.textContent = `${active.length} al · $0.029/al·h`
    const fill = document.getElementById('step-prog-fill')
    if (fill) fill.style.width = `${(progress * 100).toFixed(1)}%`
    const speedEl = document.getElementById('step-speed-label')
    if (speedEl && speed > 0) {
      speedEl.textContent = speed < 1 ? `${speed.toFixed(2)}×` : speed < 10 ? `${speed.toFixed(1)}×` : `${Math.round(speed)}×`
      const intensity = Math.min(1, Math.log10(Math.max(1, speed)) / Math.log10(80))
      speedEl.style.color = `hsl(${190 - intensity * 80}, 90%, ${50 + intensity * 20}%)`
    } else if (speedEl) { speedEl.textContent = '' }
    telCountRef.current++
    if (telCountRef.current % 60 === 0 && active.length) {
      const s = active[Math.floor(Math.random() * active.length)]
      s.uploadCount = (s.uploadCount || 0) + 1
      if (Math.random() < 0.12) printLog('GCS', 'success', `Upload: frame_${s.uploadCount}.jpg ← ${s.name.split(' ')[0]} (${s.ip})`)
    }
  }, [])

  const handleStepComplete = useCallback((stepIdx) => {
    stepDoneRef.current = true
    const fill = document.getElementById('step-prog-fill')
    if (fill) fill.style.width = '100%'
    const nextStep = STEPS[stepIdx + 1]
    const nextBtn = document.getElementById('btn-step-next')
    if (nextBtn) {
      nextBtn.textContent = nextStep ? `NEXT → ${nextStep.icon}` : '✓ Fin'
      nextBtn.classList.add('step-next-ready')
      nextBtn.disabled = !nextStep
    }
  }, [])

  // Step handlers
  const STEP_HANDLERS = useCallback(() => ({
    teacherLogin() {
      printLog('ADMIN-WEB', 'purple', 'Docente Daniel Baf inició sesión en Dashboard.')
      printLog('GCP', 'info', 'Cloud Run exam-server: cold start → 1 instancia activa.')
      printLog('SERVER', 'info', 'WebSocket Server iniciado en puerto 443 (WSS/TLS).')
      printLog('FIREBASE', 'success', 'Auth service conectado. Endpoint /join habilitado.')
      doPlaySound('connect')
    },
    connectStudents() {
      printLog('SERVER', 'success', 'Admisión abierta. Validando JWT de 25 daemons...')
      printLog('GCP', 'warning', 'Carga en aumento → escalando a 2 instancias...')
      doPlaySound('connect')
      studentsRef.current.forEach((s, idx) => {
        setTimeout(() => {
          if (s.state !== 'offline') return
          s.state = 'active'; s.shield = true
          syncNodeStyle(s); triggerConnectAnimation(s); flashAuthAnimation(s)
          updateStudentCard(s); updateMetaStats(); doPlaySound('ping')
          printLog('FIREBASE:AUTH', 'success', `JWT: ${s.name} (${s.ip}) → admitted`)
          if (idx === 12) printLog('GCP', 'success', 'exam-server: 1 → 2 instancias. CPU > 60%.')
          if (idx === 24) {
            printLog('SERVER', 'success', '25/25 daemons admitidos. Firestore: todos admitted.')
            printLog('DASHBOARD', 'success', 'Monitoreo WSS activo. 25 nodos asegurados.')
            enableTriggers(); doPlaySound('success')
          }
        }, idx * 380)
      })
    },
    examRunning() {
      printLog('SERVER', 'success', 'session:started enviado a todos los nodos.')
      printLog('GCS', 'info', 'Flujo de screenshots iniciado. Intervalo: 2s. Resolución: 720p.')
      printLog('IA', 'info', 'Monitor de patrones activo. Análisis de frames JPEG en curso.')
      doPlaySound('success')
      if (gcsIntervalRef.current) clearInterval(gcsIntervalRef.current)
      gcsIntervalRef.current = setInterval(() => {
        if (currentStepRef.current < 2 || currentStepRef.current > 7) {
          clearInterval(gcsIntervalRef.current); gcsIntervalRef.current = null; return
        }
        const active = studentsRef.current.filter(s => s.state === 'active')
        if (!active.length) return
        const batch = active.slice(0, 3 + Math.floor(Math.random() * 3))
        batch.forEach(s => { s.uploadCount = (s.uploadCount || 0) + 1 })
        printLog('GCS', 'success', `Batch upload: ${batch.length} frames → gs://examlock-telemetry/`)
      }, 1800)
    },
    wifiCut() {
      const s = studentsRef.current.find(st => st.id === RODRIGO_ID)
      if (!s || s.state !== 'active') return
      s.state = 'offline'; s.shield = false
      syncNodeStyle(s); updateStudentCard(s); updateMetaStats(); doPlaySound('warning')
      printLog('DASHBOARD', 'warning', 'Canal WSS caído: Rodrigo López. Heartbeat timeout.')
      printLog('AGENTE:rodrigo', 'warning', 'Red desconectada. Modo offline. Capturas cacheadas en /tmp.')
      setTimeout(() => {
        if (s.state !== 'offline') return
        s.state = 'active'; s.shield = true
        syncNodeStyle(s); updateStudentCard(s); updateMetaStats(); doPlaySound('success')
        printLog('AGENTE:rodrigo', 'success', 'Red restablecida. Reconexión WSS exitosa.')
        printLog('GCS', 'success', 'Burst upload: 4 evidencias cacheadas → gs://examlock-telemetry/')
      }, 2800)
    },
    dnsEvasion() {
      const s = studentsRef.current.find(st => st.id === VALENTINA_ID)
      if (!s || s.state !== 'active') return
      s.state = 'warning'; syncNodeStyle(s); updateStudentCard(s); updateMetaStats(); doPlaySound('warning')
      printLog('AGENTE:valentina', 'warning', 'Modificación /etc/resolv.conf detectada. DNS externo: 1.1.1.1')
      printLog('KERNEL:valentina', 'error', 'iptables DROP paquetes → 1.1.1.1, 8.8.8.8.')
      printLog('SERVER', 'warning', 'Valentina García — bypass DNS mitigado automáticamente.')
      setTimeout(() => {
        if (s.state !== 'warning') return
        s.state = 'active'; syncNodeStyle(s); updateStudentCard(s); updateMetaStats()
        printLog('AGENTE:valentina', 'success', 'DNS flushed. Reglas auditadas. Estado: Seguro.')
      }, 3000)
    },
    camBlocked() {
      const s = studentsRef.current.find(st => st.id === ANDREA_ID)
      if (!s || s.state !== 'active') return
      s.state = 'warning'; syncNodeStyle(s); updateStudentCard(s); updateMetaStats(); doPlaySound('warning')
      printLog('IA', 'warning', 'Frame negro detectado: Andrea Pérez. Posible obstrucción.')
      printLog('SERVER', 'warning', 'Alerta: cámara inaccesible en 192.168.1.103.')
      printLog('DASHBOARD', 'warning', '⚠️ Andrea Pérez — 3 frames negros consecutivos.')
      setTimeout(() => {
        if (s.state !== 'warning') return
        s.state = 'active'; syncNodeStyle(s); updateStudentCard(s); updateMetaStats()
        printLog('AGENTE:andrea', 'success', 'Cámara restablecida. Captura resumida.')
      }, 3500)
    },
    usbExpulsion() {
      const s = studentsRef.current.find(st => st.id === PEDRO_ID)
      if (!s || s.state !== 'active') return
      s.state = 'danger'; syncNodeStyle(s); updateStudentCard(s); updateMetaStats(); doPlaySound('critical')
      printLog('KERNEL:pedro', 'error', '🔴 CRÍTICO: USB storage montado (udev event: /dev/sdb1).')
      printLog('AGENTE:pedro', 'error', 'Inyección keylogger detectada. Patrón heurístico activado.')
      printLog('SERVER', 'error', 'ALERTA: Pedro González — Evasión USB confirmada.')
      printLog('DASHBOARD', 'error', '🚨 Pedro González montó USB. Docente expulsando...')
      setTimeout(() => simExpel(PEDRO_ID), 2200)
    },
    keylogger() {
      const s = studentsRef.current.find(st => st.id === CARLOS_ID)
      if (!s || s.state !== 'active') return
      s.state = 'warning'; syncNodeStyle(s); updateStudentCard(s); updateMetaStats(); doPlaySound('warning')
      printLog('IA', 'warning', 'Keylogger: 1247 chars en 1.2s. Ritmo de escritura sobrehumano.')
      printLog('AGENTE:carlos', 'warning', 'Paste masivo detectado. Posible IA generativa.')
      printLog('DASHBOARD', 'warning', '⚠️ Carlos Mendoza — alerta copy-paste IA (ChatGPT?).')
    },
    examEnd() {
      printLog('DASHBOARD', 'success', 'Daniel Baf finalizó la sesión URL-EXAM-101.')
      printLog('SERVER', 'success', 'Emitiendo session:finished a todos los nodos activos.')
      disableTriggers()
      studentsRef.current.forEach((s, i) => {
        setTimeout(() => {
          if (s.state === 'expelled') { printLog(`AGENTE:${s.name.split(' ')[0].toLowerCase()}`, 'warning', 'Nodo expulsado. Requiere reinicio.'); return }
          s.state = 'offline'; s.shield = false
          syncNodeStyle(s); updateStudentCard(s)
          printLog(`AGENTE:${s.name.split(' ')[0].toLowerCase()}`, 'success', 'iptables -F. Kiosk cerrado. Cage liberado.')
        }, i * 120)
      })
      setTimeout(() => {
        updateMetaStats()
        printLog('GCP', 'info', 'exam-server: sin tráfico activo → escalando a 0 instancias.')
        doPlaySound('success')
      }, 25 * 120 + 500)
    },
  }), [doPlaySound, updateStudentCard, updateMetaStats, enableTriggers, disableTriggers])

  const goToStep = useCallback((idx) => {
    if (idx < 0 || idx >= STEPS.length) return
    cancelStep()
    currentStepRef.current = idx
    stepDoneRef.current = false
    updateStepPanel()
    const step = STEPS[idx]
    const handlers = STEP_HANDLERS()
    handlers[step.handlerKey]?.()
    if (step.crInstances !== undefined) {
      const simT = formatTime(getStepStartSimTime(idx))
      setCloudRunInstances(step.crInstances, step.crLabel, simT)
    }
    setStepCpuTarget(idx)
    startStep(idx)
    const nextBtn = document.getElementById('btn-step-next')
    if (nextBtn) { nextBtn.textContent = 'En progreso...'; nextBtn.disabled = true; nextBtn.classList.remove('step-next-ready') }
    const prevBtn = document.getElementById('btn-step-prev')
    if (prevBtn) prevBtn.disabled = idx === 0
    updateDots()
  }, [STEP_HANDLERS, updateStepPanel, updateDots])

  const instantStep = useCallback((idx) => {
    if (idx >= 1) studentsRef.current.forEach(s => { s.state = 'active'; s.shield = true; syncNodeStyle(s); updateStudentCard(s) })
    if (idx >= 6) { const p = studentsRef.current.find(s => s.id === PEDRO_ID); if (p) { p.state = 'expelled'; p.shield = false; syncNodeStyle(p); updateStudentCard(p) } }
    if (idx >= 7) { const c = studentsRef.current.find(s => s.id === CARLOS_ID); if (c) { c.state = 'warning'; syncNodeStyle(c); updateStudentCard(c) } }
    const step = STEPS[idx]
    if (step?.crInstances !== undefined) setCloudRunInstances(step.crInstances, step.crLabel, '--')
    currentStepRef.current = idx
    updateMetaStats()
  }, [updateStudentCard, updateMetaStats])

  const simExpel = useCallback((id) => {
    const s = studentsRef.current.find(st => st.id === id)
    if (!s || s.state === 'expelled' || s.state === 'offline') return
    s.state = 'expelled'; s.shield = false
    syncNodeStyle(s); updateStudentCard(s); updateMetaStats(); doPlaySound('critical')
    printLog('DASHBOARD', 'admin', `Daniel Baf expulsó a ${s.name}.`)
    printLog('SERVER', 'error', `WebSocket emit 'client:expel' → ${s.ip}`)
    printLog(`AGENTE:${s.name.split(' ')[0].toLowerCase()}`, 'error', 'Bloqueo total: iptables -A OUTPUT -j DROP. Pantalla bloqueada.')
  }, [updateStudentCard, updateMetaStats, doPlaySound])

  const simGoToStep = useCallback((idx) => {
    if (idx === currentStepRef.current) return
    simReset()
    for (let i = 0; i <= idx; i++) {
      if (i < idx) instantStep(i)
      else goToStep(i)
    }
  }, [instantStep, goToStep])

  const simReset = useCallback(() => {
    cancelStep()
    studentsRef.current = createStudents()
    currentStepRef.current = -1
    stepDoneRef.current = false
    if (gcsIntervalRef.current) { clearInterval(gcsIntervalRef.current); gcsIntervalRef.current = null }
    resetCR(); disableTriggers(); clearTerminal()
    renderStudentGrid()
    studentsRef.current.forEach(s => { spawnStudentNode(s); syncNodeStyle(s) })
    const clockEl = document.getElementById('sim-clock')
    if (clockEl) clockEl.textContent = '08:00:00'
    updateMetaStats(); updateStepPanel()
    const nextBtn = document.getElementById('btn-step-next')
    if (nextBtn) { nextBtn.textContent = 'NEXT →'; nextBtn.disabled = false; nextBtn.classList.remove('step-next-ready') }
    printLog('SISTEMA', 'purple', 'Simulador reiniciado. Presiona NEXT para iniciar.')
  }, [renderStudentGrid, updateMetaStats, updateStepPanel, disableTriggers])

  const simStepNext = useCallback(() => {
    if (isRunning()) return
    const next = currentStepRef.current + 1
    if (next >= STEPS.length) return
    goToStep(next)
  }, [goToStep])

  const simStepPrev = useCallback(() => {
    const prev = Math.max(0, currentStepRef.current - 1)
    cancelStep()
    studentsRef.current = createStudents()
    renderStudentGrid()
    studentsRef.current.forEach(s => { spawnStudentNode(s); syncNodeStyle(s) })
    clearTerminal(); disableTriggers()
    if (gcsIntervalRef.current) { clearInterval(gcsIntervalRef.current); gcsIntervalRef.current = null }
    resetCR()
    currentStepRef.current = -1
    for (let i = 0; i < prev; i++) instantStep(i)
    goToStep(prev)
  }, [renderStudentGrid, disableTriggers, instantStep, goToStep])

  // Init on mount
  useEffect(() => {
    if (mountedRef.current) return
    mountedRef.current = true

    const canvasEl = document.getElementById('network-canvas')
    const svgEl = document.getElementById('cables-svg')
    if (!canvasEl || !svgEl) return

    initNetworkCanvas(canvasEl, svgEl, studentsRef.current, (student, e) => {
      const pop = document.getElementById('node-popover')
      if (!pop) return
      const labels = { active:'Online', offline:'Offline', warning:'Alerta', danger:'Peligro', expelled:'Expulsado' }
      pop.innerHTML = `
        <div class="popover-name">${student.name}</div>
        <div class="popover-row"><span>IP:</span><span style="font-family:var(--font-mono);color:var(--cyan)">${student.ip}</span></div>
        <div class="popover-row"><span>Estado:</span><span>${labels[student.state]||student.state}</span></div>
        <div class="popover-row"><span>Firewall:</span><span style="color:${student.shield?'var(--emerald)':'var(--text-3)'}">${student.shield?'ACTIVO':'NINGUNO'}</span></div>
        <div class="popover-row"><span>Uploads:</span><span>${student.uploadCount||0}</span></div>
        <div class="popover-row"><span>OS:</span><span>Debian Live (RAM)</span></div>`
      const rect = canvasEl.getBoundingClientRect()
      pop.style.left = `${e.clientX - rect.left + 12}px`
      pop.style.top  = `${e.clientY - rect.top - 10}px`
      pop.style.display = 'block'
    })

    const termEl = document.getElementById('terminal-body')
    const clockStr = () => formatTime(new Date(2026, 4, 20, 8, 0, 0))
    initTerminal(termEl, clockStr)
    initPlayback({ onTick: handleTick, onStepComplete: handleStepComplete })
    initCloudRunPanel('cr-panel')
    positionInfraNodes()
    studentsRef.current.forEach(s => spawnStudentNode(s))
    renderStudentGrid()
    updateStepPanel()
    printLog('SISTEMA', 'purple', 'ExamLock Simulador listo. Presiona NEXT para iniciar.')

    const onResize = () => {
      positionInfraNodes()
      studentsRef.current.forEach(s => {
        const node = document.getElementById(`snode-${s.id}`)
        if (!node) return
        const { sx, sy } = getStudentPosition(s)
        node.style.left = `${sx}px`; node.style.top = `${sy}px`
        const cable = document.getElementById(`scable-${s.id}`)
        const { cx, cy } = getCenter()
        if (cable) cable.setAttribute('d', `M${sx} ${sy} Q${cx+(sx-cx)*0.25} ${cy+(sy-cy)*0.25} ${cx} ${cy}`)
      })
    }
    window.addEventListener('resize', onResize)

    const onKey = (e) => {
      if (state.activeTab !== 'simulator') return
      if (['ArrowRight','Enter','Space'].includes(e.code)) { e.preventDefault(); simStepNext() }
      if (['ArrowLeft','Backspace'].includes(e.code)) { e.preventDefault(); simStepPrev() }
    }
    document.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('resize', onResize)
      document.removeEventListener('keydown', onKey)
      if (gcsIntervalRef.current) clearInterval(gcsIntervalRef.current)
      cancelStep()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div id="simulator-root">
      <div className="sim-header">
        <div className="sim-title-block">
          <div className="sim-logo-icon">🔒</div>
          <div>
            <div className="sim-title">ExamLock Live Session</div>
            <div className="sim-subtitle">25 alumnos · Step-by-step</div>
          </div>
          <span className="session-badge">URL-EXAM-101</span>
        </div>
        <div className="sim-clock-block">
          <span className="sim-clock-label">Tiempo simulado</span>
          <span id="sim-clock" className="sim-clock-value">08:00:00</span>
        </div>
        <div className="sim-header-actions">
          <button id="btn-audio" className="sim-btn" title="Audio"
            onClick={() => {
              dispatch({ type: 'AUDIO_TOGGLE' })
              setAudioIcon(prev => prev === '🔊' ? '🔇' : '🔊')
            }}>{audioIcon}</button>
          <button className="sim-btn" onClick={simReset}>🔄</button>
        </div>
      </div>

      <div className="sim-workspace">
        <div className="sim-left">
          <div className="sim-panel-hdr">
            <div><div className="sim-panel-title">📡 Red de Daemons</div><div className="sim-panel-sub">25 nodos · GCP infraestructura</div></div>
            <div style={{ fontSize:'0.65rem', color:'var(--cyan)', fontFamily:'var(--font-mono)' }}>● WSS ● HTTPS</div>
          </div>
          <div className="network-canvas" id="network-canvas">
            <svg className="cables-svg" id="cables-svg">
              <path id="cable-srv-fb"  className="svg-cable cable-infra"/>
              <path id="cable-srv-gcs" className="svg-cable cable-infra"/>
            </svg>
            <div className="net-node infra node-firebase" id="net-node-fb">
              <span className="node-icon">🔑</span><span className="node-label">Firebase Auth</span>
            </div>
            <div className="net-node infra node-server" id="net-node-srv">
              <span className="node-icon">☁️</span><span className="node-label">Cloud Run</span>
            </div>
            <div className="net-node infra node-gcs" id="net-node-gcs">
              <span className="node-icon">🪣</span><span className="node-label">GCS</span>
            </div>
            <div className="node-popover" id="node-popover"></div>
            <div className="cost-counter">
              <span className="cost-label">Costo acumulado</span>
              <span id="cost-value" className="cost-value">$0.000</span>
              <span id="cost-detail" className="cost-detail">0 alumnos</span>
            </div>
          </div>
          <div className="cr-panel-wrap">
            <div className="cr-panel-title">☁️ Cloud Run — escalado</div>
            <div id="cr-panel" className="cr-panel"></div>
          </div>
        </div>

        <div className="sim-right">
          <div className="teacher-meta">
            <div className="meta-stat"><div className="meta-label">Docente</div><div className="meta-val" style={{ fontSize:'0.78rem' }}>Daniel Baf</div></div>
            <div className="meta-stat"><div className="meta-label">Nodos</div><div id="meta-nodes" className="meta-val">0/25</div></div>
            <div className="meta-stat"><div className="meta-label">Estado</div><div id="meta-status" className="meta-val" style={{ color:'var(--emerald)' }}>🔒 OK</div></div>
          </div>
          <div className="triggers-bar">
            <span className="trigger-label">Manual:</span>
            <button id="trig-evasion" className="trig-btn trig-evasion" disabled onClick={() => { if (currentStepRef.current >= 2) STEP_HANDLERS().dnsEvasion() }}>💥 DNS</button>
            <button id="trig-wifi"    className="trig-btn trig-wifi"    disabled onClick={() => { if (currentStepRef.current >= 2) STEP_HANDLERS().wifiCut() }}>🔌 Wi-Fi</button>
            <button id="trig-usb"     className="trig-btn trig-usb"     disabled onClick={() => { if (currentStepRef.current >= 2) STEP_HANDLERS().usbExpulsion() }}>💾 USB</button>
          </div>
          <div className="student-grid" id="student-grid"></div>
          <div className="terminal-section">
            <div className="terminal-hdr">
              <span className="terminal-title">🗲 Terminal de Auditoría</span>
              <span className="terminal-badge">Live</span>
            </div>
            <div className="terminal-body" id="terminal-body"></div>
          </div>
        </div>
      </div>

      <div className="step-panel" id="step-panel">
        <div className="step-dots" id="step-dots"></div>
        <div className="step-content">
          <div className="step-icon-wrap" id="step-icon">🔒</div>
          <div className="step-text">
            <div className="step-num" id="step-num">Paso 0 / {STEPS.length}</div>
            <div className="step-label" id="step-label">Listo para iniciar</div>
            <div className="step-desc"  id="step-desc">Presiona NEXT para comenzar la simulación</div>
          </div>
        </div>
        <div className="step-progress-wrap">
          <div className="step-progress-track" id="step-prog-track">
            <div className="step-progress-fill" id="step-prog-fill"></div>
            <div className="step-progress-bell" id="step-prog-bell"></div>
          </div>
          <div className="step-speed-label" id="step-speed-label"></div>
        </div>
        <div className="step-nav-btns">
          <button className="step-nav-btn step-prev-btn" id="btn-step-prev" onClick={simStepPrev}>⏮ Anterior</button>
          <button className="step-nav-btn step-next-btn" id="btn-step-next" onClick={simStepNext}>NEXT →</button>
        </div>
      </div>
    </div>
  )
}
