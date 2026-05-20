// presentation.js — navegación de slides, sidebar, atajos de teclado

import { getSlides }       from './slides.js';
import { initFlowAnimator, nextFlowStep, prevFlowStep, isFlowAtEnd, isFlowAtStart } from './flowAnimator.js';
import { switchTab }       from '../js/core/tabs.js';

let currentSlide = 0;
let slides = [];
let sidebarOpen = false;

export function initPresentation() {
    const container = document.getElementById('presentation-container');
    if (!container) return;

    slides = getSlides();

    // Render all slides
    slides.forEach((html, i) => {
        const div = document.createElement('div');
        div.className = 'slide' + (i === 0 ? ' active' : '');
        div.id = `slide-${i + 1}`;
        div.innerHTML = html;
        container.appendChild(div);
    });

    // Build progress dots
    buildDots();
    buildSidebar();
    bindNavButtons();
    bindKeyboard();
    bindSidebarToggle();

    // Init flow animator when slide 5 becomes active
    checkFlowInit();

    // Update counter
    updateCounter();
}

function goTo(idx) {
    if (idx < 0 || idx >= slides.length) return;
    document.querySelectorAll('.slide').forEach((s, i) => {
        s.classList.toggle('active', i === idx);
    });
    currentSlide = idx;
    updateDots();
    updateCounter();
    updateSidebar();

    if (idx === 4) { // Slide 5 (0-indexed 4) — flow animator
        setTimeout(() => initFlowAnimator(), 100);
    }
    if (idx === 16) { // Slide 17 — sensitivity chart
        setTimeout(() => window.s17SelectMode?.(2), 100);
    }
    if (idx === 17) { // Slide 18 — budget simulator
        setTimeout(() => window.budgetSliderUpdate?.(), 100);
    }
}

function buildDots() {
    const dots = document.getElementById('nav-dots');
    if (!dots) return;
    dots.innerHTML = '';
    slides.forEach((_, i) => {
        const d = document.createElement('div');
        d.className = 'progress-dot' + (i === 0 ? ' active' : '');
        d.setAttribute('role', 'listitem');
        d.setAttribute('aria-label', `Slide ${i + 1}`);
        d.addEventListener('click', () => goTo(i));
        dots.appendChild(d);
    });
}

function buildSidebar() {
    const list = document.getElementById('sidebar-list');
    if (!list) return;
    const titles = [
        'Portada', 'Planteamiento del Problema', 'Enfoque de la Solución', 'Arquitectura Propuesta',
        'Flujo de Ejecución (Animado)', 'Demostración en Vivo', 'Modos de Despliegue',
        'Hardening del SO', 'Control de Red', 'Monitoreo y Proctoring',
        'Auditoría de Teclado con IA', 'Metodología Pentesting', 'Dashboard Docente',
        'Vectores Residuales', 'Ciclo de Vida del Examen',
        'Análisis de Costos GCP', 'Sensibilidad y Escenarios', 'Simulador de Presupuesto',
        'Valor Estratégico', 'Conclusiones'
    ];
    titles.forEach((t, i) => {
        const li = document.createElement('li');
        li.className = 'sidebar-item' + (i === 0 ? ' active' : '');
        li.textContent = `${String(i + 1).padStart(2, '0')}. ${t}`;
        li.addEventListener('click', () => { goTo(i); closeSidebar(); });
        list.appendChild(li);
    });
}

function updateDots() {
    document.querySelectorAll('.progress-dot').forEach((d, i) => {
        d.classList.toggle('active', i === currentSlide);
    });
}

function updateCounter() {
    const el = document.getElementById('slide-counter');
    if (el) el.textContent = `${currentSlide + 1} / ${slides.length}`;
}

function updateSidebar() {
    document.querySelectorAll('.sidebar-item').forEach((el, i) => {
        el.classList.toggle('active', i === currentSlide);
    });
}

