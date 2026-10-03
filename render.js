/* Dibuja las tarjetas de los jugadores a partir de players.js.
   No hace falta editar este archivo: los datos están en players.js */

(function () {
  const contenedor = document.getElementById("roster");
  if (!contenedor || typeof JUGADORES === "undefined") return;

  const escapar = (texto) =>
    String(texto).replace(/[&<>"']/g, (c) => ({
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
          <img src="${escapar(j.foto)}" alt="Foto de ${escapar(j.nombre)}" loading="lazy" />
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

  contenedor.innerHTML = JUGADORES.map(tarjeta).join("");
})();
