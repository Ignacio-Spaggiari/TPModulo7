import { TRACKS, midiToFrequency } from './Music.js';

// Todo el audio se sintetiza con la Web Audio API: no hay archivos de sonido.
// Usa el AudioContext de Phaser, que se desbloquea solo con el primer click o tecla.

const SCHEDULE_AHEAD = 0.12; // segundos de música que se programan por adelantado
const SCHEDULER_INTERVAL = 25; // ms

// Cada efecto tiene un tiempo mínimo entre repeticiones (ms) para no saturar
// cuando pasan muchas cosas en el mismo frame.
const SFX = {
  shoot: {
    cooldown: 60,
    play: (a) => a.tone({ type: 'square', from: 1200, to: 600, duration: 0.07, volume: 0.05 }),
  },
  enemyHit: {
    cooldown: 40,
    play: (a) => a.tone({ type: 'triangle', from: 420, to: 220, duration: 0.06, volume: 0.12 }),
  },
  enemyDeath: {
    cooldown: 40,
    play: (a) => {
      a.noise({ duration: 0.12, volume: 0.1, filter: 1500 });
      a.tone({ type: 'sine', from: 500, to: 90, duration: 0.15, volume: 0.12 });
    },
  },
  // Las explosiones grandes son más graves y largas, no más fuertes: así se sienten
  // más potentes sin tapar el resto ni saturar.
  explosionMedium: {
    cooldown: 80,
    play: (a) => {
      a.noise({ duration: 0.22, volume: 0.12, filter: 900 });
      a.tone({ type: 'sine', from: 220, to: 50, duration: 0.25, volume: 0.15 });
    },
  },
  explosionLarge: {
    cooldown: 160,
    play: (a) => {
      a.noise({ duration: 0.45, volume: 0.15, filter: 600 });
      a.tone({ type: 'sine', from: 140, to: 35, duration: 0.5, volume: 0.2 });
    },
  },
  explosionBoss: {
    cooldown: 1000,
    play: (a) => {
      a.noise({ duration: 1.6, volume: 0.22, filter: 450 });
      a.tone({ type: 'sine', from: 110, to: 25, duration: 1.8, volume: 0.28 });
      a.tone({ type: 'triangle', from: 70, to: 30, duration: 1.4, volume: 0.15, time: a.ctx.currentTime + 0.9 });
    },
  },
  powerUp: {
    cooldown: 100,
    play: (a) => a.tone({ type: 'sine', from: 400, to: 1300, duration: 0.25, volume: 0.1 }),
  },
  playerHurt: {
    cooldown: 150,
    play: (a) => {
      a.tone({ type: 'sawtooth', from: 220, to: 70, duration: 0.25, volume: 0.18, filter: 1200 });
      a.noise({ duration: 0.15, volume: 0.15, filter: 800 });
    },
  },
  pickup: {
    cooldown: 50,
    play: (a) => a.tone({ type: 'sine', from: 1300, to: 1800, duration: 0.05, volume: 0.05 }),
  },
  click: {
    cooldown: 80,
    play: (a) => a.tone({ type: 'sine', from: 700, to: 1000, duration: 0.07, volume: 0.2 }),
  },
  levelUp: {
    cooldown: 200,
    play: (a) => a.arpeggio([72, 76, 79, 84], 0.08, { type: 'triangle', duration: 0.18, volume: 0.15 }),
  },
  bossRoar: {
    cooldown: 1000,
    play: (a) => {
      a.tone({ type: 'sawtooth', from: 120, to: 40, duration: 1.2, volume: 0.25, filter: 600 });
      a.noise({ duration: 1, volume: 0.2, filter: 400 });
    },
  },
  victory: {
    cooldown: 1000,
    play: (a) => a.arpeggio([60, 64, 67, 72, 76, 79, 84], 0.11, { type: 'square', duration: 0.3, volume: 0.08 }),
  },
  defeat: {
    cooldown: 1000,
    play: (a) => a.arpeggio([67, 63, 60, 55, 48], 0.22, { type: 'sawtooth', duration: 0.35, volume: 0.1, filter: 1500 }),
  },
};

