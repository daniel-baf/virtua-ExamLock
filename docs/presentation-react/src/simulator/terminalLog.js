// terminalLog.js — logger de terminal con colores y timestamps

let logEl = null;
let simTimeRef = null;

export function initTerminal(el, getSimTime) {
    logEl = el;
    simTimeRef = getSimTime;
}

export function printLog(tag, type, message) {
    if (!logEl) return;
    const time = simTimeRef ? simTimeRef() : '08:00:00';
    const typeClass = {
        info: 'log-info', success: 'log-success', warning: 'log-warning',
        error: 'log-error', network: 'log-network', admin: 'log-purple', purple: 'log-purple'
    }[type] || 'log-info';

    const row = document.createElement('div');
    row.className = 'log-row';
    row.innerHTML = `<span class="log-time log-time-mono">[${time}]</span><span class="log-tag ${typeClass}">[${tag}]</span><span class="log-msg">${message}</span>`;
    logEl.appendChild(row);
    // Keep last 200 lines
    while (logEl.children.length > 200) logEl.removeChild(logEl.firstChild);
    logEl.scrollTop = logEl.scrollHeight;
}

export function clearTerminal() {
    if (logEl) logEl.innerHTML = '';
}
