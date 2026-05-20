const { Router } = require('express');
const { requireRole } = require('../auth');
const monitoringSettingsService = require('../domains/admin/application/monitoringSettingsService');
const domainPresetsService = require('../domains/admin/application/domainPresetsService');
const { db } = require('../firebase');

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

// GET /api/admin/domain-presets
router.get('/domain-presets', requireAdmin, async (_req, res) => {
  try {
    res.json(await domainPresetsService.listPresets(db()));
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
});

// POST /api/admin/domain-presets
router.post('/domain-presets', requireAdmin, async (req, res) => {
  try {
    res.status(201).json(await domainPresetsService.createPreset(db(), req.body, req.user.uid));
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
});

// PUT /api/admin/domain-presets/:id
router.put('/domain-presets/:id', requireAdmin, async (req, res) => {
  try {
    res.json(await domainPresetsService.updatePreset(db(), req.params.id, req.body, req.user.uid));
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
});

// DELETE /api/admin/domain-presets/:id
router.delete('/domain-presets/:id', requireAdmin, async (req, res) => {
  try {
    await domainPresetsService.deletePreset(db(), req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
});

module.exports = router;
