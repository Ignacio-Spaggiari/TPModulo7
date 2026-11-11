# Leuco: Defensa Celular

Survivor de arena al estilo *Vampire Survivors*. Sos **Leuco**, un glóbulo blanco dentro de un vaso sanguíneo: sobreviví a oleadas de virus, bacterias y parásitos, juntá proteínas para subir de nivel hasta tener todas las mejoras al máximo y, entonces, derrotá al **Supervirus** antes de que se termine el tiempo.

Todo el arte y el sonido se generan por código: no hay imágenes ni archivos de audio.

📄 **GDD:** [docs/GDD.pdf](docs/GDD.pdf)

## Integrante

- Ignacio Spaggiari

## Tecnologías

- JavaScript
- Node.js
- Vite 6
- Phaser 3.90 (Arcade Physics)
- Web Audio API (efectos y música sintetizados)

## Instalación

```bash
npm install
```

## Ejecutar

```bash
npm run dev
```

Después abrí http://localhost:5173 en el navegador.

## Build

```bash
npm run build
```

El resultado queda en `dist/`. Para probar el build: `npm run preview`.

## Gameplay

Leuco se mueve libremente por la arena y dispara anticuerpos automáticamente al enemigo más cercano. Los enemigos aparecen fuera de la pantalla y lo persiguen; cada vez aparecen más, más rápidos y más resistentes. Al morir sueltan proteínas (XP) y, a veces, plaquetas que curan.

### Objetivo

Conseguir las **25 mejoras** (todas al máximo) y, cuando aparece el Supervirus, **derrotarlo en menos de 1:30**.

- **Victoria:** derrotar al Supervirus a tiempo.
- **Derrota:** quedarse sin vida, o que se termine el 1:30 con el Supervirus vivo.

### Mecánicas principales

- **Movimiento y disparo automático:** el jugador solo esquiva y se posiciona; Leuco apunta solo.
- **Progresión por niveles:** al llenar la barra de XP se elige 1 de 3 mejoras al azar (cadencia, daño, disparo múltiple, vida, velocidad e imán de XP).
- **Oleadas crecientes:** virus (básico), bacterias (rápidas) y parásitos (resistentes) aparecen cada vez más seguido.
- **Jefe final:** el Supervirus lanza ráfagas de esporas e invoca virus, con una cuenta regresiva de 1:30.
- **Puntaje y récord:** cada enemigo da puntos y el mejor puntaje se guarda en el navegador.

## Controles

| Acción | Control |
|---|---|
| Mover | `WASD` o flechas |
| Disparar | Automático |
| Elegir mejora | `1` `2` `3` o click |
| Pausa | `ESC` o `P` |
| Empezar / Reintentar | `ENTER` (menú) / `R` o `ENTER` (pantalla final) |
| Volver al menú | `Q` (pausa y pantalla final) |
| Silenciar / activar sonido | `M` o el ícono de parlante |

## Arquitectura

```
src/
├── main.js            # Configuración de Phaser y lista de escenas
├── config.js          # Constantes de balanceo (jugador, enemigos, oleadas, jefe, colores)
├── scenes/
│   ├── BootScene.js       # Genera todas las texturas por código e inicia el audio
│   ├── MenuScene.js       # Menú principal
│   ├── GameScene.js       # Partida: coordina jugador, enemigos, combate y fases
│   ├── UIScene.js         # HUD superpuesto (vida, XP, mejoras, jefe, alerta de vida baja)
│   ├── LevelUpScene.js    # Elección de mejoras
│   ├── PauseScene.js      # Pausa con el estado de las mejoras
│   ├── GameOverScene.js   # Victoria / derrota, puntaje y récord
│   └── SoundScene.js      # Ícono de silencio, siempre encima de todo
├── entities/
│   ├── Player.js          # Leuco: movimiento, vida, invulnerabilidad
│   ├── Enemy.js           # Enemigo reutilizable (virus, bacteria, parásito, Supervirus)
│   ├── Projectile.js      # Anticuerpos del jugador y esporas del jefe
│   └── Pickup.js          # Proteínas (XP) y plaquetas (curación)
├── systems/
│   ├── WaveManager.js     # Qué enemigos aparecen, cuándo y dónde
│   ├── Upgrades.js        # Definición de mejoras y elección al azar
│   ├── Effects.js         # Explosiones, números de daño, pulso de mejora
│   ├── Background.js      # Torrente sanguíneo con parallax, bloom y viñeta
│   ├── Audio.js           # Efectos de sonido, música y silencio
│   ├── Music.js           # Temas musicales compuestos por código
│   └── HighScore.js       # Récord en localStorage
├── patterns/
│   └── ObjectPool.js      # Pool genérico de objetos reutilizables
├── ui/
│   └── Button.js          # Botón reutilizable
└── assets/                # Vacía: todo se genera por código
```

Cómo se relacionan las piezas durante una partida:

```
GameScene
 ├── Player
 ├── WaveManager
 │    └── Enemy             (pool: Physics Group)
 ├── Projectile             (pool: Physics Group, anticuerpos y esporas)
 ├── Pickup                 (pool: Physics Group)
 ├── Upgrades               (Strategy: cada mejora define su apply)
 ├── Effects
 │    └── ObjectPool        (números de daño)
 └── BloodStream            (fondo)

UIScene ──lee el estado──▶ GameScene
LevelUpScene / PauseScene ──pausan y reanudan──▶ GameScene
audio (Singleton) ◀── todas las escenas
```

