class BossProjectile {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.r = 10;
    this.active = true;
    this._t = 0;
  }

  update(dt) {
    this._t += dt;
    this.x += this.vx * dt / 1000;
    this.y += this.vy * dt / 1000;
    if (this.y > 950 || this.x < -100 || this.x > 1800) this.active = false;
  }

  hitTest(player) {
    const px = player.x + player.w / 2;
    const py = player.y + player.h / 2;
    return Math.hypot(this.x - px, this.y - py) < this.r + 18;
  }

  draw(ctx) {
    const pulse = 0.6 + 0.4 * Math.sin(this._t / 80);
    ctx.save();

    const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 2.5);
    grd.addColorStop(0, `rgba(255,220,0,${0.5 * pulse})`);
    grd.addColorStop(1, 'rgba(255,100,0,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r * 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255,240,80,${pulse})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ff6000';
    ctx.lineWidth = 2;
    ctx.stroke();

    const a = this._t / 120;
    ctx.strokeStyle = 'rgba(255,255,200,0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(this.x + Math.cos(a) * this.r, this.y + Math.sin(a) * this.r);
    ctx.lineTo(this.x - Math.cos(a) * this.r, this.y - Math.sin(a) * this.r);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.x + Math.cos(a + Math.PI / 2) * this.r, this.y + Math.sin(a + Math.PI / 2) * this.r);
    ctx.lineTo(this.x - Math.cos(a + Math.PI / 2) * this.r, this.y - Math.sin(a + Math.PI / 2) * this.r);
    ctx.stroke();

    ctx.restore();
  }
}

