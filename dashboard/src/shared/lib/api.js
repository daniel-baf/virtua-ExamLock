import { auth } from './firebase';

const BASE = import.meta.env.VITE_SERVER_URL;

async function headers() {
  const token = await auth.currentUser?.getIdToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function imagePathFromStorageUrl(url) {
  try {
    const parsed = new URL(url);
    const bucket = parsed.pathname.split('/')[1];
    const prefix = `/${bucket}/`;
    if (!parsed.pathname.startsWith(prefix)) return null;
    return decodeURIComponent(parsed.pathname.slice(prefix.length));
  } catch {
    return null;
  }
}

async function imageBlobUrl(uid, storageUrl) {
  const path = imagePathFromStorageUrl(storageUrl);
  if (!path) return storageUrl;
  const res = await fetch(`${BASE}/api/student/${uid}/screenshot-image?path=${encodeURIComponent(path)}`, {
    headers: await headers(),
  });
  if (!res.ok) throw new Error('image_load_failed');
  const blob = await res.blob();
  return URL.createObjectURL(blob);
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
  // Sessions
  listSessions:   ()           => req('GET',  '/api/session'),
  createSession:  (body)       => req('POST', '/api/session/create', body),
  getSession:     (code)       => req('GET',  `/api/session/${code}`),
  getSessionSummary: (sessionId) =>
                                  req('GET',  `/api/session/id/${sessionId}`),
  listStudents:   (sessionId)  => req('GET',  `/api/session/${sessionId}/students`),
  requestAllScreenshots: (sessionId) =>
                                  req('POST', `/api/session/${sessionId}/screenshot-all`),
  setWhitelist:   (sessionId, domains, blockInternet) =>
                                  req('PUT',  `/api/session/${sessionId}/whitelist`, { domains, blockInternet }),
  getAudit:       (sessionId)  => req('GET',  `/api/session/${sessionId}/audit`),

  // Students
  admit:           (uid)        => req('POST', `/api/student/${uid}/admit`),
  kick:            (uid, reason)=> req('POST', `/api/student/${uid}/kick`, { reason }),
  readmit:         (uid)        => req('POST', `/api/student/${uid}/readmit`),
  requestScreenshot: (uid)      => req('POST', `/api/student/${uid}/screenshot`),
  listStudentScreenshots: (uid) => req('GET',  `/api/student/${uid}/screenshots`),
  imageBlobUrl,
  sendMessage:     (uid, text)  => req('POST', `/api/student/${uid}/message`, { text }),

  // Dev
  resetDb: () => req('POST', '/api/dev/reset'),
};
