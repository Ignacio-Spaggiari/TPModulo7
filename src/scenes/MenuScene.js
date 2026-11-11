import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, FONT } from '../config.js';
import BloodStream, { applyCameraFX } from '../systems/Background.js';
import { loadHighScore } from '../systems/HighScore.js';
import { createButton } from '../ui/Button.js';
import { audio } from '../systems/Audio.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const cx = GAME_WIDTH / 2;
    audio.playMusic('menu');
    this.stream = new BloodStream(this, GAME_WIDTH, GAME_HEIGHT, { farCells: 14, nearCells: 10, fixedToCamera: true });
    applyCameraFX(this.cameras.main);

    this.add
      .text(cx, 130, 'LEUCO', { fontFamily: FONT, fontSize: '96px', color: '#f5f5f5', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setShadow(0, 6, '#000000', 8, false, true);
    this.add
      .text(cx, 205, 'Defensa Celular', { fontFamily: FONT, fontSize: '32px', color: '#c9b6ff' })
      .setOrigin(0.5);

    const leuco = this.add.image(cx, 310, 'player').setScale(1.8);
    this.tweens.add({ targets: leuco, y: 325, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    const instructions = [
      'Una infección entró al torrente sanguíneo.',
      'Hacete más fuerte hasta tener todas las mejoras al máximo',
      'y derrotá al Supervirus en 1:30.',
      '',
      'WASD / Flechas: moverte   ·   El disparo es automático',
      'Juntá proteínas para subir de nivel   ·   ESC / P: pausa',
    ];
    this.add
      .text(cx, 450, instructions, { fontFamily: FONT, fontSize: '20px', color: '#f5f5f5', align: 'center', lineSpacing: 6 })
      .setOrigin(0.5);

    createButton(this, cx, 590, 'JUGAR', () => this.startGame());

    this.add
      .text(cx, 650, `Récord: ${loadHighScore()}   ·   ENTER para empezar`, { fontFamily: FONT, fontSize: '18px', color: '#e3c9cd' })
      .setOrigin(0.5);

    this.input.keyboard.on('keydown-ENTER', () => this.startGame());
  }

  update(time, delta) {
    this.stream.update(delta);
  }

  startGame() {
    audio.play('click');
    this.scene.start('Game');
  }
}
