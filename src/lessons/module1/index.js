// Módulo 1 — Maqueta tu primera página (HTML + CSS, 9 lecciones)
// Construyes una pequeña página de presentación personal, sin JavaScript
// todavía. Pensado para quien nunca ha programado: cada lección introduce
// un único concepto nuevo y lo explica desde cero.
//
// Las descripciones se renderizan con <RichText>: párrafos separados por
// línea en blanco y código entre acentos graves (`así`).

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
  L5_HTML,
  L6_HTML,
  L6_CSS,
  L7_HTML,
  L7_CSS,
  L8_HTML,
  L8_CSS,
  L9_HTML,
  L9_CSS,
} from './fixtures';

export const module1 = [
  {
    id: 'm1-l1',
    title: 'Tu primer título y un párrafo',
    description: [
      'Una página web, por dentro, es solo texto. Lo que hace que el navegador lo entienda son las etiquetas: marcas que envuelven cada trozo de contenido y le dicen qué es. Casi todas van en pareja: una de apertura como `<h1>` y una de cierre igual pero con barra, `</h1>`. Lo que pongas entre ambas es el contenido.',
      'Hoy usarás dos: `<h1>`, el título principal de la página (solo debería haber uno), y `<p>`, un párrafo de texto normal.',
      'Escribe en la pestaña HTML un `<h1>` con tu nombre y, debajo, un `<p>` presentándote. Cuando lo tengas, pulsa el botón «Ver en web» para ver tu página en la vista previa de la derecha.',
    ].join('\n\n'),
    objectives: [
      { label: 'Escribe un título <h1> con tu nombre', validate: textNotEmpty('h1') },
      { label: 'Escribe un párrafo <p> presentándote', validate: textNotEmpty('p') },
    ],
    hints: [
      'Las etiquetas van en pareja: abres con <h1>, escribes tu texto y cierras con </h1> (la misma con una barra).',
      'Escribe: <h1>Tu nombre</h1>',
      'Debajo, en otra línea: <p>Hola, estoy aprendiendo a hacer páginas web.</p>',
      'Pulsa «Ver en web» (el botón bajo el editor) para que la vista previa se actualice.',
    ],
    setupFiles: { html: L1_HTML, css: '', js: '' },
    curiosity:
      'La primera página web de la historia, creada por Tim Berners-Lee en 1991, sigue online en info.cern.ch — y usa etiquetas casi idénticas a las que acabas de escribir.',
  },
  {
    id: 'm1-l2',
    title: 'Subtítulos y listas',
    description: [
      'Los títulos tienen jerarquía: `<h1>` es el más importante y de ahí baja hasta `<h6>`. Para dividir tu página en secciones usarás sobre todo `<h2>`, el subtítulo.',
      'Para enumerar cosas existe la lista: `<ul>` marca dónde empieza y dónde acaba, y dentro cada elemento va en su propia etiqueta `<li>`. Fíjate en que unas etiquetas viven dentro de otras: se llama anidar, y es la base de todo HTML.',
      'Añade debajo de tu párrafo un `<h2>` (por ejemplo «Mis habilidades») y, a continuación, una `<ul>` con al menos 3 `<li>`. Recuerda pulsar «Ver en web».',
    ].join('\n\n'),
    objectives: [
      { label: 'Añade un subtítulo <h2>', validate: textNotEmpty('h2') },
      { label: 'Crea una lista <ul> con al menos 3 elementos <li>', validate: minCount('ul li', 3) },
    ],
    hints: [
      'El subtítulo funciona igual que el h1: <h2>Mis habilidades</h2>',
      'La lista entera va entre <ul> y </ul>; cada elemento, entre <li> y </li>.',
      '<ul> <li>HTML</li> <li>CSS</li> <li>JavaScript</li> </ul>',
    ],
    setupFiles: { html: L2_HTML, css: '', js: '' },
    curiosity:
      '<ul> tiene una hermana, <ol> (ordered list), que numera los elementos automáticamente: si insertas uno nuevo en medio, el navegador renumera el resto por ti. Se usa para rankings, recetas, instrucciones… cualquier cosa donde el orden importe.',
  },
  {
    id: 'm1-l3',
    title: 'Enlaces: el corazón de la web',
    description: [
      'Lo que convierte un documento en una página web de verdad son los enlaces: texto que, al pulsarlo, te lleva a otra página. Se crean con la etiqueta `<a>`.',
      'Aquí aparece algo nuevo: los atributos, información extra que se escribe dentro de la etiqueta de apertura con la forma `nombre="valor"`. El atributo `href` de `<a>` guarda la dirección de destino: `<a href="https://ejemplo.com">Púlsame</a>`. El texto entre las etiquetas es lo que se ve; el `href`, adónde lleva.',
      'Añade al final de tu página un enlace a tu web favorita. Escribe la dirección completa, empezando por `https://`.',
    ].join('\n\n'),
    objectives: [
      { label: 'Añade un enlace <a> con su atributo href', validate: attrNotEmpty('a', 'href') },
      { label: 'El enlace tiene un texto visible que pulsar', validate: textNotEmpty('a') },
    ],
    hints: [
      'La dirección va dentro de la etiqueta de apertura: <a href="...">',
      '<a href="https://developer.mozilla.org">Mi web favorita</a>',
      'En la vista previa, tu enlace se abre en una pestaña nueva al hacerle clic.',
    ],
    setupFiles: { html: L3_HTML, css: '', js: '' },
    curiosity:
      'La «a» de <a> viene de "anchor" (ancla), y href significa "hypertext reference". El hipertexto — texto con enlaces a otros textos — da nombre a casi todo: HTML es HyperText Markup Language, y el HTTP de las direcciones, HyperText Transfer Protocol.',
  },
  {
    id: 'm1-l4',
    title: 'Imágenes',
    description: [
      'Las imágenes se insertan con `<img>`, una etiqueta especial: no envuelve contenido, así que no tiene etiqueta de cierre. Toda su información va en atributos.',
      'Necesita dos: `src` (source), la dirección del archivo de imagen, y `alt` (texto alternativo), una frase que describe qué se ve. El `alt` no es adorno: es lo que escuchan las personas que usan lector de pantalla y lo que se muestra si la imagen no carga.',
      'Añade una imagen a tu página. Si no tienes ninguna a mano, usa `https://picsum.photos/200/120`, un servicio que devuelve una foto de ejemplo.',
    ].join('\n\n'),
    objectives: [
      { label: 'Añade una imagen <img> con su atributo src', validate: attrNotEmpty('img', 'src') },
      { label: 'Descríbela con el atributo alt', validate: attrNotEmpty('img', 'alt') },
    ],
    hints: [
      'Todo va en una sola etiqueta: <img src="..." alt="..." />',
      '<img src="https://picsum.photos/200/120" alt="Una foto de ejemplo" />',
    ],
    setupFiles: { html: L4_HTML, css: '', js: '' },
    curiosity:
      'El atributo alt no es un detalle menor: los lectores de pantalla que usan las personas ciegas lo leen en voz alta en lugar de la imagen, y los buscadores lo usan para saber de qué trata. Una imagen sin alt es, para mucha gente, una imagen que no existe.',
  },
  {
    id: 'm1-l5',
    title: 'Cómo se enlaza una hoja de estilos',
    description: [
      'Tu página ya tiene estructura, pero el aspecto — colores, tamaños, tipografías — es el que trae el navegador de serie. De cambiarlo se encarga otro lenguaje: CSS. En la próxima lección lo escribirás; en esta aprenderás cómo se conecta con tu HTML.',
      'En un proyecto real el CSS vive en su propio archivo (por ejemplo `styles.css`) y el HTML lo enlaza con la etiqueta `<link rel="stylesheet" href="styles.css">`. Sin esa línea, el navegador ni se entera de que tu CSS existe.',
      'En JSPlay lo que escribas en la pestaña CSS se aplica solo — el editor pone ese enlace por ti — pero fuera de aquí tendrás que escribirlo tú. Añádelo ahora a tu HTML para que se te quede grabado.',
    ].join('\n\n'),
    objectives: [
      {
        label: 'Enlaza una hoja de estilos externa con <link>',
        validate: attrNotEmpty('link[rel="stylesheet"]', 'href'),
      },
    ],
    hints: [
      'La etiqueta <link> no tiene cierre y suele ir al principio del documento.',
      '<link rel="stylesheet" href="styles.css">',
      'No verás ningún cambio en la vista previa — apunta a un archivo que aquí no existe — pero el objetivo se marcará igualmente.',
    ],
    setupFiles: { html: L5_HTML, css: '', js: '' },
    curiosity:
      'El atributo rel viene de "relationship": describe qué relación tiene el documento enlazado con la página actual. "stylesheet" no es la única opción — rel="icon" define el favicon de la pestaña, y rel="canonical" le dice a los buscadores cuál es la URL "oficial" cuando la misma página existe en varias direcciones.',
  },
  {
    id: 'm1-l6',
    title: 'Tus primeras reglas CSS',
    description: [
      'El CSS funciona con reglas, y cada regla tiene dos partes: un selector, que dice a qué elementos afecta, y entre llaves una lista de propiedades con sus valores. Así: `body { background-color: black; }` significa «al elemento body, ponle fondo negro». Cada propiedad termina en punto y coma.',
      'El selector más simple es el nombre de una etiqueta: `body` selecciona la página entera, `p` todos los párrafos, `h1` el título.',
      'Ve a la pestaña CSS y dale a tu página un color de fondo con `background-color` y un color de letra con `color`. Puedes usar nombres en inglés (`black`, `tomato`, `lightblue`) o códigos como `#1e1e2f`.',
    ].join('\n\n'),
    objectives: [
      { label: 'La página (body) tiene un color de fondo', validate: hasBackgroundColor('body') },
      {
        label: 'El texto tiene un color distinto al negro de serie',
        validate: computedStyle('body', 'color', (v) => v !== 'rgb(0, 0, 0)'),
      },
    ],
    hints: [
      'Escribe en la pestaña CSS, no en la de HTML.',
      'body { background-color: #1e1e2f; }',
      'Dentro de las mismas llaves caben más propiedades: body { background-color: #1e1e2f; color: #ebdbb2; }',
    ],
    setupFiles: { html: L6_HTML, css: L6_CSS, js: '' },
    curiosity:
      'CSS entiende 148 colores por su nombre en inglés, de "tomato" a "papayawhip". Uno es especial: "rebeccapurple" (#663399) entró en el estándar en 2014 en memoria de Rebecca Meyer, hija del pionero del CSS Eric Meyer. Era su color favorito.',
  },
  {
    id: 'm1-l7',
    title: 'El modelo de caja',
    description: [
      'Para el CSS, todo elemento es una caja rectangular con capas, de dentro hacia fuera: el contenido, el `padding` (espacio interior alrededor del contenido), el `border` (el borde visible) y el `margin` (espacio exterior que la separa de otras cajas). Es el famoso «modelo de caja», y entenderlo es media asignatura de CSS.',
      'Los tamaños se dan en píxeles: `padding: 12px;` añade 12 píxeles de aire por los cuatro lados, y `border: 3px solid orange;` dibuja un borde naranja de 3 píxeles en línea continua.',
      'Dale `padding` al párrafo y un borde a la imagen, y observa en la vista previa qué cambia con cada regla.',
    ].join('\n\n'),
    objectives: [
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
      'p { padding: 12px; } — prueba a subir y bajar el número y compara.',
      'img { border: 3px solid orange; }',
      'El borde admite otros estilos: dashed (a rayas) o dotted (a puntos).',
    ],
    setupFiles: { html: L7_HTML, css: L7_CSS, js: '' },
    curiosity:
      'Por defecto, el ancho de una caja en CSS NO incluye su padding ni su borde: se suman aparte. Por eso a veces un elemento con padding "se sale" de su contenedor — la propiedad box-sizing: border-box, usadísima en la práctica, cambia esa regla para que todo encaje como uno espera.',
  },
  {
    id: 'm1-l8',
    title: 'Coloca elementos con Flexbox',
    description: [
      'Por defecto el navegador apila los elementos uno debajo de otro. Para ponerlos en fila — un menú, una galería, una barra de botones — existe Flexbox.',
      'Se activa en el contenedor, es decir, en la etiqueta que envuelve lo que quieres colocar: al darle `display: flex`, sus hijos directos se ponen en fila. Con `gap` controlas la separación entre ellos.',
      'Tu página trae un `<nav class="menu">` con tres enlaces, uno debajo de otro. Fíjate en el atributo `class`: le da un nombre al elemento, y en CSS se selecciona con un punto delante: `.menu`. Conviértelo en una barra horizontal con separación entre los enlaces.',
    ].join('\n\n'),
    objectives: [
      {
        label: 'El menú tiene al menos 3 elementos dentro',
        validate: minCount('.menu > *', 3),
      },
      {
        label: 'Aplica display: flex al contenedor .menu',
        validate: computedStyle('.menu', 'display', 'flex'),
      },
      {
        label: 'Añade separación entre los enlaces con gap',
        validate: computedStyle('.menu', 'columnGap', (v) => v !== '0px' && v !== 'normal'),
      },
    ],
    hints: [
      'Las reglas van sobre el contenedor, que es una clase: .menu { ... } (con el punto).',
      '.menu { display: flex; }',
      '.menu { display: flex; gap: 16px; }',
    ],
    setupFiles: { html: L8_HTML, css: L8_CSS, js: '' },
    curiosity:
      'Antes de que Flexbox se estandarizara (2009-2017), centrar una caja verticalmente en CSS era tan incordio que se convirtió en un chiste recurrente entre desarrolladores web. Con Flexbox, se resuelve con una sola línea: align-items: center.',
  },
  {
    id: 'm1-l9',
    title: 'Tipografía y toque final',
    description: [
      'Última capa de pintura. La propiedad `font-family` cambia la tipografía y se escribe como una lista de opciones separadas por comas: si la primera fuente no está instalada en el ordenador del visitante, el navegador prueba la siguiente. El `sans-serif` final significa «cualquier fuente sin remates que tengas».',
      'Y `border-radius` redondea las esquinas de una caja: cuanto mayor el valor, más redondas.',
      'Remata tu página: tipografía para todo el `body`, un color propio para el `<h1>` y esquinas redondeadas para la imagen. Al terminar habrás maquetado tu primera página web completa. 🎉',
    ].join('\n\n'),
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
    setupFiles: { html: L9_HTML, css: L9_CSS, js: '' },
    curiosity:
      'Hasta la llegada de border-radius con CSS3 (hacia 2010), conseguir esquinas redondeadas en la web implicaba recortar imágenes de fondo a medida para cada caja — un hack tan extendido que tenía nombre propio: "sliding doors".',
  },
];
