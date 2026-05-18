const { Router } = require('express');
const { requireRole } = require('../auth');
const monitoringSettingsService = require('../domains/admin/application/monitoringSettingsService');

const router = Router();
const requireAdmin = requireRole('admin');

router.get('/monitoring-settings', requireAdmin, async (_req, res) => {
  try {
    res.json(await monitoringSettingsService.getSettings());
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
});

router.patch('/monitoring-settings', requireAdmin, async (req, res) => {
  try {
    res.json(await monitoringSettingsService.updateSettings(req.body?.streamConfig ?? {}, req.user.uid));
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
});

module.exports = router;
