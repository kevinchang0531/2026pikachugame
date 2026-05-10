// 純 Web Audio API 程序音樂，不需要音樂檔
// 每關各有不同主題，無縫循環

const N = {
  R: 0,
  C3:130.81, D3:146.83, E3:164.81, F3:174.61, G3:196.00, A3:220.00, B3:246.94,
  C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392.00, A4:440.00, B4:493.88,
  C5:523.25, D5:587.33, E5:659.25, F5:698.46,
};

// 每首曲子：16 拍迴圈，各 layer 拍數總和必須等於 16
const TRACKS = [
  // ── 關卡 1：草原 ─ C 大調・輕快跳躍・BPM 148 ──────────────
  {
    bpm: 148, vol: 0.13,
    layers: [
      { wave: 'square', vol: 0.45, notes: [
        // 旋律 (4 小節×4 拍=16 拍)
        [N.E4,.5],[N.D4,.5],[N.C4,1],[N.E4,.5],[N.G4,.5],[N.E4,1],   // 小節 1
        [N.A4,.5],[N.G4,.5],[N.E4,1],[N.D4,.5],[N.C4,.5],[N.D4,1],   // 小節 2
        [N.E4,.5],[N.G4,.5],[N.C5,1],[N.B4,.5],[N.A4,.5],[N.G4,1],   // 小節 3
        [N.E4,.5],[N.D4,.5],[N.C4,3],                                  // 小節 4
      ]},
      { wave: 'triangle', vol: 0.3, notes: [
        // 低音 (16 拍)
        [N.C3,2],[N.G3,2],[N.F3,2],[N.G3,2],
        [N.C3,2],[N.G3,2],[N.C3,4],
      ]},
      { wave: 'sine', vol: 0.12, notes: [
        // 和聲 pad (16 拍)
        [N.E4,4],[N.D4,4],[N.E4,4],[N.C4,4],
      ]},
    ],
  },

  // ── 關卡 2：熔岩洞窟 ─ A 小調・陰暗神秘・BPM 108 ───────────
  {
    bpm: 108, vol: 0.11,
    layers: [
      { wave: 'triangle', vol: 0.5, notes: [
        // 旋律 (16 拍)
        [N.A3,1],[N.C4,.5],[N.E4,.5],[N.A4,.75],[N.G4,.25],[N.E4,1], // 小節 1
        [N.F4,.5],[N.E4,.5],[N.D4,.5],[N.C4,.5],[N.E4,1],[N.D4,1],   // 小節 2
        [N.G3,1],[N.B3,.5],[N.D4,.5],[N.G4,.75],[N.E4,.25],[N.D4,1], // 小節 3
        [N.E4,.5],[N.D4,.5],[N.C4,1],[N.A3,2],                        // 小節 4
      ]},
      { wave: 'sine', vol: 0.28, notes: [
        // 深沉脈動低音 (16 拍)
        [N.A3,2],[N.R,.5],[N.A3,1.5],[N.G3,2],[N.R,.5],[N.G3,1.5],
        [N.A3,2],[N.R,.5],[N.A3,1.5],[N.E3,4],
      ]},
      { wave: 'sawtooth', vol: 0.06, notes: [
        // 顫音裝飾 (16 拍)
        [N.A4,2],[N.G4,2],[N.F4,2],[N.E4,2],
        [N.D4,2],[N.C4,2],[N.E4,4],
      ]},
    ],
  },

  // ── 關卡 3：電力發電廠 ─ C 大調・快節奏電子・BPM 172 ────────
  {
    bpm: 172, vol: 0.12,
    layers: [
      { wave: 'sawtooth', vol: 0.3, notes: [
        // 快速主旋律 (16 拍)
        [N.C4,.25],[N.E4,.25],[N.G4,.5],[N.C5,.5],[N.B4,.25],[N.G4,.25],[N.E4,.5],[N.R,1.5], // 小節 1
        [N.A4,.25],[N.G4,.25],[N.F4,.5],[N.E4,.5],[N.D4,.25],[N.C4,.25],[N.R,2],              // 小節 2
        [N.G4,.25],[N.E4,.25],[N.C4,.5],[N.E4,.25],[N.G4,.25],[N.A4,.5],[N.B4,.25],[N.C5,.25],[N.R,1.5], // 小節 3
        [N.G4,.25],[N.F4,.25],[N.E4,.25],[N.D4,.25],[N.C4,3],                                 // 小節 4
      ]},
      { wave: 'square', vol: 0.18, notes: [
        // 琶音低音 (32 音符 × 0.5 拍 = 16 拍)
        [N.C3,.5],[N.G3,.5],[N.C3,.5],[N.G3,.5],[N.C3,.5],[N.G3,.5],[N.C3,.5],[N.G3,.5],
        [N.F3,.5],[N.C4,.5],[N.F3,.5],[N.C4,.5],[N.F3,.5],[N.C4,.5],[N.F3,.5],[N.C4,.5],
        [N.C3,.5],[N.G3,.5],[N.C3,.5],[N.G3,.5],[N.C3,.5],[N.G3,.5],[N.C3,.5],[N.G3,.5],
        [N.G3,.5],[N.D4,.5],[N.G3,.5],[N.D4,.5],[N.C3,.5],[N.G3,.5],[N.C3,.5],[N.C3,.5],
      ]},
      { wave: 'sine', vol: 0.15, notes: [
        // 電子節拍（用下降頻率模擬踢鼓）
        [N.C3,.25],[N.R,.75],[N.C3,.25],[N.R,.25],[N.C3,.25],[N.R,.25],[N.C3,.25],[N.R,.75],[N.C3,.25],[N.R,.25],[N.C3,.25],[N.R,.25], // 小節 1+2 (8 拍)
        [N.C3,.25],[N.R,.75],[N.C3,.25],[N.R,.25],[N.C3,.25],[N.R,.25],[N.C3,.25],[N.R,.75],[N.C3,.25],[N.R,.25],[N.C3,.25],[N.R,.25], // 小節 3+4 (8 拍)
      ]},
    ],
  },

  // ── 關卡 4：亞馬遜森林 ─ F 大調・熱帶冒險・BPM 128 ─────────────
  {
    bpm: 128, vol: 0.12,
    layers: [
      { wave: 'square', vol: 0.38, notes: [
        // 旋律 (16 拍)
        [N.C4,.5],[N.F4,.5],[N.G4,.5],[N.A4,.5],[N.G4,.5],[N.F4,.5],[N.C4,1],
        [N.A3,.5],[N.C4,.5],[N.F4,1],[N.G4,.5],[N.A4,.5],[N.G4,1],
        [N.F4,.5],[N.G4,.5],[N.A4,1],[N.C5,.5],[N.A4,.5],[N.G4,1],
        [N.F4,.5],[N.C4,.5],[N.F4,1],[N.C4,2],
      ]},
      { wave: 'triangle', vol: 0.28, notes: [
        // 低音脈動 (16 拍)
        [N.F3,2],[N.C4,2],[N.F3,2],[N.C4,2],
        [N.G3,2],[N.C4,2],[N.F3,4],
      ]},
      { wave: 'sawtooth', vol: 0.09, notes: [
        // 節奏打擊 (16 拍 = 32 × 0.5)
        [N.F3,.5],[N.R,.5],[N.F3,.5],[N.R,.5],[N.F3,.5],[N.R,.5],[N.F3,.5],[N.R,.5],
        [N.F3,.5],[N.R,.5],[N.F3,.5],[N.R,.5],[N.F3,.5],[N.R,.5],[N.F3,.5],[N.R,.5],
        [N.F3,.5],[N.R,.5],[N.F3,.5],[N.R,.5],[N.F3,.5],[N.R,.5],[N.F3,.5],[N.R,.5],
        [N.F3,.5],[N.R,.5],[N.F3,.5],[N.R,.5],[N.F3,.5],[N.R,.5],[N.F3,.5],[N.R,.5],
      ]},
    ],
  },

  // ── 關卡 5：太空軌道 ─ A 小調・飄逸太空・BPM 96 ──────────────
  {
    bpm: 96, vol: 0.11,
    layers: [
      { wave: 'sine', vol: 0.42, notes: [
        // 旋律 (16 拍)
        [N.A4,1],[N.E4,1],[N.C4,1],[N.E4,1],
        [N.G4,1],[N.E4,1],[N.D4,1],[N.E4,1],
        [N.A4,1],[N.G4,1],[N.E4,1],[N.C4,1],
        [N.D4,2],[N.E4,2],
      ]},
      { wave: 'triangle', vol: 0.22, notes: [
        // 緩慢低音 (16 拍)
        [N.A3,4],[N.E3,4],[N.C3,4],[N.G3,4],
      ]},
      { wave: 'sine', vol: 0.11, notes: [
        // 琶音裝飾 (16 拍 = 32 × 0.5)
        [N.A4,.5],[N.E4,.5],[N.C4,.5],[N.E4,.5],[N.A4,.5],[N.E4,.5],[N.C4,.5],[N.E4,.5],
        [N.G4,.5],[N.D4,.5],[N.B3,.5],[N.D4,.5],[N.G4,.5],[N.D4,.5],[N.B3,.5],[N.D4,.5],
        [N.A4,.5],[N.E4,.5],[N.C4,.5],[N.E4,.5],[N.A4,.5],[N.E4,.5],[N.C4,.5],[N.E4,.5],
        [N.D4,.5],[N.A3,.5],[N.E4,.5],[N.D4,.5],[N.E4,.5],[N.C4,.5],[N.A3,.5],[N.E4,.5],
      ]},
    ],
  },

  // ── BOSS 關：緊張決戰 ─ E 小調・重擊電子・BPM 184 ────────────
  {
    bpm: 184, vol: 0.13,
    layers: [
      { wave: 'sawtooth', vol: 0.38, notes: [
        // 主旋律 (16 拍)
        [N.E4,1],[N.G4,1],[N.A4,1],[N.B4,1],
        [N.A4,1],[N.G4,1],[N.E4,2],
        [N.C4,1],[N.E4,1],[N.G4,1],[N.A4,1],
        [N.G4,1],[N.E4,1],[N.E4,2],
      ]},
      { wave: 'square', vol: 0.22, notes: [
        // 低音驅動 (16 拍)
        [N.E3,4],[N.G3,4],[N.C4,4],[N.E3,4],
      ]},
      { wave: 'triangle', vol: 0.14, notes: [
        // 八分音符節拍 (16 拍 = 32個 0.5拍)
        [N.E3,.5],[N.R,.5],[N.E3,.5],[N.R,.5],[N.E3,.5],[N.R,.5],[N.E3,.5],[N.R,.5],
        [N.E3,.5],[N.R,.5],[N.E3,.5],[N.R,.5],[N.E3,.5],[N.R,.5],[N.E3,.5],[N.R,.5],
        [N.E3,.5],[N.R,.5],[N.E3,.5],[N.R,.5],[N.E3,.5],[N.R,.5],[N.E3,.5],[N.R,.5],
        [N.E3,.5],[N.R,.5],[N.E3,.5],[N.R,.5],[N.E3,.5],[N.R,.5],[N.E3,.5],[N.R,.5],
      ]},
    ],
  },
];

