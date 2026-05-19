const { spawn, execFileSync } = require('child_process');
const { log } = require('./logger');
const { EXAM_USER } = require('./config');

const MODIFIER_KEYSYMS = new Set([
  'Shift_L', 'Shift_R', 'Control_L', 'Control_R',
  'Alt_L', 'Alt_R', 'ISO_Level3_Shift', 'Caps_Lock',
  'Super_L', 'Super_R', 'Num_Lock', 'Mode_switch',
  'Meta_L', 'Meta_R',
]);

const SPECIAL_KEYSYM_NAMES = {
  Return: 'Enter',
  BackSpace: 'Backspace',
  Tab: 'Tab',
  Escape: 'Escape',
  Delete: 'Delete',
  Left: '←',
  Right: '→',
  Up: '↑',
  Down: '↓',
  Home: 'Home',
  End: 'End',
  Page_Up: 'PageUp',
  Page_Down: 'PageDown',
  Insert: 'Insert',
  F1: 'F1', F2: 'F2', F3: 'F3', F4: 'F4',
  F5: 'F5', F6: 'F6', F7: 'F7', F8: 'F8',
  F9: 'F9', F10: 'F10', F11: 'F11', F12: 'F12',
  Print: 'PrtSc',
  space: ' ',
};

// Static fallback for common US QWERTY keycodes (when xmodmap fails)
const STATIC_KEYMAP = new Map([
  [10,'1'],[11,'2'],[12,'3'],[13,'4'],[14,'5'],[15,'6'],[16,'7'],[17,'8'],[18,'9'],[19,'0'],
  [20,'-'],[21,'='],[24,'q'],[25,'w'],[26,'e'],[27,'r'],[28,'t'],[29,'y'],[30,'u'],[31,'i'],
  [32,'o'],[33,'p'],[34,'['],[35,']'],[36,'Return'],[38,'a'],[39,'s'],[40,'d'],[41,'f'],[42,'g'],
  [43,'h'],[44,'j'],[45,'k'],[46,'l'],[47,';'],[48,'\''],[51,'\\'],[52,'z'],[53,'x'],[54,'c'],
  [55,'v'],[56,'b'],[57,'n'],[58,'m'],[59,','],[60,'.'],[61,'/'],[65,'space'],
  [22,'BackSpace'],[23,'Tab'],[9,'Escape'],[119,'Delete'],
  [111,'Up'],[116,'Down'],[113,'Left'],[114,'Right'],
  [110,'Home'],[115,'End'],[112,'Page_Up'],[117,'Page_Down'],
  [67,'F1'],[68,'F2'],[69,'F3'],[70,'F4'],[71,'F5'],[72,'F6'],
  [73,'F7'],[74,'F8'],[75,'F9'],[76,'F10'],[95,'F11'],[96,'F12'],
]);

let xinputProc = null;
let onKeyCallback = null;
let keymapCache = null;

const modState = { shift: false, ctrl: false, alt: false, capsLock: false };

function xEnv() {
  return {
    ...process.env,
    DISPLAY: ':0',
    XAUTHORITY: `/home/${EXAM_USER}/.Xauthority`,
  };
}

function loadKeymap() {
  if (keymapCache) return keymapCache;

  const cmds = EXAM_USER
    ? [['runuser', ['-u', EXAM_USER, '--', 'xmodmap', '-pke']]]
    : [['xmodmap', ['-pke']]];

  for (const [cmd, args] of cmds) {
    try {
      const out = execFileSync(cmd, args, { env: xEnv(), stdio: 'pipe', timeout: 5000 }).toString();
      const map = new Map();
      for (const line of out.split('\n')) {
        const m = line.match(/^keycode\s+(\d+)\s*=\s*(.*)$/);
        if (!m) continue;
        const syms = m[2].trim().split(/\s+/).filter(Boolean);
        if (syms.length) map.set(parseInt(m[1], 10), syms);
      }
      if (map.size > 0) {
        log('keylogger', `keymap loaded: ${map.size} keycodes`);
        keymapCache = map;
        return keymapCache;
      }
    } catch (err) {
      log('keylogger', `xmodmap (${cmd}) failed:`, err.message);
    }
  }

  log('keylogger', 'xmodmap unavailable — using static US QWERTY fallback');
  // Build map in same format: keycode → [normal, shift]
  const fallback = new Map();
  for (const [kc, sym] of STATIC_KEYMAP) {
    if (sym.length === 1) {
      fallback.set(kc, [sym, sym.toUpperCase()]);
    } else {
      fallback.set(kc, [sym]);
    }
  }
  keymapCache = fallback;
  return keymapCache;
}

function symToChar(sym) {
  if (!sym || sym === 'NoSymbol') return null;
  if (sym.length === 1) return sym;
  if (/^U[0-9A-Fa-f]{4,}$/.test(sym)) return String.fromCodePoint(parseInt(sym.slice(1), 16));
  return null;
}

