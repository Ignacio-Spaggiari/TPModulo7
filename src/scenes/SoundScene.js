import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config.js';
import { audio } from '../systems/Audio.js';

const ICON_X = GAME_WIDTH - 36;
const ICON_Y = GAME_HEIGHT - 46;

// Ícono de parlante que queda encima de todas las escenas. Se activa con click o con la tecla M.
export default class SoundScene extends Phaser.Scene {
  constructor() {
    super('Sound');
  }

  create() {
    this.icon = this.add.graphics();
    this.add
      .zone(ICON_X, ICON_Y, 44, 44)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.toggle());
    this.input.keyboard.on('keydown-M', () => this.toggle());
    this.draw();
  }

  toggle() {
    audio.toggleMute();
    this.draw();
    audio.play('click');
  }

  draw() {
    const g = this.icon.clear();
    const x = ICON_X;
    const y = ICON_Y;

    g.fillStyle(0x000000, 0.4).fillCircle(x, y, 20);
    g.fillStyle(0xf5f5f5);
    g.fillRect(x - 11, y - 4, 5, 8);
    g.fillTriangle(x - 7, y - 4, x + 1, y - 10, x + 1, y + 10);
    g.fillTriangle(x - 7, y - 4, x + 1, y + 10, x - 7, y + 4);

    if (audio.muted) {
      g.lineStyle(3, COLORS.danger);
      g.lineBetween(x + 5, y - 5, x + 13, y + 5);
      g.lineBetween(x + 13, y - 5, x + 5, y + 5);
    } else {
      g.lineStyle(2, 0xf5f5f5);
      g.beginPath().arc(x + 2, y, 6, -0.9, 0.9).strokePath();
      g.beginPath().arc(x + 2, y, 11, -0.9, 0.9).strokePath();
    }
  }
}
