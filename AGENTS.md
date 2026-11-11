# AGENTS.md

## Proyecto

**Leuco: Defensa Celular**: videojuego survivor de arena desarrollado como trabajo práctico de Desarrollo Tecnológico (Módulo 7). El jugador controla a Leuco, un glóbulo blanco, que debe completar las 25 mejoras y derrotar al Supervirus en menos de 1:30.

- Autor: Ignacio Spaggiari
- Agente usado: Claude Code (en lugar de OpenCode)
- Diseño completo: `docs/GDD.md` (versión exportada en `docs/GDD.pdf`)

## Stack

- JavaScript (módulos ES)
- Node.js
- Vite 6
- Phaser 3.90 con Arcade Physics
- Web Audio API para el sonido

## Objetivo

Desarrollar un videojuego pequeño pero completo (menú, partida, victoria, derrota y reinicio) aplicando:

- Buenas prácticas de organización de código.
- Desarrollo asistido por agentes de programación.

## Arquitectura

```
src/
├── main.js        # Configuración de Phaser y lista de escenas
├── config.js      # TODOS los números de balanceo y colores
├── scenes/        # Una escena por pantalla o capa (Boot, Menu, Game, UI, LevelUp, Pause, GameOver, Sound)
├── entities/      # Objetos del juego con física (Player, Enemy, Projectile, Pickup)
├── systems/       # Lógica reutilizable (oleadas, mejoras, efectos, fondo, audio, música, récord)
├── patterns/      # Implementaciones de patrones de diseño (ObjectPool)
├── ui/            # Componentes de interfaz (Button)
└── assets/        # Vacía: el arte y el sonido se generan por código
```

Responsabilidades clave:

- `GameScene` coordina la partida pero delega: oleadas en `WaveManager`, efectos en `Effects`, fondo en `BloodStream`, mejoras en `Upgrades`.
- `UIScene` dibuja el HUD leyendo el estado de `GameScene`; no modifica la partida.
- `LevelUpScene` y `PauseScene` pausan `GameScene` y la reanudan al terminar.
- `audio` (en `systems/Audio.js`) es un Singleton compartido por todas las escenas.
- Enemigos, proyectiles e ítems se reutilizan con Physics Groups (Object Pool); los números de daño usan `patterns/ObjectPool.js`.

## Reglas para el agente

- Utilizar JavaScript. No agregar TypeScript.
- Utilizar Phaser 3 (no migrar a Phaser 4 ni a otro motor).
- Mantener las clases pequeñas y con responsabilidades claras.
- Evitar concentrar toda la lógica en `GameScene`: la lógica nueva va a un sistema o entidad.
- Evitar lógica duplicada y variables globales innecesarias (la única excepción es `window.game`, que solo existe en desarrollo para depurar).
- No agregar dependencias externas sin justificar su necesidad.
- Priorizar soluciones comprensibles y respetar la arquitectura existente.

### Convenciones del proyecto

- **Balanceo en `config.js`:** cualquier número de juego (vida, velocidad, daño, oleadas, explosiones, jefe) se define ahí, no dentro de la lógica.
- **Sin assets externos:** las texturas se dibujan por código en `BootScene` y el sonido se sintetiza en `Audio.js` / `Music.js`.
- **Objetos que aparecen seguido se reutilizan:** usar `physics.add.group` con `classType` o `ObjectPool`, nunca crear y destruir en cada frame.
- **Reinicio limpio:** el estado de una partida se inicializa en `create()` de la escena, no en el constructor, para que reiniciar arranque de cero.
- **Sonidos con tiempo mínimo entre repeticiones:** todo efecto nuevo define un `cooldown` en `SFX` para no saturar.
- **`localStorage` siempre con `try/catch`:** puede fallar en modo privado.
- **Textos y comentarios en español** (rioplatense en los textos del juego).
- **El GDD acompaña al código:** si cambia una mecánica, un control o un número importante, se actualiza `docs/GDD.md` y se vuelve a exportar `docs/GDD.pdf`.

## Flujo de trabajo

Antes de realizar cambios importantes:

1. Analizar el código existente.
2. Explicar brevemente el cambio propuesto.
3. Identificar las clases afectadas.
4. Implementar el cambio, verificar y refactorizar si es necesario.

Verificación de cada cambio:

1. `npm run build` debe compilar sin errores.
2. Probar el juego con `npm run dev`: menú, partida, mejoras, pausa, jefe, victoria, derrota y reinicio.
3. Revisar la consola del navegador.

Los commits los hace el autor; el agente no commitea ni pushea.

## Comandos

- Instalar dependencias: `npm install`
- Ejecutar: `npm run dev` (http://localhost:5173)
- Build: `npm run build`
- Probar el build: `npm run preview`

## Configuración utilizada

- `.claude/launch.json`: le indica a Claude Code cómo levantar el servidor de desarrollo para probar el juego en su navegador integrado.
- En desarrollo, el juego queda accesible como `window.game` desde la consola del navegador para inspeccionar el estado (por ejemplo, `window.game.scene.getScene('Game')`).
