// charts.js — generadores de SVG para charts de costos

/**
 * Bar chart SVG con eje X y Y, barras apiladas o simples.
 * @param {object} opts
 * @param {string[]} opts.labels
 * @param {number[]} opts.values
 * @param {string}   opts.color
 * @param {number}   opts.w
 * @param {number}   opts.h
 * @param {string}   opts.yLabel
 * @param {Function} opts.yFmt
 */
export function buildBarChart({ labels, values, color = '#00e5ff', w = 520, h = 200, yLabel = 'USD', yFmt = v => `$${v.toFixed(0)}` } = {}) {
    const padL = 54, padB = 36, padT = 16, padR = 12;
    const cw = w - padL - padR;
    const ch = h - padT - padB;
    const maxV = Math.max(...values) * 1.1 || 1;
    const bw = (cw / labels.length) * 0.6;
    const gap = cw / labels.length;

    let bars = '';
    let xLabels = '';
    let yLines = '';

    // Y gridlines (4)
    for (let i = 0; i <= 4; i++) {
        const yv = (maxV / 4) * i;
        const y = padT + ch - (ch * i / 4);
        yLines += `<line x1="${padL}" x2="${padL + cw}" y1="${y}" y2="${y}" stroke="#ffffff18" stroke-dasharray="4 3"/>`;
        yLines += `<text x="${padL - 6}" y="${y + 4}" text-anchor="end" fill="#94a3b8" font-size="10">${yFmt(yv)}</text>`;
    }

    labels.forEach((lbl, i) => {
        const bh = ch * (values[i] / maxV);
        const x = padL + i * gap + (gap - bw) / 2;
        const y = padT + ch - bh;
        bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="3" fill="${color}" opacity="0.85"/>`;
        bars += `<text x="${(x + bw / 2).toFixed(1)}" y="${(y - 4).toFixed(1)}" text-anchor="middle" fill="${color}" font-size="9" font-weight="bold">${yFmt(values[i])}</text>`;
        xLabels += `<text x="${(padL + i * gap + gap / 2).toFixed(1)}" y="${(h - 6).toFixed(1)}" text-anchor="middle" fill="#94a3b8" font-size="9">${lbl}</text>`;
    });

    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:${w}px">
  <text x="${padL - 44}" y="${padT + ch / 2}" text-anchor="middle" fill="#64748b" font-size="9" transform="rotate(-90,${padL - 44},${padT + ch / 2})">${yLabel}</text>
  ${yLines}
  ${bars}
  ${xLabels}
  <line x1="${padL}" x2="${padL + cw}" y1="${padT + ch}" y2="${padT + ch}" stroke="#334155"/>
  <line x1="${padL}" x2="${padL}" y1="${padT}" y2="${padT + ch}" stroke="#334155"/>
</svg>`;
}

/**
 * Stacked bar chart: egress vs CR vs FS+GCS
 */
export function buildStackedBarChart({ labels, seriesEgress, seriesCR, seriesOther, w = 520, h = 220 } = {}) {
    const padL = 54, padB = 36, padT = 16, padR = 80;
    const cw = w - padL - padR;
    const ch = h - padT - padB;
    const totals = labels.map((_, i) => (seriesEgress[i] || 0) + (seriesCR[i] || 0) + (seriesOther[i] || 0));
    const maxV = Math.max(...totals) * 1.1 || 1;
    const bw = (cw / labels.length) * 0.55;
    const gap = cw / labels.length;
    const COLORS = ['#00e5ff', '#818cf8', '#34d399'];
    const LABELS_LEGEND = ['Egreso', 'Cloud Run', 'FS+GCS'];

    let bars = '', xLbls = '', yLines = '';

    for (let i = 0; i <= 4; i++) {
        const yv = (maxV / 4) * i;
        const y = padT + ch - (ch * i / 4);
        yLines += `<line x1="${padL}" x2="${padL + cw}" y1="${y}" y2="${y}" stroke="#ffffff18" stroke-dasharray="4 3"/>`;
        yLines += `<text x="${padL - 6}" y="${y + 4}" text-anchor="end" fill="#94a3b8" font-size="10">$${yv.toFixed(1)}</text>`;
    }

    labels.forEach((lbl, i) => {
        const x = padL + i * gap + (gap - bw) / 2;
        let y0 = padT + ch;
        [[seriesEgress[i] || 0, COLORS[0]], [seriesCR[i] || 0, COLORS[1]], [seriesOther[i] || 0, COLORS[2]]].forEach(([v, c]) => {
            const bh = ch * (v / maxV);
            y0 -= bh;
            bars += `<rect x="${x.toFixed(1)}" y="${y0.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="${c}" opacity="0.85"/>`;
        });
        xLbls += `<text x="${(padL + i * gap + gap / 2).toFixed(1)}" y="${(h - 6).toFixed(1)}" text-anchor="middle" fill="#94a3b8" font-size="9">${lbl}</text>`;
    });

    // Legend
    let legend = '';
    COLORS.forEach((c, i) => {
        legend += `<rect x="${padL + cw + 6}" y="${padT + 4 + i * 18}" width="10" height="10" rx="2" fill="${c}"/>`;
        legend += `<text x="${padL + cw + 20}" y="${padT + 13 + i * 18}" fill="#94a3b8" font-size="10">${LABELS_LEGEND[i]}</text>`;
    });

    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:${w}px">
  ${yLines}${bars}${xLbls}${legend}
  <line x1="${padL}" x2="${padL + cw}" y1="${padT + ch}" y2="${padT + ch}" stroke="#334155"/>
  <line x1="${padL}" x2="${padL}" y1="${padT}" y2="${padT + ch}" stroke="#334155"/>
</svg>`;
}

/**
 * Pie / Donut chart SVG
 * @param {Array<{label,value,color}>} slices
 */
export function buildDonutChart(slices, { r = 70, cx = 95, cy = 85, w = 260, h = 170 } = {}) {
    const total = slices.reduce((s, x) => s + x.value, 0);
    let angle = -Math.PI / 2;
    let paths = '', legends = '';

    slices.forEach((sl, i) => {
        const frac = sl.value / total;
        const startA = angle;
        const endA   = angle + 2 * Math.PI * frac;
        const ri = r - 18;

        const x1 = cx + r * Math.cos(startA);
        const y1 = cy + r * Math.sin(startA);
        const x2 = cx + r * Math.cos(endA);
        const y2 = cy + r * Math.sin(endA);
        const xi1 = cx + ri * Math.cos(startA);
        const yi1 = cy + ri * Math.sin(startA);
        const xi2 = cx + ri * Math.cos(endA);
        const yi2 = cy + ri * Math.sin(endA);
        const large = frac > 0.5 ? 1 : 0;

        paths += `<path d="M${xi1.toFixed(1)},${yi1.toFixed(1)} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large},1 ${x2.toFixed(1)},${y2.toFixed(1)} L${xi2.toFixed(1)},${yi2.toFixed(1)} A${ri},${ri} 0 ${large},0 ${xi1.toFixed(1)},${yi1.toFixed(1)} Z" fill="${sl.color}" opacity="0.9"/>`;

        legends += `<rect x="${cx + r + 14}" y="${8 + i * 22}" width="10" height="10" rx="2" fill="${sl.color}"/>`;
        legends += `<text x="${cx + r + 28}" y="${17 + i * 22}" fill="#cbd5e1" font-size="11">${sl.label} <tspan fill="${sl.color}" font-weight="bold">${(frac * 100).toFixed(0)}%</tspan></text>`;
        angle = endA;
    });

    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:${w}px">
  ${paths}
  <circle cx="${cx}" cy="${cy}" r="20" fill="#0f172a"/>
  ${legends}
</svg>`;
}

/**
 * Sensitivity heatmap table HTML
 */
export function buildSensitivityTable(modes) {
    const rows = modes.map(m => {
        const heat = m.total2h <= 0.030 ? 'heat-low' : m.total2h <= 0.065 ? 'heat-mid' : 'heat-high';
        const isDefault = m.label.includes('base');
        return `<tr class="${isDefault ? 'row-default' : ''}">
          <td>${m.label}</td>
          <td>${m.kbFrame} KB</td>
          <td>${m.intervalS}s</td>
          <td>${m.gib2h.toFixed(3)} GiB</td>
          <td>$${m.egress2h.toFixed(3)}</td>
          <td class="${heat}"><strong>$${m.total2h.toFixed(3)}</strong></td>
        </tr>`;
    }).join('');

    return `<table class="data-table sensitivity-table">
  <thead><tr>
    <th>Modo</th><th>KB/frame</th><th>Intervalo</th>
    <th>GiB/alumno 2h</th><th>Egreso/alumno</th><th>Total/alumno 2h</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>`;
}
