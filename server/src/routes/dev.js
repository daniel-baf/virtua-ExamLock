const { Router } = require('express');
const { db } = require('../firebase');
const { requireTeacher } = require('../auth');

const router = Router();

// POST /api/dev/reset  — wipe all test data, teacher auth required
router.post('/reset', requireTeacher, async (req, res) => {
  const collections = ['sessions', 'students', 'answers', 'questions'];

  await Promise.all(
    collections.map(async (col) => {
      const snap = await db().collection(col).get();
      const batch = db().batch();
      snap.docs.forEach(d => batch.delete(d.ref));
      if (!snap.empty) await batch.commit();
    })
  );

  res.json({ ok: true, wiped: collections });
});

module.exports = router;
