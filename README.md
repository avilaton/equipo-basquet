# Basket Universitario Mini

Página estática del equipo de **minibásquet (categoría Mini)** del **Club Universitario de Córdoba**, con tres pestañas:

- **Plantel:** tarjetas con foto, número, posición, altura y edad; regla de alturas. Al tocar un jugador se abre su ficha con un jugadorcito animado (tocándolo protege la pelota, tira al aro o hace una bandeja).
- **Partidos:** próximo partido, fixture y resultados (`partidos.js`).
- **Asistencia:** porcentaje de cada jugador en entrenamientos y partidos (`asistencia.js` y `partidos.js`).

Colores del club: **rojo y blanco**.

> ⚠ **Datos e imágenes de ejemplo.** Reemplazá luego los nombres, datos y fotos por los reales.

El escudo del encabezado es el del Club Universitario de Córdoba ([Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Universitario_cba_logo.svg)).

## Ver la página

Publicada con GitHub Pages. También podés abrir `index.html` directamente en el navegador.

## Cómo cargar / editar los jugadores

Hay dos formas de cargar los datos. La página usa la **Google Sheet** si está
configurada; si no, usa el archivo `players.js` como respaldo.

### Opción A — Google Sheet (recomendada, editás desde el celu)

1. Creá una planilla en Google Sheets con estas columnas en la **primera fila**
   (el orden no importa, los nombres sí):

   | nombre | numero | posicion | edad | altura | mano | ingreso | foto | bio |
   |--------|--------|----------|------|--------|------|---------|------|-----|

   - Una fila por jugador.
   - `foto`: nombre del archivo en `img/` (ej: `img/donato.jpg`) o un link
     público a una imagen. Si lo dejás vacío, se muestra una silueta gris.

2. En la planilla: **Archivo → Compartir → Publicar en la web →** elegí la hoja
   y el formato **CSV → Publicar**. Copiá el link.
3. Pegá ese link en [`config.js`](config.js), entre las comillas de
   `const SHEET_CSV_URL = "";`.
4. Listo: la página baja los datos de la planilla al abrirse. Para cambiar datos,
   editás la planilla (Google tarda ~5 min en reflejarlo).

> 🔒 **Privacidad:** "Publicar en la web" hace ese CSV visible para cualquiera
> con el link. Son datos de menores, así que compartí solo lo necesario.

### Opción B — archivo players.js (sin planilla)

Dejá `SHEET_CSV_URL` vacío en [`config.js`](config.js) y editá
[`players.js`](players.js). Vas a ver un bloque por jugador:

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

- **Editar:** cambiá el texto entre comillas. Escribí cada valor en **una sola
  línea** (si no, rompe el archivo).
- **Agregar jugador:** copiá un bloque `{ ... }` completo (con la coma) y pegalo
  dentro de los corchetes `[ ]`.
- **Quitar jugador:** borrá su bloque `{ ... }`.
- **Campo vacío:** dejalo con comillas vacías `""` y no aparecerá.

> 💡 **Si editaste y no ves el cambio enseguida:** es la caché del navegador.
> GitHub Pages guarda los archivos ~10 minutos. Hacé una recarga forzada
> (`Cmd/Ctrl + Shift + R`), abrilo en una ventana de incógnito, o esperá unos
> minutos. El cambio ya está publicado igual.

## Cómo cargar partidos y asistencia

- **Partidos:** editá [`partidos.js`](partidos.js). Hay un bloque de ejemplo comentado: copialo, sacale las `//` y completalo. Los tantos (`nuestros`, `suyos`) quedan vacíos hasta que se juegue; en `jugaron` van los números de camiseta separados por coma.
- **Entrenamientos:** editá [`asistencia.js`](asistencia.js), un renglón por entrenamiento con la fecha y los números de camiseta de los presentes.

La asistencia se cuenta por número de camiseta, así que cada jugador tiene que tener su número cargado.

## Cómo reemplazar las fotos

1. Colocá las imágenes reales en la carpeta [`img/`](img/) (`.jpg`, `.png` o `.svg`).
2. En [`players.js`](players.js), apuntá el campo `foto` a tu imagen, por ejemplo `foto: "img/donato.jpg"`.

## Estructura

```
equipo-basquet/
├── index.html      # Estructura de la página (no hace falta editarlo)
├── config.js       # 👉 Link de la Google Sheet (opción A)
├── players.js      # 👉 Datos de respaldo si no usás planilla (opción B)
├── partidos.js     # 👉 Fixture, resultados y quiénes jugaron
├── asistencia.js   # 👉 Asistencia a entrenamientos
├── render.js       # Baja los datos y dibuja la página
├── styles.css      # Estilos (paleta rojo/blanco del club)
└── img/            # Logo del club y fotos de los jugadores
```
