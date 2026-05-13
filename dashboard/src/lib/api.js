import { auth } from './firebase';

const BASE = import.meta.env.VITE_SERVER_URL;

async function headers() {
  const token = await auth.currentUser?.getIdToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: await headers(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(err.error ?? 'request_failed'), { status: res.status });
  }
  return res.json();
}

export const api = {
  createSession: (body) => req('POST', '/api/session/create', body),
  getSession: (code) => req('GET', `/api/session/${code}`),
  getResults: (id) => req('GET', `/api/session/${id}/results`),
  createQuestions: (sessionId, questions) => req('POST', `/api/exam/${sessionId}/questions`, { questions }),
  reactivateStudent: (id) => req('POST', `/api/student/${id}/reactivate`),
  blockInternet: (id) => req('POST', `/api/student/${id}/block-internet`),
  unblockInternet: (id) => req('POST', `/api/student/${id}/unblock-internet`),
  sendMessage: (id, text) => req('POST', `/api/student/${id}/message`, { text }),
};