class AudioManager {
  init(game) {
    // Si el navegador no soporta Web Audio, Phaser no tiene contexto y el juego queda en silencio.
    this.ctx = game.sound.context;
    if (!this.ctx) return;

    // El compresor baja el volumen automáticamente cuando suenan muchas cosas juntas,
    // así las explosiones en cadena no saturan ni distorsionan.
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -18;
    this.compressor.knee.value = 12;
    this.compressor.ratio.value = 6;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;
    this.compressor.connect(this.ctx.destination);

    this.master = this.ctx.createGain();
    this.master.gain.value = 0.6;
    this.master.connect(this.compressor);

    this.sfxBus = this.createBus(0.7);
    this.musicBus = this.createBus(0.35);
    this.noiseBuffer = this.createNoiseBuffer();
    this.lastPlayed = {};

    this.currentTrack = null;
    this.timer = null;
  }

  createBus(volume) {
    const bus = this.ctx.createGain();
    bus.gain.value = volume;
    bus.connect(this.master);
    return bus;
  }

  createNoiseBuffer() {
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  play(name) {
    if (!this.ctx) return;

    const now = performance.now();
    const sfx = SFX[name];
    if (now - (this.lastPlayed[name] || 0) < sfx.cooldown) return;

    this.lastPlayed[name] = now;
    sfx.play(this);
  }

  // Oscilador con envolvente: sube rápido y se apaga exponencialmente.
  // `filter` agrega un pasa bajos para suavizar ondas ásperas.
  tone({ type, from, to, duration, volume, time, attack = 0.005, filter, bus = this.sfxBus }) {
    const start = time ?? this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(from, start);
    if (to) osc.frequency.exponentialRampToValueAtTime(to, start + duration);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(volume, start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    this.connectThrough(osc, gain, filter, 'lowpass', bus);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  noise({ duration, volume, time, filter = 2000, filterType = 'lowpass', bus = this.sfxBus }) {
    const start = time ?? this.ctx.currentTime;
    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();

    source.buffer = this.noiseBuffer;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    this.connectThrough(source, gain, filter, filterType, bus);
    source.start(start, Math.random() * 0.5);
    source.stop(start + duration + 0.02);
  }

  connectThrough(source, gain, filterFrequency, filterType, bus) {
    if (filterFrequency) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.value = filterFrequency;
      source.connect(filter).connect(gain);
    } else {
      source.connect(gain);
    }
    gain.connect(bus);
  }

  arpeggio(notes, gap, options) {
    const start = this.ctx.currentTime;
    notes.forEach((note, i) => {
      const frequency = midiToFrequency(note);
      this.tone({ ...options, from: frequency, time: start + i * gap });
    });
  }

  // --- Música ---

  playMusic(name) {
    if (!this.ctx || this.currentTrack === name) return;

    this.stopMusic();
    this.currentTrack = name;
    this.track = TRACKS[name];
    this.step = 0;
    this.nextStepTime = this.ctx.currentTime + 0.05;

    // Cada tema tiene su propio volumen para poder hacer un fade out al cambiar.
    this.trackGain = this.ctx.createGain();
    this.trackGain.connect(this.musicBus);

    this.timer = setInterval(() => this.scheduleMusic(), SCHEDULER_INTERVAL);
  }

  // Programa las notas un poco antes de que suenen para que el ritmo no dependa de los frames.
  // Si el contexto está suspendido (antes del primer click), currentTime no avanza y espera.
  scheduleMusic() {
    const stepDuration = 60 / this.track.bpm / 4; // semicorcheas
    while (this.nextStepTime < this.ctx.currentTime + SCHEDULE_AHEAD) {
      this.track.step(this, this.step, this.nextStepTime, stepDuration, this.trackGain);
      this.nextStepTime += stepDuration;
      this.step += 1;
    }
  }

  stopMusic() {
    if (!this.ctx || !this.currentTrack) return;

    clearInterval(this.timer);
    const gain = this.trackGain;
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.3);
    setTimeout(() => gain.disconnect(), 500);

    this.currentTrack = null;
  }
}

export const audio = new AudioManager();
