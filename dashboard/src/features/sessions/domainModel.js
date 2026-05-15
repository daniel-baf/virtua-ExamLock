const PRESET_COOKIE = 'examlock_network_presets';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function normalizeDomain(value) {
  const raw = String(value ?? '').trim().toLowerCase();
  if (!raw) return '';

  if (raw.includes('://')) {
    try {
      return new URL(raw).hostname.toLowerCase();
    } catch {
      return '';
    }
  }

  return raw.replace(/\/$/, '');
}

export function normalizeDomainEntry(entry, fallbackSource = 'custom') {
  if (typeof entry === 'string') {
    const domain = normalizeDomain(entry);
    return domain ? { domain, enabled: true, source: fallbackSource } : null;
  }

  if (!entry || typeof entry !== 'object') return null;
  const domain = normalizeDomain(entry.domain ?? entry.value ?? entry.host);
  if (!domain) return null;

  return {
    domain,
    enabled: entry.enabled !== false,
    source: entry.source === 'default' ? 'default' : fallbackSource,
  };
}

export function normalizeDomainList(entries = [], fallbackSource = 'custom') {
  const byDomain = new Map();
  entries.forEach(entry => {
    const normalized = normalizeDomainEntry(entry, fallbackSource);
    if (!normalized) return;
    byDomain.set(normalized.domain, normalized);
  });
  return [...byDomain.values()];
}

export function mergeDomainLists(current = [], incoming = [], fallbackSource = 'custom') {
  const merged = new Map();
  normalizeDomainList(current).forEach(entry => merged.set(entry.domain, entry));
  normalizeDomainList(incoming, fallbackSource).forEach(entry => {
    const existing = merged.get(entry.domain);
    merged.set(entry.domain, existing ? { ...existing, enabled: true } : entry);
  });
  return [...merged.values()];
}

export function activeDomainCount(entries = []) {
  return normalizeDomainList(entries).filter(entry => entry.enabled).length;
}

export function readLocalPresets() {
  const cookie = document.cookie
    .split('; ')
    .find(part => part.startsWith(`${PRESET_COOKIE}=`));
  if (!cookie) return [];

  try {
    const value = decodeURIComponent(cookie.slice(PRESET_COOKIE.length + 1));
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(preset => ({
        name: String(preset.name ?? '').trim(),
        domains: normalizeDomainList(preset.domains ?? []),
      }))
      .filter(preset => preset.name && preset.domains.length > 0);
  } catch {
    return [];
  }
}

export function writeLocalPresets(presets) {
  const clean = presets
    .map(preset => ({
      name: String(preset.name ?? '').trim().slice(0, 80),
      domains: normalizeDomainList(preset.domains ?? []),
    }))
    .filter(preset => preset.name && preset.domains.length > 0)
    .slice(0, 20);

  document.cookie = `${PRESET_COOKIE}=${encodeURIComponent(JSON.stringify(clean))}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  return clean;
}
