import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, FONT } from '../config.js';
import { countUpgradeLevels, TOTAL_UPGRADE_LEVELS } from '../systems/Upgrades.js';
import { audio } from '../systems/Audio.js';

const BAR_WIDTH = 260;
const BOSS_BAR_WIDTH = 520;
const XP_BAR_HEIGHT = 12;
const LOW_HEALTH = 0.3; // fracción de la vida máxima a partir de la cual empieza la alerta
const HEARTBEAT_INTERVAL = 900;

// HUD superpuesto: lee el estado de GameScene en cada frame y lo dibuja.
export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UI');
  }

  create() {
    this.gameScene = this.scene.get('Game');
    this.bossWarned = false;
    this.heartbeatTimer = HEARTBEAT_INTERVAL;

    // Va primero para quedar por debajo del resto del HUD.
    this.dangerOverlay = this.add.image(0, 0, 'lowHealth').setOrigin(0).setAlpha(0);

    const style = { fontFamily: FONT, fontSize: '22px', color: '#f5f5f5', fontStyle: 'bold' };
    this.bars = this.add.graphics();
    this.healthText = this.add.text(20 + BAR_WIDTH / 2, 31, '', { ...style, fontSize: '16px' }).setOrigin(0.5);
    this.levelText = this.add.text(20, 50, '', style);
    this.centerText = this.add.text(GAME_WIDTH / 2, 30, '', style).setOrigin(0.5);
    this.bossText = this.add.text(GAME_WIDTH / 2, 66, 'Supervirus', { ...style, fontSize: '16px' }).setOrigin(0.5).setVisible(false);
    this.scoreText = this.add.text(GAME_WIDTH - 20, 20, '', style).setOrigin(1, 0);
    this.messageText = this.add
      .text(GAME_WIDTH / 2, 140, '', { ...style, fontSize: '32px', color: '#ff6b6b', align: 'center' })
      .setOrigin(0.5)
      .setAlpha(0);

    for (const text of [this.healthText, this.levelText, this.centerText, this.bossText, this.scoreText, this.messageText]) {
      text.setShadow(0, 2, '#000000', 4, false, true);
    }
  }

  update(time, delta) {
    const game = this.gameScene;
    const { player } = game;
    if (!player) return;

    this.updateLowHealth(player, game, time, delta);

    this.drawBars(player, game);

    if (game.bossPhase) {
      // Cuenta regresiva para derrotar al jefe.
      const remaining = Math.ceil(game.bossTimeLeft / 1000);
      const seconds = String(remaining % 60).padStart(2, '0');
      this.centerText
        .setText(`${Math.floor(remaining / 60)}:${seconds}`)
        .setFontSize(36)
        .setColor(remaining <= 20 ? '#ff6b6b' : '#f5f5f5');
    } else {
      // Antes del jefe, el progreso es cuántas mejoras faltan.
      this.centerText.setText(`Mejoras: ${countUpgradeLevels(game.upgradeLevels)} / ${TOTAL_UPGRADE_LEVELS}`);
    }

    this.healthText.setText(`${Math.ceil(player.health)} / ${player.stats.maxHealth}`);
    this.levelText.setText(`Nivel ${game.level}`);
    this.scoreText.setText(`Puntaje: ${game.score}`);

    if (game.bossPhase && !this.bossWarned) {
      this.bossWarned = true;
      this.bossText.setVisible(true);
      this.showMessage('¡Apareció el Supervirus!\nDerrotalo antes de que termine el tiempo');
    }
  }

  // Con poca vida los bordes laten en rojo y suena un latido; más rápido e intenso cuanto menos vida queda.
  updateLowHealth(player, game, time, delta) {
    const ratio = player.health / player.stats.maxHealth;
    const active = ratio < LOW_HEALTH && !game.isOver && !game.scene.isPaused();

    if (!active) {
      this.dangerOverlay.setAlpha(0);
      this.heartbeatTimer = HEARTBEAT_INTERVAL;
      return;
    }

    const intensity = 1 - ratio / LOW_HEALTH;
    const pulse = 0.5 + 0.5 * Math.sin(time * 0.007);
    this.dangerOverlay.setAlpha((0.3 + 0.4 * pulse) * (0.5 + 0.5 * intensity));

    this.heartbeatTimer += delta;
    if (this.heartbeatTimer >= HEARTBEAT_INTERVAL - intensity * 300) {
      this.heartbeatTimer = 0;
      audio.play('heartbeat');
    }
  }

  drawBars(player, game) {
    const bars = this.bars.clear();

    // Vida
    const healthRatio = player.health / player.stats.maxHealth;
    bars.fillStyle(0x000000, 0.5).fillRect(20, 20, BAR_WIDTH, 22);
    bars.fillStyle(healthRatio > 0.3 ? COLORS.health : COLORS.danger).fillRect(20, 20, BAR_WIDTH * healthRatio, 22);
    bars.lineStyle(2, 0xf5f5f5).strokeRect(20, 20, BAR_WIDTH, 22);

    // Vida del jefe
    if (game.bossPhase && game.boss) {
      const bossRatio = Math.max(0, game.boss.health / game.boss.config.health);
      const x = (GAME_WIDTH - BOSS_BAR_WIDTH) / 2;
      bars.fillStyle(0x000000, 0.5).fillRect(x, 58, BOSS_BAR_WIDTH, 16);
      bars.fillStyle(COLORS.virus).fillRect(x, 58, BOSS_BAR_WIDTH * bossRatio, 16);
      bars.lineStyle(2, 0xf5f5f5).strokeRect(x, 58, BOSS_BAR_WIDTH, 16);
    }

    // Experiencia
    const xpY = GAME_HEIGHT - XP_BAR_HEIGHT;
    bars.fillStyle(0x000000, 0.5).fillRect(0, xpY, GAME_WIDTH, XP_BAR_HEIGHT);
    bars.fillStyle(COLORS.protein).fillRect(0, xpY, GAME_WIDTH * (game.xp / game.xpToNext), XP_BAR_HEIGHT);
  }

  showMessage(message) {
    this.messageText.setText(message).setAlpha(1);
    this.tweens.add({ targets: this.messageText, alpha: 0, delay: 3000, duration: 600 });
  }
}
