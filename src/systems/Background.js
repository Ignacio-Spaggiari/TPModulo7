import Phaser from 'phaser';

// Glóbulos rojos decorativos que flotan lentamente; no interactúan con nada.
export function addRedCells(scene, count, width, height) {
  for (let i = 0; i < count; i++) {
    const cell = scene.add
      .image(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), 'redCell')
      .setAngle(Phaser.Math.Between(0, 360))
      .setScale(Phaser.Math.FloatBetween(0.7, 1.3))
      .setAlpha(0.55)
      .setDepth(-1);

    scene.tweens.add({
      targets: cell,
      x: cell.x + Phaser.Math.Between(-60, 60),
      y: cell.y + Phaser.Math.Between(-60, 60),
      angle: cell.angle + Phaser.Math.Between(-40, 40),
      duration: Phaser.Math.Between(4000, 8000),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }
}
