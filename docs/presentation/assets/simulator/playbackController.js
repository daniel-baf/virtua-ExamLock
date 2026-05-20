// playbackController.js — step-based con curva de campana logarítmica

import { STEPS, STEP_START_TIME, getStepStartSimTime } from './steps.js';

// Velocidad mínima y máxima en la curva (inicio/fin del paso → mitad del paso)
const BELL_MIN = 0.5;
const BELL_MAX = 80;

let state = {
    simTime: new Date(STEP_START_TIME),
    currentStepIdx: -1,
    stepProgress: 0,       // 0..1 progreso lineal en tiempo real
    stepElapsedReal: 0,    // ms reales consumidos en el paso actual
    running: false,
    rafId: null,
    lastTs: null,
    onTick: null,
    onStepComplete: null,
};

/**
 * Curva de campana logarítmica.
 * t=0 → BELL_MIN, t=0.5 → BELL_MAX, t=1 → BELL_MIN
 */
function logBell(t) {
    const bell = Math.sin(Math.PI * Math.max(0, Math.min(1, t))) ** 2;
    const logMin = Math.log10(BELL_MIN);
    const logMax = Math.log10(BELL_MAX);
    return Math.pow(10, logMin + (logMax - logMin) * bell);
}

export function initPlayback({ onTick, onStepComplete }) {
    state.simTime        = new Date(STEP_START_TIME);
    state.currentStepIdx = -1;
    state.stepProgress   = 0;
    state.stepElapsedReal = 0;
    state.running        = false;
    state.onTick         = onTick;
    state.onStepComplete = onStepComplete;
    if (state.rafId) cancelAnimationFrame(state.rafId);
    state.rafId = null;
}

/**
 * Inicia la reproducción del paso `stepIdx`.
 * Avanza el progreso linealmente en tiempo real mientras el reloj
 * de simulación sigue la curva de campana logarítmica.
 */
export function startStep(stepIdx) {
    const step = STEPS[stepIdx];
    if (!step) return;

    // Snap sim time al inicio exacto del paso
    state.simTime        = getStepStartSimTime(stepIdx);
    state.currentStepIdx = stepIdx;
    state.stepProgress   = 0;
    state.stepElapsedReal = 0;
    state.running        = true;
    state.lastTs         = null;

    rafLoop();
}

export function cancelStep() {
    state.running = false;
    if (state.rafId) { cancelAnimationFrame(state.rafId); state.rafId = null; }
}

export function getSimTime()    { return new Date(state.simTime); }
export function getProgress()   { return state.stepProgress; }
export function getCurrentStepIdx() { return state.currentStepIdx; }
export function isRunning()     { return state.running; }

// Salta directamente a un paso sin animación
export function jumpToStep(stepIdx) {
    cancelStep();
    state.simTime        = getStepStartSimTime(stepIdx);
    state.currentStepIdx = stepIdx - 1; // el caller llama startStep(stepIdx)
    state.stepProgress   = 0;
    state.stepElapsedReal = 0;
}

function rafLoop() {
    if (!state.running) return;
    state.rafId = requestAnimationFrame(ts => {
        const realDelta = ts - (state.lastTs ?? ts);
        state.lastTs = ts;

        const step = STEPS[state.currentStepIdx];
        if (!step) { state.running = false; return; }

        // Progreso lineal en tiempo real (0 → 1)
        state.stepElapsedReal = Math.min(step.realDurationMs, state.stepElapsedReal + realDelta);
        state.stepProgress    = state.stepElapsedReal / step.realDurationMs;

        // Reloj de simulación sigue la campana logarítmica
        const speed       = logBell(state.stepProgress);
        const simDeltaMs  = realDelta * speed;
        state.simTime     = new Date(state.simTime.getTime() + simDeltaMs);

        if (state.onTick) state.onTick(state.simTime, state.stepProgress, speed);

        if (state.stepProgress >= 1) {
            state.running = false;
            if (state.onStepComplete) state.onStepComplete(state.currentStepIdx);
            return;
        }

        if (state.running) rafLoop();
    });
}

export { STEPS };
