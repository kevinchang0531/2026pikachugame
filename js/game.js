import { Input }              from './input.js';
import { Player }             from './player.js';
import { Audio }              from './audio.js';
import { BGM }                from './bgm.js';
import { LEVEL_1, LEVEL_2, LEVEL_3 } from './level.js';

const LEVELS = [LEVEL_1, LEVEL_2, LEVEL_3];

export class Game {
  constructor(canvas) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');
    this.input   = new Input();
    this.running = false;
    this.lastTime = 0;
    this._levelIdx = 0;
    this._load(LEVELS[0]);
  }

  _load(levelDef) {
    // 深複製關卡（重玩/換關時敵人和收集物重置）
    this.level = {
      ...levelDef,
      enemies:      levelDef.enemies.map(e => Object.assign(Object.create(Object.getPrototypeOf(e)), e)),
      collectibles: levelDef.collectibles.map(c => Object.assign(Object.create(Object.getPrototypeOf(c)), c)),
    };
    // 重置收集物狀態
    this.level.collectibles.forEach(c => { c.collected = false; c._t = Math.random() * Math.PI * 2; });
    this.level.enemies.forEach(e => { e.dead = false; e.deathTimer = 0; e.x = e.startX; });

    this.player  = new Player(levelDef.playerStart.x, levelDef.playerStart.y);
    this.bullets = [];
    this.cameraX = 0;
    this.won     = false;
    this.score   = this.score ?? 0;
    this._winTimer = 0;
    this._time   = 0;
    BGM.play(this._levelIdx);
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
    const { player, level } = this;

    if (this.won) {
      this._winTimer += dt;
      // 自動進入下一關
      if (this._winTimer > 2200) {
        this._levelIdx = (this._levelIdx + 1) % LEVELS.length;
        this._load(LEVELS[this._levelIdx]);
      }
      return;
    }

    this._time += dt;
    player.update(dt, this.input, level.platforms);

    // ── 射擊 ──
    const newBullet = player.tryShoot(this.input);
    if (newBullet) this.bullets.push(newBullet);

    this.bullets = this.bullets.filter(b => b.active);
    for (const b of this.bullets) {
      b.update(dt);
      for (const e of level.enemies) {
        if (b.hitTest(e)) {
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
        player.vy = -400; // 踩到後小彈跳
        this.score += 100;
        Audio.stomp();
      } else if (result === 'hurt' && !player.invincible) {
        player.respawn();
      }
    }

    // 收集物碰撞
    for (const c of level.collectibles) {
      if (!c.collected && c.hitTest(player)) {
        c.collected = true;
        this.score += c.type === 'bolt' ? 50 : 30;
        Audio.collect();
      }
      c.update(dt);
    }

    // 鏡頭
    const targetX = player.x - this.canvas.width / 3;
    this.cameraX = Math.max(0, Math.min(targetX, level.width - this.canvas.width));

    // 終點
    const g = level.goal;
    if (player.x + player.w > g.x && player.x < g.x + g.w &&
        player.y + player.h > g.y && player.y < g.y + g.h) {
      this.won = true;
      this._winTimer = 0;
      Audio.win();
    }
  }

  draw() {
    const { ctx, canvas, cameraX, level } = this;

    // 天空背景
    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, level.bg[0]);
    sky.addColorStop(1, level.bg[1]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 裝飾（白天雲 / 夜晚星星）
    this._drawBgDecor(cameraX, level.bg[0]);

    ctx.save();
    ctx.translate(-cameraX, 0);

    for (const p of level.platforms)    p.draw(ctx);
    for (const c of level.collectibles) c.draw(ctx);
    for (const e of level.enemies)      if (e.alive) e.draw(ctx);
    for (const b of this.bullets)       b.draw(ctx);
    this._drawGoal(ctx, level.goal);
    this.player.draw(ctx);

    ctx.restore();

    this._drawHUD();
    if (this.won) this._drawWin();
  }

  _drawBgDecor(camX, topColor) {
    const { ctx, canvas, level } = this;

    if (level.bgType === 'cave')     { this._drawCaveDecor(camX);     return; }
    if (level.bgType === 'electric') { this._drawElectricDecor(camX); return; }

    const isNight = topColor.startsWith('#0') || topColor.startsWith('#1');
    if (isNight) {
      // 星星
      ctx.fillStyle = '#fff';
      [50,120,200,310,430,550,670,760].forEach((sx, i) => {
        const x = ((sx - camX * 0.1) % (canvas.width + 40) + canvas.width + 40) % (canvas.width + 40) - 20;
        const y = 30 + (i * 37) % 140;
        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
      });
      // 月亮
      const mx = ((600 - camX * 0.05) % (canvas.width + 100) + canvas.width + 100) % (canvas.width + 100) - 50;
      ctx.fillStyle = '#fffbe6';
      ctx.beginPath(); ctx.arc(mx, 60, 28, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = level.bg[0];
      ctx.beginPath(); ctx.arc(mx + 10, 54, 22, 0, Math.PI * 2); ctx.fill();
    } else {
      // 雲朵
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

  _drawCaveDecor(camX) {
    const { ctx, canvas, level } = this;

    // ── 熔岩光暈（畫面底部橘紅色輝光）──
    const lavaGlow = ctx.createLinearGradient(0, canvas.height - 120, 0, canvas.height);
    lavaGlow.addColorStop(0, 'rgba(0,0,0,0)');
    lavaGlow.addColorStop(1, 'rgba(220,60,0,0.35)');
    ctx.fillStyle = lavaGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ── 岩壁紋理（左右兩側暗色遮罩讓畫面有洞窟感）──
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

    // ── 鐘乳石（視差 0.9，貼近前景）──
    if (!level.stalactites) return;
    ctx.save();
    ctx.translate(-camX * 0.9, 0);

    for (const [wx, len] of level.stalactites) {
      // 視野剔除（只畫可見範圍 ±100px）
      const sx = wx - camX * 0.9 + camX; // 還原螢幕 x
      if (sx < -60 || sx > canvas.width + 60) continue;

      const w = 18 + (wx % 14);  // 寬度 18~32
      ctx.fillStyle = '#3d1a08';
      ctx.beginPath();
      ctx.moveTo(wx - w / 2, 0);
      ctx.lineTo(wx + w / 2, 0);
      ctx.lineTo(wx,         len);
      ctx.closePath();
      ctx.fill();

      // 石尖點高光
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

    // 底部藍色電場光暈
    const glow = ctx.createLinearGradient(0, canvas.height - 160, 0, canvas.height);
    glow.addColorStop(0, 'rgba(0,0,0,0)');
    glow.addColorStop(1, 'rgba(0,80,255,0.2)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 掃描線（CRT 效果）
    ctx.fillStyle = 'rgba(0,20,60,0.08)';
    for (let sy = 0; sy < canvas.height; sy += 4) {
      ctx.fillRect(0, sy, canvas.width, 2);
    }

    // 電路走線（視差 0.4，僅畫可見範圍內的）
    if (!level.circuits) return;
    ctx.save();
    ctx.translate(-camX * 0.4, 0);

    for (const [wx, wy, type] of level.circuits) {
      const sx = wx - camX * 0.4 + camX;
      if (sx < -100 || sx > canvas.width + 100) continue;

      // 脈衝動畫（各節點相位不同）
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

      // 節點圓圈
      ctx.fillStyle = `rgba(80,200,255,${alpha + 0.1})`;
      ctx.beginPath(); ctx.arc(wx, wy, 3, 0, Math.PI * 2); ctx.fill();

      // 偶發亮光點
      if (Math.sin(t * 3 + wx) > 0.92) {
        ctx.fillStyle = 'rgba(200,240,255,0.8)';
        ctx.beginPath(); ctx.arc(wx, wy, 5, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }

  _drawGoal(ctx, g) {
    ctx.strokeStyle = '#888'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(g.x + 4, g.y + g.h); ctx.lineTo(g.x + 4, g.y - 30); ctx.stroke();
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath(); ctx.moveTo(g.x + 4, g.y - 30); ctx.lineTo(g.x + 28, g.y - 20); ctx.lineTo(g.x + 4, g.y - 10); ctx.fill();
    ctx.fillStyle = '#ffcb05';
    ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('⚡', g.x - 4, g.y + g.h - 8);
  }

  _drawHUD() {
    const { ctx, canvas } = this;
    const lv = this._levelIdx + 1;

    // 背景條
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, canvas.width, 40);

    // 分數
    ctx.fillStyle = '#ffcb05';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`⚡ ${this.score}`, 12, 26);

    // 關卡
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(`第 ${lv} 關`, canvas.width / 2, 26);

    // 操作提示
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('← → 移動  ↑/Space 跳  Z/Ctrl 射擊  踩頭消滅', canvas.width - 10, 26);
  }

  _drawWin() {
    const { ctx, canvas } = this;
    const isLast = this._levelIdx === LEVELS.length - 1;
    const progress = Math.min(this._winTimer / 300, 1);

    ctx.fillStyle = `rgba(0,0,0,${0.55 * progress})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (progress < 1) return;

    ctx.fillStyle = '#ffcb05';
    ctx.font = 'bold 52px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isLast ? '🏆 全關通關！' : '⚡ 關卡通過！', canvas.width / 2, canvas.height / 2 - 24);

    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText(
      isLast ? `最終分數：${this.score}　皮卡丘萬歲！` : `得分：${this.score}　準備進入第 ${this._levelIdx + 2} 關…`,
      canvas.width / 2, canvas.height / 2 + 28
    );
  }
}
