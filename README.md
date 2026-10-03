# Club Universitario · Básquet Infantil · Donato

Página estática con el plantel del equipo de básquet infantil del **Club Universitario** (equipo de Donato): nombres, fotos y datos de cada jugador. Colores del club: **rojo y blanco**.

> ⚠ **Datos e imágenes de ejemplo.** Reemplazá luego los nombres, datos y fotos por los reales.

El escudo del encabezado es el del Club Universitario de Córdoba ([Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Universitario_cba_logo.svg)).

## Ver la página

Publicada con GitHub Pages. También podés abrir `index.html` directamente en el navegador.

## Cómo reemplazar los datos

1. **Fotos:** colocá las imágenes reales en la carpeta [`img/`](img/) y actualizá los `src` en [`index.html`](index.html).
   - Podés reemplazar los archivos `jugador-1.svg`, `jugador-2.svg`, `jugador-3.svg` por fotos `.jpg`/`.png` (recordá cambiar también la extensión en el HTML).
2. **Datos:** editá cada `<article class="card">` en [`index.html`](index.html) con el nombre, posición, número, edad, altura, etc.
3. **Más jugadores:** copiá un bloque `<article class="card">` completo y pegalo para sumar jugadores.

## Estructura

```
equipo-basquet/
├── index.html      # Página principal con las tarjetas de los jugadores
├── styles.css      # Estilos (paleta rojo/blanco del club)
└── img/            # Logo del club y fotos de los jugadores (ejemplos en SVG)
```
