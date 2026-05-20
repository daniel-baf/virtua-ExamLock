// budgetSimulator.js — sliders interactivos de presupuesto (slide 18)

import { calcExamCost, calcMargin, modeToParams, FRAME_KB, INTERVAL_S } from './costModel.js';

const MODES = ['480p/5s', '480p/2s', '720p/2s', '720p/1s', '1080p/2s'];

let _initialized = false;

export function initBudgetSimulator() {
    if (_initialized) return;
    _initialized = true;

    // Expose global for slides.js inline onchange handlers
    window.budgetSliderUpdate = update;
    window.budgetApplyToSim  = applyToSim;

    // Bind inputs once DOM has slide 18
    bindInputs();
    update();
}

function bindInputs() {
    const ids = ['bs-students', 'bs-hours', 'bs-interval-idx', 'bs-interval', 'bs-teachers', 'bs-price'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => update());
        }
    });
}

function getParams() {
    const students  = parseInt(document.getElementById('bs-students')?.value   ?? 45);
    const hours     = parseFloat(document.getElementById('bs-hours')?.value    ?? 2);
    const teachers  = parseInt(document.getElementById('bs-teachers')?.value   ?? 1);
    const price     = parseFloat(document.getElementById('bs-price')?.value    ?? 0.30);

    // Two sources: index-based (costs tab) or direct seconds (presentation slide 18)
    let kbFrame = 115, intervalS = 2, mode = '720p/2s';
    const idxEl  = document.getElementById('bs-interval-idx');
    const directEl = document.getElementById('bs-interval');
    if (idxEl) {
        const modeIdx = parseInt(idxEl.value ?? 2);
        mode = MODES[modeIdx] ?? '720p/2s';
        ({ kbFrame, intervalS } = modeToParams(mode));
    } else if (directEl) {
        intervalS = parseInt(directEl.value ?? 2);
        // Map direct interval → closest mode (720p assumed)
        mode = intervalS <= 1 ? '720p/1s' : '720p/2s';
        kbFrame = 115;
    }

    return { students, hours, kbFrame, intervalS, teachers, price, mode };
}

export function update() {
    const { students, hours, kbFrame, intervalS, teachers, price, mode } = getParams();
    const result = calcExamCost({ students, kbFrame, intervalS, hours, teachers });
    const marg   = calcMargin({ totalCost: result.total, students, hours, pricePerStudentHour: price });

    setVal('bs-total',      `$${result.total.toFixed(2)}`);
    setVal('bs-egress',     `$${result.egress.toFixed(2)}`);
    setVal('bs-cr',         `$${result.cr.toFixed(2)}`);
    setVal('bs-fs',         `$${result.fs.toFixed(2)}`);
    setVal('bs-per-s',      `$${result.perStudent.toFixed(4)}`);
    setVal('bs-per-sh',     `$${result.perStudentHour.toFixed(4)}`);
    setVal('bs-revenue',    `$${marg.revenue.toFixed(2)}`);
    setVal('bs-margin',     `${marg.marginPct.toFixed(1)}%`);   // slides.js shows %
    setVal('bs-margin-pct', `${marg.marginPct.toFixed(1)}%`);
    setVal('bs-mode-label', mode);
    // aliases used by slides.js
    setVal('bs-per-student', `$${result.perStudent.toFixed(3)} por alumno`);

    // Update slider display labels (costs tab)
    setLabel('bs-students-lbl',  `${students} alumnos`);
    setLabel('bs-hours-lbl',     `${hours}h`);
    setLabel('bs-teachers-lbl',  `${teachers} docente${teachers > 1 ? 's' : ''}`);
    setLabel('bs-price-lbl',     `$${price.toFixed(2)}/al·h`);
    setLabel('bs-interval-lbl',  mode);
    // aliases used by slides.js
    setLabel('bs-val-students',  `${students}`);
    setLabel('bs-val-hours',     `${hours} horas`);
    setLabel('bs-val-interval',  `${intervalS}s`);
    setLabel('bs-val-teachers',  `${teachers}`);

    // Color margin
    const marginEl = document.getElementById('bs-margin-pct');
    if (marginEl) {
        marginEl.style.color = marg.marginPct >= 80 ? '#34d399' : marg.marginPct >= 50 ? '#fbbf24' : '#f87171';
    }

    // Egress dominance bar
    const egressFrac = result.total > 0 ? result.egress / result.total : 0;
    const barEl = document.getElementById('bs-egress-bar');
    if (barEl) barEl.style.width = `${(egressFrac * 100).toFixed(0)}%`;

    // Emit for live chart update
    document.dispatchEvent(new CustomEvent('budget:updated', { detail: { result, marg, params: getParams() } }));
}

