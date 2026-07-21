// Código de partida para cada lección del módulo 1 (HTML + CSS).
// La página crece de lección en lección: cada fixture arranca donde la
// solución de la lección anterior terminó.
//
// Desde la lección 1, cada fixture ya trae el esqueleto real de un
// documento HTML: <html>, <head> (con un <title>) y <body>. El alumno solo
// escribe dentro del <body> hasta la lección 5, donde <head> pasa a ser
// donde vive su primer contenido de verdad (el <link> de la hoja de
// estilos) — por eso desde el principio se le deja ver esa sección, aunque
// todavía no tenga que tocarla.
//
// El encabezado (h1 + p de presentación) usa los textos genéricos del
// perfil: al sembrar una lección, App los sustituye por el nombre y la
// presentación reales que el jugador escribió (ver utils/profile.js).

import { NOMBRE_GENERICO, PRESENTACION_GENERICA } from '../../utils/profile';

const INTRO = `<h1>${NOMBRE_GENERICO}</h1>
<p>${PRESENTACION_GENERICA}</p>`;

// Esqueleto común: <html> envuelve la página entera, <head> guarda
// información que no se ve (aquí, de momento, solo el <title>) y <body>
// contiene todo lo visible. `headExtra` deja hueco para lecciones que ya
// necesitan añadir algo dentro de <head>.
const PAGE = (body, headExtra = '') => `<html>
<head>
  <title>Mi página</title>
${headExtra}</head>
<body>
${body}
</body>
</html>
`;

export const L1_HTML = PAGE(`<!-- Esto es un comentario: el navegador lo ignora, es una nota para ti.
     Escribe debajo tu <h1> y tu <p>, y pulsa «Ver en web». -->
`);

export const L2_HTML = PAGE(`${INTRO}

<!-- Añade aquí tu <h2> y tu lista <ul> con sus <li> -->
`);

export const L3_HTML = PAGE(`${INTRO}
<h2>Mis habilidades</h2>
<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>

<!-- Añade aquí tu enlace <a> -->
`);

export const L4_HTML = PAGE(`${INTRO}
<h2>Mis habilidades</h2>
<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>
<a href="https://developer.mozilla.org">Mi web favorita</a>

<!-- Añade aquí tu imagen <img> -->
`);

export const L5_HTML = PAGE(
  `${INTRO}
<h2>Mis habilidades</h2>
<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>
<a href="https://developer.mozilla.org">Mi web favorita</a>
<img src="https://picsum.photos/200/120" alt="Una foto de ejemplo" />
`,
  `
  <!-- Añade aquí el <link> a la hoja de estilos: esta es su sitio, dentro
       de <head>, no ahí abajo en el <body> con el resto del contenido. -->
`
);

export const L6_HTML = PAGE(`${INTRO}
<h2>Mis habilidades</h2>
<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>
<a href="https://developer.mozilla.org">Mi web favorita</a>
<img src="https://picsum.photos/200/120" alt="Una foto de ejemplo" />
`);

export const L6_CSS = `/* Esto es un comentario de CSS: el navegador lo ignora.
   Escribe debajo tus reglas y pulsa «Ver en web». */
`;

export const L7_HTML = L6_HTML;

export const L7_CSS = `body {
  background-color: #1e1e2f;
  color: #ebdbb2;
}

/* Dale padding al párrafo y un borde a la imagen */
`;

export const L8_HTML = PAGE(`${INTRO}

<nav class="menu">
  <a href="#">Inicio</a>
  <a href="#">Sobre mí</a>
  <a href="#">Contacto</a>
</nav>
`);

export const L8_CSS = `body {
  background-color: #1e1e2f;
  color: #ebdbb2;
}

/* Convierte .menu en una fila con Flexbox */
`;

export const L9_HTML = PAGE(`${INTRO}
<img src="https://picsum.photos/200/120" alt="Una foto de ejemplo" />
`);

export const L9_CSS = `body {
  background-color: #1e1e2f;
  color: #ebdbb2;
}

/* Añade tipografía, un color para el <h1> y esquinas redondeadas a la imagen */
`;
