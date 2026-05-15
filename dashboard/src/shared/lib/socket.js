import { io } from 'socket.io-client';
import { auth } from './firebase';

let socket = null;

export async function connectTeacherSocket(sessionId) {
  if (socket?.connected) return socket;

  const token = await auth.currentUser.getIdToken();

  socket = io(import.meta.env.VITE_SERVER_URL, {
    auth: { token },
    query: { sessionId },
    transports: ['websocket'],
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
