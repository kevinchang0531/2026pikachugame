import { Audio }  from './audio.js';
import { Bullet } from './bullet.js';

const GRAVITY    = 1800;
const WALK_SPEED = 220;
const JUMP_VEL   = -600;
const MAX_JUMPS  = 2;
const HURT_INVINCIBLE_MS = 1200; // 受傷後無敵時間

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 40;
    this.h = 48;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.jumpsLeft = MAX_JUMPS;
    this.facing = 1;
    this._jumpHeld = false;
    this._wasJumping = false; // 追蹤上次跳躍是一段還是二段
    this.hurtTimer = 0;        // 無敵時間倒計時
    this._shootCooldown = 0;   // 射擊冷卻
    this._shootHeld = false;   // 防連按
    this.startX = x;
    this.startY = y;
  }

  get invincible() { return this.hurtTimer > 0; }

  respawn() {
    this.x = this.startX;
    this.y = this.startY;
    this.vx = 0;
    this.vy = 0;
    this.hurtTimer = HURT_INVINCIBLE_MS;
    Audio.hurt();
  }

  update(dt, input, platforms) {
    const s = dt / 1000;

    if (this.hurtTimer > 0)      this.hurtTimer -= dt;
    if (this._shootCooldown > 0) this._shootCooldown -= dt;

    // 左右
    if (input.left)       { this.vx = -WALK_SPEED; this.facing = -1; }
    else if (input.right) { this.vx =  WALK_SPEED;  this.facing =  1; }
    else                  { this.vx = 0; }

    // 跳躍
    if (input.jump && !this._jumpHeld && this.jumpsLeft > 0) {
      const isDouble = this.jumpsLeft < MAX_JUMPS;
      this.vy = JUMP_VEL;
      this.jumpsLeft--;
      this._jumpHeld = true;
      isDouble ? Audio.doubleJump() : Audio.jump();
    }
    if (!input.jump) this._jumpHeld = false;

    // 重力
    this.vy += GRAVITY * s;

    // 位移
    this.x += this.vx * s;
    this.y += this.vy * s;

    // 平台碰撞
    this.onGround = false;
    for (const p of platforms) {
      if (this._collide(p)) {
        this.onGround = true;
        this.jumpsLeft = MAX_JUMPS;
        this.vy = 0;
        this.y = p.y - this.h;
      }
    }

    // 掉出畫面 → 重生
    if (this.y > 1200) this.respawn();
  }

  // 嘗試射擊：返回 Bullet 實例或 null
  tryShoot(input) {
    if (!input.shoot) { this._shootHeld = false; return null; }
    if (this._shootHeld || this._shootCooldown > 0) return null;
    this._shootHeld = true;
    this._shootCooldown = 320; // ms 冷卻
    const bx = this.facing > 0 ? this.x + this.w + 2 : this.x - 20;
    const by = this.y + this.h * 0.4;
    Audio.shoot();
    return new Bullet(bx, by, this.facing);
  }

  _collide(p) {
    const prevBottom = this.y + this.h - this.vy * 0.016;
    const bottom = this.y + this.h;
    return (
      this.vy >= 0 &&
      prevBottom <= p.y + 2 &&
      bottom >= p.y &&
      this.x + this.w > p.x &&
      this.x < p.x + p.w
    );
  }

  draw(ctx) {
    // 無敵閃爍
    if (this.hurtTimer > 0 && Math.floor(this.hurtTimer / 100) % 2 === 0) return;

    ctx.save();
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
    ctx.translate(cx, cy);
    if (this.facing === -1) ctx.scale(-1, 1);

    // 身體
    ctx.fillStyle = '#ffcb05';
    ctx.beginPath();
    ctx.ellipse(0, 6, 18, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // 頭
    ctx.beginPath();
    ctx.ellipse(0, -14, 16, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // 耳朵（黑色）
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.moveTo(-10, -24); ctx.lineTo(-6, -22); ctx.lineTo(-14, -14); ctx.fill();
    ctx.beginPath(); ctx.moveTo(10,  -24); ctx.lineTo( 6, -22); ctx.lineTo( 14, -14); ctx.fill();

    // 耳朵黃色
    ctx.fillStyle = '#ffcb05';
    ctx.beginPath(); ctx.moveTo(-10, -23); ctx.lineTo(-7, -21); ctx.lineTo(-13, -15); ctx.fill();
    ctx.beginPath(); ctx.moveTo(10,  -23); ctx.lineTo( 7, -21); ctx.lineTo( 13, -15); ctx.fill();

    // 眼睛
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(-5, -16, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc( 5, -16, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-4, -17, 1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc( 6, -17, 1, 0, Math.PI * 2); ctx.fill();

    // 腮紅
    ctx.fillStyle = 'rgba(220,80,80,0.7)';
    ctx.beginPath(); ctx.ellipse(-11, -12, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( 11, -12, 5, 3, 0, 0, Math.PI * 2); ctx.fill();

    // 鼻子
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.ellipse(0, -13, 2, 1.5, 0, 0, Math.PI * 2); ctx.fill();

    // 嘴巴
    ctx.strokeStyle = '#222'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-3, -10); ctx.quadraticCurveTo(0, -8, 3, -10); ctx.stroke();

    // 閃電尾巴
    ctx.strokeStyle = '#ffcb05'; ctx.lineWidth = 4; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-18, 0); ctx.lineTo(-24, -8); ctx.lineTo(-16, -14); ctx.lineTo(-22, -22);
    ctx.stroke();

    ctx.restore();
  }
}