// ── 播放引擎 ──────────────────────────────────────────────────

let _ac      = null;
let _master  = null;
let _gen     = 0;       // 世代計數，stop() 時遞增讓舊回呼自動放棄
let _running = false;

function ctx() {
  if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)();
  return _ac;
}

function scheduleLayer(ac, dest, layer, bps, t0) {
  const g = ac.createGain();
  g.gain.value = layer.vol;
  g.connect(dest);

  let t = t0;
  for (const [freq, beats] of layer.notes) {
    const dur = beats / bps;
    if (freq > 0) {
      const osc = ac.createOscillator();
      const env = ac.createGain();
      osc.connect(env); env.connect(g);
      osc.type = layer.wave;
      osc.frequency.value = freq;
      const atk = Math.min(0.02, dur * 0.08);
      const rel = Math.min(0.06, dur * 0.25);
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(1, t + atk);
      env.gain.setValueAtTime(1, t + dur - rel);
      env.gain.linearRampToValueAtTime(0, t + dur);
      osc.start(t);
      osc.stop(t + dur + 0.01);
    }
    t += dur;
  }
  return t - t0; // 回傳實際秒數
}

function loop(track, gen) {
  if (!_running || gen !== _gen) return;

  const ac = ctx();
  if (ac.state === 'suspended') ac.resume();

  const bps = track.bpm / 60;
  let loopSec = 0;

  for (const layer of track.layers) {
    const sec = scheduleLayer(ac, _master, layer, bps, ac.currentTime + 0.04);
    loopSec = Math.max(loopSec, sec);
  }

  // 提前 0.15 秒觸發下一次，確保無縫銜接
  setTimeout(() => loop(track, gen), (loopSec - 0.15) * 1000);
}

export const BGM = {
  /** levelIdx：0-based */
  play(levelIdx) {
    this.stop();
    const track = TRACKS[levelIdx];
    if (!track) return;
    try {
      const ac = ctx();
      if (ac.state === 'suspended') ac.resume();

      // 主增益節點（用於淡入）
      const master = ac.createGain();
      master.gain.setValueAtTime(0, ac.currentTime);
      master.gain.linearRampToValueAtTime(track.vol, ac.currentTime + 0.5);

      // 壓縮器，防止削波
      const comp = ac.createDynamicsCompressor();
      comp.connect(ac.destination);
      master.connect(comp);
      _master  = master;
      _running = true;
      _gen++;
      loop(track, _gen);
    } catch (e) {
      console.warn('BGM play error:', e);
    }
  },

  stop() {
    _running = false;
    _gen++;  // 讓所有舊 setTimeout 回呼失效
    if (_master) {
      try {
        _master.gain.linearRampToValueAtTime(0, ctx().currentTime + 0.3);
      } catch (_) {}
      _master = null;
    }
  },
};
