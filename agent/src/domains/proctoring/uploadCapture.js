const socketClient = require('../../../socket');

function uploadCapture({ type, imageBase64, state }) {
  if (!imageBase64) {
    const error = new Error('missing_image');
    error.statusCode = 400;
    throw error;
  }

  const current = state.getState();
  const event = type === 'camera' ? 'student:camera' : 'student:screenshot';
  socketClient.emit(event, { studentId: current.studentId, imageBase64 });
  return { ok: true };
}

module.exports = { uploadCapture };
