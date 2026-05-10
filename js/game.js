import { Input }  from './input.js';
import { Player } from './player.js';
import { Audio }  from './audio.js';
import { BGM }    from './bgm.js';
import { Boss }   from './boss.js';
import { LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5, LEVEL_BOSS } from './level.js';

const LEVELS = [LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5, LEVEL_BOSS];

export class Game {
  constructor(canvas) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');
    this.input   = new Input();
    this.running = false;
    this.lastTime = 0;
    this.lives   = 3;
    this.score   = 0;
    this._levelIdx = 0;
    this._state  = 'menu';
    this._menuKeyHeld = false;
    this.level   = null;
    this.player  = null;
    this.bullets = [];
    this.cameraX = 0;
    this.won     = false;
    this._winTimer = 0;
    this._time   = 0;
    this.boss    = null;
  }

  _load(levelDef) {
    this.level = {
      ...levelDef,
      enemies:      levelDef.enemies.map(e => Object.assign(Object.create(Object.getPrototypeOf(e)), e)),
      collectibles: levelDef.collectibles.map(c => Object.assign(Object.create(Object.getPrototypeOf(c)), c)),
    };
    this.level.collectibles.forEach(c => { c.collected = false; c._t = Math.random() * Math.PI * 2; });
    this.level.enemies.forEach(e => { e.dead = false; e.deathTimer = 0; e.x = e.startX; });

    this.player  = new Player(levelDef.playerStart.x, levelDef.playerStart.y);
    this.bullets = [];
    this.cameraX = 0;
    this.won     = false;
    this._winTimer = 0;
    this._time   = 0;
    this.boss    = levelDef.bossStart ? new Boss(levelDef.bossStart.x, levelDef.bossStart.y) : null;
    BGM.play(this._levelIdx);
  }

  _startGame() {
    this.lives = 3;
    this.score = 0;
    this._levelIdx = 0;
    this._load(LEVELS[0]);
    this._state = 'playing';
    this._menuKeyHeld = true; // 防止剛開始就因按鍵殘留而觸發其他動作
  }

  _loseLife() {
    if (this._state !== 'playing') return;
    this.lives--;
    if (this.lives <= 0) {
      this._state = 'gameover';
      BGM.stop();
      Audio.hurt();
    } else {
      this.player.respawn();
    }
  }

  start() {
    this.running  = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  loop(timestamp) {
    const dt = Math.min(timestamp - this.lastTime, 50);
    this.lastTime = timestamp;
    this.update(dt);
    this.draw();
    if (this.running) requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    const anyKey = Object.values(this.input.keys).some(Boolean);

    if (this._state !== 'playing') {
      if (!this._menuKeyHeld && anyKey) {
        if (this._state === 'clear') {
          this._state = 'menu';
        } else {
          this._startGame(); // menu / gameover → 開始/重試
        }
      }
      this._menuKeyHeld = anyKey;
      return;
    }

    this._menuKeyHeld = anyKey;
    this._updatePlaying(dt);
  }

  _updatePlaying(dt) {
    const { player, level } = this;

    if (this.won) {
      this._winTimer += dt;
      if (this._winTimer > 2200) {
        const nextIdx = this._levelIdx + 1;
        if (nextIdx >= LEVELS.length) {
          this._state = 'clear';
          BGM.stop();
        } else {
          this._levelIdx = nextIdx;
          this._load(LEVELS[this._levelIdx]);
        }
      }
      return;
    }

    this._time += dt;
    player.update(dt, this.input, level.platforms);

    // 射擊
    const newBullet = player.tryShoot(this.input);
    if (newBullet) this.bullets.push(newBullet);

    this.bullets = this.bullets.filter(b => b.active);
    for (const b of this.bullets) b.update(dt);

    if (this.boss) {
      // ── BOSS 關邏輯 ──
      this.boss.update(dt);

      // Boss 子彈打玩家
      for (const p of this.boss.projectiles) {
        if (p.hitTest(player) && !player.invincible) {
          p.active = false;
          this._loseLife();
        }
      }

      // 玩家踩/碰 Boss
      const bossResult = this.boss.hitTest(player);
      if (bossResult === 'stomp') {
        if (this.boss.takeDamage()) {
          player.vy = -480;
          this.score += 200;
          Audio.bossHurt();
        } else {
          player.vy = -280;
        }
      } else if (bossResult === 'hurt' && !player.invincible) {
        this._loseLife();
      }

      // 玩家子彈打 Boss
      for (const b of this.bullets) {
        if (b.active && this.boss.hitByBullet(b)) {
          b.active = false;
          this.score += 200;
          Audio.bossHurt();
        }
      }

      // Boss 死亡 → 通關
      if (this.boss.dead && !this.won) {
        this.won = true;
        this._winTimer = 0;
        Audio.bossDefeat();
      }
    } else {
      // ── 一般關卡邏輯 ──

      // 子彈打敵人
      for (const b of this.bullets) {
        for (const e of level.enemies) {
          if (b.active && b.hitTest(e)) {
            b.active = false;
            e.die();
            this.score += 100;
            Audio.stomp();
          }
        }
      }

      // 敵人更新 & 碰撞
      for (const e of level.enemies) {
        e.update(dt);
        if (e.dead) continue;
        const result = e.hitTest(player);
        if (result === 'stomp') {
          e.die();
          player.vy = -400;
          this.score += 100;
          Audio.stomp();
        } else if (result === 'hurt' && !player.invincible) {
          this._loseLife();
        }
      }

      // 收集物
      for (const c of level.collectibles) {
        if (!c.collected && c.hitTest(player)) {
          c.collected = true;
          this.score += c.type === 'bolt' ? 50 : 30;
          Audio.collect();
        }
        c.update(dt);
      }

      // 終點旗
      const g = level.goal;
      if (g &&
          player.x + player.w > g.x && player.x < g.x + g.w &&
          player.y + player.h > g.y && player.y < g.y + g.h) {
        this.won = true;
        this._winTimer = 0;
        Audio.win();
      }
    }

    // 鏡頭
    const targetX = player.x - this.canvas.width / 3;
    this.cameraX = Math.max(0, Math.min(targetX, level.width - this.canvas.width));

    // 掉落死亡
    if (player.y > 1200) this._loseLife();
  }

  draw() {
    if (this._state === 'menu')  { this._drawMenu();  return; }
    if (this._state === 'clear') { this._drawClear(); return; }

    // playing / gameover 都畫遊戲畫面
    const { ctx, canvas, cameraX, level } = this;

    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, level.bg[0]);
    sky.addColorStop(1, level.bg[1]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this._drawBgDecor(cameraX, level.bg[0]);

    ctx.save();
    ctx.translate(-cameraX, 0);

    for (const p of level.platforms)    p.draw(ctx);
    for (const c of level.collectibles) c.draw(ctx);
    for (const e of level.enemies)      if (e.alive) e.draw(ctx);
    for (const b of this.bullets)       b.draw(ctx);
    if (level.goal) this._drawGoal(ctx, level.goal);
    if (this.boss)  this.boss.draw(ctx);
    this.player.draw(ctx);

    ctx.restore();

    this._drawHUD();
    if (this.won)                   this._drawWin();
    if (this._state === 'gameover') this._drawGameOver();
  }

  // ── 背景裝飾 ────────────────────────────────────────────────

  _drawBgDecor(camX, topColor) {
    const { level } = this;
    if (level.bgType === 'cave')     { this._drawCaveDecor(camX);     return; }
    if (level.bgType === 'electric') { this._drawElectricDecor(camX); return; }
    if (level.bgType === 'jungle')   { this._drawJungleDecor(camX);   return; }
    if (level.bgType === 'space')    { this._drawSpaceDecor(camX);    return; }
    if (level.bgType === 'boss')     { this._drawBossDecor(camX);     return; }

    const isNight = topColor.startsWith('#0') || topColor.startsWith('#1');
    const { ctx, canvas } = this;

    if (isNight) {
      ctx.fillStyle = '#fff';
      [50,120,200,310,430,550,670,760].forEach((sx, i) => {
        const x = ((sx - camX * 0.1) % (canvas.width + 40) + canvas.width + 40) % (canvas.width + 40) - 20;
        const y = 30 + (i * 37) % 140;
        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
      });
      const mx = ((600 - camX * 0.05) % (canvas.width + 100) + canvas.width + 100) % (canvas.width + 100) - 50;
      ctx.fillStyle = '#fffbe6';
      ctx.beginPath(); ctx.arc(mx, 60, 28, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = level.bg[0];
      ctx.beginPath(); ctx.arc(mx + 10, 54, 22, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      [100,400,700,1000,1300,1600].forEach((cx) => {
        const x = ((cx - camX * 0.3) % (canvas.width + 200) + canvas.width + 200) % (canvas.width + 200) - 100;
        const y = 60 + (cx % 80);
        ctx.beginPath();
        ctx.arc(x,      y,      30, 0, Math.PI * 2);
        ctx.arc(x + 30, y - 10, 20, 0, Math.PI * 2);
        ctx.arc(x + 55, y,      25, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  _drawJungleDecor(camX) {
    const { ctx, canvas, level } = this;
    const t = this._time / 1000;

    // 底部薄霧
    const mist = ctx.createLinearGradient(0, canvas.height - 160, 0, canvas.height);
    mist.addColorStop(0, 'rgba(0,0,0,0)');
    mist.addColorStop(1, 'rgba(10,40,5,0.45)');
    ctx.fillStyle = mist;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 頂部樹冠遮蔭
    const canopy = ctx.createLinearGradient(0, 0, 0, 130);
    canopy.addColorStop(0, 'rgba(0,25,0,0.65)');
    canopy.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = canopy;
    ctx.fillRect(0, 0, canvas.width, 130);

    // 藤蔓
    if (level.vines) {
      ctx.save();
      ctx.translate(-camX * 0.85, 0);
      for (const [wx, len] of level.vines) {
        const sx = wx - camX * 0.85 + camX;
        if (sx < -50 || sx > canvas.width + 50) continue;
        const sway = Math.sin(t * 0.8 + wx * 0.02) * 10;
        ctx.strokeStyle = '#1a5a10';
        ctx.lineWidth = 5 + (wx % 5);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(wx, 0);
        ctx.quadraticCurveTo(wx + sway, len * 0.5, wx + sway * 1.4, len);
        ctx.stroke();
        // 葉片
        ctx.fillStyle = '#2a7a1a';
        ctx.beginPath();
        ctx.ellipse(wx + sway * 1.4, len, 9, 5, sway * 0.05, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 螢火蟲
    for (let i = 0; i < 14; i++) {
      const fx = ((i * 420 + 80 - camX * 0.55) % (canvas.width + 120) + canvas.width + 120) % (canvas.width + 120) - 60;
      const fy = 280 + (i * 53) % 440;
      if (Math.sin(t * 2.2 + i * 1.4) > 0.55) {
        ctx.fillStyle = 'rgba(190,255,80,0.7)';
        ctx.beginPath();
        ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  _drawSpaceDecor(camX) {
    const { ctx, canvas } = this;
    const t = this._time / 1000;

    // 三層視差星星
    const layers = [
      { count: 60, par: 0.05, rMin: 0.5, rMax: 1.0, baseAlpha: 0.65 },
      { count: 35, par: 0.15, rMin: 1.0, rMax: 1.6, baseAlpha: 0.85 },
      { count: 18, par: 0.30, rMin: 1.6, rMax: 2.5, baseAlpha: 1.00 },
    ];
    for (const g of layers) {
      for (let i = 0; i < g.count; i++) {
        const bx = (i * 7919) % 5200;
        const by = (i * 3571) % (canvas.height - 40) + 20;
        const sx = ((bx - camX * g.par) % (canvas.width + 60) + canvas.width + 60) % (canvas.width + 60) - 30;
        const twinkle = g.par < 0.1 ? 1 : 0.5 + 0.5 * Math.sin(t * 1.8 + i * 0.7);
        const r = g.rMin + (i % 3) * (g.rMax - g.rMin) / 2;
        ctx.globalAlpha = g.baseAlpha * twinkle;
        ctx.fillStyle = i % 5 === 0 ? '#aaaaff' : i % 7 === 0 ? '#ffbbaa' : '#ffffff';
        ctx.beginPath(); ctx.arc(sx, by, r, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // 星雲光暈
    for (let j = 0; j < 3; j++) {
      const nx = ((j * 1700 + 500 - camX * 0.07) % (canvas.width + 360) + canvas.width + 360) % (canvas.width + 360) - 180;
      const ny = 160 + j * 220;
      const grd = ctx.createRadialGradient(nx, ny, 0, nx, ny, 200 + j * 40);
      const cols = ['rgba(70,0,110,0.07)', 'rgba(0,30,90,0.07)', 'rgba(50,0,70,0.06)'];
      grd.addColorStop(0, cols[j]); grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 流星（偶發）
    if (Math.sin(t * 0.7) > 0.92) {
      const mx = ((t * 80) % (canvas.width + 200)) - 100;
      const my = ((t * 40) % canvas.height);
      ctx.strokeStyle = 'rgba(255,255,220,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(mx - 60, my + 20);
      ctx.stroke();
    }
  }

  _drawCaveDecor(camX) {
    const { ctx, canvas, level } = this;

    const lavaGlow = ctx.createLinearGradient(0, canvas.height - 120, 0, canvas.height);
    lavaGlow.addColorStop(0, 'rgba(0,0,0,0)');
    lavaGlow.addColorStop(1, 'rgba(220,60,0,0.35)');
    ctx.fillStyle = lavaGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const wallL = ctx.createLinearGradient(0, 0, 80, 0);
    wallL.addColorStop(0, 'rgba(0,0,0,0.5)');
    wallL.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = wallL;
    ctx.fillRect(0, 0, 80, canvas.height);

    const wallR = ctx.createLinearGradient(canvas.width - 80, 0, canvas.width, 0);
    wallR.addColorStop(0, 'rgba(0,0,0,0)');
    wallR.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = wallR;
    ctx.fillRect(canvas.width - 80, 0, 80, canvas.height);

    if (!level.stalactites) return;
    ctx.save();
    ctx.translate(-camX * 0.9, 0);

    for (const [wx, len] of level.stalactites) {
      const sx = wx - camX * 0.9 + camX;
      if (sx < -60 || sx > canvas.width + 60) continue;

      const w = 18 + (wx % 14);
      ctx.fillStyle = '#3d1a08';
      ctx.beginPath();
      ctx.moveTo(wx - w / 2, 0);
      ctx.lineTo(wx + w / 2, 0);
      ctx.lineTo(wx,         len);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(120,60,30,0.6)';
      ctx.beginPath();
      ctx.moveTo(wx - 3, len - 20);
      ctx.lineTo(wx + 3, len - 20);
      ctx.lineTo(wx,     len);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  _drawElectricDecor(camX) {
    const { ctx, canvas, level } = this;
    const t = this._time / 1000;

    const glow = ctx.createLinearGradient(0, canvas.height - 160, 0, canvas.height);
    glow.addColorStop(0, 'rgba(0,0,0,0)');
    glow.addColorStop(1, 'rgba(0,80,255,0.2)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(0,20,60,0.08)';
    for (let sy = 0; sy < canvas.height; sy += 4) {
      ctx.fillRect(0, sy, canvas.width, 2);
    }

    if (!level.circuits) return;
    ctx.save();
    ctx.translate(-camX * 0.4, 0);

    for (const [wx, wy, type] of level.circuits) {
      const sx = wx - camX * 0.4 + camX;
      if (sx < -100 || sx > canvas.width + 100) continue;

      const phase = (t * 1.5 + wx * 0.003) % 1;
      const alpha = 0.15 + 0.2 * Math.abs(Math.sin(phase * Math.PI));

      ctx.strokeStyle = `rgba(0,150,255,${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (type === 'h') {
        ctx.moveTo(wx - 60, wy); ctx.lineTo(wx + 60, wy);
      } else {
        ctx.moveTo(wx, wy - 60); ctx.lineTo(wx, wy + 60);
      }
      ctx.stroke();

      ctx.fillStyle = `rgba(80,200,255,${alpha + 0.1})`;
      ctx.beginPath(); ctx.arc(wx, wy, 3, 0, Math.PI * 2); ctx.fill();

      if (Math.sin(t * 3 + wx) > 0.92) {
        ctx.fillStyle = 'rgba(200,240,255,0.8)';
        ctx.beginPath(); ctx.arc(wx, wy, 5, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }

  _drawBossDecor(camX) {
    const { ctx, canvas } = this;

    const lGlow = ctx.createLinearGradient(0, 0, 100, 0);
    lGlow.addColorStop(0, 'rgba(120,0,180,0.35)');
    lGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = lGlow;
    ctx.fillRect(0, 0, 100, canvas.height);

    const rGlow = ctx.createLinearGradient(canvas.width - 100, 0, canvas.width, 0);
    rGlow.addColorStop(0, 'rgba(0,0,0,0)');
    rGlow.addColorStop(1, 'rgba(120,0,180,0.35)');
    ctx.fillStyle = rGlow;
    ctx.fillRect(canvas.width - 100, 0, 100, canvas.height);

    ctx.fillStyle = 'rgba(0,0,0,0.07)';
    for (let sy = 0; sy < canvas.height; sy += 4) {
      ctx.fillRect(0, sy, canvas.width, 2);
    }

    // 隨機閃電
    if (Math.random() < 0.025) {
      const lx = 40 + Math.random() * (canvas.width - 80);
      ctx.strokeStyle = 'rgba(200,80,255,0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      let y = 0;
      while (y < canvas.height) {
        y += 40 + Math.random() * 60;
        ctx.lineTo(lx + (Math.random() - 0.5) * 80, y);
      }
      ctx.stroke();
    }
  }

  // ── HUD ─────────────────────────────────────────────────────

  _drawHUD() {
    const { ctx, canvas } = this;
    const lv = this._levelIdx + 1;

    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, canvas.width, 44);

    // 分數
    ctx.fillStyle = '#ffcb05';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`⚡ ${this.score}`, 12, 28);

    // 關卡
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    const isBossLevel = this._levelIdx === LEVELS.length - 1;
    ctx.fillText(isBossLevel ? '⚡ BOSS' : `第 ${lv} 關`, canvas.width / 2, 28);

    // 生命值
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ff5555';
    ctx.font = 'bold 17px monospace';
    const hearts = '♥'.repeat(Math.max(0, this.lives)) + '♡'.repeat(Math.max(0, 3 - this.lives));
    ctx.fillText(hearts, canvas.width - 10, 28);
  }

  // ── 遊戲畫面 ─────────────────────────────────────────────────

  _drawGoal(ctx, g) {
    ctx.strokeStyle = '#888'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(g.x + 4, g.y + g.h); ctx.lineTo(g.x + 4, g.y - 30); ctx.stroke();
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath(); ctx.moveTo(g.x + 4, g.y - 30); ctx.lineTo(g.x + 28, g.y - 20); ctx.lineTo(g.x + 4, g.y - 10); ctx.fill();
    ctx.fillStyle = '#ffcb05';
    ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('⚡', g.x - 4, g.y + g.h - 8);
  }

  _drawWin() {
    const { ctx, canvas } = this;
    const isBoss = this._levelIdx === LEVELS.length - 1;
    const progress = Math.min(this._winTimer / 300, 1);

    ctx.fillStyle = `rgba(0,0,0,${0.55 * progress})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (progress < 1) return;

    ctx.fillStyle = '#ffcb05';
    ctx.font = 'bold 52px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isBoss ? '⚡ BOSS 擊敗！' : '⚡ 關卡通過！', canvas.width / 2, canvas.height / 2 - 24);

    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#fff';
    const nextMsg = this._levelIdx + 1 === LEVELS.length - 1
      ? '準備挑戰最終 BOSS！'
      : `準備進入第 ${this._levelIdx + 2} 關…`;
    ctx.fillText(
      isBoss ? `得分：${this.score}　即將顯示通關結果…` : `得分：${this.score}　${nextMsg}`,
      canvas.width / 2, canvas.height / 2 + 28
    );
  }

  // ── 選單 / GameOver / 通關畫面 ──────────────────────────────

  _drawMenu() {
    const { ctx, canvas } = this;
    const t = performance.now();

    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, '#001040');
    bg.addColorStop(1, '#000820');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 漂浮 ⚡
    ctx.font = '24px sans-serif';
    for (let i = 0; i < 12; i++) {
      const px = ((i * 137 + t * 0.025) % (canvas.width + 60)) - 30;
      const py = ((i * 83  + t * 0.018 + i * 50) % (canvas.height + 60)) - 30;
      ctx.globalAlpha = 0.12 + 0.06 * Math.sin(t / 800 + i);
      ctx.fillStyle = '#ffcb05';
      ctx.fillText('⚡', px, py);
    }
    ctx.globalAlpha = 1;

    // 標題
    ctx.save();
    ctx.shadowColor = '#ffcb05';
    ctx.shadowBlur  = 32;
    ctx.fillStyle   = '#ffcb05';
    ctx.font        = 'bold 68px sans-serif';
    ctx.textAlign   = 'center';
    ctx.fillText('⚡ PIKACHU', canvas.width / 2, 260);
    ctx.fillText('大冒險', canvas.width / 2, 336);
    ctx.restore();

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font      = '22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('2026', canvas.width / 2, 378);

    // 閃爍提示
    if (Math.sin(t / 420) > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.font      = 'bold 26px monospace';
      ctx.fillText('按任意鍵開始', canvas.width / 2, 510);
    }

    // 操作說明
    ctx.fillStyle = 'rgba(255,255,255,0.38)';
    ctx.font      = '14px monospace';
    ctx.fillText('← → 移動　↑ / Space 跳（二段跳）　Z / Ctrl 射擊', canvas.width / 2, 700);
    ctx.fillText('踩在敵人頭上消滅　共 5 關 ＋ BOSS 決戰', canvas.width / 2, 726);
    ctx.fillText('3 條命　掉落或碰到敵人扣命', canvas.width / 2, 752);
  }

  _drawGameOver() {
    const { ctx, canvas } = this;
    const t = performance.now();

    ctx.fillStyle = 'rgba(0,0,0,0.80)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#e74c3c';
    ctx.font      = 'bold 76px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 60);

    ctx.fillStyle = '#ffcb05';
    ctx.font      = 'bold 28px monospace';
    ctx.fillText(`分數：${this.score}`, canvas.width / 2, canvas.height / 2 + 14);

    if (Math.sin(t / 450) > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.font      = 'bold 22px monospace';
      ctx.fillText('按任意鍵重新開始', canvas.width / 2, canvas.height / 2 + 74);
    }
  }

  _drawClear() {
    const { ctx, canvas } = this;
    const t = performance.now();

    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, '#2a1800');
    bg.addColorStop(1, '#0a0800');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 閃爍星星
    ctx.font = '18px sans-serif';
    for (let i = 0; i < 20; i++) {
      const sx = ((i * 163 + t * 0.035) % (canvas.width + 60)) - 30;
      const sy = ((i * 97  + t * 0.055 + i * 35) % (canvas.height + 60)) - 30;
      const a  = 0.3 + 0.7 * Math.abs(Math.sin(t / 300 + i));
      ctx.globalAlpha = a;
      ctx.fillStyle   = '#ffcb05';
      ctx.fillText('✨', sx, sy);
    }
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.shadowColor = '#ffcb05';
    ctx.shadowBlur  = 40;
    ctx.fillStyle   = '#ffcb05';
    ctx.font        = 'bold 72px sans-serif';
    ctx.textAlign   = 'center';
    ctx.fillText('🏆 全關通關！', canvas.width / 2, 300);
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`最終分數：${this.score}`, canvas.width / 2, 392);

    ctx.fillStyle = 'rgba(255,203,5,0.8)';
    ctx.font      = '22px monospace';
    ctx.fillText('⚡ 皮卡丘萬歲！⚡', canvas.width / 2, 444);

    if (Math.sin(t / 420) > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font      = 'bold 22px monospace';
      ctx.fillText('按任意鍵回到選單', canvas.width / 2, 564);
    }
  }
}
