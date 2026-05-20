// audio.js — WebAudio synth compartido

let ctx = null;
let active = true;

function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
}

export function setAudioActive(val) { active = val; }
export function isAudioActive() { return active; }

export function playSound(type) {
    if (!active) return;
    try {
        const ac = getCtx();
        const now = ac.currentTime;
        switch (type) {
            case 'connect': {
                const osc = ac.createOscillator(), gain = ac.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.15);
                osc.connect(gain); gain.connect(ac.destination);
                osc.start(now); osc.stop(now + 0.15);
                break;
            }
            case 'warning': {
                [0, 0.15].forEach(d => {
                    const osc = ac.createOscillator(), gain = ac.createGain();
                    const flt = ac.createBiquadFilter();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(293.66, now + d);
                    osc.frequency.linearRampToValueAtTime(329.63, now + d + 0.1);
                    gain.gain.setValueAtTime(0.06, now + d);
                    gain.gain.linearRampToValueAtTime(0, now + d + 0.12);
                    flt.type = 'lowpass'; flt.frequency.value = 800;
                    osc.connect(flt); flt.connect(gain); gain.connect(ac.destination);
                    osc.start(now + d); osc.stop(now + d + 0.12);
                });
                break;
            }
            case 'critical': {
                const osc1 = ac.createOscillator(), osc2 = ac.createOscillator();
                const gain = ac.createGain(), flt = ac.createBiquadFilter();
                osc1.type = 'sawtooth'; osc1.frequency.setValueAtTime(110, now); osc1.frequency.linearRampToValueAtTime(80, now + 0.5);
                osc2.type = 'triangle'; osc2.frequency.setValueAtTime(112, now); osc2.frequency.linearRampToValueAtTime(82, now + 0.5);
                gain.gain.setValueAtTime(0.12, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                flt.type = 'lowpass'; flt.frequency.value = 500;
                osc1.connect(flt); osc2.connect(flt); flt.connect(gain); gain.connect(ac.destination);
                osc1.start(now); osc2.start(now); osc1.stop(now + 0.55); osc2.stop(now + 0.55);
                break;
            }
            case 'success': {
                [523.25, 659.25, 783.99].forEach((freq, i) => {
                    const osc = ac.createOscillator(), gain = ac.createGain();
                    osc.type = 'sine';
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.04, now + i * 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35 + i * 0.05);
                    osc.connect(gain); gain.connect(ac.destination);
                    osc.start(now + i * 0.05); osc.stop(now + 0.4 + i * 0.05);
                });
                break;
            }
            case 'ping': {
                const osc = ac.createOscillator(), gain = ac.createGain();
                osc.type = 'sine'; osc.frequency.value = 1200;
                gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                osc.connect(gain); gain.connect(ac.destination);
                osc.start(now); osc.stop(now + 0.08);
                break;
            }
        }
    } catch(e) { /* silently fail */ }
}
