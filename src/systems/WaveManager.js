import Phaser from 'phaser';
import { WAVES, SPAWN_DISTANCE, WORLD_SIZE } from '../config.js';

const EDGE_MARGIN = 30;

// Decide qué enemigos aparecen y cuándo, según el tiempo de partida.
export default class WaveManager {
  constructor(scene) {
    this.scene = scene;
    this.spawnTimer = 0;
  }

  currentWave(elapsedSeconds) {
    return WAVES.filter((wave) => elapsedSeconds >= wave.from).pop();
  }

  update(elapsed, delta) {
    const wave = this.currentWave(elapsed / 1000);

    this.spawnTimer += delta;
    while (this.spawnTimer >= wave.interval) {
      this.spawnTimer -= wave.interval;
      this.spawn(Phaser.Utils.Array.GetRandom(wave.types));
    }
  }

  // Por defecto aparecen en un anillo fuera de la pantalla, alrededor del jugador.
  spawn(kind, center = this.scene.player, distance = SPAWN_DISTANCE) {
    let x;
    let y;

    for (let attempt = 0; attempt < 10; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      x = center.x + Math.cos(angle) * distance;
      y = center.y + Math.sin(angle) * distance;
      if (this.isInsideWorld(x, y)) break;
    }

    x = Phaser.Math.Clamp(x, EDGE_MARGIN, WORLD_SIZE - EDGE_MARGIN);
    y = Phaser.Math.Clamp(y, EDGE_MARGIN, WORLD_SIZE - EDGE_MARGIN);

    const enemy = this.scene.enemies.get(x, y);
    if (enemy) enemy.spawn(x, y, kind);
    return enemy;
  }

  isInsideWorld(x, y) {
    return x > EDGE_MARGIN && x < WORLD_SIZE - EDGE_MARGIN && y > EDGE_MARGIN && y < WORLD_SIZE - EDGE_MARGIN;
  }
}
