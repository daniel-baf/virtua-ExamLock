// costs.js — módulo principal del tab de costos GCP

import { buildBarChart, buildStackedBarChart, buildDonutChart, buildSensitivityTable } from './charts.js';
import { initBudgetSimulator } from './budgetSimulator.js';

const SCENARIOS = [
    { students: 10,   total: 0.58,  egress: 0.47,  cr: 0.10, fsGcs: 0.01 },
    { students: 45,   total: 2.60,  egress: 2.13,  cr: 0.44, fsGcs: 0.04 },
    { students: 100,  total: 5.77,  egress: 4.74,  cr: 0.96, fsGcs: 0.07 },
    { students: 200,  total: 11.53, egress: 9.48,  cr: 1.91, fsGcs: 0.14 },
    { students: 300,  total: 17.29, egress: 14.22, cr: 2.86, fsGcs: 0.21 },
    { students: 500,  total: 28.81, egress: 23.69, cr: 4.77, fsGcs: 0.35 },
    { students: 750,  total: 43.22, egress: 35.54, cr: 7.15, fsGcs: 0.53 },
    { students: 1000, total: 57.62, egress: 47.39, cr: 9.53, fsGcs: 0.70 },
];

const SENSITIVITY_MODES = [
    { label: '480p/5s',        kbFrame: 41,  intervalS: 5, gib2h: 0.056, egress2h: 0.007, total2h: 0.017 },
    { label: '480p/2s',        kbFrame: 41,  intervalS: 2, gib2h: 0.141, egress2h: 0.017, total2h: 0.027 },
    { label: '720p/2s (base)', kbFrame: 115, intervalS: 2, gib2h: 0.395, egress2h: 0.047, total2h: 0.058 },
    { label: '720p/1s',        kbFrame: 115, intervalS: 1, gib2h: 0.790, egress2h: 0.095, total2h: 0.105 },
    { label: '1080p/2s',       kbFrame: 225, intervalS: 2, gib2h: 0.772, egress2h: 0.093, total2h: 0.103 },
];

