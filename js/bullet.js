const SPEED    = 720;  // px/s
const MAX_DIST = 650;  // px，超過就消失

export class Bullet {
  constructor(x, y, dir) {
    this.x    = x;
    this.y    = y;
    this.w    = 18;
    this.h    = 8;
    this.vx   = SPEED * dir;
    this.dir  = dir;
    this.active = true;
    this._dist  = 0;
    this._t     = 0; // 動畫計時
  }

  update(dt) {
    const s = dt / 1000;
    this.x    += this.vx * s;
    this._dist += SPEED * s;
    this._t    += dt;
    if (this._dist > MAX_DIST) this.active = false;
  }

  hitTest(enemy) {
    if (!this.active || enemy.dead) return false;
    return (
      this.x + this.w > enemy.x + 4 &&
      this.x          < enemy.x + enemy.w - 4 &&
      this.y + this.h > enemy.y + 4 &&
      this.y          < enemy.y + enemy.h - 4
    );
  }

  draw(ctx) {
    if (!this.active) return;
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
    const flicker = Math.sin(this._t / 30) > 0; // 高頻閃爍

    ctx.save();
    ctx.shadowColor = '#ffe066';
    ctx.shadowBlur  = 12;

    // 外層光暈
    ctx.fillStyle = flicker ? 'rgba(255,220,50,0.4)' : 'rgba(255,180,20,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, this.w / 2 + 4, this.h / 2 + 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 閃電芯（小閃電形）
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(cx + 5 * this.dir,  cy - 4);
    ctx.lineTo(cx - 2 * this.dir,  cy - 1);
    ctx.lineTo(cx + 1 * this.dir,  cy - 1);
    ctx.lineTo(cx - 5 * this.dir,  cy + 4);
    ctx.lineTo(cx + 2 * this.dir,  cy + 1);
    ctx.lineTo(cx - 1 * this.dir,  cy + 1);
    ctx.closePath();
    ctx.fill();

    // 子彈本體（亮黃橢圓）
    ctx.fillStyle = '#ffcb05';
    ctx.beginPath();
    ctx.ellipse(cx, cy, this.w / 2, this.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