function keycodeToEvent(keycode) {
  const syms = (keymapCache ?? new Map()).get(keycode) ?? [];
  const sym0 = syms[0] ?? '';
  const sym = modState.shift ? (syms[1] ?? sym0) : sym0;

  if (modState.ctrl) {
    const ch = symToChar(sym0);
    return { type: 'special', name: ch ? `Ctrl+${ch.toLowerCase()}` : `Ctrl+${sym0}` };
  }
  if (modState.alt) {
    const ch = symToChar(sym0);
    return { type: 'special', name: ch ? `Alt+${ch}` : `Alt+${sym0}` };
  }

  if (sym in SPECIAL_KEYSYM_NAMES) {
    const mapped = SPECIAL_KEYSYM_NAMES[sym];
    return mapped === ' ' ? { type: 'char', ch: ' ' } : { type: 'special', name: mapped };
  }

  const ch = symToChar(sym);
  if (ch) {
    let finalCh = ch;
    if (modState.capsLock && ch.length === 1) {
      if (modState.shift) finalCh = ch.toLowerCase();
      else if (/[a-z]/.test(ch)) finalCh = ch.toUpperCase();
    }
    return { type: 'char', ch: finalCh };
  }

  return null;
}

function updateModifier(keycode, isPress) {
  const syms = (keymapCache ?? new Map()).get(keycode) ?? [];
  const sym = syms[0] ?? '';
  switch (sym) {
    case 'Shift_L': case 'Shift_R': modState.shift = isPress; break;
    case 'Control_L': case 'Control_R': modState.ctrl = isPress; break;
    case 'Alt_L': case 'Alt_R': case 'ISO_Level3_Shift': modState.alt = isPress; break;
    case 'Caps_Lock': if (isPress) modState.capsLock = !modState.capsLock; break;
  }
}

function isModifier(keycode) {
  const syms = (keymapCache ?? new Map()).get(keycode) ?? [];
  return MODIFIER_KEYSYMS.has(syms[0] ?? '');
}

function buildSpawnArgs() {
  // Try with runuser first (ISO env), fall back to direct xinput (dev env)
  if (EXAM_USER) {
    return { cmd: 'runuser', args: ['-u', EXAM_USER, '--', 'xinput', 'test-xi2', '--root'] };
  }
  return { cmd: 'xinput', args: ['test-xi2', '--root'] };
}

function start({ onKey }) {
  if (xinputProc) return;

  keymapCache = loadKeymap();
  onKeyCallback = onKey;
  modState.shift = false;
  modState.ctrl = false;
  modState.alt = false;

  const { cmd, args } = buildSpawnArgs();
  log('keylogger', `spawning: ${cmd} ${args.join(' ')}`);

  try {
    xinputProc = spawn(cmd, args, { env: xEnv(), stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (err) {
    log('keylogger', 'spawn failed:', err.message);
    xinputProc = null;
    onKeyCallback = null;
    onKey({ type: 'error', error: `spawn failed: ${err.message}` });
    return;
  }

  let buf = '';
  let currentType = null;
  let rawLineCount = 0; // debug: log first 20 raw lines to confirm format

  xinputProc.stdout.on('data', chunk => {
    buf += chunk.toString();
    let nl;
    while ((nl = buf.indexOf('\n')) !== -1) {
      const line = buf.slice(0, nl).trimEnd();
      buf = buf.slice(nl + 1);

      if (rawLineCount < 20) {
        log('keylogger', 'raw:', JSON.stringify(line));
        rawLineCount++;
      }

      // Match "EVENT type N (Name)" — may have leading whitespace on some builds
      const evMatch = line.match(/EVENT type (\d+)/);
      if (evMatch) { currentType = parseInt(evMatch[1], 10); continue; }

      if (currentType !== null) {
        // Match "    detail: N" or "detail: N"
        const detailMatch = line.match(/detail:\s*(\d+)/);
        if (detailMatch) {
          const keycode = parseInt(detailMatch[1], 10);
          const isPress = currentType === 2;
          const isRelease = currentType === 3;

          if (isModifier(keycode)) {
            updateModifier(keycode, isPress);
          } else if (isPress) {
            const ev = keycodeToEvent(keycode);
            if (ev) {
              log('keylogger', 'key:', JSON.stringify(ev));
              if (onKeyCallback) onKeyCallback({ ...ev, t: Date.now() });
            } else {
              log('keylogger', `unmapped keycode ${keycode}, syms:`, JSON.stringify((keymapCache ?? new Map()).get(keycode)));
            }
          }
          currentType = null;
        }
      }
    }
  });

  xinputProc.stderr.on('data', chunk => {
    log('keylogger', 'stderr:', chunk.toString().trim());
  });

  xinputProc.on('error', err => {
    log('keylogger', 'process error:', err.message);
    xinputProc = null;
    if (onKeyCallback) onKeyCallback({ type: 'error', error: err.message });
    onKeyCallback = null;
  });

  xinputProc.on('close', code => {
    log('keylogger', 'process closed, code:', code);
    if (code !== 0 && code !== null) {
      if (onKeyCallback) onKeyCallback({ type: 'error', error: `xinput exited with code ${code}` });
    }
    xinputProc = null;
  });

  log('keylogger', 'started');
}

function stop() {
  if (!xinputProc) return;
  try { xinputProc.kill('SIGTERM'); } catch {}
  xinputProc = null;
  onKeyCallback = null;
  keymapCache = null;
  log('keylogger', 'stopped');
}

module.exports = { start, stop };
