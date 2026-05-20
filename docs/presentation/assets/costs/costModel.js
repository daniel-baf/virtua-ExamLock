// costModel.js — fórmulas exactas de gcp-cost-simulation.md

// Precios base (USD, mayo 2026)
export const PRICING = {
    egressPerGib:      0.12,
    crCpuPerVcpuS:     0.000024,
    crRamPerGibS:      0.0000025,
    fsPer100kReads:    0.03,
    fsPer100kWrites:   0.09,
};

// Frame sizes KB por modo
export const FRAME_KB = {
    '480p/5s':  41,
    '480p/2s':  41,
    '720p/2s':  115,
    '720p/1s':  115,
    '1080p/2s': 225,
};

export const INTERVAL_S = {
    '480p/5s':  5,
    '480p/2s':  2,
    '720p/2s':  2,
    '720p/1s':  1,
    '1080p/2s': 2,
};

/**
 * Calcula egreso GiB por alumno para un examen.
 * @param {number} kbFrame  - KB por frame JPEG
 * @param {number} intervalS - intervalo entre frames en segundos
 * @param {number} hours    - duración del examen en horas
 * @returns {number} GiB por alumno
 */
export function calcEgressGib(kbFrame, intervalS, hours) {
    const fps = 1 / intervalS;
    const secs = hours * 3600;
    return (kbFrame * fps * secs) / (1024 * 1024);
}

/**
 * Costo de egreso por alumno (un docente).
 * Si hay más de 1 docente, se multiplica el egreso.
 */
export function calcEgressCost(kbFrame, intervalS, hours, teachers = 1) {
    return calcEgressGib(kbFrame, intervalS, hours) * PRICING.egressPerGib * teachers;
}

/**
 * Costo Cloud Run por alumno.
 */
export function calcCloudRunCost(hours) {
    const secs = hours * 3600;
    const cpu = 0.05 * secs * PRICING.crCpuPerVcpuS;
    const ram = 0.04882812 * secs * PRICING.crRamPerGibS;
    return cpu + ram;
}

/**
 * Costo Firestore por alumno.
 */
export function calcFirestoreCost(hours) {
    const secs = hours * 3600;
    const heartbeats = Math.floor(secs / 15);
    const writes = heartbeats + 20 + 5;
    const reads  = heartbeats;
    return (writes / 100000) * PRICING.fsPer100kWrites
         + (reads  / 100000) * PRICING.fsPer100kReads;
}

/**
 * Costo GCS screenshots por alumno (marginal).
 */
export function calcGcsCost() {
    return 0.0001;
}

/**
 * Costo variable total por alumno.
 * @param {object} params - { kbFrame, intervalS, hours, teachers }
 */
export function calcPerStudentCost({ kbFrame = 115, intervalS = 2, hours = 2, teachers = 1 } = {}) {
    const egress = calcEgressCost(kbFrame, intervalS, hours, teachers);
    const cr     = calcCloudRunCost(hours);
    const fs     = calcFirestoreCost(hours);
    const gcs    = calcGcsCost();
    return { egress, cr, fs, gcs, total: egress + cr + fs + gcs };
}

/**
 * Costo total del examen.
 * @param {object} params - { students, kbFrame, intervalS, hours, teachers }
 */
export function calcExamCost({ students = 45, kbFrame = 115, intervalS = 2, hours = 2, teachers = 1 } = {}) {
    const perStudent = calcPerStudentCost({ kbFrame, intervalS, hours, teachers });
    return {
        egress: perStudent.egress * students,
        cr:     perStudent.cr     * students,
        fs:     perStudent.fs     * students,
        gcs:    perStudent.gcs    * students,
        total:  perStudent.total  * students,
        perStudent: perStudent.total,
        perStudentHour: perStudent.total / hours,
    };
}

/**
 * Margen bruto dado precio de venta por alumno-hora.
 */
export function calcMargin({ totalCost, students, hours, pricePerStudentHour = 0.30 }) {
    const revenue = students * hours * pricePerStudentHour;
    const margin  = revenue - totalCost;
    const marginPct = revenue > 0 ? (margin / revenue) * 100 : 0;
    return { revenue, margin, marginPct };
}

/**
 * Modo a kbFrame + intervalS.
 */
export function modeToParams(mode = '720p/2s') {
    return {
        kbFrame:   FRAME_KB[mode]   ?? 115,
        intervalS: INTERVAL_S[mode] ?? 2,
    };
}