`GameScene` coordina, pero delega: las oleadas están en `WaveManager`, los efectos visuales en `Effects`, el fondo en `BloodStream`, las mejoras en `Upgrades` y el HUD en una escena aparte (`UIScene`). Todos los números de balanceo están en `config.js`.

## Patrones utilizados

- **Object Pool** (`src/patterns/ObjectPool.js` y Physics Groups de Phaser): enemigos, proyectiles, ítems y números de daño se crean una vez y se reutilizan, en lugar de crear y destruir cientos de objetos por minuto.
- **Singleton** (`src/systems/Audio.js`): existe una única instancia `audio` que maneja todo el sonido; cualquier escena la importa y usa el mismo estado (por ejemplo, el silencio).
- **Strategy** (`src/systems/Upgrades.js`): cada mejora es un objeto con su propia función `apply(player)`. El juego aplica cualquier mejora de la misma forma sin saber qué hace cada una.
- **Configuración por datos** (`src/config.js`): enemigos, oleadas, explosiones y jefe se describen como datos, así se balancea sin tocar la lógica.

## Agente utilizado: Claude Code

La consigna pedía OpenCode, pero **este trabajo se hizo con Claude Code**, el agente de programación de Anthropic (app de escritorio, modelo Claude Opus 5.5). Cumple el mismo rol: lee el proyecto, edita archivos, ejecuta comandos en la terminal y prueba el juego en un navegador.

Herramientas del agente que se usaron:

- **Edición de archivos y terminal:** crear el proyecto con Vite, instalar dependencias, escribir el código y compilar (`npm run build`) después de cada cambio.
- **Navegador integrado:** levantar `npm run dev`, jugar y comprobar cada función (escenas, mejoras, jefe, sonido, silencio) y revisar errores de consola.
- **Chrome automatizado (puppeteer):** sacar capturas en alta resolución para revisar los efectos visuales.

La configuración usada para levantar el servidor de prueba desde el agente está en `.claude/launch.json`, y el contexto y las reglas para el agente están en [AGENTS.md](AGENTS.md).

### Principales instrucciones (prompts)

1. *"Tirame ideas que cumplan con la consigna"* → elección de un survivor de arena y luego de la temática del glóbulo blanco.
2. *"Desarrollemos el GDD"* → GDD completo; después se simplificó (sin flujo de pantallas, alcance ni arquitectura) y se exportó a PDF.
3. *"Empecemos con el desarrollo"* → proyecto Vite + Phaser con todas las escenas, combate, XP, mejoras, HUD, pausa, victoria, derrota y reinicio.
4. *"Quitemos el contador: que se juegue hasta maximizar al personaje y ahí aparezca un boss fuerte con 1:30 para derrotarlo"* → rediseño de la condición de victoria.
5. *"Necesito sonidos de disparos, muerte, daño, botones, música de menú y otra más polenta para el combate"* → audio sintetizado y tres temas musicales.
6. *"Dale iluminación, brillos suaves, que se vea menos 2D, y un efecto de líquido que deje un rastro"* → texturas con volumen, bloom, parallax y estela.
7. *"Explosiones según el tamaño del enemigo, sin que el sonido sature, y feedback al tomar una mejora"* → sistema de explosiones, compresor de audio y pulso de mejora.
8. *"Botón de silencio, números de daño, alerta de vida baja y mejoras en la pausa"* → últimos agregados de interfaz.

En cada cambio importante, el GDD se actualizó junto con el código.

## Problemas encontrados y soluciones

| Problema | Solución |
|---|---|
| El repositorio de GitHub se clonó en una subcarpeta y el juego quedó afuera, así que git no veía cambios para commitear. | Se movió todo el proyecto dentro de la carpeta del repositorio. |
| Con un contador fijo de 3 minutos la partida se sentía corta y sin meta clara. | Se rediseñó: la partida dura hasta completar las 25 mejoras y termina con un jefe con 1:30. Se bajó la XP por nivel (de `5 + nivel×5` a `4 + nivel×2`) para que llegar al jefe lleve unos 5 minutos. |
| No había assets y no se quería depender de imágenes o sonidos con licencia. | Texturas dibujadas por código con canvas (degradados, halos, reflejos) y audio sintetizado con Web Audio API. |
| Los navegadores bloquean el audio hasta que el usuario interactúa. | Se usa el contexto de audio de Phaser, que se desbloquea con el primer click o tecla; la música queda en espera hasta ese momento. |
| Con muchas explosiones juntas el sonido saturaba. | Tiempo mínimo entre repeticiones de cada efecto, explosiones grandes más graves (no más fuertes) y un compresor en la salida de audio. |
| Cientos de enemigos, proyectiles y partículas podían trabar el juego. | Object Pool: los objetos se reutilizan en lugar de crearse y destruirse. |
| La pantalla de victoria aparecía antes de que terminara la explosión del jefe. | El fin de partida acepta una demora y espera a que termine la cadena de explosiones. |
| La tecla `M` se usaba para volver al menú y también se quería para silenciar. | El menú pasó a `Q` (igual que en la pausa) y `M` quedó para el sonido. |
| Durante el desarrollo aparecían errores en consola por guardados a medio terminar (recarga en caliente de Vite). | Se verificó cada cambio con `npm run build` y recargando el juego completo. |
