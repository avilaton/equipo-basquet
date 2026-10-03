# Club Universitario · Minibásquet · Categoría Mini · Donato

Página estática con el plantel de **minibásquet (categoría Mini)** del **Club Universitario** (equipo de Donato): nombres, fotos y datos de cada jugador. Colores del club: **rojo y blanco**.

> ⚠ **Datos e imágenes de ejemplo.** Reemplazá luego los nombres, datos y fotos por los reales.

El escudo del encabezado es el del Club Universitario de Córdoba ([Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Universitario_cba_logo.svg)).

## Ver la página

Publicada con GitHub Pages. También podés abrir `index.html` directamente en el navegador.

## Cómo cargar / editar los jugadores

Toda la información de los jugadores está en un solo archivo fácil de editar:
**[`players.js`](players.js)**. No hace falta tocar el HTML.

1. Abrí [`players.js`](players.js). Vas a ver un bloque por jugador:

   ```js
   {
     nombre: "Donato Ávila",
     numero: "7",
     posicion: "Alero",
     edad: "9 años",
     altura: "1,38 m",
     mano: "Izquierda",
     ingreso: "2024",
     foto: "img/jugador-2.svg",
     bio: "Gran energía en defensa...",
   },
   ```

2. **Editar un jugador:** cambiá el texto entre comillas de cada campo.
3. **Agregar un jugador:** copiá un bloque `{ ... }` completo (incluida la coma final) y pegalo dentro de los corchetes `[ ]`.
4. **Quitar un jugador:** borrá su bloque `{ ... }`.
5. **Campo vacío:** si no querés mostrar un dato, dejalo con comillas vacías `""` y no aparecerá.

Las tarjetas se dibujan solas a partir de ese archivo.

## Cómo reemplazar las fotos

1. Colocá las imágenes reales en la carpeta [`img/`](img/) (`.jpg`, `.png` o `.svg`).
2. En [`players.js`](players.js), apuntá el campo `foto` a tu imagen, por ejemplo `foto: "img/donato.jpg"`.

## Estructura

```
equipo-basquet/
├── index.html      # Estructura de la página (no hace falta editarlo)
├── players.js      # 👉 DATOS DE LOS JUGADORES (editá este archivo)
├── render.js       # Dibuja las tarjetas desde players.js
├── styles.css      # Estilos (paleta rojo/blanco del club)
└── img/            # Logo del club y fotos de los jugadores (ejemplos en SVG)
```
