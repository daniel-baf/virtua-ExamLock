const { Router } = require('express');
const { db } = require('../firebase');
const { requireRole } = require('../auth');
const {
  STREAM_INTERVAL_PRESETS,
  STREAM_RESOLUTION_PRESETS,
  getMonitoringSettings,
  saveMonitoringSettings,
} = require('../monitoringConfig');

const router = Router();
const requireAdmin = requireRole('admin');

router.get('/monitoring-settings', requireAdmin, async (_req, res) => {
  try {
    const settings = await getMonitoringSettings(db());
    res.json({
      streamConfig: settings.streamConfig,
      updatedAt: settings.updatedAt,
      updatedBy: settings.updatedBy,
      presets: {
        intervalMs: STREAM_INTERVAL_PRESETS,
        resolutionPreset: Object.keys(STREAM_RESOLUTION_PRESETS),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/monitoring-settings', requireAdmin, async (req, res) => {
  const { streamConfig = {} } = req.body ?? {};
  if (
    !Object.keys(STREAM_RESOLUTION_PRESETS).includes(streamConfig.resolutionPreset)
    || !STREAM_INTERVAL_PRESETS.includes(Number(streamConfig.intervalMs))
  ) {
    return res.status(400).json({ error: 'invalid_stream_config' });
  }

  try {
    const saved = await saveMonitoringSettings(db(), streamConfig, req.user.uid);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
