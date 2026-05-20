// cloudRunPanel.js — visualización de escalado Cloud Run en tiempo real

let containerEl   = null;
let instances     = 0;
let scaleHistory  = [];
let instanceCpus  = [];
let instanceMems  = [];
let cpuRafId      = null;
let currentStepId = -1;

// CPU objetivo por paso (por instancia)
const STEP_CPU_TARGETS = {
    0: [38],
    1: [88, 72],
    2: [56, 41],
    3: [52, 38],
    4: [62, 47],
    5: [54, 42],
    6: [68, 52],
    7: [60, 46],
    8: [14, 9],
};

export function initCloudRunPanel(containerId) {
    containerEl = document.getElementById(containerId);
    render();
}

export function setCloudRunInstances(n, label, simTimeStr) {
    const prev = instances;
    instances  = n;

    // Reset CPU per new instance count
    instanceCpus = Array.from({ length: n }, (_, i) =>
        n === 1 ? [35] : i === 0 ? [50, 60][0] : [35]
    );
    instanceMems = Array.from({ length: n }, () => 30 + Math.random() * 20);

    if (label) {
        scaleHistory.push({ from: prev, to: n, label, time: simTimeStr || '—' });
        if (scaleHistory.length > 4) scaleHistory.shift();
    }
    render();
    if (n > prev) flashScale('#34d399');
    else if (n < prev) flashScale('#ef4444');
}

export function setStepCpuTarget(stepId) {
    currentStepId = stepId;
    tickCpu();
}

function tickCpu() {
    if (cpuRafId) return; // ya corriendo
    function loop() {
        const targets = STEP_CPU_TARGETS[currentStepId] ?? [40];
        instanceCpus = instanceCpus.map((cpu, i) => {
            const target = targets[Math.min(i, targets.length - 1)];
            const next = cpu + (target - cpu) * 0.06 + (Math.random() - 0.5) * 4;
            return Math.max(2, Math.min(99, next));
        });
        instanceMems = instanceMems.map(m => Math.max(20, Math.min(90, m + (Math.random() - 0.5) * 2)));
        render();
        cpuRafId = requestAnimationFrame(loop);
    }
    cpuRafId = requestAnimationFrame(loop);
}

export function stopCpuTick() {
    if (cpuRafId) { cancelAnimationFrame(cpuRafId); cpuRafId = null; }
}

export function resetPanel() {
    stopCpuTick();
    instances     = 0;
    scaleHistory  = [];
    instanceCpus  = [];
    instanceMems  = [];
    currentStepId = -1;
    render();
}

function render() {
    if (!containerEl) return;

    const instHTML = instances === 0
        ? `<div class="cr-idle">⏸ scaled to zero — minScale=0</div>`
        : instanceCpus.map((cpu, i) => {
            const cpuPct = Math.min(99, Math.max(1, cpu));
            const memPct = Math.min(99, Math.max(1, instanceMems[i] ?? 30));
            const cpuColor = cpuPct > 80 ? '#ef4444' : cpuPct > 60 ? '#f59e0b' : '#34d399';
            const memColor = '#818cf8';
            return `
        <div class="cr-instance" id="cr-inst-${i}">
          <div class="cr-inst-badge">inst-${i + 1}</div>
          <div class="cr-bars">
            <div class="cr-bar-row">
              <span class="cr-bar-lbl">CPU</span>
              <div class="cr-bar-track"><div class="cr-bar-fill" style="width:${cpuPct.toFixed(0)}%;background:${cpuColor}"></div></div>
              <span class="cr-bar-val" style="color:${cpuColor}">${cpuPct.toFixed(0)}%</span>
            </div>
            <div class="cr-bar-row">
              <span class="cr-bar-lbl">MEM</span>
              <div class="cr-bar-track"><div class="cr-bar-fill" style="width:${memPct.toFixed(0)}%;background:${memColor}"></div></div>
              <span class="cr-bar-val" style="color:${memColor}">${memPct.toFixed(0)}%</span>
            </div>
          </div>
        </div>`;
        }).join('');

    const histHTML = scaleHistory.length
        ? scaleHistory.map(h => `<span class="cr-hist-pill" style="color:${h.to > h.from ? '#34d399' : '#94a3b8'}">${h.label || h.from+'→'+h.to}</span>`).join('')
        : '';

    containerEl.innerHTML = `
    <div class="cr-panel-header">
      <span class="cr-service-name">🛡️ exam-server</span>
      <span class="cr-inst-badge-main ${instances === 0 ? 'cr-zero' : 'cr-active'}">${instances} inst${instances !== 1 ? 's' : ''}</span>
    </div>
    ${instHTML}
    ${histHTML ? `<div class="cr-history">${histHTML}</div>` : ''}`;
}

function flashScale(color) {
    if (!containerEl) return;
    containerEl.style.boxShadow = `0 0 20px ${color}88`;
    containerEl.style.borderColor = color;
    setTimeout(() => {
        if (containerEl) {
            containerEl.style.boxShadow = '';
            containerEl.style.borderColor = '';
        }
    }, 800);
}
