/* Dibuja las tarjetas de los jugadores.
   - Si en config.js hay un SHEET_CSV_URL, baja los datos de la Google Sheet.
   - Si no hay link o si falla, usa los datos de ejemplo de players.js.
   No hace falta editar este archivo. */

(function () {
  const contenedor = document.getElementById("roster");
  if (!contenedor) return;

  const escapar = (texto) =>
    String(texto == null ? "" : texto).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));

  const dato = (etiqueta, valor) => {
    if (!valor) return "";
    return `<div><dt>${escapar(etiqueta)}</dt><dd>${escapar(valor)}</dd></div>`;
  };

  const tarjeta = (j) => {
    const foto = j.foto ? escapar(j.foto) : "img/placeholder.svg";
    const numero = j.numero
      ? `<span class="card__number" aria-label="Número de camiseta">#${escapar(j.numero)}</span>`
      : "";
    const posicion = j.posicion
      ? `<p class="card__position">${escapar(j.posicion)}</p>`
      : "";
    const bio = j.bio ? `<p class="card__bio">${escapar(j.bio)}</p>` : "";
    const datos =
      dato("Edad", j.edad) +
      dato("Altura", j.altura) +
      dato("Mano hábil", j.mano) +
      dato("Ingreso", j.ingreso);

    return `
      <article class="card">
        <div class="card__photo">
          <img src="${foto}" alt="Foto de ${escapar(j.nombre)}" loading="lazy" />
          ${numero}
        </div>
        <div class="card__body">
          <h2 class="card__name">${escapar(j.nombre)}</h2>
          ${posicion}
          <dl class="card__data">${datos}</dl>
          ${bio}
        </div>
      </article>`;
  };

  const pintar = (jugadores) => {
    contenedor.innerHTML = jugadores.map(tarjeta).join("");
  };

  const mensaje = (texto) => {
    contenedor.innerHTML = `<p class="roster__msg">${escapar(texto)}</p>`;
  };

  /* --- Parser de CSV (soporta comillas, comas y saltos de línea dentro de celdas) --- */
  const parseCSV = (texto) => {
    const filas = [];
    let fila = [];
    let campo = "";
    let enComillas = false;
    for (let i = 0; i < texto.length; i++) {
      const c = texto[i];
      if (enComillas) {
        if (c === '"') {
          if (texto[i + 1] === '"') {
            campo += '"';
            i++;
          } else {
            enComillas = false;
          }
        } else {
          campo += c;
        }
      } else if (c === '"') {
        enComillas = true;
      } else if (c === ",") {
        fila.push(campo);
        campo = "";
      } else if (c === "\n") {
        fila.push(campo);
        filas.push(fila);
        fila = [];
        campo = "";
      } else if (c !== "\r") {
        campo += c;
      }
    }
    if (campo !== "" || fila.length) {
      fila.push(campo);
      filas.push(fila);
    }
    return filas;
  };

  const csvAJugadores = (texto) => {
    texto = texto.replace(/^\uFEFF/, "");
    const filas = parseCSV(texto).filter((f) => f.some((v) => v.trim() !== ""));
    if (filas.length < 2) return [];
    const cabeceras = filas[0].map((h) => h.trim().toLowerCase());
    return filas.slice(1).map((fila) => {
      const obj = {};
      cabeceras.forEach((h, idx) => {
        obj[h] = (fila[idx] || "").trim();
      });
      return obj;
    });
  };

  const usarRespaldo = (motivo) => {
    if (typeof JUGADORES !== "undefined" && JUGADORES.length) {
      pintar(JUGADORES);
    } else {
      mensaje("No se pudieron cargar los jugadores.");
    }
    if (motivo) console.warn("Usando datos de respaldo:", motivo);
  };

  /* --- Carga principal --- */
  const haySheet =
    typeof SHEET_CSV_URL !== "undefined" && SHEET_CSV_URL.trim() !== "";

  if (!haySheet) {
    usarRespaldo("no hay SHEET_CSV_URL configurado");
    return;
  }

  mensaje("Cargando jugadores…");
  const url =
    SHEET_CSV_URL +
    (SHEET_CSV_URL.indexOf("?") === -1 ? "?" : "&") +
    "_cb=" +
    Date.now();

  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    })
    .then((texto) => {
      const jugadores = csvAJugadores(texto).filter((j) => j.nombre);
      if (!jugadores.length) {
        usarRespaldo("la planilla no devolvió jugadores");
        return;
      }
      pintar(jugadores);
    })
    .catch((err) => usarRespaldo(err.message));
})();
