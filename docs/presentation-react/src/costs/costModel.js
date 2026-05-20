import { pricing } from '../shared/pricing.js'

export const PRICING = {
  egressPerGib:    pricing.egress.premiumNA,
  crCpuPerVcpuS:   pricing.cloudRun.cpuPerVcpuS,
  crRamPerGibS:    pricing.cloudRun.ramPerGibS,
  fsPer100kReads:  pricing.firestore.readsPer100k,
  fsPer100kWrites: pricing.firestore.writesPer100k,
}

export const FRAME_KB = {
  '480p/5s':  41,
  '480p/2s':  41,
  '720p/2s':  115,
  '720p/1s':  115,
  '1080p/2s': 225,
}

export const INTERVAL_S = {
  '480p/5s':  5,
  '480p/2s':  2,
  '720p/2s':  2,
  '720p/1s':  1,
  '1080p/2s': 2,
}

export function calcEgressGib(kbFrame, intervalS, hours) {
  const fps = 1 / intervalS
  const secs = hours * 3600
  return (kbFrame * fps * secs) / (1024 * 1024)
}

export function calcEgressCost(kbFrame, intervalS, hours, teachers = 1) {
  return calcEgressGib(kbFrame, intervalS, hours) * PRICING.egressPerGib * teachers
}

export function calcCloudRunCost(hours) {
  const secs = hours * 3600
  const cpu = 0.05 * secs * PRICING.crCpuPerVcpuS
  const ram = 0.04882812 * secs * PRICING.crRamPerGibS
  return cpu + ram
}

export function calcFirestoreCost(hours) {
  const secs = hours * 3600
  const heartbeats = Math.floor(secs / 15)
  const writes = heartbeats + 20 + 5
  const reads = heartbeats
  return (writes / 100000) * PRICING.fsPer100kWrites
       + (reads  / 100000) * PRICING.fsPer100kReads
}

export function calcGcsCost() {
  return 0.0001
}

export function calcPerStudentCost({ kbFrame = 115, intervalS = 2, hours = 2, teachers = 1 } = {}) {
  const egress = calcEgressCost(kbFrame, intervalS, hours, teachers)
  const cr     = calcCloudRunCost(hours)
  const fs     = calcFirestoreCost(hours)
  const gcs    = calcGcsCost()
  return { egress, cr, fs, gcs, total: egress + cr + fs + gcs }
}

export function calcExamCost({ students = 45, kbFrame = 115, intervalS = 2, hours = 2, teachers = 1 } = {}) {
  const ps = calcPerStudentCost({ kbFrame, intervalS, hours, teachers })
  return {
    egress:          ps.egress * students,
    cr:              ps.cr     * students,
    fs:              ps.fs     * students,
    gcs:             ps.gcs    * students,
    total:           ps.total  * students,
    perStudent:      ps.total,
    perStudentHour:  ps.total / hours,
  }
}

export function calcMargin({ totalCost, students, hours, pricePerStudentHour = 0.30 }) {
  const revenue   = students * hours * pricePerStudentHour
  const margin    = revenue - totalCost
  const marginPct = revenue > 0 ? (margin / revenue) * 100 : 0
  return { revenue, margin, marginPct }
}

export function modeToParams(mode = '720p/2s') {
  return {
    kbFrame:   FRAME_KB[mode]   ?? 115,
    intervalS: INTERVAL_S[mode] ?? 2,
  }
}
