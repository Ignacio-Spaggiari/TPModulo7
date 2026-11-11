import Phaser from 'phaser';
import { ENEMIES } from '../config.js';

// Los enemigos se reutilizan desde un pool: `spawn` los reinicia con el tipo pedido.
export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'virus');
  }

  spawn(x, y, kind) {
    const config = ENEMIES[kind];
    this.kind = kind;
    this.config = config;
    this.health = config.health;

    this.setTexture(config.texture);
    this.enableBody(true, x, y, true, true);
    this.body.setCircle(config.radius, this.width / 2 - config.radius, this.height / 2 - config.radius);
    this.body.setMass(config.boss ? 10 : 1);
    this.clearTint();
    this.setRotation(0);
    this.setDepth(config.boss ? 6 : 5);
  }

  chase(target) {
    this.scene.physics.moveToObject(this, target, this.config.speed);

    if (this.kind === 'bacteria') {
      this.setRotation(this.body.velocity.angle());
    } else {
      this.rotation += 0.01;
    }
  }

  // Devuelve true si el enemigo murió.
  takeDamage(amount) {
    this.health -= amount;
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(60, () => this.clearTint());
    return this.health <= 0;
  }

  die() {
    this.disableBody(true, true);
  }
}
