# GDD — Leuco: Defensa Celular

> Game Design Document · Versión 0.4 · Noviembre 2026

---

## 1. Resumen

| Campo | Detalle |
|---|---|
| **Título** | Leuco: Defensa Celular |
| **Género** | Survivor de arena (estilo *Vampire Survivors*), acción top-down |
| **Plataforma** | Navegador web (escritorio) |
| **Tecnología** | JavaScript · Node.js · Vite · Phaser 3 |
| **Duración de partida** | Variable (~5 minutos) |
| **Público** | Casual, todo público |

**Concepto en una frase:** sos un glóbulo blanco dentro de un vaso sanguíneo: sobreviví a oleadas de virus y bacterias hasta tener todas las mejoras al máximo, y después derrotá al Supervirus en 1:30.

---

## 2. Pilares de diseño

1. **Fácil de entender:** solo te movés. El ataque es automático.
2. **Presión creciente:** cada vez aparecen más enemigos, más rápidos y más resistentes.
3. **Progreso dentro de la partida:** subís de nivel y elegís mejoras, así cada partida se siente un poco distinta.
4. **Estética orgánica sin assets externos:** todo se dibuja por código, con volumen, brillos e iluminación para que el mundo se sienta vivo y líquido.

---

## 3. Historia y ambientación

Una infección entró al torrente sanguíneo. Leuco, un glóbulo blanco recién activado, es la primera línea de defensa. Tiene que fortalecerse combatiendo la infección hasta alcanzar su máximo potencial y, entonces, enfrentar al **Supervirus**, el origen de la infección, antes de que se propague por todo el cuerpo.

- **Arena:** un tramo de vaso sanguíneo con plasma rojo oscuro que fluye. Los glóbulos rojos decorativos son arrastrados por la corriente y se apartan cuando Leuco pasa entre ellos.
- **Tono:** arcade, colorido y con humor liviano.

---

## 4. Mecánicas

### 4.1 Mecánica principal

**Moverse, sobrevivir y fortalecerse.** El jugador controla el desplazamiento de Leuco y el disparo de anticuerpos es automático: cada cierto tiempo sale un proyectil hacia el enemigo más cercano.

### 4.2 Controles

| Acción | Tecla |
|---|---|
| Moverse | `WASD` o flechas |
| Elegir mejora | `1` `2` `3` o click |
| Pausa | `ESC` o `P` |
| Empezar / Reiniciar | `ENTER` o `R` (en las pantallas de fin) |

### 4.3 Jugador (Leuco)

| Stat | Valor inicial |
|---|---|
| Vida | 100 |
| Velocidad | 200 px/s |
| Cadencia de disparo | 1 anticuerpo cada 600 ms |
| Daño por anticuerpo | 1 |
| Velocidad del proyectil | 450 px/s |
| Invulnerabilidad tras un golpe | 500 ms (parpadea) |

### 4.4 Enemigos

Los enemigos aparecen fuera de la pantalla, en un anillo alrededor del jugador, y lo persiguen en línea recta.

| Enemigo | Forma | Vida | Velocidad | Daño por contacto | Aparece desde | XP |
|---|---|---|---|---|---|---|
| **Virus** | Círculo verde con espinas | 1 | 80 | 10 | 0:00 | 1 |
| **Bacteria** | Cápsula amarilla, se mueve rápido | 2 | 140 | 8 | 0:45 | 2 |
| **Parásito** | Óvalo violeta grande | 6 | 50 | 20 | 1:30 | 5 |

El **Supervirus** es el jefe final y se describe en la sección 4.9.

### 4.5 Experiencia y niveles

- Cada enemigo eliminado suelta una **proteína** (orbe celeste) que vale XP.
- Las proteínas se atraen hacia el jugador cuando está cerca (radio de imán: 80 px).
- Al llenar la barra de XP, el juego **se pausa** y se ofrecen **3 mejoras al azar** para elegir una.
- XP necesaria por nivel: `4 + nivel × 2` (6, 8, 10…).
- Hay 25 niveles de mejora en total. Si subís de nivel con todas las mejoras al máximo, en lugar de elegir te curás 20 de vida.

### 4.6 Mejoras

| Mejora | Efecto | Máx. |
|---|---|---|
| **Anticuerpos rápidos** | −15 % de tiempo entre disparos | 5 |
| **Anticuerpos potentes** | +1 de daño | 5 |
| **Disparo múltiple** | +1 proyectil por disparo (en abanico) | 4 |
| **Membrana reforzada** | +25 de vida máxima y cura 25 | 4 |
| **Flagelo** | +15 % de velocidad de movimiento | 4 |
| **Quimiotaxis** | +50 % de radio del imán de XP | 3 |

### 4.7 Ítems de curación

- **Plaqueta** (cruz blanca): 3 % de probabilidad de caer al eliminar un enemigo. Cura 20 de vida.

### 4.8 Curva de dificultad

| Tiempo | Enemigos que aparecen | Intervalo de aparición |
|---|---|---|
| 0:00 – 0:45 | Virus | 1 cada 900 ms |
| 0:45 – 1:30 | Virus, Bacteria | 1 cada 600 ms |
| 1:30 – 2:30 | Virus, Bacteria, Parásito | 1 cada 400 ms |
| 2:30 en adelante | Virus, Bacteria, Parásito | 1 cada 300 ms |

