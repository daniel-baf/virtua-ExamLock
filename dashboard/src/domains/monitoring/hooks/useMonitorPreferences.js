import { useMemo } from 'react';
import useLocalStorageState from '@/shared/hooks/useLocalStorageState';

const DEFAULTS = {
  tab: 'admitted',
  columns: 4,
  closedView: 'list',
  showPinnedOnly: false,
  search: '',
  filter: 'all',
  pinnedBySession: {},
};

export default function useMonitorPreferences({ sessionId, userKey }) {
  const storageKey = `examlock.monitor.preferences.v1:${userKey ?? 'anon'}`;
  const [preferences, setPreferences] = useLocalStorageState(storageKey, DEFAULTS);
  const state = {
    ...DEFAULTS,
    ...preferences,
    pinnedBySession: {
      ...DEFAULTS.pinnedBySession,
      ...(preferences.pinnedBySession ?? {}),
    },
  };

  const pinnedIds = useMemo(
    () => new Set(state.pinnedBySession?.[sessionId] ?? []),
    [state.pinnedBySession, sessionId],
  );

  function setPreference(key, value) {
    setPreferences(current => ({
      ...current,
      [key]: typeof value === 'function' ? value(current[key]) : value,
    }));
  }

  function togglePinned(uid) {
    setPreferences(current => {
      const currentPinned = current.pinnedBySession?.[sessionId] ?? [];
      const nextPinned = currentPinned.includes(uid)
        ? currentPinned.filter(value => value !== uid)
        : [uid, ...currentPinned];

      return {
        ...current,
        pinnedBySession: {
          ...(current.pinnedBySession ?? {}),
          [sessionId]: nextPinned,
        },
      };
    });
  }

  return {
    tab: state.tab,
    columns: state.columns,
    closedView: state.closedView,
    showPinnedOnly: state.showPinnedOnly,
    search: state.search,
    filter: state.filter,
    pinnedIds,
    setTab: value => setPreference('tab', value),
    setColumns: value => setPreference('columns', Number(value)),
    setClosedView: value => setPreference('closedView', value),
    setShowPinnedOnly: value => setPreference('showPinnedOnly', value),
    setSearch: value => setPreference('search', value),
    setFilter: value => setPreference('filter', value),
    togglePinned,
  };
}
