// Código de partida para cada lección del módulo 1 (HTML + CSS).
// La página crece de lección en lección: cada fixture arranca donde la
// solución de la lección anterior terminó.
//
// El encabezado (h1 + p de presentación) usa los textos genéricos del
// perfil: al sembrar una lección, App los sustituye por el nombre y la
// presentación reales que el jugador escribió (ver utils/profile.js).

import { NOMBRE_GENERICO, PRESENTACION_GENERICA } from '../../utils/profile';

const INTRO = `<h1>${NOMBRE_GENERICO}</h1>
<p>${PRESENTACION_GENERICA}</p>`;

export const L1_HTML = `<!-- Esto es un comentario: el navegador lo ignora, es una nota para ti.
     Escribe debajo tu <h1> y tu <p>, y pulsa «Ver en web». -->
`;

export const L2_HTML = `${INTRO}

<!-- Añade aquí tu <h2> y tu lista <ul> con sus <li> -->
`;

export const L3_HTML = `${INTRO}
<h2>Mis habilidades</h2>
<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>

<!-- Añade aquí tu enlace <a> -->
`;

export const L4_HTML = `${INTRO}
<h2>Mis habilidades</h2>
<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>
<a href="https://developer.mozilla.org">Mi web favorita</a>

<!-- Añade aquí tu imagen <img> -->
`;

export const L5_HTML = `${INTRO}
<h2>Mis habilidades</h2>
<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>
<a href="https://developer.mozilla.org">Mi web favorita</a>
<img src="https://picsum.photos/200/120" alt="Una foto de ejemplo" />

<!-- Añade aquí el <link> a la hoja de estilos -->
`;

export const L6_HTML = `${INTRO}
<h2>Mis habilidades</h2>
<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>
<a href="https://developer.mozilla.org">Mi web favorita</a>
<img src="https://picsum.photos/200/120" alt="Una foto de ejemplo" />
`;

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

export const L8_HTML = `${INTRO}

<nav class="menu">
  <a href="#">Inicio</a>
  <a href="#">Sobre mí</a>
  <a href="#">Contacto</a>
</nav>
`;

export const L8_CSS = `body {
  background-color: #1e1e2f;
  color: #ebdbb2;
}

/* Convierte .menu en una fila con Flexbox */
`;

export const L9_HTML = `${INTRO}
<img src="https://picsum.photos/200/120" alt="Una foto de ejemplo" />
`;

export const L9_CSS = `body {
  background-color: #1e1e2f;
  color: #ebdbb2;
}

/* Añade tipografía, un color para el <h1> y esquinas redondeadas a la imagen */
`;
