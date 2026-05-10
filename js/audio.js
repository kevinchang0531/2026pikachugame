// 純 Web Audio API 程序音效，不需要音效檔案
let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function play(setup) {
  try {
    const ac = getCtx();
    if (ac.state === 'suspended') ac.resume();
    setup(ac);
  } catch (_) {}
}

export const Audio = {
  jump() {
    play((ac) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(300, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ac.currentTime + 0.12);
      gain.gain.setValueAtTime(0.18, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + 0.18);
    });
  },

  doubleJump() {
    play((ac) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(500, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ac.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + 0.15);
    });
  },

  collect() {
    play((ac) => {
      [0, 0.06, 0.12].forEach((offset, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = 'sine';
        osc.frequency.value = 880 * Math.pow(1.25, i);
        gain.gain.setValueAtTime(0.15, ac.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + offset + 0.12);
        osc.start(ac.currentTime + offset);
        osc.stop(ac.currentTime + offset + 0.12);
      });
    });
  },

  stomp() {
    play((ac) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ac.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + 0.15);
    });
  },

  hurt() {
    play((ac) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ac.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + 0.3);
    });
  },

  shoot() {
    play((ac) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ac.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.1);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + 0.1);
    });
  },

  bossHurt() {
    play((ac) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(700, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ac.currentTime + 0.22);
      gain.gain.setValueAtTime(0.28, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + 0.25);
    });
  },

  bossDefeat() {
    play((ac) => {
      [330, 392, 523, 659, 784, 1047].forEach((freq, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = 'square';
        osc.frequency.value = freq;
        const t = ac.currentTime + i * 0.1;
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.start(t);
        osc.stop(t + 0.35);
      });
    });
  },

  win() {
    play((ac) => {
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = 'square';
        osc.frequency.value = freq;
        const t = ac.currentTime + i * 0.18;
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
      });
    });
  },
};
