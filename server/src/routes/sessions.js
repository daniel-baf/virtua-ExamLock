const { Router } = require('express');
const { requireRole } = require('../auth');
const sessionService = require('../domains/sessions/application/sessionService');
const keystrokeAudit = require('../domains/monitoring/keystrokeAuditStore');

const router = Router();

// POST /api/session/create
router.post('/create', requireRole('teacher'), async (req, res) => {
  try {
    const result = await sessionService.createSession({
      teacherId: req.user.uid,
      ...req.body,
    });
    res.json(result);
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ error: error.message });
  }
});

// GET /api/session/network-defaults — institutional default whitelist
router.get('/network-defaults', requireRole('teacher'), async (_req, res) => {
  res.json(sessionService.getNetworkDefaults());
});

// GET /api/session  — list sessions for authenticated teacher
router.get('/', requireRole('teacher'), async (req, res) => {
  res.json(await sessionService.listTeacherSessions(req.user.uid));
});

// GET /api/session/id/:id  — teacher session summary
router.get('/id/:id', requireRole('teacher'), async (req, res) => {
  try {
    res.json(await sessionService.getTeacherSessionSummary(req.params.id, req.user.uid));
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ error: error.message });
  }
});

// GET /api/session/:code  — validate code before join (public)
router.get('/:code', async (req, res) => {
  try {
    res.json(await sessionService.getPublicSessionByCode(req.params.code));
  } catch (error) {
    const responseError = error.message === 'session_not_found' ? 'not_found' : error.message;
    res.status(error.statusCode ?? 500).json({ error: responseError });
  }
});

// POST /api/session/:code/join  — student joins (Firebase ID token required, role=student)
router.post('/:code/join', requireRole('student'), async (req, res) => {
  try {
    res.json(await sessionService.joinSession({ code: req.params.code, user: req.user }));
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ error: error.message });
  }
});

// GET /api/session/:id/students  — teacher monitor
router.get('/:id/students', requireRole('teacher'), async (req, res) => {
  try {
    res.json(await sessionService.listSessionStudents(req.params.id, req.user.uid));
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ error: error.message });
  }
});

// POST /api/session/:id/screenshot-all  — request screenshots from all active students
router.post('/:id/screenshot-all', requireRole('teacher'), async (req, res) => {
  try {
    res.json(await sessionService.requestSessionScreenshots(req.params.id, req.user.uid, req.app.get('io')));
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ error: error.message });
  }
});

// PUT /api/session/:id/whitelist  — teacher updates whitelist, broadcasts to all students
router.put('/:id/whitelist', requireRole('teacher'), async (req, res) => {
  try {
    res.json(await sessionService.updateWhitelist({
      sessionId: req.params.id,
      teacherId: req.user.uid,
      ...req.body,
      io: req.app.get('io'),
    }));
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ error: error.message });
  }
});

// GET /api/session/:id/audit  — post-exam audit data (download)
router.get('/:id/audit', requireRole('teacher'), async (req, res) => {
  try {
    const audit = await sessionService.getSessionAudit(req.params.id, req.user.uid);
    const keystrokeData = keystrokeAudit.getSession(req.params.id);
    const chunkMap = new Map(keystrokeData.map(d => [d.uid, d.chunks]));
    audit.students = audit.students.map(s => ({
      ...s,
      keystrokeChunks: chunkMap.get(s.uid) ?? [],
    }));

    const download = req.query.download === '1';
    if (download) {
      res.setHeader('Content-Disposition', `attachment; filename="audit-${req.params.id}.json"`);
      res.setHeader('Content-Type', 'application/json');
      const payload = buildDownloadPayload(audit);
      return res.json(payload);
    }

    res.json(audit);
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ error: error.message });
  }
});

function buildDownloadPayload(audit) {
  const { session } = audit;
  const domains = session.allowedDomains?.length
    ? session.allowedDomains.join(', ')
    : 'ninguno (internet bloqueado)';

  const prompt = `Eres un asistente experto en integridad académica. Se te proporciona el registro completo \
de un examen digital vigilado por la plataforma ExamLock. Contiene la actividad de teclado, \
eventos de conexión/desconexión y configuración de red de cada alumno.

CONTEXTO DEL EXAMEN
- Sesión: ${session.name ?? 'sin nombre'}
- Inicio: ${session.startedAt ? new Date(session.startedAt).toLocaleString('es') : '—'}
- Fin programado: ${session.endsAt ? new Date(session.endsAt).toLocaleString('es') : '—'}
- Internet: ${session.blockInternet ? 'bloqueado' : 'libre'}
- Dominios permitidos: ${domains}

DATOS DISPONIBLES POR ALUMNO (campo "students")
Cada alumno tiene:
- keystrokeChunks[]: bloques de texto capturado cada 60 s con hora de inicio y fin.
  Los marcadores especiales son: [Ctrl+C] [Ctrl+V] [←] [→] [↑] [↓] [Delete] [Escape] etc.
- timeline[]: eventos del sistema (admitido, desconectado, expulsado, etc.) con timestamp.
- status: estado final (admitted / kicked / closed / offline).
- admittedAt / lastHeartbeat: cuándo entró y última señal de vida.

TU TAREA
Analiza CADA alumno y genera un informe individual + un ranking final.

CRITERIOS DE SOSPECHA
1. Ctrl+C / Ctrl+V: frecuencia y contexto. ¿Ocurren justo al inicio? ¿En bloques largos sin errores previos?
2. Texto que aparece de golpe sin correcciones (Backspace) → posible pegado.
3. Desconexiones durante el examen: ¿cuándo ocurrieron? ¿Justo antes de un bloque sospechoso?
4. Bloques vacíos prolongados: ¿el alumno dejó de escribir mucho tiempo?
5. Dominios permitidos: ¿alguno podría facilitar copiar? (ej. traductores, docs compartidos)
6. Texto idéntico o muy similar entre alumnos → coordinación.

FORMATO DE RESPUESTA OBLIGATORIO

---
## [email o nombre del alumno]
**Score de integridad: XX/100** (100 = sin sospechas, 0 = evidencia clara de trampa)
**Veredicto:** Sin sospechas | Revisión recomendada | Alta sospecha

**Eventos clave:**
- HH:MM – descripción breve del evento sospechoso o relevante

**Análisis:**
Párrafo breve con el razonamiento. Cita fragmentos de keystrokeChunks si es relevante.

---

(repetir para cada alumno)

---
## RANKING FINAL
De más a menos sospechoso:
1. [email] — Score XX/100 — motivo principal
2. ...

---
## RESUMEN EJECUTIVO
2-3 oraciones para el docente sobre el estado general del grupo.

IMPORTANTE: Basa todo análisis ÚNICAMENTE en los datos del JSON. No inventes ni asumas. \
Si no hay datos de teclado de un alumno, indícalo explícitamente.

--- FIN DE INSTRUCCIONES --- A continuación los datos del examen:`;

  return {
    _instrucciones: prompt,
    ...audit,
  };
}

module.exports = router;
