// 草皮色系 → 一般關卡；岩石色系（含 '#4a' '#5a' '#6a' '#7a' '#b8'）→ 洞窟關卡
const CAVE_COLORS = new Set(['#4a3020','#5a4030','#6a4530','#6a4530','#7a3a20','#b8860b']);

export class Platform {
  constructor(x, y, w, h = 20, color = '#3a7d44') {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
  }

  draw(ctx) {
    const isCave = CAVE_COLORS.has(this.color) || this.color.startsWith('#4a3') || this.color.startsWith('#5a4') ||
                   this.color.startsWith('#6a4') || this.color.startsWith('#7a3') || this.color.startsWith('#b88');

    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);

    if (isCave) {
      // 洞窟岩石：上緣橘色裂縫高光
      ctx.fillStyle = 'rgba(180,80,20,0.5)';
      ctx.fillRect(this.x, this.y, this.w, 4);
      // 裂縫格線
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 1;
      for (let bx = this.x; bx < this.x + this.w; bx += 36) {
        ctx.strokeRect(bx, this.y, 36, this.h);
      }
      // 黃金終點台的上緣光芒
      if (this.color === '#b8860b') {
        ctx.fillStyle = 'rgba(255,220,50,0.6)';
        ctx.fillRect(this.x, this.y, this.w, 5);
      }
    } else {
      // 草原：草皮上緣
      ctx.fillStyle = '#5cb85c';
      ctx.fillRect(this.x, this.y, this.w, 6);
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      for (let bx = this.x; bx < this.x + this.w; bx += 40) {
        ctx.strokeRect(bx, this.y, 40, this.h);
      }
    }
  }
}
