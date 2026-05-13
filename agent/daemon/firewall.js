const { execSync } = require('child_process');
const dns = require('dns').promises;
const fs = require('fs');

const REFRESH_MS = 60_000;

function readServerHostname() {
  try {
    const raw = fs.readFileSync('/etc/examlock.conf', 'utf8');
    const match = raw.match(/^SERVER_URL=(.+)$/m);
    if (match) return new URL(match[1].trim()).hostname;
  } catch {}
  return null;
}

const SERVER_HOSTNAME = readServerHostname();
let refreshTimer = null;
let lastDomains = [];
let lastBlock = false;

async function applyWhitelist(domains, blockInternet) {
  lastDomains = domains;
  lastBlock = blockInternet;

  if (!blockInternet) {
    try {
      execSync('nft flush ruleset', { stdio: 'pipe' });
    } catch (err) {
      console.error('[firewall] flush failed:', err.message);
    }
    stopRefresh();
    return;
  }

  await buildAndApply(domains);
  startRefresh();
}

async function buildAndApply(domains) {
  const ips = new Set(['127.0.0.0/8']);
  const allDomains = SERVER_HOSTNAME ? [SERVER_HOSTNAME, ...domains] : [...domains];

  for (const domain of allDomains) {
    try {
      const addrs = await dns.resolve4(domain);
      addrs.forEach(ip => ips.add(ip));
    } catch {}
  }

  const ipSet = [...ips].join(', ');

  const ruleset = `
table inet examlock {
  chain output {
    type filter hook output priority 0; policy drop;
    udp dport 53 accept
    tcp dport 53 accept
    ip daddr { ${ipSet} } accept
  }
}`;

  try {
    execSync('nft flush ruleset', { stdio: 'pipe' });
    execSync('nft -f /dev/stdin', { input: ruleset, stdio: ['pipe', 'pipe', 'pipe'] });
    console.log('[firewall] applied whitelist:', [...ips].join(', '));
  } catch (err) {
    console.error('[firewall] apply failed:', err.message);
  }
}

function startRefresh() {
  stopRefresh();
  refreshTimer = setInterval(() => buildAndApply(lastDomains), REFRESH_MS);
}

function stopRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

module.exports = { applyWhitelist };
