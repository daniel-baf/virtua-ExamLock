export function createUserFormState(user) {
  return {
    email: user?.email ?? '',
    password: '',
    displayName: user?.displayName ?? '',
    role: user?.role ?? 'teacher',
  };
}

export function buildUserUpdates(form) {
  return {
    displayName: form.displayName.trim(),
    role: form.role,
  };
}

export function buildNewUserPayload(form) {
  return {
    email: form.email.trim(),
    password: form.password,
    displayName: form.displayName.trim(),
    role: form.role,
  };
}

export function friendlyUserError(message = '') {
  if (message.includes('email-already-exists')) return 'Ese correo ya existe.';
  if (message.includes('invalid-email')) return 'El correo no es válido.';
  if (message.includes('weak-password')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (message.includes('permission')) return 'No tienes permisos para realizar esta acción.';
  return message || 'No se pudo guardar el usuario.';
}
