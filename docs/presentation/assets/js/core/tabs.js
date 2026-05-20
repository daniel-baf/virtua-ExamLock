// tabs.js — sistema de tabs + deep-link por hash

export function initTabs() {
    const buttons = document.querySelectorAll('.tab-btn');
    const panels  = document.querySelectorAll('.tab-panel');

    function activateTab(id) {
        buttons.forEach(b => {
            const active = b.dataset.tab === id;
            b.classList.toggle('active', active);
            b.setAttribute('aria-selected', String(active));
        });
        panels.forEach(p => {
            const active = p.id === `tab-${id}`;
            p.classList.toggle('active', active);
        });
        history.replaceState(null, '', `#${id}`);
        document.dispatchEvent(new CustomEvent('tab:activated', { detail: { tab: id } }));
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => activateTab(btn.dataset.tab));
    });

    // Deep-link on load
    const hash = location.hash.replace('#', '');
    if (hash && document.getElementById(`tab-${hash}`)) {
        activateTab(hash);
    }
}

export function switchTab(id) {
    const btn = document.querySelector(`.tab-btn[data-tab="${id}"]`);
    if (btn) btn.click();
}
