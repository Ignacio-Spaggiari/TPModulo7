import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, FONT } from '../config.js';
import { audio } from '../systems/Audio.js';

const CARD_WIDTH = 300;
const CARD_HEIGHT = 220;
const CARD_GAP = 40;

// Overlay que pausa el juego y ofrece hasta 3 mejoras para elegir.
export default class LevelUpScene extends Phaser.Scene {
  constructor() {
    super('LevelUp');
  }

  create({ options, level, upgradeLevels }) {
    this.options = options;
    this.chosen = false;

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7).setOrigin(0);
    this.add
      .text(GAME_WIDTH / 2, 150, `¡Nivel ${level}!`, { fontFamily: FONT, fontSize: '56px', color: '#7fe7ff', fontStyle: 'bold' })
      .setOrigin(0.5);
    this.add
      .text(GAME_WIDTH / 2, 210, 'Elegí una mejora (1, 2, 3 o click)', { fontFamily: FONT, fontSize: '22px', color: '#f5f5f5' })
      .setOrigin(0.5);

    const totalWidth = options.length * CARD_WIDTH + (options.length - 1) * CARD_GAP;
    const startX = (GAME_WIDTH - totalWidth) / 2 + CARD_WIDTH / 2;
    options.forEach((upgrade, index) => {
      this.createCard(startX + index * (CARD_WIDTH + CARD_GAP), 400, upgrade, index, upgradeLevels[upgrade.id] || 0);
    });

    ['ONE', 'TWO', 'THREE'].slice(0, options.length).forEach((key, index) => {
      this.input.keyboard.on(`keydown-${key}`, () => this.choose(index));
    });
  }

  createCard(x, y, upgrade, index, currentLevel) {
    const card = this.add
      .rectangle(x, y, CARD_WIDTH, CARD_HEIGHT, 0x5c1220)
      .setStrokeStyle(3, 0xc9b6ff)
      .setInteractive({ useHandCursor: true });

    const textStyle = { fontFamily: FONT, color: '#f5f5f5', align: 'center' };
    this.add.text(x, y - 80, `[${index + 1}]`, { ...textStyle, fontSize: '20px', color: '#c9b6ff' }).setOrigin(0.5);
    this.add
      .text(x, y - 45, upgrade.name, { ...textStyle, fontSize: '24px', fontStyle: 'bold', wordWrap: { width: CARD_WIDTH - 30 } })
      .setOrigin(0.5);
    this.add.text(x, y + 15, upgrade.description, { ...textStyle, fontSize: '20px' }).setOrigin(0.5);
    this.add
      .text(x, y + 80, `Nivel ${currentLevel} → ${currentLevel + 1} (máx. ${upgrade.max})`, { ...textStyle, fontSize: '16px', color: '#e3c9cd' })
      .setOrigin(0.5);

    card.on('pointerover', () => card.setFillStyle(0x8b1a2b));
    card.on('pointerout', () => card.setFillStyle(0x5c1220));
    card.on('pointerdown', () => this.choose(index));
  }

  choose(index) {
    if (this.chosen) return;
    this.chosen = true;
    audio.play('click');

    const game = this.scene.get('Game');
    game.applyUpgrade(this.options[index]);

    // Si subió varios niveles de golpe, encadena la próxima elección.
    const next = game.nextLevelUpData();
    if (next) {
      this.scene.restart(next);
      return;
    }

    this.scene.resume('Game');
    this.scene.stop();
  }
}
