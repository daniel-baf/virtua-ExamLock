const DEFAULT_NETWORK_DOMAINS = [
  { domain: 'www.url.edu.gt', enabled: true, source: 'default' },
  { domain: 'landivar.url.edu.gt', enabled: true, source: 'default' },
  { domain: 'moodle26.url.edu.gt', enabled: true, source: 'default' },
  { domain: 'accounts.google.com', enabled: true, source: 'default' },
  { domain: 'fonts.googleapis.com', enabled: true, source: 'default' },
  { domain: 'www.googletagmanager.com', enabled: true, source: 'default' },
  { domain: 'cdn.jsdelivr.net', enabled: true, source: 'default' },
  { domain: 'www.google.com', enabled: true, source: 'default' },
  { domain: 'googleads.g.doubleclick.net', enabled: false, source: 'default' },
];

function normalizeDomain(domain) {
  const value = String(domain ?? '').trim().toLowerCase();
  if (!value) return null;

  if (value.includes('://')) {
    try {
      return new URL(value).hostname.toLowerCase();
    } catch {
      return null;
    }
  }

  return value.replace(/\/$/, '');
}

function normalizeWhitelistEntry(entry, fallbackSource = 'custom') {
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

function normalizeWhitelist(entries = [], fallbackSource = 'custom') {
  const byDomain = new Map();

  entries.forEach(entry => {
    const normalized = normalizeWhitelistEntry(entry, fallbackSource);
    if (!normalized) return;
    byDomain.set(normalized.domain, normalized);
  });

  return [...byDomain.values()];
}

function activeDomains(entries = []) {
  return normalizeWhitelist(entries)
    .filter(entry => entry.enabled)
    .map(entry => entry.domain);
}

function defaultWhitelist() {
  return normalizeWhitelist(DEFAULT_NETWORK_DOMAINS, 'default');
}

module.exports = {
  DEFAULT_NETWORK_DOMAINS,
  activeDomains,
  defaultWhitelist,
  normalizeWhitelist,
};
