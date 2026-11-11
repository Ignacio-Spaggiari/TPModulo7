import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT } from '../config.js';
import { createButton } from '../ui/Button.js';
import { audio } from '../systems/Audio.js';
import { UPGRADES, countUpgradeLevels, TOTAL_UPGRADE_LEVELS } from '../systems/Upgrades.js';

const PIP_SIZE = 18;
const PIP_GAP = 8;
const ROW_HEIGHT = 36;

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super('Pause');
  }

  create() {
    const cx = GAME_WIDTH / 2;

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7).setOrigin(0);
    this.add
      .text(cx, 90, 'PAUSA', { fontFamily: FONT, fontSize: '64px', color: '#f5f5f5', fontStyle: 'bold' })
      .setOrigin(0.5);

    this.showUpgrades(cx, this.scene.get('Game').upgradeLevels);

    createButton(this, cx, 560, 'Continuar (ESC)', () => this.resumeGame(), 300);
    createButton(this, cx, 635, 'Salir al menú (Q)', () => this.quitToMenu(), 300);

    this.input.keyboard.on('keydown-ESC', this.resumeGame, this);
    this.input.keyboard.on('keydown-P', this.resumeGame, this);
    this.input.keyboard.on('keydown-Q', this.quitToMenu, this);
  }

  // Lista de mejoras con un casillero por nivel: los llenos son los que ya tenés.
  showUpgrades(cx, upgradeLevels) {
    const textStyle = { fontFamily: FONT, fontSize: '20px', color: '#f5f5f5' };
    this.add
      .text(cx, 160, `Mejoras: ${countUpgradeLevels(upgradeLevels)} / ${TOTAL_UPGRADE_LEVELS}`, { ...textStyle, fontSize: '24px', color: '#c9b6ff', fontStyle: 'bold' })
      .setOrigin(0.5);

    const pips = this.add.graphics();
    UPGRADES.forEach((upgrade, index) => {
      const y = 215 + index * ROW_HEIGHT;
      const level = upgradeLevels[upgrade.id] || 0;

      this.add.text(cx - 260, y, upgrade.name, textStyle).setOrigin(0, 0.5);
      for (let i = 0; i < upgrade.max; i++) {
        const x = cx + 60 + i * (PIP_SIZE + PIP_GAP);
        if (i < level) pips.fillStyle(COLORS.antibody).fillRect(x, y - PIP_SIZE / 2, PIP_SIZE, PIP_SIZE);
        pips.lineStyle(2, 0xf5f5f5, 0.7).strokeRect(x, y - PIP_SIZE / 2, PIP_SIZE, PIP_SIZE);
      }
      this.add
        .text(cx + 260, y, level === upgrade.max ? 'MÁX' : `${level}/${upgrade.max}`, { ...textStyle, color: level === upgrade.max ? '#7fe7ff' : '#e3c9cd' })
        .setOrigin(1, 0.5);
    });
  }

  resumeGame() {
    audio.play('click');
    this.scene.resume('Game');
    this.scene.stop();
  }

  quitToMenu() {
    audio.play('click');
    this.scene.stop('Game');
    this.scene.stop('UI');
    this.scene.start('Menu');
  }
}
