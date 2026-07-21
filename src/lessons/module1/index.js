// Módulo 1 — Maqueta tu primera página (HTML + CSS, 6 lecciones)
// Construyes una pequeña página de presentación personal, sin JavaScript
// todavía: el objetivo es soltura con las etiquetas y el modelo de caja.

import {
  minCount,
  textNotEmpty,
  attrNotEmpty,
  computedStyle,
  hasBackgroundColor,
  sourceIncludes,
} from '../_helpers';
import {
  L1_HTML,
  L2_HTML,
  L3_HTML,
  L4_HTML,
  L4_CSS,
  L5_HTML,
  L5_CSS,
  L6_HTML,
  L6_CSS,
} from './fixtures';

export const module1 = [
  {
    id: 'm1-l1',
    title: 'Tu primer título y párrafo',
    description:
      'El HTML describe la estructura de una página con etiquetas: cada una envuelve un trozo de contenido y le dice al navegador qué es. `<h1>` es el título principal — solo debería haber uno por página — y `<p>` es un párrafo de texto normal. Escribe un `<h1>` con tu nombre y, debajo, un `<p>` presentándote en una frase.',
    objectives: [
      { label: 'Añade un título <h1> con tu nombre', validate: textNotEmpty('h1') },
      { label: 'Añade un párrafo <p> presentándote', validate: textNotEmpty('p') },
    ],
    hints: [
      'Escribe: <h1>Tu nombre</h1>',
      'Debajo añade: <p>Cuéntanos algo sobre ti.</p>',
      'Los cambios se ven al instante en la vista previa de la derecha',
    ],
    setupFiles: { html: L1_HTML, css: '', js: '' },
    curiosity:
      'La primera página web de la historia, creada por Tim Berners-Lee en 1991, sigue online en info.cern.ch — y usa etiquetas casi idénticas a las que acabas de escribir.',
  },
  {
    id: 'm1-l2',
    title: 'Listas, enlaces e imágenes',
    description:
      'Con `<ul>` (lista) y `<li>` (cada elemento) agrupas cosas relacionadas; con `<a href="...">` enlazas a otra página; con `<img src="..." alt="...">` muestras una imagen — el `alt` describe la imagen para quien no puede verla, así que no es opcional. Añade un `<h2>` como subtítulo, una lista de al menos 3 elementos, un enlace y una imagen.',
    objectives: [
      { label: 'Añade una lista <ul> con al menos 3 elementos <li>', validate: minCount('li', 3) },
      { label: 'Añade un enlace <a> con atributo href', validate: attrNotEmpty('a', 'href') },
      {
        label: 'Añade una imagen <img> con atributos src y alt',
        validate: (s) => {
          const el = s.doc.querySelector('img');
          return !!el && !!el.getAttribute('src')?.trim() && !!el.getAttribute('alt')?.trim();
        },
      },
    ],
    hints: [
      '<h2>Mis habilidades</h2>',
      '<ul><li>HTML</li><li>CSS</li><li>JavaScript</li></ul>',
      '<a href="https://developer.mozilla.org">Mi web favorita</a>',
      '<img src="https://picsum.photos/200/120" alt="Una imagen de ejemplo" />',
    ],
    setupFiles: { html: L2_HTML, css: '', js: '' },
    curiosity:
      'El atributo alt no es un detalle menor: los lectores de pantalla que usan las personas ciegas lo leen en voz alta en lugar de la imagen, y los buscadores lo usan para saber de qué trata. Una imagen sin alt es, para mucha gente, una imagen que no existe.',
  },
  {
    id: 'm1-l3',
    title: 'Cómo se enlaza una hoja de estilos',
    description:
      'En un proyecto real, el CSS vive en su propio archivo (`styles.css`) y el HTML tiene que enlazarlo explícitamente con `<link rel="stylesheet" href="styles.css">`. En JSPlay verás que, a partir de la próxima lección, lo que escribas en la pestaña CSS se aplica solo — el editor enlaza ese archivo por ti para que puedas centrarte en aprender CSS sin repetir esta etiqueta cada vez. Añádela ahora a tu HTML: es la que hace ese enlace posible fuera de aquí.',
    objectives: [
      {
        label: 'Enlaza una hoja de estilos externa con <link>',
        validate: attrNotEmpty('link[rel="stylesheet"]', 'href'),
      },
    ],
    hints: [
      '<link rel="stylesheet" href="styles.css">',
      'Esta etiqueta no cambia nada en la vista previa — apunta a un archivo que no existe aquí — pero fuera de JSPlay es la que conecta tu HTML con tu CSS.',
    ],
    setupFiles: { html: L3_HTML, css: '', js: '' },
    curiosity:
      'El atributo rel viene de "relationship": describe qué relación tiene el documento enlazado con la página actual. "stylesheet" no es la única opción — rel="icon" define el favicon de la pestaña, y rel="canonical" le dice a los buscadores cuál es la URL "oficial" cuando la misma página existe en varias direcciones.',
  },
  {
    id: 'm1-l4',
    title: 'Selectores CSS y el modelo de caja',
    description:
      'CSS da estilo al HTML con reglas del tipo `selector { propiedad: valor; }`. Todo elemento es, por dentro, una caja con contenido, padding (espacio interior), border (borde) y margin (espacio exterior) — el "modelo de caja". Ponle un color de fondo a la página con `body { background-color: ...; }`, dale padding al párrafo y un borde a la imagen.',
    objectives: [
      { label: 'La página tiene un color de fondo', validate: hasBackgroundColor('body') },
      {
        label: 'El párrafo <p> tiene padding',
        validate: computedStyle('p', 'paddingTop', (v) => v !== '0px'),
      },
      {
        label: 'La imagen <img> tiene un borde visible',
        validate: computedStyle('img', 'borderTopWidth', (v) => v !== '0px'),
      },
    ],
    hints: [
      'body { background-color: #1e1e2f; color: #ebdbb2; }',
      'p { padding: 12px; }',
      'img { border: 3px solid orange; }',
    ],
    setupFiles: { html: L4_HTML, css: L4_CSS, js: '' },
    curiosity:
      'Por defecto, el ancho de una caja en CSS NO incluye su padding ni su borde: se suman aparte. Por eso a veces un elemento con padding "se sale" de su contenedor — la propiedad box-sizing: border-box, usadísima en la práctica, cambia esa regla para que todo encaje como uno espera.',
  },
  {
    id: 'm1-l5',
    title: 'Layout con Flexbox',
    description:
      'Flexbox coloca varios elementos en fila o columna sin trucos raros: basta con `display: flex` en el contenedor. Ya tienes un `<nav class="menu">` con tres enlaces dentro, uno debajo de otro. Conviértelo en una barra horizontal con espacio entre los enlaces.',
    objectives: [
      {
        label: 'El menú tiene al menos 3 elementos dentro',
        validate: minCount('.menu > *', 3),
      },
      { label: 'Aplica display: flex al contenedor .menu', validate: computedStyle('.menu', 'display', 'flex') },
      {
        label: 'Añade separación entre los enlaces con gap',
        validate: computedStyle('.menu', 'columnGap', (v) => v !== '0px' && v !== 'normal'),
      },
    ],
    hints: [
      '.menu { display: flex; }',
      'Añade separación: .menu { display: flex; gap: 16px; }',
    ],
    setupFiles: { html: L5_HTML, css: L5_CSS, js: '' },
    curiosity:
      'Antes de que Flexbox se estandarizara (2009-2017), centrar una caja verticalmente en CSS era tan incordio que se convirtió en un chiste recurrente entre desarrolladores web. Con Flexbox, se resuelve con una sola línea: align-items: center.',
  },
  {
    id: 'm1-l6',
    title: 'Colores, tipografía y el toque final',
    description:
      'Ya casi tienes una página con buena pinta: solo falta rematarla. Define una tipografía para toda la página con `font-family` en `body`, dale un color de texto propio al `<h1>` y redondea las esquinas de la imagen con `border-radius`.',
    objectives: [
      {
        label: 'Define una tipografía para toda la página',
        validate: sourceIncludes('css', /body\s*{[^}]*font-family\s*:/i),
      },
      {
        label: 'Dale un color de texto propio al <h1>',
        validate: (s) =>
          sourceIncludes('css', /h1\s*{[^}]*color\s*:/i)(s) &&
          computedStyle('h1', 'color', (v) => v !== 'rgb(0, 0, 0)')(s),
      },
      {
        label: 'Redondea las esquinas de la imagen con border-radius',
        validate: computedStyle('img', 'borderRadius', (v) => v !== '0px'),
      },
    ],
    hints: [
      'body { font-family: "Segoe UI", sans-serif; }',
      'h1 { color: #fabd2f; }',
      'img { border-radius: 12px; }',
    ],
    setupFiles: { html: L6_HTML, css: L6_CSS, js: '' },
    curiosity:
      'Hasta la llegada de border-radius con CSS3 (hacia 2010), conseguir esquinas redondeadas en la web implicaba recortar imágenes de fondo a medida para cada caja — un hack tan extendido que tenía nombre propio: "sliding doors".',
  },
];
