import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, FONT } from '../config.js';
import BloodStream, { applyCameraFX } from '../systems/Background.js';
import { loadHighScore, saveHighScore } from '../systems/HighScore.js';
import { createButton } from '../ui/Button.js';
import { audio } from '../systems/Audio.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create({ victory, reason, score, kills, level, seconds }) {
    const cx = GAME_WIDTH / 2;
    this.stream = new BloodStream(this, GAME_WIDTH, GAME_HEIGHT, { farCells: 14, nearCells: 10, fixedToCamera: true });
    applyCameraFX(this.cameras.main);

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
    createButton(this, cx + 150, 540, 'Menú (Q)', () => this.goToMenu());

    this.input.keyboard.on('keydown-R', this.retry, this);
    this.input.keyboard.on('keydown-ENTER', this.retry, this);
    this.input.keyboard.on('keydown-Q', this.goToMenu, this);
  }

  update(time, delta) {
    this.stream.update(delta);
  }

  retry() {
    audio.play('click');
    this.scene.start('Game');
  }

  goToMenu() {
    audio.play('click');
    this.scene.start('Menu');
  }
}
