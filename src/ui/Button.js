import { FONT } from '../config.js';

export function createButton(scene, x, y, label, onClick, width = 260) {
  const bg = scene.add
    .rectangle(x, y, width, 56, 0x8b1a2b)
    .setStrokeStyle(3, 0xf5f5f5)
    .setInteractive({ useHandCursor: true });

  const text = scene.add
    .text(x, y, label, { fontFamily: FONT, fontSize: '24px', color: '#f5f5f5', fontStyle: 'bold' })
    .setOrigin(0.5);

  bg.on('pointerover', () => bg.setFillStyle(0xb02a3e));
  bg.on('pointerout', () => bg.setFillStyle(0x8b1a2b));
  bg.on('pointerdown', onClick);

  return { bg, text };
}
