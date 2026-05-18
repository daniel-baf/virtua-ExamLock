import { api } from '@/shared/lib/api';

export const listUsers   = (pageToken) => api.listUsers(pageToken);
export const createUser  = (body)      => api.createUser(body);
export const updateUser  = (uid, body) => api.updateUser(uid, body);
export const deleteUser  = (uid)       => api.deleteUser(uid);
