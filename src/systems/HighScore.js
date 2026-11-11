const KEY = 'leuco-highscore';

// localStorage puede fallar (modo privado, permisos), así que siempre tiene un valor por defecto.
export function loadHighScore() {
  try {
    return Number(localStorage.getItem(KEY)) || 0;
  } catch {
    return 0;
  }
}

export function saveHighScore(score) {
  try {
    localStorage.setItem(KEY, String(score));
  } catch {
    // Si no se puede guardar, el récord solo dura esta sesión.
  }
}
