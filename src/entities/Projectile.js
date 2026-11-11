import Phaser from 'phaser';
import { PROJECTILE_LIFESPAN } from '../config.js';

export default class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'antibody');
    // Suma su color al fondo, así se ven como luces brillantes.
    this.setBlendMode(Phaser.BlendModes.ADD);
  }

  // Lo usan tanto los anticuerpos del jugador como las esporas del jefe.
  fire(x, y, angle, speed, damage, texture = 'antibody') {
    this.setTexture(texture);
    this.enableBody(true, x, y, true, true);
    this.body.setCircle(6, this.width / 2 - 6, this.height / 2 - 6);
    this.damage = damage;
    this.lifespan = PROJECTILE_LIFESPAN;
    this.setRotation(angle);
    this.setDepth(8);
    this.scene.physics.velocityFromRotation(angle, speed, this.body.velocity);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this.lifespan -= delta;
    if (this.lifespan <= 0) this.disableBody(true, true);
  }
}
