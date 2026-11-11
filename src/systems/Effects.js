import Phaser from 'phaser';
import { COLORS, FONT } from '../config.js';

const ADD = Phaser.BlendModes.ADD;
const MAX_DAMAGE_NUMBERS = 60;

// Cada tamaño de explosión tiene sus propias partículas: cuanto más grande el enemigo,
// más lejos y más tiempo vuelan, y más grande es el destello y la onda expansiva.
const SPARK_TIERS = {
  small: { lifespan: 450, speed: { min: 60, max: 200 }, scale: { start: 0.55, end: 0 } },
  medium: { lifespan: 650, speed: { min: 90, max: 300 }, scale: { start: 0.75, end: 0 } },
  large: { lifespan: 1000, speed: { min: 120, max: 480 }, scale: { start: 1.1, end: 0 } },
};

export default class Effects {
  constructor(scene) {
    this.scene = scene;
    this.pulseTween = null;
    this.damageNumbers = [];

    this.sparks = {};
    for (const [tier, config] of Object.entries(SPARK_TIERS)) {
      this.sparks[tier] = this.createEmitter('droplet', { ...config, alpha: { start: 0.9, end: 0 }, blendMode: 'ADD' });
    }

    // Pedazos de membrana: esferitas sombreadas que se tiñen del color del enemigo.
    this.debris = this.createEmitter('debris', {
      lifespan: { min: 500, max: 1100 },
      speed: { min: 80, max: 340 },
      scale: { start: 1, end: 0.3 },
      alpha: { start: 1, end: 0 },
      rotate: { min: 0, max: 360 },
    });

    this.embers = this.createEmitter('droplet', {
      lifespan: 300,
      speed: { min: 150, max: 450 },
      scale: { start: 0.25, end: 0 },
      tint: 0xffffff,
      blendMode: 'ADD',
    });

    this.sparkles = this.createEmitter('droplet', {
      lifespan: 700,
      speed: { min: 60, max: 180 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: [COLORS.nucleus, COLORS.antibody, 0xffffff],
      blendMode: 'ADD',
    });
  }

  createEmitter(texture, config) {
    return this.scene.add.particles(0, 0, texture, { ...config, emitting: false }).setDepth(7);
  }

  // `explosion` viene de la config del enemigo (ver ENEMIES en config.js).
  explode(x, y, color, explosion) {
    const { tier, size, sparks, debris, shake } = explosion;

    this.flash(x, y, size);
    this.shockwave(x, y, color, size);

    const emitter = this.sparks[tier];
    emitter.setParticleTint(color);
    emitter.explode(sparks, x, y);
    this.embers.explode(Math.ceil(sparks / 2), x, y);

    if (debris > 0) {
      this.debris.setParticleTint(color);
      this.debris.explode(debris, x, y);
    }
    if (shake) this.scene.cameras.main.shake(100 + size * 40, shake);
  }

  // El jefe muere con una cadena de explosiones y un estallido final enorme.
  bossDeath(x, y, color, explosion) {
    const chain = 8;
    const camera = this.scene.cameras.main;

    for (let i = 0; i < chain; i++) {
      this.scene.time.delayedCall(i * 110, () => {
        const offsetX = Phaser.Math.Between(-60, 60);
        const offsetY = Phaser.Math.Between(-60, 60);
        this.explode(x + offsetX, y + offsetY, color, { tier: 'medium', size: 1.6, sparks: 14, debris: 6, shake: 0.006 });
      });
    }

    this.scene.time.delayedCall(chain * 110 + 120, () => {
      this.explode(x, y, color, explosion);
      camera.flash(350, 220, 255, 220);
    });

    return chain * 110 + 120;
  }

  // Destello blanco que se expande y se apaga rápido.
  flash(x, y, size) {
    const flash = this.scene.add.image(x, y, 'droplet').setBlendMode(ADD).setScale(size * 1.2).setDepth(8);
    this.scene.tweens.add({
      targets: flash,
      scale: size * 3.2,
      alpha: 0,
      duration: 160 + size * 40,
      ease: 'Quad.out',
      onComplete: () => flash.destroy(),
    });
  }

  // Anillo de onda expansiva del color del enemigo.
  shockwave(x, y, color, size) {
    const ring = this.scene.add.image(x, y, 'ring').setTint(color).setBlendMode(ADD).setScale(0.15 * size).setDepth(7);
    this.scene.tweens.add({
      targets: ring,
      scale: 0.75 * size,
      alpha: 0,
      duration: 320 + size * 70,
      ease: 'Cubic.out',
      onComplete: () => ring.destroy(),
    });
  }

  // Número que sube y se desvanece donde pegó un anticuerpo. Los textos se reutilizan
  // en vez de crearse cada vez, porque generar un texto nuevo es costoso.
  damageNumber(x, y, value) {
    let text = this.damageNumbers.find((number) => !number.active);
    if (!text) {
      if (this.damageNumbers.length >= MAX_DAMAGE_NUMBERS) return;
      text = this.scene.add
        .text(0, 0, '', { fontFamily: FONT, fontSize: '18px', fontStyle: 'bold', stroke: '#3a0a12', strokeThickness: 4 })
        .setOrigin(0.5)
        .setDepth(12);
      this.damageNumbers.push(text);
    }

    text
      .setActive(true)
      .setVisible(true)
      .setText(value)
      .setColor(value >= 5 ? '#ffe066' : '#ffffff')
      .setPosition(x + Phaser.Math.Between(-10, 10), y - 12)
      .setAlpha(1)
      .setScale(1.4);

    this.scene.tweens.add({
      targets: text,
      y: text.y - 36,
      scale: 1,
      alpha: 0,
      duration: 650,
      ease: 'Quad.out',
      onComplete: () => text.setActive(false).setVisible(false),
    });
  }

  // Al aplicar una mejora, Leuco se agranda un instante, brilla y suelta destellos.
  upgradePulse(player, glow) {
    if (this.pulseTween) this.pulseTween.stop();
    player.setScale(1);

    this.pulseTween = this.scene.tweens.add({
      targets: player,
      scale: 1.35,
      duration: 130,
      yoyo: true,
      ease: 'Back.out',
      onComplete: () => player.setScale(1),
    });

    this.scene.tweens.add({ targets: glow, scale: { from: 5.5, to: 3.2 }, duration: 450, ease: 'Quad.out' });
    this.shockwave(player.x, player.y, COLORS.nucleus, 1.4);
    this.sparkles.explode(18, player.x, player.y);
  }
}