function bindNavButtons() {
    document.getElementById('btn-prev')?.addEventListener('click', () => goTo(currentSlide - 1));
    document.getElementById('btn-next')?.addEventListener('click', () => goTo(currentSlide + 1));
}

function bindSidebarToggle() {
    document.getElementById('btn-sidebar-toggle')?.addEventListener('click', toggleSidebar);
    document.querySelector('.presentation-viewport')?.addEventListener('click', (e) => {
        if (sidebarOpen && !e.target.closest('.sidebar') && !e.target.closest('#btn-sidebar-toggle')) {
            closeSidebar();
        }
    });
}

function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
    document.getElementById('sidebar')?.classList.toggle('open', sidebarOpen);
}

function closeSidebar() {
    sidebarOpen = false;
    document.getElementById('sidebar')?.classList.remove('open');
}

function bindKeyboard() {
    document.addEventListener('keydown', e => {
        // Only when presentation tab is active
        if (!document.getElementById('tab-presentation')?.classList.contains('active')) return;

        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                if (currentSlide === 4 && !isFlowAtEnd()) { nextFlowStep(); }
                else goTo(currentSlide + 1);
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                if (currentSlide === 4 && !isFlowAtStart()) { prevFlowStep(); }
                else goTo(currentSlide - 1);
                break;
            case 'f':
            case 'F':
                toggleSidebar();
                break;
            case 'Escape':
                closeSidebar();
                break;
        }
    });
}

function checkFlowInit() {
    if (currentSlide === 4) initFlowAnimator();
}

// Expose for inline onclick handlers in slide HTML
window.nextFlowStep = nextFlowStep;
window.prevFlowStep = prevFlowStep;
window.openSimTab = () => switchTab('simulator');
window.openCostsTab = () => switchTab('costs');
window.openPresentationSlide = (idx) => { switchTab('presentation'); goTo(idx); };

// Slide 17 — sensitivity chart
const S17_MODES = [
    { label: '480p / 5s',   total: 0.017 },
    { label: '480p / 2s',   total: 0.027 },
    { label: '720p / 2s',   total: 0.058 },
    { label: '720p / 1s',   total: 0.105 },
    { label: '1080p / 2s',  total: 0.103 },
];
const S17_STUDENTS = [10, 45, 100, 200, 500, 1000];
const S17_BAR_XS   = [49, 81, 113, 145, 177, 209]; // bar center x
const S17_BAR_X0   = [38, 70, 102, 134, 166, 198]; // bar left x
const S17_BASELINE = 120;
const S17_MAX_H    = 100;

window.s17SelectMode = function(modeIdx) {
    const mode = S17_MODES[modeIdx];
    if (!mode) return;

    const costs = S17_STUDENTS.map(s => parseFloat((s * mode.total).toFixed(2)));
    const maxCost = Math.max(...costs);

    costs.forEach((cost, i) => {
        const h = Math.max(1, Math.round((cost / maxCost) * S17_MAX_H));
        const y = S17_BASELINE - h;
        const ratio = cost / maxCost;
        const color = ratio < 0.35 ? '#06b6d4' : ratio < 0.7 ? '#8b5cf6' : '#f59e0b';

        const bar = document.getElementById('s17-bar-' + i);
        if (bar) { bar.setAttribute('y', y); bar.setAttribute('height', h); bar.setAttribute('fill', color); }

        const lbl = document.getElementById('s17-lbl-' + i);
        if (lbl) {
            const lblY = h > 12 ? y - 2 : y - 3;
            lbl.setAttribute('y', lblY);
            lbl.textContent = '$' + cost.toFixed(2);
        }
    });

    // Y-axis labels: evenly spaced at 100%, 66%, 33%, 10% of max
    const yStops = [maxCost, maxCost * 0.66, maxCost * 0.33, maxCost * 0.1];
    yStops.forEach((v, i) => {
        const el = document.getElementById('s17-y-' + i);
        if (el) el.textContent = '$' + (v >= 10 ? Math.round(v) : v.toFixed(1));
    });

    // Chart title
    const title = document.getElementById('s17-chart-title');
    if (title) title.textContent = 'ESCENARIOS POR NÚMERO DE ALUMNOS (2h · ' + mode.label + ' · 1 docente)';

    // Scenario box
    const scen = document.getElementById('s17-scenario');
    const c45  = (45  * mode.total).toFixed(2);
    const c500 = (500 * mode.total).toFixed(2);
    if (scen) scen.innerHTML =
        '<b>Escenario A (45 alumnos, 2h):</b> <span style="color:white">$' + c45 + '</span> · ' +
        '<b>Escenario B (500 alumnos, 2h):</b> <span style="color:white">$' + c500 + '</span>';

    // Highlight active row
    S17_MODES.forEach((_, j) => {
        const row = document.getElementById('s17-row-' + j);
        if (row) row.classList.toggle('highlight-row', j === modeIdx);
    });
};

