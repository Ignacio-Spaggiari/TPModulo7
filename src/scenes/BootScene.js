import Phaser from 'phaser';
import { COLORS } from '../config.js';
import { audio } from '../systems/Audio.js';

// Genera todas las texturas del juego con formas geométricas, sin assets externos.
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    const g = this.make.graphics({}, false);

    this.makeTexture(g, 'player', 56, 56, () => {
      g.fillStyle(COLORS.player).fillCircle(28, 28, 24);
      g.lineStyle(2, 0xd9d9ef).strokeCircle(28, 28, 24);
      g.fillStyle(COLORS.nucleus);
      g.fillCircle(22, 24, 8).fillCircle(33, 23, 7).fillCircle(29, 34, 7);
    });

    this.makeTexture(g, 'antibody', 20, 18, () => {
      g.lineStyle(3, COLORS.antibody);
      g.lineBetween(2, 9, 10, 9);
      g.lineBetween(10, 9, 18, 3);
      g.lineBetween(10, 9, 18, 15);
    });

    this.makeTexture(g, 'virus', 40, 40, () => {
      this.drawSpikes(g, 20, 20, 8, 12, 17, 3, COLORS.virus);
      g.fillStyle(COLORS.virus).fillCircle(20, 20, 12);
      g.fillStyle(0x3fa83f).fillCircle(16, 17, 3).fillCircle(24, 23, 2.5);
    });

    this.makeTexture(g, 'bacteria', 40, 24, () => {
      g.fillStyle(COLORS.bacteria).fillRoundedRect(2, 2, 36, 20, 10);
      g.fillStyle(0xc9a92e).fillEllipse(14, 12, 8, 5).fillEllipse(26, 12, 8, 5);
    });

    this.makeTexture(g, 'parasite', 60, 44, () => {
      g.fillStyle(COLORS.parasite).fillEllipse(30, 22, 56, 40);
      g.fillStyle(0x7a3fa8).fillCircle(20, 16, 5).fillCircle(38, 26, 6).fillCircle(26, 30, 3);
    });

    this.makeTexture(g, 'supervirus', 160, 160, () => {
      g.fillStyle(COLORS.virus, 0.2).fillCircle(80, 80, 79);
      this.drawSpikes(g, 80, 80, 14, 50, 68, 7, COLORS.virus);
      g.fillStyle(0x3fa83f).fillCircle(80, 80, 50);
      g.fillStyle(0x2a7a2a).fillCircle(66, 68, 10).fillCircle(96, 88, 9).fillCircle(72, 100, 6);
    });

    this.makeTexture(g, 'spore', 16, 16, () => {
      g.fillStyle(COLORS.spore).fillCircle(8, 8, 7);
      g.fillStyle(0x2a7a2a).fillCircle(8, 8, 3);
    });

    this.makeTexture(g, 'protein', 14, 14, () => {
      g.fillStyle(COLORS.protein).fillCircle(7, 7, 6);
      g.fillStyle(0xffffff, 0.6).fillCircle(5, 5, 2);
    });

    this.makeTexture(g, 'platelet', 20, 20, () => {
      g.fillStyle(0xffffff).fillRect(7, 2, 6, 16).fillRect(2, 7, 16, 6);
    });

    this.makeTexture(g, 'redCell', 64, 44, () => {
      g.fillStyle(COLORS.redCell).fillEllipse(32, 22, 60, 40);
      g.fillStyle(COLORS.redCellCenter).fillEllipse(32, 22, 32, 20);
    });

    g.destroy();
    audio.init(this.game);
    this.scene.start('Menu');
  }

  makeTexture(g, key, width, height, draw) {
    g.clear();
    draw();
    g.generateTexture(key, width, height);
  }

  drawSpikes(g, cx, cy, count, innerRadius, outerRadius, tipRadius, color) {
    g.lineStyle(3, color);
    g.fillStyle(color);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      g.lineBetween(cx + cos * innerRadius, cy + sin * innerRadius, cx + cos * outerRadius, cy + sin * outerRadius);
      g.fillCircle(cx + cos * outerRadius, cy + sin * outerRadius, tipRadius);
    }
  }
}