function setVal(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function setLabel(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function applyToSim() {
    const { students, hours, mode } = getParams();
    // Switch to simulator tab
    document.querySelector('[data-tab="simulator"]')?.click();
    // Emit event for simulator to adjust its config display
    document.dispatchEvent(new CustomEvent('budget:applyToSim', { detail: { students, hours, mode } }));
}

export function buildBudgetSimulatorHTML() {
    const modeOpts = MODES.map((m, i) =>
        `<option value="${i}"${i === 2 ? ' selected' : ''}>${m}</option>`
    ).join('');

    return `
<div class="budget-sim-wrap">
  <div class="budget-controls">
    <div class="bs-slider-group">
      <label>Alumnos <span id="bs-students-lbl" class="bs-val">45 alumnos</span></label>
      <input type="range" id="bs-students" min="1" max="500" value="45" step="1">
    </div>
    <div class="bs-slider-group">
      <label>Duración <span id="bs-hours-lbl" class="bs-val">2h</span></label>
      <input type="range" id="bs-hours" min="0.5" max="8" value="2" step="0.5">
    </div>
    <div class="bs-slider-group">
      <label>Resolución/Intervalo <span id="bs-interval-lbl" class="bs-val">720p/2s</span></label>
      <input type="range" id="bs-interval-idx" min="0" max="4" value="2" step="1">
    </div>
    <div class="bs-slider-group">
      <label>Docentes <span id="bs-teachers-lbl" class="bs-val">1 docente</span></label>
      <input type="range" id="bs-teachers" min="1" max="5" value="1" step="1">
    </div>
    <div class="bs-slider-group">
      <label>Precio venta <span id="bs-price-lbl" class="bs-val">$0.30/al·h</span></label>
      <input type="range" id="bs-price" min="0.05" max="1.00" value="0.30" step="0.05">
    </div>
  </div>

  <div class="budget-results">
    <div class="bs-result-primary">
      <div class="bs-big-num" id="bs-total">$2.60</div>
      <div class="bs-big-label">Costo total nube</div>
    </div>
    <div class="bs-result-grid">
      <div class="bs-metric">
        <span class="bs-metric-val egress-color" id="bs-egress">$2.13</span>
        <span class="bs-metric-lbl">Egreso stream</span>
      </div>
      <div class="bs-metric">
        <span class="bs-metric-val cr-color" id="bs-cr">$0.44</span>
        <span class="bs-metric-lbl">Cloud Run</span>
      </div>
      <div class="bs-metric">
        <span class="bs-metric-val fs-color" id="bs-fs">$0.04</span>
        <span class="bs-metric-lbl">Firestore+GCS</span>
      </div>
      <div class="bs-metric">
        <span class="bs-metric-val" id="bs-per-s">$0.0580</span>
        <span class="bs-metric-lbl">Costo/alumno</span>
      </div>
      <div class="bs-metric">
        <span class="bs-metric-val" id="bs-per-sh">$0.0290</span>
        <span class="bs-metric-lbl">Costo/al·hora</span>
      </div>
      <div class="bs-metric">
        <span class="bs-metric-val success-color" id="bs-revenue">$27.00</span>
        <span class="bs-metric-lbl">Ingresos brutos</span>
      </div>
      <div class="bs-metric">
        <span class="bs-metric-val success-color" id="bs-margin">$24.40</span>
        <span class="bs-metric-lbl">Margen bruto</span>
      </div>
      <div class="bs-metric">
        <span class="bs-metric-val success-color" id="bs-margin-pct">90.0%</span>
        <span class="bs-metric-lbl">Margen %</span>
      </div>
    </div>

    <div class="bs-egress-dombar-wrap">
      <div class="bs-egress-dombar-label">Egreso = <strong>82%</strong> del costo variable</div>
      <div class="bs-egress-dombar-track">
        <div id="bs-egress-bar" class="bs-egress-dombar-fill" style="width:82%"></div>
      </div>
    </div>

    <div class="bs-formula">
      <code>costo = alumnos × horas × $0.029 + alumnos × horas × $0.024 × (docentes − 1)</code>
    </div>

    <button class="btn btn-primary" onclick="window.budgetApplyToSim()" style="margin-top:12px">
      Aplicar al simulador →
    </button>
  </div>
</div>`;
}
