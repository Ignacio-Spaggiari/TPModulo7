import Phaser from 'phaser';
import { GAME_WIDTH, FONT } from '../config.js';
import { addRedCells } from '../systems/Background.js';
import { loadHighScore, saveHighScore } from '../systems/HighScore.js';
import { createButton } from '../ui/Button.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create({ victory, reason, score, kills, level, seconds }) {
    const cx = GAME_WIDTH / 2;
    addRedCells(this, 18, GAME_WIDTH, 720);

    const isNewRecord = score > loadHighScore();
    if (isNewRecord) saveHighScore(score);

    let title = '¡Infección contenida!';
    if (!victory) title = reason === 'timeout' ? 'El Supervirus se propagó' : 'El cuerpo fue infectado';

    this.add
      .text(cx, 130, title, {
        fontFamily: FONT,
        fontSize: '64px',
        fontStyle: 'bold',
        color: victory ? '#7fe7ff' : '#ff6b6b',
      })
      .setOrigin(0.5)
      .setShadow(0, 6, '#000000', 8, false, true);

    const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    const stats = [
      `Puntaje: ${score}`,
      `Tiempo sobrevivido: ${time}`,
      `Nivel alcanzado: ${level}`,
      `Enemigos eliminados: ${kills}`,
      '',
      isNewRecord ? '¡Nuevo récord!' : `Récord: ${loadHighScore()}`,
    ];
    this.add
      .text(cx, 320, stats, { fontFamily: FONT, fontSize: '26px', color: '#f5f5f5', align: 'center', lineSpacing: 8 })
      .setOrigin(0.5);

    createButton(this, cx - 150, 540, 'Reintentar (R)', () => this.retry());
    createButton(this, cx + 150, 540, 'Menú (M)', () => this.scene.start('Menu'));

    this.input.keyboard.on('keydown-R', this.retry, this);
    this.input.keyboard.on('keydown-ENTER', this.retry, this);
    this.input.keyboard.on('keydown-M', () => this.scene.start('Menu'));
  }

  retry() {
    this.scene.start('Game');
  }
}
