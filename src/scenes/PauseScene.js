import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, FONT } from '../config.js';
import { createButton } from '../ui/Button.js';

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super('Pause');
  }

  create() {
    const cx = GAME_WIDTH / 2;

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6).setOrigin(0);
    this.add
      .text(cx, 230, 'PAUSA', { fontFamily: FONT, fontSize: '72px', color: '#f5f5f5', fontStyle: 'bold' })
      .setOrigin(0.5);

    createButton(this, cx, 370, 'Continuar (ESC)', () => this.resumeGame(), 300);
    createButton(this, cx, 450, 'Salir al menú (Q)', () => this.quitToMenu(), 300);

    this.input.keyboard.on('keydown-ESC', this.resumeGame, this);
    this.input.keyboard.on('keydown-P', this.resumeGame, this);
    this.input.keyboard.on('keydown-Q', this.quitToMenu, this);
  }

  resumeGame() {
    this.scene.resume('Game');
    this.scene.stop();
  }

  quitToMenu() {
    this.scene.stop('Game');
    this.scene.stop('UI');
    this.scene.start('Menu');
  }
}
