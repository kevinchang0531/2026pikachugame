export class Collectible {
  constructor(x, y, type = 'bolt') {
    this.x = x;
    this.y = y;
    this.w = 28;
    this.h = 28;
    this.type = type; // 'bolt' | 'coin'
    this.collected = false;
    this._t = Math.random() * Math.PI * 2; // 漂浮相位偏移
  }

  update(dt) {
    this._t += dt / 1000 * 2.5;
  }

  hitTest(player) {
    if (this.collected) return false;
    return (
      player.x + player.w > this.x &&
      player.x < this.x + this.w &&
      player.y + player.h > this.y &&
      player.y < this.y + this.h
    );
  }

  draw(ctx) {
    if (this.collected) return;
    const bob = Math.sin(this._t) * 4; // 漂浮動畫
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2 + bob;

    if (this.type === 'bolt') {
      this._drawBolt(ctx, cx, cy);
    } else {
      this._drawCoin(ctx, cx, cy);
    }
  }

  _drawBolt(ctx, cx, cy) {
    // 外光暈
    ctx.save();
    ctx.shadowColor = '#ffe066';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffcb05';
    ctx.strokeStyle = '#e6a800';
    ctx.lineWidth = 1.5;

    // 閃電形狀
    ctx.beginPath();
    ctx.moveTo(cx + 3,  cy - 13);
    ctx.lineTo(cx - 4,  cy - 1);
    ctx.lineTo(cx + 1,  cy - 1);
    ctx.lineTo(cx - 3,  cy + 13);
    ctx.lineTo(cx + 4,  cy + 1);
    ctx.lineTo(cx - 1,  cy + 1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  _drawCoin(ctx, cx, cy) {
    ctx.save();
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ffd700';
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // ₽ 符號（金幣感）
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#b8860b';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', cx, cy + 1);
    ctx.restore();
  }
}
