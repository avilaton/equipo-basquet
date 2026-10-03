/* ============================================================
   CONFIGURACIÓN DE LA GOOGLE SHEET
   ------------------------------------------------------------
   Pegá acá, entre las comillas, el link CSV de tu planilla.

   Cómo obtenerlo:
   1. Abrí tu Google Sheet.
   2. Menú: Archivo → Compartir → Publicar en la web.
   3. En "Enlace", elegí la hoja y el formato "Valores separados
      por comas (.csv)".
   4. Clic en "Publicar" y copiá el link que te da.
   5. Pegalo abajo entre las comillas.

   La planilla debe tener estas columnas en la PRIMERA fila
   (el orden no importa, los nombres sí):

     nombre | numero | posicion | edad | altura | mano | ingreso | foto | bio

   - "foto": nombre del archivo en la carpeta img/ (ej: img/donato.jpg)
     o un link público a una imagen. Si lo dejás vacío, se usa una
     silueta gris.

   Si dejás esto vacío (""), la página usa los datos de ejemplo de
   players.js como respaldo.
   ============================================================ */

const SHEET_CSV_URL = "";
