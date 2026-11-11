import Phaser from 'phaser';
import { PLAYER } from '../config.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Copia de las stats base: las mejoras modifican esta copia, no la config.
    this.stats = { ...PLAYER };
    this.health = this.stats.maxHealth;
    this.invulnerableUntil = 0;

    this.setCollideWorldBounds(true);
    this.body.setCircle(20, this.width / 2 - 20, this.height / 2 - 20);
    this.setDepth(10);
  }

  move(dx, dy) {
    const length = Math.hypot(dx, dy) || 1;
    this.setVelocity((dx / length) * this.stats.speed, (dy / length) * this.stats.speed);
  }

  // `now` es el tiempo de partida en ms; devuelve true si el golpe hizo daño.
  takeDamage(amount, now) {
    if (now < this.invulnerableUntil) return false;

    this.health = Math.max(0, this.health - amount);
    this.invulnerableUntil = now + this.stats.invulnerableTime;
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 80,
      yoyo: true,
      repeat: 2,
      onComplete: () => this.setAlpha(1),
    });
    return true;
  }

  heal(amount) {
    this.health = Math.min(this.stats.maxHealth, this.health + amount);
  }

  isDead() {
    return this.health <= 0;
  }
}
