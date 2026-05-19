const SETTINGS_COLLECTION = 'settings';
const SETTINGS_DOC_ID = 'monitoring';

const STREAM_RESOLUTION_PRESETS = {
  '480p': { preset: '480p', maxWidth: 854, maxHeight: 480 },
  '720p': { preset: '720p', maxWidth: 1280, maxHeight: 720 },
  '1080p': { preset: '1080p', maxWidth: 1920, maxHeight: 1080 },
};

const STREAM_INTERVAL_PRESETS = [1000, 2000, 5000];

const DEFAULT_STREAM_RESOLUTION_PRESET = '720p';
const DEFAULT_STREAM_INTERVAL_MS = 2000;

const DEFAULT_STREAM_CONFIG = {
  resolutionPreset: DEFAULT_STREAM_RESOLUTION_PRESET,
  intervalMs: DEFAULT_STREAM_INTERVAL_MS,
  maxWidth: STREAM_RESOLUTION_PRESETS[DEFAULT_STREAM_RESOLUTION_PRESET].maxWidth,
  maxHeight: STREAM_RESOLUTION_PRESETS[DEFAULT_STREAM_RESOLUTION_PRESET].maxHeight,
};

function normalizeStreamConfig(raw = {}) {
  const resolutionPreset = raw.resolutionPreset in STREAM_RESOLUTION_PRESETS
    ? raw.resolutionPreset
    : DEFAULT_STREAM_RESOLUTION_PRESET;
  const resolution = STREAM_RESOLUTION_PRESETS[resolutionPreset];
  const intervalMs = STREAM_INTERVAL_PRESETS.includes(Number(raw.intervalMs))
    ? Number(raw.intervalMs)
    : DEFAULT_STREAM_INTERVAL_MS;

  return {
    resolutionPreset,
    intervalMs,
    maxWidth: resolution.maxWidth,
    maxHeight: resolution.maxHeight,
  };
}

async function getMonitoringSettings(db) {
  const snap = await db.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC_ID).get();
  if (!snap.exists) return { streamConfig: DEFAULT_STREAM_CONFIG, updatedAt: null, updatedBy: null };

  const data = snap.data() ?? {};
  return {
    streamConfig: normalizeStreamConfig(data.streamConfig),
    updatedAt: data.updatedAt ?? null,
    updatedBy: data.updatedBy ?? null,
  };
}

async function saveMonitoringSettings(db, streamConfig, updatedBy) {
  const normalized = normalizeStreamConfig(streamConfig);
  const payload = {
    streamConfig: normalized,
    updatedAt: Date.now(),
    updatedBy,
  };

  await db.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC_ID).set(payload, { merge: true });
  return payload;
}

module.exports = {
  DEFAULT_STREAM_CONFIG,
  STREAM_INTERVAL_PRESETS,
  STREAM_RESOLUTION_PRESETS,
  getMonitoringSettings,
  normalizeStreamConfig,
  saveMonitoringSettings,
};
