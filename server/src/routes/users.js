const { Router } = require('express');
const { requireRole } = require('../auth');
const userService = require('../domains/users/application/userService');

const router = Router();
const requireAdmin = requireRole('admin');

router.get('/', requireAdmin, async (req, res) => {
  try {
    res.json(await userService.listUsers(req.query.pageToken || undefined));
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    res.status(201).json(await userService.createUser(req.body, req.user.uid));
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
});

router.patch('/:uid', requireAdmin, async (req, res) => {
  try {
    res.json(await userService.updateUser(req.params.uid, req.body));
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
});

router.delete('/:uid', requireAdmin, async (req, res) => {
  try {
    res.json(await userService.deleteUser(req.params.uid));
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
});

module.exports = router;
