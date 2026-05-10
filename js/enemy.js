const DEFAULT_SPEED = 80; // px/s

export class Enemy {
  constructor(x, y, patrolW = 160, speed = DEFAULT_SPEED) {
    this.x = x;
    this.y = y;
    this.w = 36;
    this.h = 36;
    this.startX = x;
    this.patrolW = patrolW;
    this.speed = speed;
    this.vx = speed;
    this.dead = false;
    this.deathTimer = 0; // 死亡動畫計時
    this._walkFrame = 0;
    this._walkTimer = 0;
  }

  update(dt) {
    if (this.dead) {
      this.deathTimer += dt;
      return;
    }
    const s = dt / 1000;
    this.x += this.vx * s;

    // 巡邏折返
    if (this.x > this.startX + this.patrolW) { this.x = this.startX + this.patrolW; this.vx = -this.speed; }
    if (this.x < this.startX)               { this.x = this.startX;               this.vx =  this.speed; }

    // 走路動畫幀
    this._walkTimer += dt;
    if (this._walkTimer > 300) { this._walkFrame ^= 1; this._walkTimer = 0; }
  }

  die() {
    this.dead = true;
    this.deathTimer = 0;
  }

  get alive() { return !this.dead || this.deathTimer < 400; }

  // AABB 碰撞檢查（含上方踩踏判斷）
  hitTest(player) {
    if (this.dead) return null;
    const overlap = (
      player.x + player.w > this.x + 4 &&
      player.x < this.x + this.w - 4 &&
      player.y + player.h > this.y + 4 &&
      player.y < this.y + this.h
    );
    if (!overlap) return null;
    // 踩頭：玩家落下、玩家底部在敵人上半部
    const stomped = player.vy > 0 && player.y + player.h < this.y + this.h * 0.6;
    return stomped ? 'stomp' : 'hurt';
  }

  draw(ctx) {
    if (this.dead) {
      // 死亡：壓扁
      const alpha = Math.max(0, 1 - this.deathTimer / 400);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#e05';
      ctx.fillRect(this.x, this.y + this.h - 10, this.w, 10);
      ctx.restore();
      return;
    }

    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
    const dir = this.vx > 0 ? 1 : -1;
    const leg = this._walkFrame === 0 ? 1 : -1;

    ctx.save();
    ctx.translate(cx, cy);
    if (dir === -1) ctx.scale(-1, 1);

    // 身體（Koffing 風格圓型小怪）
    ctx.fillStyle = '#9b59b6';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    // 斑點
    ctx.fillStyle = '#7d3c98';
    ctx.beginPath(); ctx.arc(-6, -4, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, 2,  3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, 7,  3, 0, Math.PI * 2); ctx.fill();

    // 眼睛（X 形怒臉）
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    [[-6, -6], [4, -6]].forEach(([ex, ey]) => {
      ctx.beginPath(); ctx.moveTo(ex - 3, ey - 3); ctx.lineTo(ex + 3, ey + 3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex + 3, ey - 3); ctx.lineTo(ex - 3, ey + 3); ctx.stroke();
    });

    // 嘴
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-5, 5); ctx.quadraticCurveTo(0, 3, 5, 5);
    ctx.stroke();

    // 腳（走路動畫）
    ctx.fillStyle = '#7d3c98';
    ctx.beginPath(); ctx.ellipse(-6, 16 + leg * 2, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( 6, 16 - leg * 2, 5, 4, 0, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }
}
