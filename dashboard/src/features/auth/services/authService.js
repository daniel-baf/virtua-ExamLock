import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/shared/lib/firebase';

export function signInTeacher(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signOutTeacher() {
  return signOut(auth);
}

export function currentTeacherEmail() {
  return auth.currentUser?.email ?? '';
}

export { auth };
