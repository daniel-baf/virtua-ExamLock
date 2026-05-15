import { api } from '@/shared/lib/api';
import { connectTeacherSocket, disconnectSocket } from '@/shared/lib/socket';

export function listStudents(sessionId) {
  return api.listStudents(sessionId);
}

export function getSessionSummary(sessionId) {
  return api.getSessionSummary(sessionId);
}

export function requestAllScreenshots(sessionId) {
  return api.requestAllScreenshots(sessionId);
}

export function setWhitelist(sessionId, domains, blockInternet) {
  return api.setWhitelist(sessionId, domains, blockInternet);
}

export function kickStudent(uid, reason = 'expelled') {
  return api.kick(uid, reason);
}

export function readmitStudent(uid) {
  return api.readmit(uid);
}

export function requestScreenshot(uid) {
  return api.requestScreenshot(uid);
}

export function listStudentScreenshots(uid) {
  return api.listStudentScreenshots(uid);
}

export function sendStudentMessage(uid, text) {
  return api.sendMessage(uid, text);
}

export { connectTeacherSocket, disconnectSocket };