export class Boss {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 90;
    this.h = 90;
    this.hp = 8;
    this.maxHp = 8;
    this._dir = 1;
    this.startX = x - 300;
    this.patrolW = 700;
    this.dead = false;
    this.deathTimer = 0;
    this.invTimer = 0;
    this._attackTimer = 0;
    this._shakeTimer = 0;
    this.projectiles = [];
    this._frame = 0;
    this._frameTimer = 0;
  }

  get phase() { return this.hp <= 4 ? 2 : 1; }

  update(dt) {
    if (this.dead) {
      this.deathTimer += dt;
      this.projectiles = [];
      return;
    }

    const s = dt / 1000;
    if (this.invTimer > 0)    this.invTimer -= dt;
    if (this._shakeTimer > 0) this._shakeTimer -= dt;
    this._frameTimer += dt;
    if (this._frameTimer > 250) { this._frame ^= 1; this._frameTimer = 0; }

    const speed = this.phase === 2 ? 190 : 120;
    this.x += this._dir * speed * s;
    if (this.x > this.startX + this.patrolW) { this.x = this.startX + this.patrolW; this._dir = -1; }
    if (this.x < this.startX)               { this.x = this.startX;               this._dir =  1; }

    const interval = this.phase === 2 ? 1600 : 2600;
    this._attackTimer += dt;
    if (this._attackTimer >= interval) {
      this._attackTimer = 0;
      this._shoot();
    }

    this.projectiles = this.projectiles.filter(p => p.active);
    for (const p of this.projectiles) p.update(dt);
  }

  _shoot() {
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h;
    const speed = 240;
    const count = this.phase === 2 ? 5 : 3;
    const spread = 40;
    for (let i = 0; i < count; i++) {
      const angleDeg = count > 1 ? -spread / 2 + spread / (count - 1) * i : 0;
      const a = angleDeg * Math.PI / 180;
      this.projectiles.push(new BossProjectile(cx, cy, Math.sin(a) * speed, Math.cos(a) * speed));
    }
  }

  hitTest(player) {
    if (this.dead) return null;
    const overlap = (
      player.x + player.w > this.x + 8 &&
      player.x < this.x + this.w - 8 &&
      player.y + player.h > this.y + 8 &&
      player.y < this.y + this.h
    );
    if (!overlap) return null;
    const stomped = player.vy > 0 && player.y + player.h < this.y + this.h * 0.5;
    return stomped ? 'stomp' : 'hurt';
  }

  hitByBullet(b) {
    if (this.dead || this.invTimer > 0) return false;
    if (b.x + b.w > this.x && b.x < this.x + this.w &&
        b.y + b.h > this.y && b.y < this.y + this.h) {
      return this.takeDamage();
    }
    return false;
  }

  takeDamage() {
    if (this.dead || this.invTimer > 0) return false;
    this.hp--;
    this.invTimer = 480;
    this._shakeTimer = 280;
    if (this.hp <= 0) { this.dead = true; this.deathTimer = 0; }
    return true;
  }

  draw(ctx) {
    for (const p of this.projectiles) p.draw(ctx);

    if (this.dead) {
      if (this.deathTimer > 1400) return;
      const progress = this.deathTimer / 1400;
      const cx = this.x + this.w / 2;
      const cy = this.y + this.h / 2;
      ctx.save();
      const r = 100 * progress;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grd.addColorStop(0,   `rgba(255,220,0,${1 - progress})`);
      grd.addColorStop(0.5, `rgba(255,80,0,${0.8 * (1 - progress)})`);
      grd.addColorStop(1,   'rgba(255,0,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    const blink = this.invTimer > 0 && Math.floor(this.invTimer / 80) % 2 === 0;
    if (blink) { this._drawHPBar(ctx); return; }

    const shakeX = this._shakeTimer > 0 ? (Math.random() - 0.5) * 8 : 0;
    const cx = this.x + this.w / 2 + shakeX;
    const cy = this.y + this.h / 2;

    ctx.save();
    ctx.translate(cx, cy);
    if (this._dir === -1) ctx.scale(-1, 1);

    if (this.phase === 2) {
      const auraAlpha = 0.3 + 0.2 * Math.sin(Date.now() / 150);
      ctx.strokeStyle = `rgba(255,30,30,${auraAlpha})`;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.ellipse(0, 0, 58, 60, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Body
    ctx.fillStyle = '#b8900a';
    ctx.beginPath();
    ctx.ellipse(0, 10, 36, 38, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.ellipse(0, -26, 32, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.moveTo(-16, -52); ctx.lineTo(-10, -44); ctx.lineTo(-22, -30); ctx.fill();
    ctx.beginPath(); ctx.moveTo( 16, -52); ctx.lineTo( 10, -44); ctx.lineTo( 22, -30); ctx.fill();
    ctx.fillStyle = '#b8900a';
    ctx.beginPath(); ctx.moveTo(-15, -50); ctx.lineTo(-11, -43); ctx.lineTo(-20, -31); ctx.fill();
    ctx.beginPath(); ctx.moveTo( 15, -50); ctx.lineTo( 11, -43); ctx.lineTo( 20, -31); ctx.fill();

    // Evil eyes
    ctx.fillStyle = this.phase === 2 ? '#ff2020' : '#cc0000';
    ctx.beginPath(); ctx.ellipse(-10, -30, 8, 7, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( 10, -30, 8, 7,  0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(-10, -30, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc( 10, -30, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath(); ctx.arc(-8, -32, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(12, -32, 1.5, 0, Math.PI * 2); ctx.fill();

    // Cheeks (dark red)
    ctx.fillStyle = 'rgba(150,0,0,0.75)';
    ctx.beginPath(); ctx.ellipse(-21, -23, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( 21, -23, 9, 6, 0, 0, Math.PI * 2); ctx.fill();

    // Angry brows
    ctx.strokeStyle = '#222'; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.moveTo(-20, -42); ctx.lineTo(-4, -37); ctx.stroke();
    ctx.beginPath(); ctx.moveTo( 20, -42); ctx.lineTo(  4, -37); ctx.stroke();

    // Sinister grin
    ctx.strokeStyle = '#222'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -16);
    ctx.quadraticCurveTo(0, -22, 8, -16);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.fillRect(-4, -21, 4, 6);
    ctx.fillRect( 0, -21, 4, 6);

    // Lightning tail
    ctx.strokeStyle = '#ffe030'; ctx.lineWidth = 5; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-36, 0); ctx.lineTo(-48, -16); ctx.lineTo(-34, -26); ctx.lineTo(-46, -42);
    ctx.stroke();

    // Legs
    const leg = this._frame === 0 ? 1 : -1;
    ctx.fillStyle = '#966000';
    ctx.beginPath(); ctx.ellipse(-14, 52 + leg * 5, 11, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( 14, 52 - leg * 5, 11, 9, 0, 0, Math.PI * 2); ctx.fill();

    ctx.restore();

    this._drawHPBar(ctx);
  }

  _drawHPBar(ctx) {
    const bw = 220;
    const bh = 16;
    const bx = this.x + this.w / 2 - bw / 2;
    const by = this.y - 36;
    const ratio = Math.max(0, this.hp / this.maxHp);

    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(bx - 3, by - 3, bw + 6, bh + 6);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(bx, by, bw, bh);

    const barColor = ratio > 0.5 ? '#2ecc71' : ratio > 0.25 ? '#f39c12' : '#e74c3c';
    ctx.fillStyle = barColor;
    ctx.fillRect(bx, by, bw * ratio, bh);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`⚡ BOSS  ${this.hp} / ${this.maxHp}`, bx + bw / 2, by + bh - 1);
  }
}
