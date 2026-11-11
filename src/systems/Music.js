// Temas musicales compuestos por código. Cada tema define su tempo y una función
// `step` que se llama en cada semicorchea (16 por compás) para programar sus notas.

export const midiToFrequency = (note) => 440 * 2 ** ((note - 69) / 12);

// Notas en formato MIDI (60 = Do central).
const MENU_CHORDS = [
  [57, 60, 64], // La menor
  [53, 57, 60], // Fa
  [48, 52, 55], // Do
  [55, 59, 62], // Sol
];

const BATTLE_CHORDS = [
  { root: 45, triad: [69, 72, 76] }, // La menor
  { root: 41, triad: [65, 69, 72] }, // Fa
  { root: 43, triad: [67, 71, 74] }, // Sol
  { root: 40, triad: [64, 68, 71] }, // Mi
];

// Índices sobre [fundamental, tercera, quinta, octava] para la melodía de cada compás.
const LEAD_PATTERN = [0, null, 1, null, 2, null, 1, null, 0, null, 1, 2, 3, 2, 1, null];

function note(audio, midi, time, options) {
  audio.tone({ ...options, from: midiToFrequency(midi), time });
}

function kick(audio, time, bus) {
  audio.tone({ type: 'sine', from: 150, to: 45, duration: 0.15, volume: 0.5, time, bus });
}

function snare(audio, time, bus) {
  audio.noise({ duration: 0.12, volume: 0.2, filter: 1000, filterType: 'highpass', time, bus });
}

function hihat(audio, time, bus, volume) {
  audio.noise({ duration: 0.03, volume, filter: 7000, filterType: 'highpass', time, bus });
}

// Tranquilo y misterioso: acordes suaves con un arpegio por encima.
function menuStep(audio, step, time, stepDuration, bus) {
  const s = step % 16;
  const chord = MENU_CHORDS[Math.floor(step / 16) % MENU_CHORDS.length];
  const barDuration = stepDuration * 16;

  if (s === 0) {
    chord.forEach((midi) => note(audio, midi, time, { type: 'triangle', duration: barDuration, volume: 0.09, attack: 0.6, bus }));
  }
  if (s === 0 || s === 8) {
    note(audio, chord[0] - 12, time, { type: 'sine', duration: stepDuration * 7, volume: 0.2, bus });
  }
  if (s % 2 === 0) {
    note(audio, chord[(s / 2) % 3] + 12, time, { type: 'sine', duration: stepDuration * 2.5, volume: 0.09, bus });
  }
}

// Combate: batería, bajo constante y una melodía rápida. `intense` lo vuelve más cargado para el jefe.
function battleStep(audio, step, time, stepDuration, bus, intense = false) {
  const s = step % 16;
  const { root, triad } = BATTLE_CHORDS[Math.floor(step / 16) % BATTLE_CHORDS.length];

  if (s % 4 === 0 || (intense && s % 4 === 2 && s >= 8)) kick(audio, time, bus);
  if (s === 4 || s === 12) snare(audio, time, bus);
  if (intense || s % 2 === 0) hihat(audio, time, bus, s % 4 === 2 ? 0.08 : 0.04);

  if (intense || s % 2 === 0) {
    const bassNote = s % 4 === 2 ? root + 12 : root;
    note(audio, bassNote, time, { type: 'square', duration: stepDuration * 1.6, volume: 0.08, filter: 900, bus });
  }

  const index = LEAD_PATTERN[s];
  if (index !== null) {
    const leadNote = index === 3 ? triad[0] + 12 : triad[index];
    note(audio, leadNote, time, { type: 'square', duration: stepDuration * 1.8, volume: 0.045, filter: 3000, bus });
  }
}

export const TRACKS = {
  menu: { bpm: 80, step: menuStep },
  battle: { bpm: 140, step: battleStep },
  boss: { bpm: 165, step: (...args) => battleStep(...args, true) },
};
