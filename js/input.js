export class Input {
  constructor() {
    this.keys = {};
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
  }

  isDown(code) { return !!this.keys[code]; }

  get left()  { return this.isDown('ArrowLeft')  || this.isDown('KeyA'); }
  get right() { return this.isDown('ArrowRight') || this.isDown('KeyD'); }
  get jump()  { return this.isDown('ArrowUp') || this.isDown('KeyW') || this.isDown('Space'); }
  get shoot() { return this.isDown('KeyZ') || this.isDown('ControlLeft') || this.isDown('ControlRight'); }
}
