import { useEffect, useState } from 'react';

export default function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') return resolveInitialValue(initialValue);

    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) return JSON.parse(raw);
    } catch {
      // Ignore malformed persisted values and fall back to the initial one.
    }

    return resolveInitialValue(initialValue);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Ignore persistence failures.
    }
  }, [key, state]);

  return [state, setState];
}

function resolveInitialValue(initialValue) {
  return typeof initialValue === 'function' ? initialValue() : initialValue;
}
