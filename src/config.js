// Constantes de balanceo y configuración general (ver GDD).

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const WORLD_SIZE = 2400;

// Fase final: cuando todas las mejoras llegan al máximo aparece el jefe,
// y hay que derrotarlo antes de que termine este tiempo (segundos).
export const BOSS_TIME_LIMIT = 90;
export const BOSS = {
  sporeInterval: 2200, // ms entre ráfagas de esporas
  sporeCount: 12,
  sporeSpeed: 220,
  sporeDamage: 15,
  summonInterval: 5000, // ms entre invocaciones de virus
  summonCount: 4,
};

export const PLAYER = {
  maxHealth: 100,
  speed: 200,
  fireRate: 600, // ms entre disparos
  damage: 1,
  projectileSpeed: 450,
  projectiles: 1,
  magnetRadius: 80,
  invulnerableTime: 500, // ms
};

// Distancia máxima a la que Leuco detecta enemigos para dispararles.
export const FIRE_RANGE = 650;
// Separación angular entre proyectiles del disparo múltiple (radianes).
export const MULTISHOT_SPREAD = 0.18;
export const PROJECTILE_LIFESPAN = 1500;

export const ENEMIES = {
  virus: { texture: 'virus', radius: 13, health: 1, speed: 80, damage: 10, xp: 1, score: 10 },
  bacteria: { texture: 'bacteria', radius: 10, health: 2, speed: 140, damage: 8, xp: 2, score: 20 },
  parasite: { texture: 'parasite', radius: 20, health: 6, speed: 50, damage: 20, xp: 5, score: 50 },
  supervirus: { texture: 'supervirus', radius: 52, health: 4000, speed: 90, damage: 40, xp: 0, score: 2000, boss: true },
};

// Cada oleada empieza en `from` (segundos) y define qué aparece y cada cuánto (ms).
export const WAVES = [
  { from: 0, types: ['virus'], interval: 900 },
  { from: 45, types: ['virus', 'bacteria'], interval: 600 },
  { from: 90, types: ['virus', 'bacteria', 'parasite'], interval: 400 },
  { from: 150, types: ['virus', 'bacteria', 'parasite'], interval: 300 },
];
export const SPAWN_DISTANCE = 760;
export const MAX_ENEMIES = 300;

export const HEAL_DROP_CHANCE = 0.03;
export const HEAL_AMOUNT = 20;
export const PICKUP_SPEED = 450;

export const WIN_BONUS = 1000;

export const xpToNextLevel = (level) => 4 + level * 2;

export const COLORS = {
  plasma: 0x3a0a12,
  vesselWall: 0x5c1220,
  redCell: 0x8b1a2b,
  redCellCenter: 0x6e1422,
  player: 0xf5f5f5,
  nucleus: 0xc9b6ff,
  antibody: 0x7fe7ff,
  virus: 0x5fd35f,
  bacteria: 0xf2d14b,
  parasite: 0xa35fd3,
  protein: 0x4fc3f7,
  spore: 0xb8f06b,
  health: 0x6be36b,
  danger: 0xff6b6b,
};

export const FONT = 'Trebuchet MS, Arial, sans-serif';
