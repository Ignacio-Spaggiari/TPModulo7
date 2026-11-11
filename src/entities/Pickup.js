import Phaser from 'phaser';

// Ítems que suelta un enemigo al morir: proteínas (XP) o plaquetas (curación).
export default class Pickup extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'protein');
  }

  spawn(x, y, kind, value) {
    this.kind = kind;
    this.value = value;
    this.attracted = false;

    this.setTexture(kind === 'heal' ? 'platelet' : 'protein');
    this.enableBody(true, x, y, true, true);
    this.setScale(kind === 'xp' && value >= 5 ? 1.6 : 1);
    this.setBlendMode(kind === 'xp' ? Phaser.BlendModes.ADD : Phaser.BlendModes.NORMAL);
    this.setVelocity(0, 0);
    this.setDepth(3);
  }

  collect() {
    this.disableBody(true, true);
  }
}
