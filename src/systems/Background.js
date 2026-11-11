import Phaser from 'phaser';

const FLOW_SPEED = 22; // px/s: velocidad base de la corriente sanguínea (hacia la derecha)
const PUSH_RADIUS = 120;
const PUSH_FORCE = 260;
const PUSH_DAMPING = 0.92;
const WRAP_MARGIN = 60;

// Torrente sanguíneo: plasma que fluye y glóbulos rojos en dos capas con parallax
// (la capa lejana se mueve menos con la cámara, lo que da sensación de profundidad).
// Los glóbulos de la capa cercana se apartan cuando Leuco pasa entre ellos.
export default class BloodStream {
  constructor(scene, width, height, { farCells, nearCells, fixedToCamera = false }) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.time = 0;

    this.plasma = scene.add.tileSprite(0, 0, width, height, 'plasma').setOrigin(0).setDepth(-10);
    if (fixedToCamera) this.plasma.setScrollFactor(0);

    this.cells = [
      ...this.createLayer(farCells, { scale: [0.45, 0.75], alpha: 0.35, scrollFactor: 0.6, depth: -8, flow: 0.6, pushable: false }),
      ...this.createLayer(nearCells, { scale: [0.85, 1.3], alpha: 0.8, scrollFactor: 1, depth: -6, flow: 1, pushable: true }),
    ];
  }

  createLayer(count, { scale, alpha, scrollFactor, depth, flow, pushable }) {
    const cells = [];
    for (let i = 0; i < count; i++) {
      const cell = this.scene.add
        .image(Phaser.Math.Between(0, this.width), Phaser.Math.Between(0, this.height), 'redCell')
        .setAngle(Phaser.Math.Between(0, 360))
        .setScale(Phaser.Math.FloatBetween(...scale))
        .setAlpha(alpha)
        .setScrollFactor(scrollFactor)
        .setDepth(depth);

      cell.flow = flow * Phaser.Math.FloatBetween(0.7, 1.3);
      cell.phase = Math.random() * Math.PI * 2;
      cell.spin = Phaser.Math.FloatBetween(-0.3, 0.3);
      cell.pushable = pushable;
      cell.pushX = 0;
      cell.pushY = 0;
      cells.push(cell);
    }
    return cells;
  }

  // `stirrer` es lo que agita el líquido al moverse (Leuco); puede ser null en los menús.
  update(delta, stirrer = null) {
    const dt = delta / 1000;
    this.time += dt;
    this.plasma.tilePositionX -= FLOW_SPEED * 0.5 * dt;

    for (const cell of this.cells) {
      if (stirrer && cell.pushable) this.applyPush(cell, stirrer, dt);

      cell.x += (FLOW_SPEED * cell.flow + cell.pushX) * dt;
      cell.y += (Math.sin(this.time * 0.8 + cell.phase) * 8 + cell.pushY) * dt;
      cell.rotation += cell.spin * dt;
      cell.pushX *= PUSH_DAMPING;
      cell.pushY *= PUSH_DAMPING;

      if (cell.x > this.width + WRAP_MARGIN) cell.x = -WRAP_MARGIN;
      if (cell.x < -WRAP_MARGIN) cell.x = this.width + WRAP_MARGIN;
      if (cell.y > this.height + WRAP_MARGIN) cell.y = -WRAP_MARGIN;
      if (cell.y < -WRAP_MARGIN) cell.y = this.height + WRAP_MARGIN;
    }
  }

  // Empuja el glóbulo hacia afuera y lo arrastra un poco en la dirección del movimiento, como un líquido.
  applyPush(cell, stirrer, dt) {
    const dx = cell.x - stirrer.x;
    const dy = cell.y - stirrer.y;
    const distance = Math.hypot(dx, dy);
    if (distance >= PUSH_RADIUS || distance === 0) return;

    const strength = 1 - distance / PUSH_RADIUS;
    const velocity = stirrer.body.velocity;
    cell.pushX += ((dx / distance) * PUSH_FORCE + velocity.x * 0.8) * strength * dt * 4;
    cell.pushY += ((dy / distance) * PUSH_FORCE + velocity.y * 0.8) * strength * dt * 4;
  }
}

// Bloom (brillo que "sangra" de las zonas claras) y viñeta (bordes más oscuros, como luz focalizada).
// Solo existe en WebGL; en Canvas se omite sin romper nada.
export function applyCameraFX(camera) {
  if (!camera.postFX) return;

  camera.postFX.addBloom(0xffffff, 1, 1, 1, 0.9, 4);
  camera.postFX.addVignette(0.5, 0.5, 0.85, 0.4);
}
