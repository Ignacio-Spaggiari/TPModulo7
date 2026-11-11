import Phaser from 'phaser';
import { audio } from '../systems/Audio.js';

// Genera todas las texturas del juego por código, sin assets externos.
// Se dibujan en un canvas 2D para poder usar degradados, brillos y halos
// que les dan volumen (que parezcan esferas iluminadas y no círculos planos).
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    this.canvasTexture('player', 80, 80, (ctx) => {
      halo(ctx, 40, 40, 40, 'rgba(201, 182, 255, 0.35)');
      sphere(ctx, 40, 40, 24, { light: '#ffffff', base: '#ebe8f7', dark: '#9d97bd' });
      ctx.globalAlpha = 0.85;
      sphere(ctx, 34, 37, 8, PURPLE);
      sphere(ctx, 45, 35, 7, PURPLE);
      sphere(ctx, 41, 46, 7, PURPLE);
      ctx.globalAlpha = 1;
      gloss(ctx, 40, 40, 24);
    });

    this.canvasTexture('antibody', 26, 24, (ctx) => {
      ctx.shadowColor = '#7fe7ff';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = '#a8f3ff';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(5, 12);
      ctx.lineTo(13, 12);
      ctx.lineTo(21, 6);
      ctx.moveTo(13, 12);
      ctx.lineTo(21, 18);
      ctx.stroke();
    });

    this.canvasTexture('virus', 48, 48, (ctx) => {
      spikes(ctx, 24, 24, 8, 12, 19, 3.5, GREEN);
      sphere(ctx, 24, 24, 13, GREEN);
      spots(ctx, [[20, 21, 3], [28, 27, 2.5]], 'rgba(30, 90, 30, 0.6)');
      gloss(ctx, 24, 24, 13);
    });

    this.canvasTexture('bacteria', 48, 30, (ctx) => {
      // Flagelo
      ctx.strokeStyle = 'rgba(242, 209, 75, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(8, 15);
      ctx.bezierCurveTo(5, 9, 3, 21, 0, 15);
      ctx.stroke();
      capsule(ctx, 8, 5, 38, 20, { light: '#fff2a8', base: '#f2d14b', dark: '#9c7d16' });
      spots(ctx, [[20, 15, 3], [32, 15, 3]], 'rgba(150, 110, 20, 0.5)');
    });

    this.canvasTexture('parasite', 70, 52, (ctx) => {
      halo(ctx, 35, 26, 34, 'rgba(163, 95, 211, 0.25)');
      ctx.save();
      ctx.translate(35, 26);
      ctx.scale(1, 0.72);
      sphere(ctx, 0, 0, 28, { light: '#e2b8ff', base: '#a35fd3', dark: '#4e2470' });
      ctx.restore();
      spots(ctx, [[25, 20, 5], [44, 30, 6], [32, 34, 3]], 'rgba(70, 30, 110, 0.55)');
      gloss(ctx, 35, 26, 22);
    });

    this.canvasTexture('supervirus', 180, 180, (ctx) => {
      halo(ctx, 90, 90, 90, 'rgba(95, 211, 95, 0.4)');
      spikes(ctx, 90, 90, 14, 52, 72, 8, GREEN);
      sphere(ctx, 90, 90, 55, { light: '#c6ffb8', base: '#3fa83f', dark: '#164d16' });
      spots(ctx, [[75, 78, 11], [108, 98, 10], [82, 114, 7], [104, 70, 6]], 'rgba(20, 70, 20, 0.6)');
      gloss(ctx, 90, 90, 55);
    });

    this.canvasTexture('spore', 22, 22, (ctx) => {
      halo(ctx, 11, 11, 11, 'rgba(184, 240, 107, 0.6)');
      sphere(ctx, 11, 11, 6, { light: '#f2ffd6', base: '#b8f06b', dark: '#4f7a1c' });
    });

    this.canvasTexture('protein', 22, 22, (ctx) => {
      halo(ctx, 11, 11, 11, 'rgba(79, 195, 247, 0.6)');
      sphere(ctx, 11, 11, 6, { light: '#e6f8ff', base: '#4fc3f7', dark: '#135d80' });
    });

    this.canvasTexture('platelet', 28, 28, (ctx) => {
      halo(ctx, 14, 14, 14, 'rgba(255, 220, 230, 0.5)');
      const gradient = ctx.createLinearGradient(0, 4, 0, 24);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(1, '#f2b8c6');
      ctx.fillStyle = gradient;
      ctx.fillRect(11, 5, 6, 18);
      ctx.fillRect(5, 11, 18, 6);
    });

    // Glóbulo rojo bicóncavo: el centro es más oscuro porque está hundido.
    this.canvasTexture('redCell', 76, 56, (ctx) => {
      ctx.save();
      ctx.translate(38, 28);
      ctx.scale(1, 0.7);
      const gradient = ctx.createRadialGradient(-6, -8, 2, 0, 0, 36);
      gradient.addColorStop(0, '#5a0f1c');
      gradient.addColorStop(0.4, '#741524');
      gradient.addColorStop(0.72, '#b23046');
      gradient.addColorStop(0.9, '#8b1a2b');
      gradient.addColorStop(1, 'rgba(70, 10, 20, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Gota suave y blanca: se usa para la estela, las partículas y las luces (se tiñe en el juego).
    this.canvasTexture('droplet', 32, 32, (ctx) => halo(ctx, 16, 16, 16, 'rgba(255, 255, 255, 1)'));

    this.canvasTexture('ring', 128, 128, (ctx) => {
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(64, 64, 54, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Gris para que al teñirlo tome el color del enemigo que explota.
    this.canvasTexture('debris', 12, 12, (ctx) => sphere(ctx, 6, 6, 5, { light: '#ffffff', base: '#cccccc', dark: '#555555' }));

    this.canvasTexture('bubble', 16, 16, (ctx) => {
      ctx.strokeStyle = 'rgba(255, 220, 230, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(8, 8, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(6, 6, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Bordes rojos para la alerta de vida baja; el centro queda transparente.
    this.canvasTexture('lowHealth', 1280, 720, (ctx) => {
      const gradient = ctx.createRadialGradient(640, 360, 220, 640, 360, 760);
      gradient.addColorStop(0, 'rgba(255, 30, 50, 0)');
      gradient.addColorStop(1, 'rgba(255, 30, 50, 0.85)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1280, 720);
    });

    this.canvasTexture('light', 512, 512, (ctx) => halo(ctx, 256, 256, 256, 'rgba(255, 235, 240, 1)'));

    // Plasma con manchas suaves; se repite como mosaico, así que las manchas se dibujan "envueltas".
    this.canvasTexture('plasma', 512, 512, (ctx) => {
      ctx.fillStyle = '#3a0a12';
      ctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 28; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const r = 40 + Math.random() * 90;
        const color = Math.random() < 0.5 ? 'rgba(20, 2, 6, 0.35)' : 'rgba(110, 22, 38, 0.25)';
        for (const dx of [-512, 0, 512]) {
          for (const dy of [-512, 0, 512]) halo(ctx, x + dx, y + dy, r, color);
        }
      }
    });

    audio.init(this.game);
    this.scene.launch('Sound');
    this.scene.start('Menu');
  }

  canvasTexture(key, width, height, draw) {
    const texture = this.textures.createCanvas(key, width, height);
    draw(texture.getContext());
    texture.refresh();
  }
}

const GREEN = { light: '#c6ffb8', base: '#5fd35f', dark: '#1f6b1f' };
const PURPLE = { light: '#efe6ff', base: '#b49cff', dark: '#5a43b0' };

// Esfera iluminada desde arriba a la izquierda.
function sphere(ctx, x, y, r, { light, base, dark }) {
  const gradient = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
  gradient.addColorStop(0, light);
  gradient.addColorStop(0.45, base);
  gradient.addColorStop(1, dark);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// Reflejo de luz pequeño que da sensación de superficie húmeda.
function gloss(ctx, x, y, r) {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.translate(x - r * 0.38, y - r * 0.45);
  ctx.rotate(-0.6);
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.28, r * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Resplandor radial que se desvanece hacia afuera.
function halo(ctx, x, y, r, color) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function spikes(ctx, cx, cy, count, innerRadius, outerRadius, tipRadius, colors) {
  ctx.strokeStyle = colors.dark;
  ctx.lineWidth = 3;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(cx + cos * innerRadius, cy + sin * innerRadius);
    ctx.lineTo(cx + cos * outerRadius, cy + sin * outerRadius);
    ctx.stroke();
    sphere(ctx, cx + cos * outerRadius, cy + sin * outerRadius, tipRadius, colors);
  }
}

function spots(ctx, list, color) {
  ctx.fillStyle = color;
  for (const [x, y, r] of list) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Cápsula sombreada de arriba (luz) hacia abajo (sombra).
function capsule(ctx, x, y, width, height, { light, base, dark }) {
  const gradient = ctx.createLinearGradient(0, y, 0, y + height);
  gradient.addColorStop(0, light);
  gradient.addColorStop(0.4, base);
  gradient.addColorStop(1, dark);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, height / 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.roundRect(x + height / 2, y + 3, width - height, 4, 2);
  ctx.fill();
}
