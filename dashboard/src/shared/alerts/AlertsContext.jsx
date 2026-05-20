import { createContext, useCallback, useContext, useRef, useState } from 'react';

const AlertsContext = createContext(null);

export function AlertsProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const focusHandlerRef = useRef(null);

  const pushAlert = useCallback((alert) => {
    setAlerts(prev => {
      if (prev.some(item => item.dedupeKey === alert.dedupeKey)) return prev;
      return [{ ...alert, createdAt: Date.now() }, ...prev];
    });
  }, []);

  const acknowledgeAlert = useCallback((alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  const acknowledgeGroup = useCallback((studentUid) => {
    setAlerts(prev => prev.filter(a => a.studentUid !== studentUid));
  }, []);

  const clearAll = useCallback(() => setAlerts([]), []);

  const registerSession = useCallback((sessionId, focusHandler) => {
    setActiveSessionId(sessionId);
    focusHandlerRef.current = focusHandler;
  }, []);

  const unregisterSession = useCallback(() => {
    setActiveSessionId(null);
    focusHandlerRef.current = null;
  }, []);

  const focusStudent = useCallback((uid) => {
    focusHandlerRef.current?.(uid);
  }, []);

  return (
    <AlertsContext.Provider value={{
      alerts,
      activeSessionId,
      pushAlert,
      acknowledgeAlert,
      acknowledgeGroup,
      clearAll,
      registerSession,
      unregisterSession,
      focusStudent,
    }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error('useAlerts must be used inside AlertsProvider');
  return ctx;
}