export function initCosts() {
    const root = document.getElementById('costs-root');
    if (!root) return;

    root.innerHTML = buildCostsHTML();

    // Render charts after DOM is ready
    requestAnimationFrame(() => {
        renderSlide16Charts();
        renderSlide17Charts();
        initBudgetSimulator();
    });

    // Re-render charts when costs tab is re-activated
    document.addEventListener('tab:activated', e => {
        if (e.detail?.tab === 'costs') {
            requestAnimationFrame(() => {
                renderSlide16Charts();
                renderSlide17Charts();
            });
        }
    });

    // Sticky nav scroll
    const nav = root.querySelector('.costs-nav');
    if (nav) {
        nav.querySelectorAll('.costs-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = document.getElementById(btn.dataset.target);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                nav.querySelectorAll('.costs-nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }
}

// ---- HTML builder ---- //

function buildCostsHTML() {
    return `
<nav class="costs-nav">
  <button class="costs-nav-btn active" data-target="costs-s16">Modelo de costos</button>
  <button class="costs-nav-btn" data-target="costs-s17">Sensibilidad</button>
  <button class="costs-nav-btn" data-target="costs-s18">Simulador de presupuesto</button>
  <button class="costs-nav-btn" data-target="costs-s19">Escenarios comparados</button>
</nav>

${buildSlide16()}
${buildSlide17()}
${buildSlide18()}
${buildSlide19()}
`;
}

// ---- Slide 16: modelo de costos ---- //

function buildSlide16() {
    return `
<section class="costs-slide" id="costs-s16">
  <div class="costs-slide-header">
    <div class="costs-slide-num">16</div>
    <div>
      <div class="costs-slide-title">Análisis de Costos GCP — Modelo</div>
      <div class="costs-slide-subtitle">Stack serverless: egreso del stream es el componente dominante</div>
    </div>
  </div>

  <div class="model-grid">
    <div>
      <table class="cost-breakdown-table">
        <thead><tr><th>Componente</th><th>Costo / alumno·examen 2h</th></tr></thead>
        <tbody>
          <tr><td>Egreso stream 720p/2s</td><td>$0.047</td></tr>
          <tr><td>Cloud Run CPU + RAM</td><td>$0.0095</td></tr>
          <tr><td>Firestore writes/reads</td><td>$0.0006</td></tr>
          <tr><td>GCS screenshots</td><td>~$0.0001</td></tr>
          <tr><td>Firebase Auth</td><td>$0.0000</td></tr>
          <tr class="total-row"><td><strong>Total variable</strong></td><td>~<strong>$0.058</strong></td></tr>
        </tbody>
      </table>

      <div style="margin-top:18px" class="exec-highlight">
        <span class="exec-icon">💡</span>
        <div class="exec-text">
          Costo fijo mensual: <strong>~$0 – $7</strong> con <code>minScale=0</code>.
          Sin examenes activos, no hay gasto Cloud Run.
          El costo variable por alumno-hora es <strong>~$0.029</strong>.
        </div>
      </div>
    </div>

    <div class="donut-wrap">
      <div id="donut-chart-16" class="chart-wrap" style="width:100%;text-align:center">
        <div class="chart-title">Distribución del costo variable</div>
        <!-- inyectado en JS -->
      </div>
      <div class="donut-caption">1 examen · 1 docente · 2h · 720p/2s</div>

      <div class="chart-wrap" style="margin-top:16px">
        <div class="chart-title">Costo por alumno-semestre</div>
        <div style="padding:8px 0;font-size:0.82rem;color:#94a3b8;line-height:1.8">
          5 cursos × 4 exámenes × 2h = <strong style="color:#00e5ff">$1.16</strong>/alumno·semestre<br>
          500 alumnos × $1.16 = <strong style="color:#34d399">$580</strong>/semestre<br>
          1 000 alumnos × $1.16 = <strong style="color:#4ade80">$1 160</strong>/semestre
        </div>
      </div>
    </div>
  </div>
</section>`;
}

// ---- Slide 17: sensibilidad ---- //

function buildSlide17() {
    return `
<section class="costs-slide" id="costs-s17">
  <div class="costs-slide-header">
    <div class="costs-slide-num">17</div>
    <div>
      <div class="costs-slide-title">Sensibilidad y Escenarios</div>
      <div class="costs-slide-subtitle">El costo escala casi linealmente con resolución, intervalo y número de alumnos</div>
    </div>
  </div>

  <div class="sensitivity-section">
    ${buildSensitivityTable(SENSITIVITY_MODES)}

    <div class="chart-wrap">
      <div class="chart-title">Costo total nube vs alumnos (2h · 720p/2s · 1 docente)</div>
      <div id="bar-chart-17"></div>
    </div>

    <div class="scenarios-grid">
      <div class="scenario-card">
        <h4>Escenario A — 45 alumnos, 2h</h4>
        <div class="scenario-stat"><span>Egreso stream</span><span class="sval">$2.13</span></div>
        <div class="scenario-stat"><span>Cloud Run</span><span class="sval">$0.43</span></div>
        <div class="scenario-stat"><span>Firestore</span><span class="sval">$0.03</span></div>
        <div class="scenario-stat"><span>GCS</span><span class="sval">$0.01</span></div>
        <div class="scenario-stat"><span><strong>Total</strong></span><span class="sval"><strong>$2.60</strong></span></div>
        <div class="scenario-stat"><span>Revenue @ $0.30/al·h</span><span class="sval green">$27.00</span></div>
        <div class="scenario-stat"><span>Margen bruto</span><span class="sval green">90%</span></div>
      </div>
      <div class="scenario-card">
        <h4>Escenario B — 500 alumnos, 2h</h4>
        <div class="scenario-stat"><span>Egreso stream</span><span class="sval">$23.69</span></div>
        <div class="scenario-stat"><span>Cloud Run</span><span class="sval">$4.76</span></div>
        <div class="scenario-stat"><span>Firestore</span><span class="sval">$0.30</span></div>
        <div class="scenario-stat"><span>GCS</span><span class="sval">$0.05</span></div>
        <div class="scenario-stat"><span><strong>Total</strong></span><span class="sval"><strong>$28.81</strong></span></div>
        <div class="scenario-stat"><span>Revenue @ $0.30/al·h</span><span class="sval green">$300.00</span></div>
        <div class="scenario-stat"><span>Margen bruto</span><span class="sval green">90%</span></div>
      </div>
    </div>
  </div>
</section>`;
}

// ---- Slide 18: budget simulator (link to presentation) ---- //

function buildSlide18() {
    const scenarioRows = [
        [45,   2, '$2.60',  '$27.00', '90%'],
        [100,  2, '$5.77',  '$60.00', '90%'],
        [300,  2, '$17.29', '$180.00','90%'],
        [500,  2, '$28.81', '$300.00','90%'],
        [1000, 2, '$57.62', '$600.00','90%'],
    ].map(([s, h, cost, rev, margin]) => `<tr>
        <td>${s} alumnos</td><td>${h}h</td>
        <td style="color:#00e5ff"><strong>${cost}</strong></td>
        <td style="color:#4ade80"><strong>${rev}</strong></td>
        <td style="color:#4ade80"><strong>${margin}</strong></td>
      </tr>`).join('');

    return `
<section class="costs-slide" id="costs-s18">
  <div class="costs-slide-header">
    <div class="costs-slide-num">18</div>
    <div>
      <div class="costs-slide-title">Simulador de Presupuesto Interactivo</div>
      <div class="costs-slide-subtitle">Cálculo en vivo — disponible en la pestaña Presentación (slide 18)</div>
    </div>
  </div>

  <div class="exec-highlight" style="margin-bottom:20px">
    <span class="exec-icon">🧮</span>
    <div class="exec-text">
      <strong>Fórmula:</strong><br>
      <code style="color:#34d399">costo = alumnos × horas × $0.029 + alumnos × horas × $0.024 × (docentes − 1)</code><br><br>
      El simulador interactivo con sliders en vivo está en la
      <a href="#" onclick="window.openPresentationSlide(17);return false;" style="color:#00e5ff;text-decoration:underline">
        Presentación → Slide 18
      </a>.
    </div>
  </div>

  <table class="data-table" style="font-size:0.82rem;margin-bottom:20px">
    <thead><tr><th>Escenario</th><th>Duración</th><th>Costo nube</th><th>Ingresos @ $0.30/al·h</th><th>Margen</th></tr></thead>
    <tbody>${scenarioRows}</tbody>
  </table>

  <button class="btn btn-primary" onclick="window.openPresentationSlide(17)">
    Abrir simulador interactivo →
  </button>
</section>`;
}

// ---- Slide 19: comparative scenarios ---- //

function buildSlide19() {
    return `
<section class="costs-slide" id="costs-s19">
  <div class="costs-slide-header">
    <div class="costs-slide-num">19</div>
    <div>
      <div class="costs-slide-title">Escenarios Comparados — Hasta 1 000 alumnos</div>
      <div class="costs-slide-subtitle">El costo por alumno permanece constante: $0.058/examen 2h</div>
    </div>
  </div>

  <div class="chart-wrap" style="margin-bottom:20px">
    <div class="chart-title">Desglose apilado (Egreso / Cloud Run / FS+GCS)</div>
    <div id="stacked-chart-19"></div>
  </div>

  <table class="data-table" style="font-size:0.8rem">
    <thead><tr>
      <th>Alumnos</th><th>Egreso</th><th>Cloud Run</th><th>FS+GCS</th>
      <th>Total</th><th>$/alumno</th><th>$/al·hora</th>
    </tr></thead>
    <tbody>
      ${SCENARIOS.map(s => `<tr>
        <td>${s.students}</td>
        <td>$${s.egress.toFixed(2)}</td>
        <td>$${s.cr.toFixed(2)}</td>
        <td>$${s.fsGcs.toFixed(2)}</td>
        <td><strong style="color:#00e5ff">$${s.total.toFixed(2)}</strong></td>
        <td>$0.058</td>
        <td>$0.029</td>
      </tr>`).join('')}
    </tbody>
  </table>

  <div class="exec-highlight" style="margin-top:20px">
    <span class="exec-icon">📊</span>
    <div class="exec-text">
      El egreso del stream representa <strong>~82% del costo variable directo</strong>.
      A precio de <strong>$0.30/alumno·hora</strong>, el margen bruto es <strong>90%</strong>
      en todos los escenarios — independiente del tamaño del grupo.
    </div>
  </div>
</section>`;
}

// ---- Chart renderers ---- //

function renderSlide16Charts() {
    const el = document.getElementById('donut-chart-16');
    if (!el || el.dataset.rendered) return;
    el.dataset.rendered = '1';

    const slices = [
        { label: 'Egreso stream', value: 82, color: '#00e5ff' },
        { label: 'Cloud Run',     value: 16, color: '#818cf8' },
        { label: 'FS + GCS',      value:  2, color: '#34d399' },
    ];
    const svg = buildDonutChart(slices, { r: 60, cx: 75, cy: 70, w: 240, h: 145 });
    el.innerHTML += svg;
}

function renderSlide17Charts() {
    const bar17 = document.getElementById('bar-chart-17');
    if (bar17 && !bar17.dataset.rendered) {
        bar17.dataset.rendered = '1';
        bar17.innerHTML = buildBarChart({
            labels: SCENARIOS.map(s => `${s.students}`),
            values: SCENARIOS.map(s => s.total),
            color: '#00e5ff',
            w: 620, h: 200,
            yLabel: 'USD',
            yFmt: v => v < 10 ? `$${v.toFixed(1)}` : `$${v.toFixed(0)}`,
        });
    }

    const stacked = document.getElementById('stacked-chart-19');
    if (stacked && !stacked.dataset.rendered) {
        stacked.dataset.rendered = '1';
        stacked.innerHTML = buildStackedBarChart({
            labels:       SCENARIOS.map(s => `${s.students}`),
            seriesEgress: SCENARIOS.map(s => s.egress),
            seriesCR:     SCENARIOS.map(s => s.cr),
            seriesOther:  SCENARIOS.map(s => s.fsGcs),
            w: 620, h: 220,
        });
    }
}
