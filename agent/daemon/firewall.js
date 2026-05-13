const { execSync } = require('child_process');
const dns = require('dns').promises;
const fs = require('fs');
const net = require('net');

const REFRESH_MS = 60_000;
const EXAM_USER = 'examuser';
const SYSTEM_HOSTS = ['identitytoolkit.googleapis.com'];

function readConfig() {
  try {
    const raw = fs.readFileSync('/etc/examlock.conf', 'utf8');
    const cfg = {};
    raw.split('\n').forEach(line => {
      const eq = line.indexOf('=');
      if (eq < 0) return;
      cfg[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
    });
    return cfg;
  } catch {
    return {};
  }
}

function readServerHostname() {
  try {
    const serverUrl = readConfig().SERVER_URL ?? process.env.SERVER_URL;
    if (serverUrl) return new URL(serverUrl).hostname;
  } catch {}
  return null;
}

function readExamUid() {
  try {
    return Number(execSync(`id -u ${EXAM_USER}`, { stdio: 'pipe' }).toString().trim());
  } catch {
    return null;
  }
}

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

async function resolveDomains(domains) {
  const ipv4 = new Set();
  const ipv6 = new Set();

  for (const rawDomain of domains) {
    const domain = normalizeDomain(rawDomain);
    if (!domain) continue;

    const ipVersion = net.isIP(domain);
    if (ipVersion === 4) {
      ipv4.add(domain);
      continue;
    }
    if (ipVersion === 6) {
      ipv6.add(domain);
      continue;
    }

    try {
      const addrs = await dns.resolve4(domain);
      addrs.forEach(ip => ipv4.add(ip));
    } catch {}

    try {
      const addrs = await dns.resolve6(domain);
      addrs.forEach(ip => ipv6.add(ip));
    } catch {}
  }

  return { ipv4, ipv6 };
}

function buildIpRule(uid, family, ips) {
  if (uid === null || ips.size === 0) return null;
  const target = family === 'ip6' ? 'ip6 daddr' : 'ip daddr';
  return `    meta skuid ${uid} ${target} { ${[...ips].join(', ')} } accept`;
}

function buildDnsRules(uids) {
  return uids.flatMap(uid => {
    if (uid === null) return [];
    return [
      `    meta skuid ${uid} udp dport 53 accept`,
      `    meta skuid ${uid} tcp dport 53 accept`,
    ];
  });
}

const SERVER_HOSTNAME = readServerHostname();
const EXAM_UID = readExamUid();
const DAEMON_UID = typeof process.getuid === 'function' ? process.getuid() : 0;

let refreshTimer = null;
let lastDomains = [];
let lastBlock = false;
let lastAdmitted = false;
let lastResolvedIPs = { ipv4: [], ipv6: [] };
let lastApplyAt = null;

async function initFirewall() {
  await applyWhitelist([], false, false);
}

async function applyWhitelist(domains, blockInternet, admitted = true) {
  lastDomains = [...new Set((domains ?? []).map(normalizeDomain).filter(Boolean))];
  lastBlock = Boolean(blockInternet);
  lastAdmitted = Boolean(admitted);

  await buildAndApply(lastDomains, lastBlock, lastAdmitted);
  startRefresh();
}

async function buildAndApply(domains, blockInternet, admitted) {
  const { log } = require('./logger');
  const systemUids = [...new Set([0, DAEMON_UID])];
  const systemHosts = [...new Set([SERVER_HOSTNAME, ...SYSTEM_HOSTS].filter(Boolean))];
  const systemIps = await resolveDomains(systemHosts);
  const studentIps = admitted && blockInternet
    ? await resolveDomains(domains)
    : { ipv4: new Set(), ipv6: new Set() };

  lastResolvedIPs = { ipv4: [...studentIps.ipv4], ipv6: [...studentIps.ipv6] };
  lastApplyAt = new Date().toISOString();

  log('firewall', 'building ruleset', {
    admitted,
    blockInternet,
    domains,
    resolvedIpv4: [...studentIps.ipv4],
    resolvedIpv6: [...studentIps.ipv6],
  });

  const rules = [
    'flush ruleset',
    'table inet examlock {',
    '  chain output {',
    '    type filter hook output priority 0; policy drop;',
    '    oifname "lo" accept',
    '    ct state established,related accept',
    ...buildDnsRules(systemUids),
  ];

  const systemRules = [
    buildIpRule(DAEMON_UID, 'ip', systemIps.ipv4),
    buildIpRule(DAEMON_UID, 'ip6', systemIps.ipv6),
    DAEMON_UID === 0 ? null : buildIpRule(0, 'ip', systemIps.ipv4),
    DAEMON_UID === 0 ? null : buildIpRule(0, 'ip6', systemIps.ipv6),
  ].filter(Boolean);
  systemRules.forEach(rule => rules.push(rule));

  if (EXAM_UID !== null) {
    if (!admitted) {
      rules.push(`    meta skuid ${EXAM_UID} ip daddr 127.0.0.0/8 accept`);
      rules.push(`    meta skuid ${EXAM_UID} ip6 daddr ::1 accept`);
    } else if (!blockInternet) {
      rules.push(`    meta skuid ${EXAM_UID} accept`);
    } else {
      [
        buildIpRule(EXAM_UID, 'ip', studentIps.ipv4),
        buildIpRule(EXAM_UID, 'ip6', studentIps.ipv6),
      ].filter(Boolean).forEach(rule => rules.push(rule));
    }
  }

  rules.push('  }');
  rules.push('}');

  const ruleset = rules.join('\n');
  try {
    execSync('nft -f /dev/stdin', { input: `${ruleset}\n`, stdio: ['pipe', 'pipe', 'pipe'] });
    log('firewall', 'applied mode:', admitted ? (blockInternet ? 'whitelist' : 'open') : 'locked');
  } catch (err) {
    log('firewall', 'apply FAILED:', err.message, 'ruleset:', ruleset);
  }
}

function startRefresh() {
  stopRefresh();
  refreshTimer = setInterval(() => buildAndApply(lastDomains, lastBlock, lastAdmitted), REFRESH_MS);
}

function stopRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

function getDebugState() {
  return {
    lastDomains,
    lastBlock,
    lastAdmitted,
    lastResolvedIPs,
    lastApplyAt,
    examUid: EXAM_UID,
    daemonUid: DAEMON_UID,
  };
}

module.exports = { applyWhitelist, initFirewall, getDebugState };
