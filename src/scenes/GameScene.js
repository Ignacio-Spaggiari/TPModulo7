import Phaser from 'phaser';
import {
  WORLD_SIZE,
  BOSS_TIME_LIMIT,
  BOSS,
  FIRE_RANGE,
  MULTISHOT_SPREAD,
  MAX_ENEMIES,
  HEAL_DROP_CHANCE,
  HEAL_AMOUNT,
  PICKUP_SPEED,
  WIN_BONUS,
  COLORS,
  xpToNextLevel,
} from '../config.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import Projectile from '../entities/Projectile.js';
import Pickup from '../entities/Pickup.js';
import WaveManager from '../systems/WaveManager.js';
import { addRedCells } from '../systems/Background.js';
import { pickUpgradeOptions, countUpgradeLevels, TOTAL_UPGRADE_LEVELS } from '../systems/Upgrades.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    // Todo el estado se inicializa acá para que reiniciar la escena arranque de cero.
    this.elapsed = 0;
    this.score = 0;
    this.kills = 0;
    this.level = 1;
    this.xp = 0;
    this.xpToNext = xpToNextLevel(this.level);
    this.pendingLevelUps = 0;
    this.upgradeLevels = {};
    this.fireTimer = 0;
    this.isOver = false;

    // Fase final (jefe)
    this.bossPhase = false;
    this.boss = null;
    this.bossTimeLeft = BOSS_TIME_LIMIT * 1000;
    this.sporeTimer = 0;
    this.summonTimer = 0;

    this.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    this.createArena();

    this.player = new Player(this, WORLD_SIZE / 2, WORLD_SIZE / 2);
    this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.enemies = this.physics.add.group({ classType: Enemy, maxSize: MAX_ENEMIES });
    this.projectiles = this.physics.add.group({ classType: Projectile, maxSize: 150 });
    this.spores = this.physics.add.group({ classType: Projectile, maxSize: 120 });
    this.pickups = this.physics.add.group({ classType: Pickup, maxSize: 400 });
    this.waves = new WaveManager(this);

    this.physics.add.collider(this.enemies, this.enemies);
    this.physics.add.overlap(this.projectiles, this.enemies, this.onProjectileHit, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.onPlayerHit, null, this);
    this.physics.add.overlap(this.player, this.spores, this.onSporeHit, null, this);
    this.physics.add.overlap(this.player, this.pickups, this.onPickup, null, this);

    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT');
    this.input.keyboard.on('keydown-ESC', this.pauseGame, this);
    this.input.keyboard.on('keydown-P', this.pauseGame, this);

    this.scene.launch('UI');
  }

  createArena() {
    this.cameras.main.setBackgroundColor(COLORS.plasma);
    addRedCells(this, 60, WORLD_SIZE, WORLD_SIZE);
    // Paredes del vaso sanguíneo.
    this.add.graphics().lineStyle(24, COLORS.vesselWall).strokeRect(0, 0, WORLD_SIZE, WORLD_SIZE).setDepth(-1);
  }

  update(time, delta) {
    if (this.isOver) return;

    this.elapsed += delta;
    this.handleMovement();

    if (this.bossPhase) {
      this.updateBoss(delta);
      if (this.isOver) return;
    } else {
      this.waves.update(this.elapsed, delta);
    }

    this.enemies.getChildren().forEach((enemy) => enemy.active && enemy.chase(this.player));
    this.updateAutoFire(delta);
    this.updatePickups();

    if (this.pendingLevelUps > 0) this.openLevelUp();
  }

  handleMovement() {
    const { W, A, S, D, UP, DOWN, LEFT, RIGHT } = this.keys;
    const dx = (D.isDown || RIGHT.isDown ? 1 : 0) - (A.isDown || LEFT.isDown ? 1 : 0);
    const dy = (S.isDown || DOWN.isDown ? 1 : 0) - (W.isDown || UP.isDown ? 1 : 0);
    this.player.move(dx, dy);
  }

  updateAutoFire(delta) {
    const { stats } = this.player;
    this.fireTimer += delta;
    if (this.fireTimer < stats.fireRate) return;

    const target = this.findNearestEnemy(FIRE_RANGE);
    if (!target) {
      // Queda cargado para disparar apenas aparezca un enemigo en rango.
      this.fireTimer = stats.fireRate;
      return;
    }

    this.fireTimer = 0;
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
    for (let i = 0; i < stats.projectiles; i++) {
      const offset = (i - (stats.projectiles - 1) / 2) * MULTISHOT_SPREAD;
      const projectile = this.projectiles.get();
      if (projectile) projectile.fire(this.player.x, this.player.y, angle + offset, stats.projectileSpeed, stats.damage);
    }
  }

  findNearestEnemy(range) {
    let nearest = null;
    let nearestDistance = range * range;

    this.enemies.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
      const distance = Phaser.Math.Distance.Squared(this.player.x, this.player.y, enemy.x, enemy.y);
      if (distance < nearestDistance) {
        nearest = enemy;
        nearestDistance = distance;
      }
    });

    return nearest;
  }

  updatePickups() {
    const radius = this.player.stats.magnetRadius;

    this.pickups.getChildren().forEach((pickup) => {
      if (!pickup.active) return;
      if (!pickup.attracted && Phaser.Math.Distance.Between(this.player.x, this.player.y, pickup.x, pickup.y) < radius) {
        pickup.attracted = true;
      }
      if (pickup.attracted) this.physics.moveToObject(pickup, this.player, PICKUP_SPEED);
    });
  }

  // Con todas las mejoras al máximo empieza la fase final contra el Supervirus.
  startBossPhase() {
    this.bossPhase = true;

    // Se limpian los enemigos comunes para que la pelea sea solo contra el jefe.
    this.enemies.getChildren().forEach((enemy) => enemy.active && enemy.die());
    this.boss = this.waves.spawn('supervirus', this.player, 600);
  }

  updateBoss(delta) {
    this.bossTimeLeft -= delta;
    if (this.bossTimeLeft <= 0) {
      this.bossTimeLeft = 0;
      this.endGame(false, 'timeout');
      return;
    }

    this.sporeTimer += delta;
    if (this.sporeTimer >= BOSS.sporeInterval) {
      this.sporeTimer = 0;
      const start = Math.random() * Math.PI * 2;
      for (let i = 0; i < BOSS.sporeCount; i++) {
        const spore = this.spores.get();
        const angle = start + (Math.PI * 2 * i) / BOSS.sporeCount;
        if (spore) spore.fire(this.boss.x, this.boss.y, angle, BOSS.sporeSpeed, BOSS.sporeDamage, 'spore');
      }
    }

    this.summonTimer += delta;
    if (this.summonTimer >= BOSS.summonInterval) {
      this.summonTimer = 0;
      for (let i = 0; i < BOSS.summonCount; i++) this.waves.spawn('virus', this.boss, 90);
    }
  }

  onProjectileHit(projectile, enemy) {
    if (!projectile.active || !enemy.active) return;

    projectile.disableBody(true, true);
    if (enemy.takeDamage(projectile.damage)) this.killEnemy(enemy);
  }

  killEnemy(enemy) {
    const { config } = enemy;
    this.score += config.score;
    this.kills += 1;
    enemy.die();

    if (config.boss) {
      this.endGame(true);
      return;
    }

    this.dropPickup(enemy.x, enemy.y, 'xp', config.xp);
    if (Math.random() < HEAL_DROP_CHANCE) this.dropPickup(enemy.x + 12, enemy.y, 'heal', HEAL_AMOUNT);
  }

  dropPickup(x, y, kind, value) {
    const pickup = this.pickups.get(x, y);
    if (pickup) pickup.spawn(x, y, kind, value);
  }

  onPlayerHit(player, enemy) {
    if (!enemy.active) return;
    this.damagePlayer(enemy.config.damage);
  }

  onSporeHit(player, spore) {
    if (!spore.active) return;
    spore.disableBody(true, true);
    this.damagePlayer(spore.damage);
  }

  damagePlayer(amount) {
    if (this.isOver) return;

    if (this.player.takeDamage(amount, this.elapsed) && this.player.isDead()) {
      this.endGame(false, 'health');
    }
  }

  onPickup(player, pickup) {
    if (!pickup.active) return;

    if (pickup.kind === 'heal') {
      player.heal(pickup.value);
    } else {
      this.addXp(pickup.value);
    }
    pickup.collect();
  }

  addXp(amount) {
    this.xp += amount;
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level += 1;
      this.xpToNext = xpToNextLevel(this.level);
      this.pendingLevelUps += 1;
    }
  }

  // Devuelve los datos para la próxima elección de mejora, o null si no hay más pendientes.
  nextLevelUpData() {
    if (this.pendingLevelUps <= 0) return null;

    const options = pickUpgradeOptions(this.upgradeLevels);
    if (options.length === 0) {
      // Todas las mejoras al máximo: en lugar de elegir, se cura.
      this.player.heal(HEAL_AMOUNT * this.pendingLevelUps);
      this.pendingLevelUps = 0;
      return null;
    }

    return { options, level: this.level - this.pendingLevelUps + 1, upgradeLevels: this.upgradeLevels };
  }

  openLevelUp() {
    const data = this.nextLevelUpData();
    if (!data) return;

    this.player.setVelocity(0, 0);
    this.scene.pause();
    this.scene.launch('LevelUp', data);
  }

  applyUpgrade(upgrade) {
    this.upgradeLevels[upgrade.id] = (this.upgradeLevels[upgrade.id] || 0) + 1;
    upgrade.apply(this.player);
    this.pendingLevelUps -= 1;

    if (!this.bossPhase && countUpgradeLevels(this.upgradeLevels) >= TOTAL_UPGRADE_LEVELS) {
      this.startBossPhase();
    }
  }

  pauseGame() {
    if (this.isOver) return;

    this.scene.pause();
    this.scene.launch('Pause');
  }

  // `reason` indica por qué se perdió: 'health' (sin vida) o 'timeout' (no venció al jefe a tiempo).
  endGame(victory, reason) {
    this.isOver = true;
    this.physics.pause();
    this.player.setTint(victory ? 0xffffff : 0x666666);
    if (victory) this.score += WIN_BONUS;

    this.time.delayedCall(800, () => {
      this.scene.stop('UI');
      this.scene.start('GameOver', {
        victory,
        reason,
        score: this.score,
        kills: this.kills,
        level: this.level,
        seconds: Math.floor(this.elapsed / 1000),
      });
    });
  }
}
