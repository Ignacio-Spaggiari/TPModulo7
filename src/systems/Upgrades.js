import Phaser from 'phaser';

export const UPGRADES = [
  {
    id: 'fireRate',
    name: 'Anticuerpos rápidos',
    description: '-15 % de tiempo\nentre disparos',
    max: 5,
    apply: (player) => (player.stats.fireRate *= 0.85),
  },
  {
    id: 'damage',
    name: 'Anticuerpos potentes',
    description: '+1 de daño',
    max: 5,
    apply: (player) => (player.stats.damage += 1),
  },
  {
    id: 'multishot',
    name: 'Disparo múltiple',
    description: '+1 proyectil\npor disparo',
    max: 4,
    apply: (player) => (player.stats.projectiles += 1),
  },
  {
    id: 'membrane',
    name: 'Membrana reforzada',
    description: '+25 de vida máxima\ny cura 25',
    max: 4,
    apply: (player) => {
      player.stats.maxHealth += 25;
      player.heal(25);
    },
  },
  {
    id: 'flagellum',
    name: 'Flagelo',
    description: '+15 % de velocidad\nde movimiento',
    max: 4,
    apply: (player) => (player.stats.speed *= 1.15),
  },
  {
    id: 'chemotaxis',
    name: 'Quimiotaxis',
    description: '+50 % de radio\ndel imán de XP',
    max: 3,
    apply: (player) => (player.stats.magnetRadius *= 1.5),
  },
];

export const TOTAL_UPGRADE_LEVELS = UPGRADES.reduce((total, upgrade) => total + upgrade.max, 0);

export function countUpgradeLevels(upgradeLevels) {
  return Object.values(upgradeLevels).reduce((total, level) => total + level, 0);
}

// Hasta `count` mejoras al azar entre las que todavía no llegaron al máximo.
export function pickUpgradeOptions(upgradeLevels, count = 3) {
  const available = UPGRADES.filter((upgrade) => (upgradeLevels[upgrade.id] || 0) < upgrade.max);
  return Phaser.Utils.Array.Shuffle(available).slice(0, count);
}