No hay límite de tiempo en esta etapa: la última oleada sigue hasta que el jugador completa las mejoras. Los valores son iniciales y se ajustan durante el balanceo.

### 4.9 Fase final: el Supervirus

Cuando el jugador tiene **las 25 mejoras al máximo**, empieza la fase final:

- Desaparecen los enemigos comunes y dejan de aparecer oleadas.
- Aparece el **Supervirus** cerca del jugador y arranca una **cuenta regresiva de 1:30**.
- Hay que derrotarlo antes de que el contador llegue a 0.

| Stat | Valor |
|---|---|
| Vida | 4000 |
| Velocidad | 90 px/s (persigue al jugador) |
| Daño por contacto | 40 |
| Ráfaga de esporas | 12 esporas en círculo cada 2,2 s (15 de daño cada una) |
| Invocación | 4 virus a su alrededor cada 5 s |

---

## 5. Progreso, victoria y derrota

- **Puntuación:** suma de puntos por enemigo eliminado (Virus 10, Bacteria 20, Parásito 50, Supervirus 2000) más un bonus de 1000 si ganás.
- **Récord:** el mejor puntaje se guarda en `localStorage`.
- **Progreso:** el avance se mide en mejoras obtenidas (de 0 a 25).
- **Victoria:** derrotar al Supervirus antes de que termine la cuenta regresiva → “¡Infección contenida!”.
- **Derrota:**
  - La vida llega a 0 en cualquier momento → “El cuerpo fue infectado”.
  - Se termina el 1:30 sin derrotar al Supervirus → “El Supervirus se propagó”.
- **Reinicio:** desde la pantalla final, con `R`/`ENTER` o el botón **Reintentar**. Se puede volver al menú.

---

## 6. Interfaz (HUD)

- **Arriba al centro:** progreso de mejoras (por ejemplo, “Mejoras: 12 / 25”). En la fase final se reemplaza por la cuenta regresiva (1:30 → 0:00) y la barra de vida del Supervirus.
- **Arriba a la izquierda:** barra de vida y nivel.
- **Arriba a la derecha:** puntaje.
- **Abajo:** barra de XP a lo ancho de la pantalla.

---

## 7. Arte y sonido

### Paleta

| Elemento | Color |
|---|---|
| Fondo (plasma) | `#3a0a12` |
| Glóbulos rojos decorativos | `#8b1a2b` |
| Leuco (jugador) | `#f5f5f5` con núcleo `#c9b6ff` |
| Anticuerpos | `#7fe7ff` |
| Virus | `#5fd35f` |
| Bacteria | `#f2d14b` |
| Parásito | `#a35fd3` |
| Proteína (XP) | `#4fc3f7` |
| Esporas del Supervirus | `#b8f06b` |

### Efectos visuales

- **Volumen:** las células y los enemigos se dibujan como esferas iluminadas desde arriba a la izquierda, con degradados, sombra y un reflejo húmedo.
- **Brillos:** los anticuerpos, las proteínas y las esporas tienen un halo y se suman al fondo como luces. Leuco tiene un resplandor violeta que late suavemente.
- **Iluminación:** una luz suave acompaña a Leuco. La cámara aplica *bloom* (las zonas claras irradian brillo) y una viñeta que oscurece los bordes.
- **Profundidad:** el fondo tiene dos capas de glóbulos rojos con *parallax*: la lejana es más chica y transparente, y se mueve más lento con la cámara.
- **Torrente líquido:** el plasma y los glóbulos fluyen constantemente. Al moverse, Leuco deja una estela de plasma y burbujas, y aparta los glóbulos cercanos.
- **Impacto:** los enemigos estallan en partículas de su color al morir, y la cámara tiembla levemente cuando Leuco recibe daño.

### Sonido

Todo el audio se genera por código con la Web Audio API, sin archivos externos.

**Música**

| Tema | Dónde suena | Estilo |
|---|---|---|
| Menú | Menú principal | Tranquilo y misterioso, 80 BPM: acordes suaves y arpegio |
| Combate | Durante la partida | Enérgico, 140 BPM: batería, bajo y melodía rápida |
| Jefe | Fase final | El tema de combate más cargado y rápido, 165 BPM |

**Efectos**

| Evento | Sonido |
|---|---|
| Disparo de anticuerpos | Zap corto y agudo |
| Impacto en un enemigo | Golpe breve |
| Muerte de un enemigo | Estallido con caída de tono |
| Daño recibido | Golpe grave con ruido |
| Recoger proteína o plaqueta | Blip agudo |
| Subida de nivel | Arpegio ascendente |
| Botones y selección | Click suave |
| Aparición del Supervirus | Rugido grave |
| Victoria / Derrota | Fanfarria ascendente / melodía descendente |

---

## 8. Plan de desarrollo

1. **Setup:** proyecto con Vite y Phaser, escenas vacías y navegación entre ellas.
2. **Núcleo:** jugador, movimiento, cámara y arena.
3. **Combate:** enemigos, disparo automático, colisiones y vida.
4. **Loop completo:** victoria, derrota, puntaje y reinicio. *(Acá ya se cumple la consigna.)*
5. **Progresión:** XP, niveles y mejoras.
6. **Contenido:** Parásito, curva de dificultad y fase final contra el Supervirus.
7. **Pulido:** récord, pausa y balanceo.
