const sessionRoutes = require('../../domains/sessions/http/routes');
const studentRoutes = require('../../domains/students/http/routes');
const examRoutes = require('../../domains/exams/http/routes');
const devRoutes = require('../../domains/dev/http/routes');
const userRoutes = require('../../domains/users/http/routes');
const adminRoutes = require('../../domains/admin/http/routes');

function registerRoutes(app) {
  app.get('/healthz', (_req, res) => res.json({ ok: true }));

  app.use('/api/session', sessionRoutes);
  app.use('/api/student', studentRoutes);
  app.use('/api/exam', examRoutes);
  app.use('/api/dev', devRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/admin', adminRoutes);
}

module.exports = { registerRoutes };
