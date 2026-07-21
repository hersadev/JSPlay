// Código de partida para cada lección del módulo 3 (nivel medio).
// Es un proyecto guiado: una web personal completa que crece de lección en
// lección, igual que en el módulo 1 pero con un alcance mayor (semántica,
// Grid, responsive, datos y persistencia).
//
// El h1 y el párrafo de presentación usan los textos genéricos del perfil:
// App los sustituye por lo que el jugador escribió en el nivel básico
// (ver utils/profile.js), así su web sigue siendo la suya.

import { NOMBRE_GENERICO, PRESENTACION_GENERICA } from '../../utils/profile';

// Igual que en los módulos 1 y 2, cada fixture es un documento completo:
// <html>, <head> (con <title>) y <body> con el proyecto dentro.
const PAGE = (body) => `<html>
<head>
  <title>Mi página</title>
</head>
<body>
${body}
</body>
</html>
`;

// ── Bloques de HTML que se repiten entre fixtures ──────────────────────

const CABECERA = `<header class="cabecera">
  <h1>${NOMBRE_GENERICO}</h1>
  <nav class="menu">
    <a href="#inicio">Inicio</a>
    <a href="#proyectos">Proyectos</a>
    <a href="#contacto">Contacto</a>
  </nav>
</header>`;

const INICIO = `  <section id="inicio">
    <h2>Hola 👋</h2>
    <p>${PRESENTACION_GENERICA}</p>
  </section>`;

const PIE = `<footer class="pie">
  <p>Hecho con JSPlay</p>
</footer>`;

const GALERIA_ESTATICA = `  <section id="proyectos">
    <h2>Mis proyectos</h2>
    <div class="galeria">
      <article class="tarjeta">
        <h3>Mi página personal</h3>
        <p>Hecha con HTML y CSS en el nivel básico.</p>
      </article>
      <article class="tarjeta">
        <h3>Galería con Grid</h3>
        <p>Tarjetas colocadas con CSS Grid.</p>
      </article>
      <article class="tarjeta">
        <h3>Modo claro</h3>
        <p>Un botón que cambia el tema de la web.</p>
      </article>
    </div>
  </section>`;

const GALERIA_VACIA = `  <section id="proyectos">
    <h2>Mis proyectos</h2>
    <div class="galeria"></div>
  </section>`;

const CONTACTO = `  <section id="contacto">
    <h2>Contacto</h2>
    <form id="formulario">
      <input id="nombre" type="text" placeholder="Tu nombre" />
      <button type="submit">Enviar</button>
    </form>
    <p id="respuesta"></p>
  </section>`;

// ── Bloques de CSS ─────────────────────────────────────────────────────

const CSS_BASE = `body {
  font-family: "Segoe UI", sans-serif;
  background-color: #1e1e2f;
  color: #ebdbb2;
  margin: 0;
  padding: 16px;
}

.menu {
  display: flex;
  gap: 16px;
}

.menu a {
  color: #fabd2f;
}`;

const CSS_CONTENEDOR = `main {
  max-width: 640px;
  margin: 0 auto;
}`;

const CSS_GRID = `.galeria {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.tarjeta {
  background-color: #2a2a3d;
  padding: 16px;
}`;

const CSS_HOVER = `.tarjeta {
  transition: transform 0.2s;
}

.tarjeta:hover {
  transform: translateY(-4px);
}`;

const CSS_MEDIA = `@media (max-width: 600px) {
  .galeria {
    grid-template-columns: 1fr;
  }
}`;

const CSS_CLARO = `body.claro {
  background-color: #f5f2e9;
  color: #3c3836;
}

body.claro .tarjeta {
  background-color: #ffffff;
}`;

// ── Bloques de JS ──────────────────────────────────────────────────────

const JS_TEMA = `const boton = document.querySelector('#tema');
boton.addEventListener('click', () => {
  document.body.classList.toggle('claro');
});`;

const JS_DATOS = `const PROYECTOS = [
  { titulo: 'Mi página personal', descripcion: 'Hecha con HTML y CSS en el nivel básico.' },
  { titulo: 'Galería con Grid', descripcion: 'Tarjetas colocadas con CSS Grid.' },
  { titulo: 'Modo claro', descripcion: 'Un botón que cambia el tema de la web.' },
];

const galeria = document.querySelector('.galeria');
for (const proyecto of PROYECTOS) {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'tarjeta';
  tarjeta.innerHTML = \`<h3>\${proyecto.titulo}</h3><p>\${proyecto.descripcion}</p>\`;
  galeria.appendChild(tarjeta);
}`;

const JS_FORMULARIO = `const formulario = document.querySelector('#formulario');
formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const nombre = document.querySelector('#nombre').value;
  document.querySelector('#respuesta').textContent = \`¡Gracias, \${nombre}!\`;
});`;

const CABECERA_CON_BOTON = CABECERA.replace(
  '</nav>',
  `</nav>
  <button id="tema">🌓 Tema</button>`
);

