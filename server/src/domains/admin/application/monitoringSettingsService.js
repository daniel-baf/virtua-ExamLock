const { db } = require('../../../firebase');
const {
  STREAM_INTERVAL_PRESETS,
  STREAM_RESOLUTION_PRESETS,
  getMonitoringSettings,
  saveMonitoringSettings,
} = require('../../../monitoringConfig');

async function getSettings() {
  const settings = await getMonitoringSettings(db());
  return {
    streamConfig: settings.streamConfig,
    updatedAt: settings.updatedAt,
    updatedBy: settings.updatedBy,
    presets: {
      intervalMs: STREAM_INTERVAL_PRESETS,
      resolutionPreset: Object.keys(STREAM_RESOLUTION_PRESETS),
    },
  };
}

async function updateSettings(streamConfig, actorUid) {
  if (
    !Object.keys(STREAM_RESOLUTION_PRESETS).includes(streamConfig?.resolutionPreset)
    || !STREAM_INTERVAL_PRESETS.includes(Number(streamConfig?.intervalMs))
  ) {
    const error = new Error('invalid_stream_config');
    error.statusCode = 400;
    throw error;
  }

  return saveMonitoringSettings(db(), streamConfig, actorUid);
}

module.exports = {
  getSettings,
  updateSettings,
};