const COST_DETAILS = [
    // Card 0 — Costo fijo mensual
    `<div class="grid-2" style="gap:1rem;width:100%">
      <div class="code-block" style="font-size:0.78rem;line-height:1.8">
Cloud Run server:    <b style="color:var(--emerald)">$0.00/mes</b>  (minScale=0, no cobra sin tráfico)<br>
Cloud Run dashboard: <b style="color:var(--emerald)">$0.00/mes</b>  (minScale=0)<br>
Firestore:           <b style="color:var(--emerald)">$0.00/mes</b>  (dentro del free tier diario sin carga)<br>
GCS screenshots:     <b style="color:var(--amber)">~$0–$1/mes</b>   (retención 90 días)<br>
Cloud Build:         <b style="color:var(--amber)">~$0–$5/mes</b>   (según frecuencia de builds)<br>
<span style="color:var(--border)">────────────────────────────────────────────</span><br>
Total fijo esperado: <b style="color:white">~$0–$7/mes</b>
      </div>
      <div class="highlight-box" style="font-size:0.78rem;line-height:1.8">
        <div style="color:var(--amber);font-family:var(--font-mono);font-size:0.72rem;margin-bottom:0.5rem">Si se activa minScale=1 (instancia caliente):</div>
        <div style="font-family:var(--font-mono);color:var(--text-2)">
          CPU:  1 vCPU × 2,592,000s × $0.000024 = <b style="color:white">$62.21/mes</b><br>
          RAM:  0.5 GiB × 2,592,000s × $0.0000025 = <b style="color:white">$3.24/mes</b><br>
          <span style="color:var(--border)">─────────────────────────────────</span><br>
          Total: <b style="color:var(--amber)">~+$65/mes</b>
        </div>
        <div style="font-size:0.72rem;color:var(--text-3);margin-top:0.6rem">Recomendado solo si se necesita eliminar cold starts</div>
      </div>
    </div>`,

    // Card 1 — $0.058 por alumno · examen 2h
    `<div class="grid-2" style="gap:1rem;width:100%">
      <div class="code-block" style="font-size:0.75rem;line-height:1.9">
<b style="color:var(--cyan)">Egreso stream</b> (720p/2s, 1 docente):<br>
  115 KB/frame × 0.5 fps × 7200s = 0.395 GiB<br>
  0.395 GiB × $0.12/GiB = <b style="color:var(--cyan)">$0.047</b>  (81%)<br>
<br>
<b style="color:var(--purple)">Cloud Run</b>:<br>
  CPU: 0.05 vCPU × 7200s × $0.000024 = $0.00864<br>
  RAM: 0.0488 GiB × 7200s × $0.0000025 = $0.00088<br>
  subtotal = <b style="color:var(--purple)">$0.0095</b>  (16%)<br>
<br>
<b style="color:var(--amber)">Firestore</b>:<br>
  505 writes / 100k × $0.09 = $0.00045<br>
  480 reads  / 100k × $0.03 = $0.00014<br>
  subtotal = <b style="color:var(--amber)">$0.0006</b>  (1%)<br>
<br>
GCS screenshots:  <b>$0.0001</b>  (&lt;1%)<br>
Firebase Auth:    <b>$0.00</b><br>
<span style="color:var(--border)">────────────────────────────────────</span><br>
Total variable:   <b style="color:white">~$0.058 / alumno · examen</b>
      </div>
      <div class="highlight-box" style="font-size:0.78rem">
        <div style="color:var(--text-2);font-family:var(--font-mono);font-size:0.72rem;margin-bottom:0.5rem">Fuentes de los supuestos:</div>
        <div style="font-size:0.75rem;color:var(--text-2);line-height:1.7">
          • Frame 720p q70: <span class="mono">115 KB</span> medido<br>
          • Intervalo default: <span class="mono">2000ms</span> → <span class="mono">monitoringConfig.js</span><br>
          • Transporte: <span class="mono">Buffer binario</span> (sin overhead base64)<br>
          • Egreso: <span class="mono">$0.12/GiB</span> Premium Tier NA
        </div>
        <div style="margin-top:0.8rem;font-size:0.75rem;color:var(--text-2)">Con free tier el primer examen del mes baja a <b style="color:white">~$0.048</b></div>
      </div>
    </div>`,

    // Card 2 — $1.16 por alumno · semestre
    `<div class="grid-2" style="gap:1rem;width:100%">
      <div class="code-block" style="font-size:0.78rem;line-height:1.9">
<b style="color:var(--text-2)">Supuesto académico:</b><br>
  5 cursos / semestre<br>
  × 4 exámenes / curso<br>
  = <b style="color:white">20 exámenes / semestre</b><br>
  × 2h / examen = 40 alumno-horas<br>
<br>
<b style="color:var(--text-2)">Cálculo:</b><br>
  20 exámenes × $0.058       = <b style="color:var(--purple)">$1.16</b><br>
  40 horas    × $0.029/h     = <b style="color:var(--purple)">$1.16</b>
      </div>
      <div class="highlight-box" style="font-size:0.78rem">
        <div style="color:var(--text-2);font-family:var(--font-mono);font-size:0.72rem;margin-bottom:0.5rem">Escala por universidad:</div>
        <table class="data-table" style="font-size:0.75rem">
          <thead><tr><th>Alumnos/semestre</th><th class="num">Costo variable</th></tr></thead>
          <tbody>
            <tr><td>100</td><td class="num">~$116</td></tr>
            <tr><td>500</td><td class="num">~$580</td></tr>
            <tr class="highlight-row"><td>1,000</td><td class="num">~$1,160</td></tr>
            <tr><td>5,000</td><td class="num">~$5,800</td></tr>
          </tbody>
        </table>
        <div style="font-size:0.7rem;color:var(--text-3);margin-top:0.5rem">No incluye costo fijo mensual ni infraestructura adicional para &gt;200 alumnos simultáneos</div>
      </div>
    </div>`,
];

let _selectedCostCard = -1;

window.selectCostCard = function(idx) {
    if (_selectedCostCard === idx) {
        // Deselect — show default panel
        _selectedCostCard = -1;
        document.querySelectorAll('.cost-kpi-card').forEach(c => {
            c.style.outline = '';
            c.style.transform = '';
        });
        const detail = document.getElementById('cost-detail-panel');
        const def = document.getElementById('cost-default-panel');
        if (detail) detail.style.display = 'none';
        if (def) def.style.display = '';
        return;
    }
    _selectedCostCard = idx;
    const colors = ['#10b981', '#06b6d4', '#8b5cf6'];
    document.querySelectorAll('.cost-kpi-card').forEach((c, i) => {
        c.style.outline = i === idx ? `2px solid ${colors[idx]}` : '';
        c.style.transform = i === idx ? 'scale(1.03)' : '';
    });
    const detail = document.getElementById('cost-detail-panel');
    const def = document.getElementById('cost-default-panel');
    if (detail) { detail.innerHTML = COST_DETAILS[idx]; detail.style.display = 'block'; }
    if (def) def.style.display = 'none';
};
