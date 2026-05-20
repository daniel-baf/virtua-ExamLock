// networkCanvas.js — canvas radial de red, posicionamiento de nodos

let canvasEl = null;
let svgEl = null;
let cx = 0, cy = 0;
let canvasW = 0, canvasH = 0;
let students = [];
let popoverCb = null;

export function initNetworkCanvas(container, svgElement, studs, onHover) {
    canvasEl = container;
    svgEl    = svgElement;
    students = studs;
    popoverCb = onHover;
    measure();
}

function measure() {
    canvasW = canvasEl.clientWidth;
    canvasH = canvasEl.clientHeight;
    cx = canvasW / 2;
    cy = canvasH / 2;
}

export function getCenter() { return { cx, cy }; }

export function getStudentPosition(student) {
    measure();
    const minDim = Math.min(canvasW, canvasH);
    const r = minDim * student.radiusFactor;
    const sx = cx + r * Math.cos(student.angleRad);
    const sy = cy + r * Math.sin(student.angleRad) * 0.82; // slightly flat
    return { sx, sy };
}

export function positionInfraNodes() {
    measure();
    const fb  = document.getElementById('net-node-fb');
    const srv = document.getElementById('net-node-srv');
    const gcs = document.getElementById('net-node-gcs');
    if (!fb || !srv || !gcs) return;

    fb.style.left  = `${cx}px`; fb.style.top  = `${cy - 110}px`;
    srv.style.left = `${cx}px`; srv.style.top = `${cy}px`;
    gcs.style.left = `${cx}px`; gcs.style.top = `${cy + 110}px`;

    // Infra cables
    const c1 = document.getElementById('cable-srv-fb');
    const c2 = document.getElementById('cable-srv-gcs');
    if (c1) c1.setAttribute('d', `M${cx} ${cy-34} V${cy-82}`);
    if (c2) c2.setAttribute('d', `M${cx} ${cy+34} V${cy+82}`);
}

export function spawnStudentNode(student) {
    const existing = document.getElementById(`snode-${student.id}`);
    if (existing) existing.remove();
    const existCable = document.getElementById(`scable-${student.id}`);
    if (existCable) existCable.remove();

    const { sx, sy } = getStudentPosition(student);

    // Create node element
    const node = document.createElement('div');
    node.id = `snode-${student.id}`;
    node.className = 'net-node node-offline';
    node.style.left = `${sx}px`;
    node.style.top  = `${sy}px`;
    node.innerHTML = `
        <span class="node-icon">💻</span>
        <span class="node-label">${student.name.split(' ')[0]}</span>
        <div class="node-status-ring" id="sring-${student.id}"></div>
    `;
    node.addEventListener('mouseenter', (e) => popoverCb && popoverCb(student, e));
    node.addEventListener('mouseleave', () => {
        const pop = document.getElementById('node-popover');
        if (pop) pop.style.display = 'none';
    });
    canvasEl.appendChild(node);

    // Create SVG cable
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.id = `scable-${student.id}`;
    path.setAttribute('d', buildCablePath(sx, sy, cx, cy));
    path.setAttribute('class', 'svg-cable');
    svgEl.appendChild(path);
}

export function buildCablePath(sx, sy, cx, cy) {
    const mx = cx + (sx - cx) * 0.25;
    const my = cy + (sy - cy) * 0.25;
    return `M${sx} ${sy} Q${mx} ${my} ${cx} ${cy}`;
}

export function syncNodeStyle(student) {
    const node  = document.getElementById(`snode-${student.id}`);
    const cable = document.getElementById(`scable-${student.id}`);
    const ring  = document.getElementById(`sring-${student.id}`);
    if (!node) return;

    // State → class mapping
    node.className = `net-node node-${student.state}`;
    if (ring) ring.className = `node-status-ring ring-${student.state}`;
    if (cable) {
        const cmap = { active: 'svg-cable cable-active', warning: 'svg-cable cable-warning', danger: 'svg-cable cable-danger', offline: 'svg-cable', expelled: 'svg-cable' };
        cable.className.baseVal = cmap[student.state] || 'svg-cable';
    }
}

export function flashAuthAnimation(student) {
    const node = document.getElementById(`snode-${student.id}`);
    if (!node) return;
    const flash = document.createElement('div');
    flash.className = 'auth-flash';
    node.appendChild(flash);
    setTimeout(() => flash.remove(), 1500);
}

export function triggerConnectAnimation(student) {
    const node = document.getElementById(`snode-${student.id}`);
    if (!node) return;
    node.classList.remove('just-connected');
    // Force reflow
    void node.offsetWidth;
    node.classList.add('just-connected');
}