// ── Fixtures por lección ───────────────────────────────────────────────

// L1 — Estructura semántica: el contenido llega "plano" y hay que envolverlo.
export const L1_HTML = PAGE(`<!-- Este contenido funciona, pero es un montón de piezas sueltas.
     Envuelve el título y el menú en <header>, las secciones en <main>
     y la última línea en un <footer>. -->

<h1>${NOMBRE_GENERICO}</h1>
<nav class="menu">
  <a href="#inicio">Inicio</a>
  <a href="#proyectos">Proyectos</a>
  <a href="#contacto">Contacto</a>
</nav>

<section id="inicio">
  <h2>Hola 👋</h2>
  <p>${PRESENTACION_GENERICA}</p>
</section>

<p>Hecho con JSPlay</p>
`);

export const L1_CSS = `${CSS_BASE}
`;

// L2 — Contenedor centrado
export const L2_HTML = PAGE(`${CABECERA}
<main>
${INICIO}
</main>
${PIE}
`);

export const L2_CSS = `${CSS_BASE}

/* Centra el <main> con max-width y margin auto */
`;

// L3 — Galería con Grid
export const L3_HTML = PAGE(`${CABECERA}
<main>
${INICIO}
${GALERIA_ESTATICA}
</main>
${PIE}
`);

export const L3_CSS = `${CSS_BASE}

${CSS_CONTENEDOR}

/* Convierte .galeria en una cuadrícula con Grid */
`;

// L4 — Hover y transiciones
export const L4_HTML = L3_HTML;

export const L4_CSS = `${CSS_BASE}

${CSS_CONTENEDOR}

${CSS_GRID}

/* Haz que .tarjeta reaccione al pasar el ratón, con una transición suave */
`;

// L5 — Responsive con media queries
export const L5_HTML = L3_HTML;

export const L5_CSS = `${CSS_BASE}

${CSS_CONTENEDOR}

${CSS_GRID}

${CSS_HOVER}

/* Añade una @media query para pantallas estrechas */
`;

// L6 — Botón de tema (eventos)
export const L6_HTML = L3_HTML;

export const L6_CSS = `${CSS_BASE}

${CSS_CONTENEDOR}

${CSS_GRID}

${CSS_HOVER}

${CSS_MEDIA}

${CSS_CLARO}
`;

export const L6_JS = `// Añade el botón #tema en el HTML y haz que al hacer clic
// alterne la clase "claro" del body
`;

// L7 — Datos en un array: la galería se vacía y se rellena desde JS
export const L7_HTML = PAGE(`${CABECERA_CON_BOTON}
<main>
${INICIO}
${GALERIA_VACIA}
</main>
${PIE}
`);

export const L7_CSS = L6_CSS;

export const L7_JS = `${JS_TEMA}

const PROYECTOS = [
  { titulo: 'Mi página personal', descripcion: 'Hecha con HTML y CSS en el nivel básico.' },
  { titulo: 'Galería con Grid', descripcion: 'Tarjetas colocadas con CSS Grid.' },
  { titulo: 'Modo claro', descripcion: 'Un botón que cambia el tema de la web.' },
];

// Recorre PROYECTOS y crea una .tarjeta en .galeria por cada uno
`;

// L8 — Formulario de contacto
export const L8_HTML = PAGE(`${CABECERA_CON_BOTON}
<main>
${INICIO}
${GALERIA_VACIA}
${CONTACTO}
</main>
${PIE}
`);

export const L8_CSS = L6_CSS;

export const L8_JS = `${JS_TEMA}

${JS_DATOS}

// Escucha el evento "submit" del formulario, evita la recarga con
// preventDefault() y responde en #respuesta
`;

// L9 — Recordar el tema con localStorage
export const L9_HTML = L8_HTML;

export const L9_CSS = L6_CSS;

export const L9_JS = `${JS_TEMA}

${JS_DATOS}

${JS_FORMULARIO}

// Guarda el tema elegido con localStorage.setItem() al pulsar el botón,
// y léelo con localStorage.getItem() al cargar para aplicarlo
`;

// L10 — Pulido final
export const L10_HTML = L8_HTML;

export const L10_CSS = `${CSS_BASE}

${CSS_CONTENEDOR}

${CSS_GRID}

${CSS_HOVER}

${CSS_MEDIA}

${CSS_CLARO}

/* Remate final: sombra y esquinas redondeadas para .tarjeta,
   y scroll suave para toda la página */
`;

export const L10_JS = `${JS_TEMA}

if (localStorage.getItem('tema') === 'claro') {
  document.body.classList.add('claro');
}
boton.addEventListener('click', () => {
  const tema = document.body.classList.contains('claro') ? 'claro' : 'oscuro';
  localStorage.setItem('tema', tema);
});

${JS_DATOS}

${JS_FORMULARIO}
`;
