/* Dibuja la página.
   - Jugadores: si config.js tiene SHEET_CSV_URL, los baja de la Google Sheet;
     si no hay link o falla, usa players.js.
   - Partidos: partidos.js. Asistencia a entrenamientos: asistencia.js.
   No hace falta editar este archivo. */

(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  $("season").textContent = now.getFullYear();

  /* ---------- datos ---------- */
  const listaNumeros = (s) => String(s || "").split(/[,;\s]+/).map((x) => x.trim().replace(/^#/, "")).filter(Boolean);
  const aCm = (s) => {
    const n = parseFloat(String(s || "").replace(",", ".").replace(/[^\d.]/g, ""));
    if (!n) return null;
    return Math.round(n < 3 ? n * 100 : n);
  };
  const aEdad = (s) => { const n = parseInt(String(s || ""), 10); return Number.isFinite(n) ? n : null; };
  const aNum = (s) => { const t = String(s ?? "").trim(); if (t === "") return null; const n = Number(t); return Number.isFinite(n) ? n : null; };

  const normalizarJugador = (j) => ({
    nombre: (j.nombre || "").trim(),
    numero: String(j.numero ?? "").trim().replace(/^#/, ""),
    posicion: (j.posicion || "").trim(),
    edad: aEdad(j.edad),
    alturaCm: aCm(j.altura),
    mano: (j.mano || "").trim(),
    ingreso: (j.ingreso || "").trim(),
    foto: (j.foto || "").trim(),
    bio: (j.bio || "").trim(),
  });

  const matches = (typeof PARTIDOS !== "undefined" ? PARTIDOS : []).filter((x) => x && x.fecha).map((x) => ({
    fecha: String(x.fecha).trim(), hora: (x.hora || "").trim(), rival: (x.rival || "").trim() || "Rival a confirmar",
    visitante: /^v/i.test(x.condicion || ""), cancha: (x.cancha || "").trim(),
    us: aNum(x.nuestros), them: aNum(x.suyos), present: listaNumeros(x.jugaron), notas: (x.notas || "").trim(),
  }));
  const practices = (typeof ENTRENAMIENTOS !== "undefined" ? ENTRENAMIENTOS : []).filter((x) => x && x.fecha).map((x) => ({
    fecha: String(x.fecha).trim(), present: listaNumeros(x.presentes), notas: (x.notas || "").trim(),
  }));
  let players = [];

  /* ---------- utilidades ---------- */
  const initials = (n) => (n || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const m = (cm) => (cm ? (cm / 100).toFixed(2).replace(".", ",") + " m" : "–");
  const fmtDate = (d, opts) => (d ? new Date(d + "T12:00").toLocaleDateString("es-AR", opts) : "");
  const shortDate = (d) => fmtDate(d, { day: "numeric", month: "short" });
  const longDate = (d) => fmtDate(d, { weekday: "long", day: "numeric", month: "long" });
  const numVal = (p) => (p.numero === "" || isNaN(+p.numero) ? 999 : +p.numero);
  const byNumber = (a, b) => numVal(a) - numVal(b) || a.nombre.localeCompare(b.nombre, "es");
  const photoHTML = (p, alt) => (p.foto
    ? `<img src="${esc(p.foto)}" alt="${alt ? "Foto de " + esc(p.nombre) : ""}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'initials',textContent:'${esc(initials(p.nombre))}'}))">`
    : `<div class="initials">${esc(initials(p.nombre))}</div>`);

  const attEvents = () => [...practices.map((p) => ({ ...p, kind: "E" })), ...matches.filter((x) => x.present.length).map((x) => ({ ...x, kind: "P" }))];
  const attFor = (p) => {
    const ev = attEvents(), n = ev.length;
    if (!p.numero) return { yes: 0, n: 0, pct: null };
    const yes = ev.filter((e) => e.present.includes(p.numero)).length;
    return { yes, n, pct: n ? Math.round((yes / n) * 100) : null };
  };

  /* ---------- pestañas ---------- */
  const VIEWS = ["plantel", "partidos", "asistencia"];
  const route = () => {
    const v = VIEWS.includes(location.hash.slice(1)) ? location.hash.slice(1) : "plantel";
    VIEWS.forEach((x) => { $("v-" + x).hidden = x !== v; });
    document.querySelectorAll("nav.tabs a").forEach((a) => { if (a.dataset.view === v) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
  };
  addEventListener("hashchange", route);

  /* ---------- plantel ---------- */
  let filter = "ALL", sortBy = "number";
  try { sortBy = localStorage.getItem("plantel.sort") || "number"; } catch (e) {}
  $("sort").value = sortBy;
  $("chips").addEventListener("click", (e) => { const b = e.target.closest("[data-f]"); if (b) { filter = b.dataset.f; renderPlantel(); } });
  $("sort").addEventListener("change", (e) => { sortBy = e.target.value; try { localStorage.setItem("plantel.sort", sortBy); } catch (x) {} renderPlantel(); });

  function renderPlantel() {
    const positions = [...new Set(players.map((p) => p.posicion).filter(Boolean))];
    $("chips").innerHTML = [["ALL", "Todos", players.length], ...positions.map((x) => [x, x, players.filter((p) => p.posicion === x).length])]
      .map(([c, n, k]) => `<button class="chip" data-f="${esc(c)}" aria-pressed="${filter === c}">${esc(n)}${k ? " · " + k : ""}</button>`).join("");

    $("sCount").textContent = players.length;
    const h = players.filter((p) => p.alturaCm);
    if (h.length) {
      $("sAvg").textContent = m(h.reduce((s, p) => s + p.alturaCm, 0) / h.length);
      const top = h.reduce((a, b) => (b.alturaCm > a.alturaCm ? b : a));
      $("sMax").textContent = m(top.alturaCm); $("sMaxName").textContent = top.nombre;
    }
    const ages = players.map((p) => p.edad).filter((a) => a != null);
    $("sAge").textContent = ages.length ? (ages.reduce((s, a) => s + a, 0) / ages.length).toFixed(1).replace(".", ",") : "–";

    const by = { number: byNumber, height: (a, b) => (b.alturaCm || 0) - (a.alturaCm || 0), name: (a, b) => a.nombre.localeCompare(b.nombre, "es") }[sortBy] || byNumber;
    const list = (filter === "ALL" ? players : players.filter((p) => p.posicion === filter)).slice().sort(by);
    $("grid").innerHTML = list.length ? list.map((p) => {
      const a = attFor(p);
      return `<button class="card" data-i="${players.indexOf(p)}" aria-label="Ver a ${esc(p.nombre)}">
        <div class="photo">${photoHTML(p)}
          ${p.posicion ? `<span class="pos-tag">${esc(p.posicion.toUpperCase())}</span>` : ""}
          ${p.numero ? `<span class="num">${esc(p.numero)}</span>` : ""}</div>
        <div class="meta"><div class="name">${esc(p.nombre)}</div>
          <div class="facts">${p.alturaCm ? `<span><strong>${m(p.alturaCm)}</strong></span>` : ""}${p.edad != null ? `<span>${p.edad} años</span>` : ""}${a.pct != null ? `<span>Asist. ${a.pct}%</span>` : ""}</div></div>
      </button>`;
    }).join("") : `<div class="empty" style="grid-column:1/-1"><h3>Todavía no hay jugadores</h3><p>Cargalos en la planilla de Google o en <code>players.js</code>.</p></div>`;
    renderRuler();
  }
  $("grid").addEventListener("click", (e) => { const c = e.target.closest(".card"); if (c) openView(players[+c.dataset.i]); });

  function renderRuler() {
    const h = players.filter((p) => p.alturaCm).sort((a, b) => b.alturaCm - a.alturaCm);
    $("rulerSec").hidden = !h.length;
    if (!h.length) return;
    const lo = Math.min(100, Math.floor(Math.min(...h.map((p) => p.alturaCm)) / 10) * 10);
    const hi = Math.max(170, Math.ceil(Math.max(...h.map((p) => p.alturaCm)) / 10) * 10);
    const rowH = 30, left = 130, right = 44, W = 720, top = 22, H = top + h.length * rowH + 6;
    const x = (v) => left + ((v - lo) / (hi - lo)) * (W - left - right);
    let g = "";
    for (let t = lo; t <= hi; t += 10) g += `<line x1="${x(t)}" x2="${x(t)}" y1="${top - 4}" y2="${H}" stroke="var(--line)"/><text x="${x(t)}" y="12" text-anchor="middle">${t}</text>`;
    const avg = h.reduce((s, p) => s + p.alturaCm, 0) / h.length;
    g += h.map((p, i) => {
      const y = top + i * rowH;
      return `<text class="bar-label" x="${left - 10}" y="${y + 19}" text-anchor="end">${p.numero ? "#" + esc(p.numero) + " " : ""}${esc(p.nombre.split(/\s+/)[0])}</text>
        <rect x="${left}" y="${y + 6}" width="${Math.max(2, x(p.alturaCm) - left)}" height="${rowH - 12}" rx="3" fill="var(--accent-mark)"/>
        <text x="${x(p.alturaCm) + 6}" y="${y + 19}" style="fill:var(--fg)">${p.alturaCm}</text>`;
    }).join("");
    g += `<line x1="${x(avg)}" x2="${x(avg)}" y1="${top - 4}" y2="${H}" stroke="var(--fg)" stroke-dasharray="4 4"/>`;
    $("bars").innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="min-width:520px" role="img" aria-label="Alturas de los jugadores en centímetros">${g}</svg>
      <div class="hint" style="padding-top:4px">Línea punteada: promedio del equipo (${Math.round(avg)} cm).</div>`;
  }

  function openView(p) {
    if (!p) return;
    const a = attFor(p), d = $("viewDlg");
    d.innerHTML = `<div class="detail">
      <div class="photo">${photoHTML(p, true)}${p.numero ? `<span class="num">${esc(p.numero)}</span>` : ""}</div>
      <div class="body">
        <div class="det-head"><div><div class="label">${esc(p.posicion || "Jugador")}</div><div class="name">${esc(p.nombre)}</div></div>${dribbler(p.numero)}</div>
        <div class="kv">
          <div><span class="label">Altura</span><strong>${m(p.alturaCm)}</strong></div>
          <div><span class="label">Edad</span><strong>${p.edad != null ? p.edad + " años" : "–"}</strong></div>
          <div><span class="label">Mano hábil</span><strong>${esc(p.mano || "–")}</strong></div>
          <div><span class="label">En el club desde</span><strong>${esc(p.ingreso || "–")}</strong></div>
          <div><span class="label">Asistencia</span><strong>${a.n ? `${a.yes} de ${a.n} (${a.pct}%)` : "–"}</strong></div>
        </div>
        ${p.bio ? `<p class="notes">${esc(p.bio)}</p>` : ""}
        <div class="actions"><button class="btn" data-act="close">Cerrar</button></div>
      </div></div>`;
    d.onclick = (e) => {
      const btn = e.target.closest(".dribble-btn");
      if (btn) playMove(btn);
      if (e.target.closest("[data-act]") || e.target === d) d.close();
    };
    d.showModal();
  }

  /* ---------- jugadorcito: picar, proteger, tirar, bandeja ---------- */
  function dribbler(n) {
    const ball = (cx, cy) => `<g class="ball">
        <circle cx="${cx}" cy="${cy}" r="9" fill="#e2732b" stroke="#5a2a0c" stroke-width="1.4"/>
        <path d="M${cx - 9} ${cy} h18 M${cx} ${cy - 9} v18 M${cx - 6.5} ${cy - 6.5} q6 6.5 0 13 M${cx + 6.5} ${cy - 6.5} q-6 6.5 0 13" stroke="#5a2a0c" stroke-width="1.1" fill="none"/>
      </g>`;
    const limbs = 'stroke="var(--fg)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"';
    const shirt = (d, ty) => `<path d="${d}" fill="var(--accent)" stroke="var(--accent2)" stroke-width="2"/>
        <text x="56" y="${ty}" text-anchor="middle" fill="var(--accent-ink)" style="font: 900 19px var(--f-display)">${esc(n || "")}</text>`;
    const shorts = (y) => `<rect x="42" y="${y}" width="30" height="20" rx="4" fill="var(--accent2)"/>`;
    const upright = (legs, arms, feet) => `<g ${limbs}>${legs}${arms}</g>
        <path d="${feet}" stroke="var(--fg)" stroke-width="5" stroke-linecap="round"/>
        ${shorts(84)}${shirt("M41 36 Q57 31 73 36 L70 88 L44 88 Z", 70)}
        <circle cx="57" cy="20" r="11" fill="var(--fg)"/>`;
    return `<button type="button" class="dribble-btn" title="Tocá: protege la pelota, tira al aro o hace una bandeja" aria-label="Hacer una jugada"><svg class="dribbler" viewBox="0 0 200 165" aria-hidden="true">
      <ellipse cx="57" cy="157" rx="24" ry="3" fill="var(--fg)" opacity=".15"/>
      <g class="pose-protect">
        <ellipse class="shadow" cx="96" cy="156" rx="10" ry="2.5" fill="var(--fg)"/>
        <g class="body">
          <g ${limbs}><path d="M49 106 L37 128 L35 152"/><path d="M63 106 L76 128 L79 152"/><path d="M41 54 L24 58 L10 52"/></g>
          <path d="M30 154 h10 M74 154 h10" stroke="var(--fg)" stroke-width="5" stroke-linecap="round"/>
          ${shorts(92)}${shirt("M38 48 Q54 42 70 48 L68 96 L43 96 Z", 80)}
          <circle cx="50" cy="32" r="11" fill="var(--fg)"/>
          <g class="arm"><path d="M68 54 L82 76 L92 100" ${limbs}/></g>
        </g>
        ${ball(96, 115)}
        <text class="shout" x="8" y="30">¡MÍA!</text>
      </g>
      <g class="pose-normal">
        <ellipse class="shadow" cx="92" cy="156" rx="10" ry="2.5" fill="var(--fg)"/>
        <g class="body">
          ${upright('<path d="M50 100 L45 128 L41 152"/><path d="M63 100 L69 127 L73 152"/>', '<path d="M43 42 L33 62 L39 80"/>', "M36 154 h10 M68 154 h10")}
          <g class="arm"><path d="M71 42 L83 62 L89 84" ${limbs}/></g>
        </g>
        ${ball(92, 96)}
      </g>
      <g class="pose-shoot">
        <g class="pbody">${upright('<path d="M50 100 L48 128 L47 150"/><path d="M63 100 L66 128 L68 150"/>', '<path d="M44 40 L46 18 L58 0"/><path d="M70 40 L76 18 L70 -2"/>', "M42 152 h10 M64 152 h10")}</g>
        <g class="pball" transform="translate(64 -10)">${ball(0, 0)}</g>
        <text class="pshout" x="162" y="76" text-anchor="middle" opacity="0" style="font: 800 15px var(--f-display); fill: var(--accent-mark)">¡ADENTRO!</text>
      </g>
      <g class="pose-layup">
        <g class="pbody">${upright('<path d="M50 100 L50 128 L52 150"/><path d="M63 100 L76 113 L71 133"/>', '<path d="M44 40 L34 56 L37 72"/><path d="M70 40 L80 20 L88 2"/>', "M47 152 h10")}</g>
        <g class="pball" transform="translate(74 60)">${ball(0, 0)}</g>
        <text class="pshout" x="166" y="114" text-anchor="middle" opacity="0" paint-order="stroke" stroke="var(--surface)" stroke-width="4" style="font: 800 15px var(--f-display); fill: var(--accent-mark)">¡BANDEJA!</text>
      </g>
      <g class="hoop">
        <rect x="186" y="40" width="5" height="117" fill="var(--muted)"/>
        <path d="M188 44 H179" stroke="var(--muted)" stroke-width="3"/>
        <rect x="176" y="8" width="4" height="40" rx="1" fill="var(--fg)"/>
        <g class="net"><path d="M151 37 L155 54 M159 37 L160 54 M167 37 L165 54 M175 37 L170 54 M152.5 45.5 H172.5 M155 54 H170" stroke="var(--muted)" stroke-width="1.2" fill="none"/></g>
        <path d="M150 36 H177" stroke="#d64b1a" stroke-width="3" stroke-linecap="round"/>
      </g>
    </svg></button>`;
  }

  const bez = (u, p, c, q) => { const a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, d = u * u; return [a * p[0] + b * c[0] + d * q[0], a * p[1] + b * c[1] + d * q[1]]; };
  const lerp = (u, p, q) => [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u];
  const dropThroughNet = (dt) => {
    if (dt < 250) return [163, 30 + 118 * (dt / 250) ** 2];
    const u = Math.min(1, (dt - 250) / 400);
    return [163 - 12 * u, 148 - 22 * Math.sin(Math.PI * u)];
  };
  const shotPlan = () => {
    const jump = (t) => (t < 150 ? (4 * t) / 150 : t < 800 ? 4 * (1 - (t - 150) / 650) - 18 * Math.sin((Math.PI * (t - 150)) / 650) : 0);
    const REL = 420, SWISH = 1050, from = [64, -10 + jump(REL)];
    return { T: 1900, swish: SWISH, at(t) {
      const y = jump(t);
      const [bx, by] = t < REL ? [64, -10 + y] : t < SWISH ? bez((t - REL) / (SWISH - REL), from, [118, -62], [163, 30]) : dropThroughNet(t - SWISH);
      return { x: 0, y, bx, by };
    } };
  };
  const layupPlan = () => {
    const pos = (t) => (t < 600 ? [(52 * t) / 600, -3 * Math.abs(Math.sin((Math.PI * t) / 200))]
      : t < 1150 ? [52 + (6 * (t - 600)) / 550, -24 * Math.sin((Math.PI * (t - 600)) / 550)]
      : t < 1500 ? [58, 0] : [58 * (1 - Math.min(1, (t - 1500) / 500)), 0]);
    const REL = 900, BOARD = 1080, SWISH = 1200, [rx, ry] = pos(REL), from = [rx + 92, ry - 8];
    return { T: 2000, swish: SWISH, at(t) {
      const [x, y] = pos(t);
      const [bx, by] = t < 600 ? [x + 74, y + 60]
        : t < REL ? lerp((t - 600) / (REL - 600), [x + 74, y + 60], [x + 92, y - 8])
        : t < BOARD ? bez((t - REL) / (BOARD - REL), from, [166, -24], [171, 18])
        : t < SWISH ? lerp((t - BOARD) / (SWISH - BOARD), [171, 18], [163, 30])
        : dropThroughNet(t - SWISH);
      return { x, y, bx, by };
    } };
  };

  function playMove(btn) {
    cancelAnimationFrame(btn._raf); clearTimeout(btn._t);
    btn.classList.remove("protect", "shoot", "layup"); void btn.offsetWidth;
    const move = btn.dataset.next || "protect";
    btn.dataset.next = { protect: "shoot", shoot: "layup", layup: "protect" }[move];
    btn.classList.add(move);
    if (move === "protect") { btn._t = setTimeout(() => btn.classList.remove("protect"), 1600); return; }
    const g = btn.querySelector(".pose-" + move), body = g.querySelector(".pbody"), ball = g.querySelector(".pball"), shout = g.querySelector(".pshout"), net = btn.querySelector(".net");
    const end = () => { btn.classList.remove(move); net.removeAttribute("transform"); shout.setAttribute("opacity", 0); body.removeAttribute("transform"); };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ball.setAttribute("transform", "translate(163 44)"); shout.setAttribute("opacity", 1); btn._t = setTimeout(end, 1600); return;
    }
    const plan = move === "shoot" ? shotPlan() : layupPlan();
    const t0 = performance.now();
    const frame = (now) => {
      const t = now - t0, f = plan.at(t);
      body.setAttribute("transform", `translate(${f.x} ${f.y})`);
      ball.setAttribute("transform", `translate(${f.bx} ${f.by})`);
      const s = t > plan.swish - 40 && t < plan.swish + 250 ? 1 + 0.35 * Math.sin((Math.PI * (t - plan.swish + 40)) / 290) : 1;
      net.setAttribute("transform", `translate(0 37) scale(1 ${s}) translate(0 -37)`);
      shout.setAttribute("opacity", t > plan.swish && t < plan.T - 150 ? 1 : 0);
      if (t < plan.T) btn._raf = requestAnimationFrame(frame); else end();
    };
    btn._raf = requestAnimationFrame(frame);
  }

  /* ---------- partidos ---------- */
  const result = (x) => (x.us == null || x.them == null ? null : x.us > x.them ? "G" : x.us < x.them ? "P" : "E");
  const RES = { G: "GANADO", P: "PERDIDO", E: "EMPATE" };
  const emptyRow = (t) => `<div class="row"><span></span><span class="hint">${t}</span><span></span></div>`;
  const matchRow = (x) => {
    const r = result(x);
    return `<button class="row" data-m="${matches.indexOf(x)}">
      <span class="d">${esc(shortDate(x.fecha))}${x.hora ? "<br>" + esc(x.hora) : ""}</span>
      <span class="t"><b>vs. ${esc(x.rival)} (${x.visitante ? "visitante" : "local"})</b>${x.cancha ? `<small>${esc(x.cancha)}</small>` : ""}</span>
      ${r ? `<span class="score">${x.us}–${x.them} <span class="pill ${r}">${RES[r]}</span></span>` : x.fecha < today ? `<span class="pill pending">SIN RESULTADO</span>` : "<span></span>"}
    </button>`;
  };
  function renderPartidos() {
    const played = matches.filter(result);
    const won = played.filter((x) => result(x) === "G").length, lost = played.filter((x) => result(x) === "P").length, tied = played.length - won - lost;
    $("mPlayed").textContent = played.length; $("mWon").textContent = won; $("mLost").textContent = lost;
    $("mPerc").textContent = played.length ? Math.round((won / played.length) * 100) + "% de efectividad" : " ";
    $("mTied").textContent = tied ? `${tied} empate${tied > 1 ? "s" : ""}` : " ";
    $("mPts").textContent = played.length ? `${played.reduce((s, x) => s + x.us, 0)}–${played.reduce((s, x) => s + x.them, 0)}` : "–";
    const upcoming = matches.filter((x) => !result(x) && x.fecha >= today).sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
    const past = matches.filter((x) => result(x) || x.fecha < today).sort((a, b) => b.fecha.localeCompare(a.fecha));
    const n = upcoming[0];
    $("nextMatch").innerHTML = n ? `<button class="next row" data-m="${matches.indexOf(n)}" style="border-radius:12px">
        <div class="datebox"><b>${new Date(n.fecha + "T12:00").getDate()}</b><span>${esc(fmtDate(n.fecha, { month: "short" }))}</span></div>
        <div style="min-width:0;display:grid;gap:4px"><span class="label">${esc(longDate(n.fecha))}${n.hora ? " · " + esc(n.hora) + " h" : ""} · ${n.visitante ? "Visitante" : "Local"}</span>
          <div class="vs">vs. ${esc(n.rival)}</div>${n.cancha ? `<span class="hint">${esc(n.cancha)}</span>` : ""}</div></button>`
      : `<div class="empty"><h3>No hay partidos por jugar</h3><p>Los partidos se cargan en el archivo <code>partidos.js</code> del repositorio.</p></div>`;
    $("fixtureCount").textContent = upcoming.length ? `${upcoming.length} por jugar` : "";
    $("upcoming").innerHTML = upcoming.length ? upcoming.map(matchRow).join("") : emptyRow("Sin partidos programados.");
    $("results").innerHTML = past.length ? past.map(matchRow).join("") : emptyRow("Todavía no se jugó ningún partido.");
  }
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-m]"); if (b) viewMatch(matches[+b.dataset.m]); });
  function viewMatch(x) {
    if (!x) return;
    const r = result(x), who = players.filter((p) => p.numero && x.present.includes(p.numero)).sort(byNumber), d = $("viewDlg");
    d.innerHTML = `<div class="dlg"><div><span class="label">${esc(longDate(x.fecha))}${x.hora ? " · " + esc(x.hora) + " h" : ""} · ${x.visitante ? "Visitante" : "Local"}</span><h2>vs. ${esc(x.rival)}</h2></div>
      ${r ? `<div class="score">${x.us}–${x.them} <span class="pill ${r}">${RES[r]}</span></div>` : ""}
      ${x.cancha ? `<div><span class="label">Cancha</span><div>${esc(x.cancha)}</div></div>` : ""}
      ${who.length ? `<div><span class="label">Jugaron</span><div>${who.map((p) => esc(p.nombre)).join(", ")}</div></div>` : ""}
      ${x.notas ? `<p class="notes">${esc(x.notas)}</p>` : ""}
      <div class="actions"><button class="btn" data-act="close">Cerrar</button></div></div>`;
    d.onclick = (e) => { if (e.target.closest("[data-act]") || e.target === d) d.close(); };
    d.showModal();
  }

  /* ---------- asistencia ---------- */
  function renderAsistencia() {
    const ev = attEvents();
    $("aPractices").textContent = practices.length;
    $("aMatches").textContent = ev.filter((e) => e.kind === "P").length;
    const rates = players.map((p) => attFor(p).pct).filter((v) => v != null);
    $("aAvg").textContent = rates.length ? Math.round(rates.reduce((s, v) => s + v, 0) / rates.length) + "%" : "–";
    const last = ev.slice().sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
    $("aLast").textContent = last ? shortDate(last.fecha) : "–";
    $("aLastSub").textContent = last ? `${last.present.length} presentes · ${last.kind === "P" ? "partido" : "entrenamiento"}` : " ";
    if (!ev.length) $("attTable").innerHTML = `<div class="hint">Todavía no hay asistencia registrada. Se carga en <code>asistencia.js</code> (entrenamientos) y en <code>partidos.js</code> (quiénes jugaron).</div>`;
    else {
      const rows = players.map((p) => ({ p, a: attFor(p) })).sort((x, y) => (y.a.pct ?? -1) - (x.a.pct ?? -1) || byNumber(x.p, y.p));
      $("attTable").innerHTML = `<table><thead><tr><th>#</th><th>Jugador</th><th>Asistencia</th><th>Vino</th></tr></thead><tbody>${rows.map(({ p, a }) =>
        `<tr><td>${esc(p.numero || "–")}</td><td>${esc(p.nombre)}</td><td>${a.pct != null ? `<span class="meter"><i style="width:${a.pct}%"></i></span>${a.pct}%` : "–"}</td><td>${a.n ? `${a.yes} de ${a.n}` : "–"}</td></tr>`).join("")}</tbody></table>`;
    }
    const list = practices.slice().sort((a, b) => b.fecha.localeCompare(a.fecha));
    $("practiceList").innerHTML = list.length ? list.map((x) => `<div class="row"><span class="d">${esc(shortDate(x.fecha))}</span>
      <span class="t"><b>${x.present.length} de ${players.length} presentes</b>${x.notas ? `<small>${esc(x.notas)}</small>` : ""}</span><span></span></div>`).join("")
      : emptyRow("Sin entrenamientos registrados.");
  }

  const renderAll = () => { renderPlantel(); renderPartidos(); renderAsistencia(); };

  /* ---------- carga de jugadores (planilla o players.js) ---------- */
  const parseCSV = (texto) => {
    const filas = []; let fila = [], campo = "", enComillas = false;
    for (let i = 0; i < texto.length; i++) {
      const c = texto[i];
      if (enComillas) {
        if (c === '"') { if (texto[i + 1] === '"') { campo += '"'; i++; } else enComillas = false; } else campo += c;
      } else if (c === '"') enComillas = true;
      else if (c === ",") { fila.push(campo); campo = ""; }
      else if (c === "\n") { fila.push(campo); filas.push(fila); fila = []; campo = ""; }
      else if (c !== "\r") campo += c;
    }
    if (campo !== "" || fila.length) { fila.push(campo); filas.push(fila); }
    return filas;
  };
  const csvAJugadores = (texto) => {
    const filas = parseCSV(texto.replace(/^﻿/, "")).filter((f) => f.some((v) => v.trim() !== ""));
    if (filas.length < 2) return [];
    const cab = filas[0].map((h) => h.trim().toLowerCase());
    return filas.slice(1).map((f) => Object.fromEntries(cab.map((h, i) => [h, (f[i] || "").trim()])));
  };
  const usar = (lista) => { players = lista.map(normalizarJugador).filter((p) => p.nombre); renderAll(); };
  const respaldo = (motivo) => {
    usar(typeof JUGADORES !== "undefined" ? JUGADORES : []);
    if (motivo) console.warn("Usando players.js:", motivo);
  };

  route(); renderPartidos(); renderAsistencia();
  const sheet = typeof SHEET_CSV_URL !== "undefined" ? SHEET_CSV_URL.trim() : "";
  if (!sheet) respaldo("no hay SHEET_CSV_URL configurado");
  else fetch(sheet + (sheet.includes("?") ? "&" : "?") + "_cb=" + Date.now())
    .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
    .then((t) => { const l = csvAJugadores(t).filter((j) => j.nombre); if (l.length) usar(l); else respaldo("la planilla no devolvió jugadores"); })
    .catch((e) => respaldo(e.message));
})();
