// Módulo 3 — Proyecto: tu web completa (nivel medio, 10 lecciones)
// Un proyecto guiado de principio a fin: una web personal con estructura
// semántica, layout con Grid, diseño responsive, tema claro/oscuro, datos
// renderizados desde JavaScript, formulario y persistencia. Cada lección
// es una fase del proyecto y asume el nivel básico terminado.
//
// Las descripciones se renderizan con <RichText>: párrafos separados por
// línea en blanco y código entre acentos graves (`así`).

import {
  hasElement,
  minCount,
  computedStyle,
  sourceIncludes,
  noErrors,
} from '../_helpers';
import {
  L1_HTML,
  L1_CSS,
  L2_HTML,
  L2_CSS,
  L3_HTML,
  L3_CSS,
  L4_HTML,
  L4_CSS,
  L5_HTML,
  L5_CSS,
  L6_HTML,
  L6_CSS,
  L6_JS,
  L7_HTML,
  L7_CSS,
  L7_JS,
  L8_HTML,
  L8_CSS,
  L8_JS,
  L9_HTML,
  L9_CSS,
  L9_JS,
  L10_HTML,
  L10_CSS,
  L10_JS,
} from './fixtures';

export const module3 = [
  {
    id: 'm3-l1',
    title: 'Estructura semántica',
    description: [
      'Bienvenido al proyecto del nivel medio: vas a construir tu web personal completa, fase a fase. La primera es darle un esqueleto de verdad.',
      'Hasta ahora apilabas etiquetas sueltas. Las páginas reales se organizan con etiquetas semánticas: `<header>` para la cabecera (título, menú), `<main>` para el contenido principal y `<footer>` para el pie. No cambian el aspecto — cambian el significado: lectores de pantalla y buscadores las usan para entender tu página.',
      'El contenido ya está en el HTML, pero plano. Envuelve el título y el menú en un `<header>`, la sección en un `<main>` y la última línea en un `<footer>`.',
    ].join('\n\n'),
    objectives: [
      { label: 'El título y el menú viven en un <header>', validate: hasElement('header nav') },
      { label: 'El contenido está dentro de <main>', validate: hasElement('main section') },
      { label: 'La página termina con un <footer>', validate: hasElement('footer p') },
    ],
    hints: [
      'Las etiquetas semánticas envuelven bloques enteros: <header> ... </header>.',
      'Dentro del header van el <h1> y el <nav> completos.',
      '<main> <section id="inicio">...</section> </main>, y el último <p> entre <footer> y </footer>.',
    ],
    setupFiles: { html: L1_HTML, css: L1_CSS, js: '' },
    curiosity:
      'Antes de HTML5 (2014) todo se construía con <div> anónimos, y la estructura solo estaba en la cabeza del programador. Las etiquetas semánticas nacieron de estudiar millones de páginas reales: header, footer y nav eran los nombres de clase más usados del mundo.',
  },
  {
    id: 'm3-l2',
    title: 'Un contenedor centrado',
    description: [
      'Las líneas de texto muy anchas son incómodas de leer. Por eso casi toda web real limita el ancho de su contenido y lo centra: fíjate en cualquier blog o documentación.',
      'La receta clásica lleva dos propiedades: `max-width` fija un ancho máximo (la caja puede encoger, pero no pasar de ahí) y `margin: 0 auto` reparte el espacio sobrante a partes iguales entre izquierda y derecha — `auto` significa «calcúlalo tú».',
      'Aplícale las dos al `<main>` de tu página y estira la vista previa para ver el efecto.',
    ].join('\n\n'),
    objectives: [
      {
        label: 'El <main> tiene un ancho máximo con max-width',
        validate: computedStyle('main', 'maxWidth', (v) => v !== 'none'),
      },
      {
        label: 'Está centrado con margin auto',
        validate: sourceIncludes('css', /main\s*{[^}]*margin\s*:[^;}]*auto/i),
      },
    ],
    hints: [
      'El selector es la etiqueta: main { ... }',
      'main { max-width: 640px; }',
      'main { max-width: 640px; margin: 0 auto; } — el 0 es el margen vertical, auto el horizontal.',
    ],
    setupFiles: { html: L2_HTML, css: L2_CSS, js: '' },
    curiosity:
      'La tipografía lleva siglos con esta regla: una línea cómoda ronda los 45-75 caracteres. Los diseñadores web la heredaron de los libros — por eso tantos sitios usan un max-width de entre 600 y 800 píxeles para el texto.',
  },
  {
    id: 'm3-l3',
    title: 'Una galería con CSS Grid',
    description: [
      'Tu web ya tiene una sección de proyectos con tres tarjetas, pero apiladas. Para colocar cajas en dos dimensiones — filas Y columnas a la vez — existe CSS Grid, el hermano mayor de Flexbox.',
      'Se activa en el contenedor con `display: grid`, y las columnas se declaran con `grid-template-columns`. La forma más común: `repeat(2, 1fr)` significa «2 columnas que se reparten el espacio a partes iguales» (`fr` = fracción). El `gap` que ya conoces de Flexbox funciona igual.',
      'Convierte `.galeria` en una cuadrícula de 2 columnas con separación entre tarjetas.',
    ].join('\n\n'),
    objectives: [
      {
        label: 'La galería usa display: grid',
        validate: computedStyle('.galeria', 'display', 'grid'),
      },
      {
        label: 'Tiene al menos 2 columnas con grid-template-columns',
        validate: computedStyle('.galeria', 'gridTemplateColumns', (v) => v.split(' ').length >= 2),
      },
      {
        label: 'Hay separación entre tarjetas con gap',
        validate: computedStyle('.galeria', 'columnGap', (v) => v !== '0px' && v !== 'normal'),
      },
    ],
    hints: [
      '.galeria { display: grid; }',
      '.galeria { display: grid; grid-template-columns: repeat(2, 1fr); }',
      'Añade gap: 16px; dentro de las mismas llaves.',
    ],
    setupFiles: { html: L3_HTML, css: L3_CSS, js: '' },
    curiosity:
      'CSS Grid tardó 21 años en llegar: se propuso por primera vez en 1996 y no aterrizó en los navegadores hasta 2017. Lo desbloqueó un empujón inusual: Microsoft, Google y Mozilla lo lanzaron casi a la vez, coordinados, para que nadie se quedara atrás.',
  },
  {
    id: 'm3-l4',
    title: 'Hover y transiciones',
    description: [
      'Una web se siente viva cuando responde al usuario. La pseudo-clase `:hover` aplica estilos solo mientras el ratón está encima de un elemento: `.tarjeta:hover { ... }`.',
      'Pero un cambio instantáneo queda brusco. La propiedad `transition` lo suaviza animando el cambio: `transition: transform 0.2s;` significa «cuando cambie transform, tarda 0.2 segundos en llegar». Ojo: la transition se pone en el estado normal, no dentro del :hover.',
      'Haz que las tarjetas reaccionen al ratón — por ejemplo elevándose con `transform: translateY(-4px)` — con una transición suave. Pasa el ratón por la vista previa para probarlo.',
    ].join('\n\n'),
    objectives: [
      {
        label: 'Las tarjetas tienen un estado :hover',
        validate: sourceIncludes('css', /\.tarjeta\s*:hover\s*{/i),
      },
      {
        label: 'El cambio se anima con transition',
        validate: computedStyle('.tarjeta', 'transitionDuration', (v) => v !== '0s'),
      },
    ],
    hints: [
      'Son dos reglas: .tarjeta { transition: ... } y .tarjeta:hover { ... }',
      '.tarjeta:hover { transform: translateY(-4px); }',
      '.tarjeta { transition: transform 0.2s; } — así el movimiento es suave en ambos sentidos.',
    ],
    setupFiles: { html: L4_HTML, css: L4_CSS, js: '' },
    curiosity:
      'El cerebro percibe como "instantáneo" cualquier cambio por debajo de ~100 ms, y como "lento" lo que pasa de ~400 ms. Por eso casi todas las transiciones de interfaz del mundo duran entre 150 y 300 milisegundos: el punto justo entre brusco y perezoso.',
  },
  {
    id: 'm3-l5',
    title: 'Responsive: tu web en el móvil',
    description: [
      'Más de la mitad del tráfico web viene de móviles, y tu galería de 2 columnas quedaría apretadísima en una pantalla estrecha. La herramienta para adaptarse es la media query.',
      'Una `@media` envuelve reglas que solo se aplican si se cumple una condición: `@media (max-width: 600px) { ... }` significa «solo cuando la pantalla mida 600 píxeles o menos». Dentro puedes sobrescribir cualquier regla anterior.',
      'Añade una media query que, en pantallas estrechas, ponga la galería a una sola columna (`grid-template-columns: 1fr`). Pruébalo estrechando la vista previa con el separador.',
    ].join('\n\n'),
    objectives: [
      {
        label: 'Hay una @media query con max-width',
        validate: sourceIncludes('css', /@media[^{]*\(\s*max-width/i),
      },
      {
        label: 'Dentro, la galería pasa a una columna',
        validate: sourceIncludes('css', /@media[\s\S]*\.galeria\s*{[^}]*grid-template-columns\s*:\s*1fr/i),
      },
    ],
    hints: [
      'La media query envuelve reglas completas: @media (max-width: 600px) { .galeria { ... } }',
      'Dentro solo necesitas cambiar lo que es distinto: grid-template-columns: 1fr;',
      'Arrastra el separador de la vista previa para hacerla más estrecha que 600px y verás el cambio en directo.',
    ],
    setupFiles: { html: L5_HTML, css: L5_CSS, js: '' },
    curiosity:
      'El término "responsive web design" lo acuñó Ethan Marcotte en un artículo de 2010, inspirado en la arquitectura que responde a sus habitantes. Antes, lo normal era mantener DOS webs: la "de escritorio" y una versión aparte en m.tusitio.com para móviles.',
  },
  {
    id: 'm3-l6',
    title: 'Un botón para cambiar de tema',
    description: [
      'Toca volver a JavaScript, ahora aplicado a tu proyecto. Vas a añadir el clásico interruptor de tema claro/oscuro, que combina todo lo aprendido: HTML (un botón), CSS (los estilos del tema) y JS (reaccionar al clic).',
      'El CSS ya trae reglas para `body.claro`: solo se aplican cuando el body tiene esa clase. La pieza que falta es el evento: `boton.addEventListener("click", ...)` ejecuta una función en cada clic, y `document.body.classList.toggle("claro")` pone la clase si no está y la quita si está.',
      'Añade en el `<header>` un `<button id="tema">` y, en la pestaña script.js, haz que cada clic alterne la clase `claro` del body. Pruébalo en la vista previa.',
    ].join('\n\n'),
    objectives: [
      { label: 'Hay un botón #tema en la cabecera', validate: hasElement('header #tema') },
      {
        label: 'El clic se escucha con addEventListener',
        validate: sourceIncludes('js', /addEventListener\s*\(\s*['"]click['"]/),
      },
      {
        label: 'La clase se alterna con classList.toggle',
        validate: sourceIncludes('js', /classList\.toggle\s*\(\s*['"]claro['"]/),
      },
    ],
    hints: [
      'El botón, en el HTML: <button id="tema">🌓 Tema</button>',
      'Primero selecciónalo: const boton = document.querySelector("#tema");',
      'boton.addEventListener("click", () => { document.body.classList.toggle("claro"); });',
    ],
    setupFiles: { html: L6_HTML, css: L6_CSS, js: L6_JS },
    usesConsole: true,
    curiosity:
      'El modo oscuro es más viejo que el claro: las primeras pantallas de ordenador (fósforo verde o ámbar sobre negro) solo sabían ser oscuras. El fondo blanco llegó en los 80 imitando al papel, para que la informática de oficina resultara familiar.',
  },
  {
    id: 'm3-l7',
    title: 'Tarjetas generadas desde datos',
    description: [
      'Fíjate en la galería: se ha quedado vacía. A propósito — las tres tarjetas ya no van a vivir en el HTML, sino en un array de objetos en JS (`PROYECTOS`), como en una web real donde los datos llegan de una base de datos.',
      'Para pintarlas hace falta crear elementos desde JavaScript: `document.createElement("article")` fabrica la etiqueta, `innerHTML` rellena su interior, y `galeria.appendChild(tarjeta)` la cuelga de la página. Todo dentro de un bucle que recorre el array.',
      'Recorre `PROYECTOS` con un bucle y crea una `.tarjeta` en la galería por cada proyecto, con su título en un `<h3>` y su descripción en un `<p>`. Cuando funcione, añade un cuarto proyecto al array y mira cómo aparece solo.',
    ].join('\n\n'),
    objectives: [
      {
        label: 'La galería muestra al menos 3 tarjetas',
        validate: minCount('.galeria .tarjeta', 3),
      },
      {
        label: 'Se crean con createElement en un bucle',
        validate: async (s) =>
          (await sourceIncludes('js', /for\s*(\(|\s)|forEach/)(s)) &&
          (await sourceIncludes('js', 'createElement')(s)),
      },
      { label: 'Sin errores en la consola', validate: noErrors },
    ],
    hints: [
      'for (const proyecto of PROYECTOS) { ... } recorre el array de uno en uno.',
      'Dentro: const tarjeta = document.createElement("article"); tarjeta.className = "tarjeta";',
      'tarjeta.innerHTML = `<h3>${proyecto.titulo}</h3><p>${proyecto.descripcion}</p>`; y luego galeria.appendChild(tarjeta);',
    ],
    setupFiles: { html: L7_HTML, css: L7_CSS, js: L7_JS },
    usesConsole: true,
    curiosity:
      'Acabas de hacer, en miniatura, lo mismo que hacen React, Vue y compañía: transformar datos en interfaz. Toda la web moderna se apoya en esa idea — los datos mandan, y el HTML se genera a partir de ellos.',
  },
  {
    id: 'm3-l8',
    title: 'Un formulario que responde',
    description: [
      'Tu web ya tiene una sección de contacto con un formulario. Los formularios tienen un comportamiento heredado de los años 90: al enviarse, recargan la página entera. En una web moderna casi siempre quieres impedirlo y responder tú.',
      'El envío dispara el evento `submit` en el `<form>` (no en el botón). La función que lo escucha recibe un objeto evento, y llamar a `evento.preventDefault()` cancela la recarga. A partir de ahí, el valor escrito está en `input.value`.',
      'Escucha el `submit` del formulario, evita la recarga y escribe un saludo con el nombre introducido en el párrafo `#respuesta`.',
    ].join('\n\n'),
    objectives: [
      {
        label: 'Se escucha el evento submit del formulario',
        validate: sourceIncludes('js', /addEventListener\s*\(\s*['"]submit['"]/),
      },
      {
        label: 'La recarga se evita con preventDefault()',
        validate: sourceIncludes('js', 'preventDefault()'),
      },
      { label: 'Sin errores en la consola', validate: noErrors },
    ],
    hints: [
      'formulario.addEventListener("submit", (evento) => { ... });',
      'La primera línea dentro: evento.preventDefault();',
      'const nombre = document.querySelector("#nombre").value; y escríbelo con textContent en #respuesta.',
    ],
    setupFiles: { html: L8_HTML, css: L8_CSS, js: L8_JS },
    usesConsole: true,
    curiosity:
      'Ese "recargar al enviar" no es un capricho: en la web original el servidor generaba una página nueva con cada envío. AJAX (2005) permitió enviar datos sin recargar, y de ahí nacieron Gmail y la web moderna — todo empieza con un preventDefault().',
  },
  {
    id: 'm3-l9',
    title: 'Recordar al visitante: localStorage',
    description: [
      'Si eliges el tema claro y recargas la página… vuelve el oscuro. JavaScript olvida todo entre visitas. Para recordar existe `localStorage`: un pequeño almacén de pares clave-valor que el navegador guarda por sitio web, sin caducidad.',
      'Dos operaciones: `localStorage.setItem("tema", "claro")` guarda, y `localStorage.getItem("tema")` devuelve lo guardado (o `null` si no hay nada). Solo guarda textos.',
      'Haz que el botón de tema guarde la elección, y que al cargar la página se lea y se aplique. Comprueba que funciona pulsando «Ver en web» tras cambiar el tema: la elección debería sobrevivir.',
    ].join('\n\n'),
    objectives: [
      {
        label: 'La elección se guarda con localStorage.setItem',
        validate: sourceIncludes('js', /localStorage\.setItem\s*\(/),
      },
      {
        label: 'Al cargar se lee con localStorage.getItem',
        validate: sourceIncludes('js', /localStorage\.getItem\s*\(/),
      },
      { label: 'Sin errores en la consola', validate: noErrors },
    ],
    hints: [
      'Dentro del clic, tras el toggle: guarda "claro" u "oscuro" según document.body.classList.contains("claro").',
      'localStorage.setItem("tema", document.body.classList.contains("claro") ? "claro" : "oscuro");',
      'Al principio del archivo: if (localStorage.getItem("tema") === "claro") { document.body.classList.add("claro"); }',
    ],
    setupFiles: { html: L9_HTML, css: L9_CSS, js: L9_JS },
    usesConsole: true,
    curiosity:
      'Antes de localStorage (2009) la única memoria del navegador eran las cookies: unos 4 KB que además viajaban al servidor en CADA petición. localStorage da unos 5 MB que se quedan en tu máquina — mil veces más espacio, cero equipaje.',
  },
  {
    id: 'm3-l10',
    title: 'Pulido final',
    description: [
      'Última fase del proyecto. Los detalles que separan un ejercicio de una web terminada suelen ser pequeños: profundidad, suavidad, remates.',
      'Tres propiedades para rematar: `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);` da a las tarjetas una sombra con desplazamiento, desenfoque y un color semitransparente; `border-radius` ya lo conoces; y `scroll-behavior: smooth` en `html` hace que los enlaces del menú (que apuntan a #secciones) se desplacen con suavidad en vez de saltar.',
      'Aplica las tres, prueba los enlaces del menú y contempla tu obra: una web con semántica, Grid, responsive, tema, datos y memoria. Hecha por ti, línea a línea. 🎉',
    ].join('\n\n'),
    objectives: [
      {
        label: 'Las tarjetas tienen sombra con box-shadow',
        validate: computedStyle('.tarjeta', 'boxShadow', (v) => v !== 'none'),
      },
      {
        label: 'Y esquinas redondeadas con border-radius',
        validate: computedStyle('.tarjeta', 'borderRadius', (v) => v !== '0px'),
      },
      {
        label: 'La página se desplaza suave con scroll-behavior',
        validate: sourceIncludes('css', /scroll-behavior\s*:\s*smooth/i),
      },
    ],
    hints: [
      '.tarjeta { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); border-radius: 8px; }',
      'El scroll suave va en el elemento raíz: html { scroll-behavior: smooth; }',
      'Prueba los enlaces del menú en la vista previa: ahora se deslizan hasta cada sección.',
    ],
    setupFiles: { html: L10_HTML, css: L10_CSS, js: L10_JS },
    curiosity:
      'Las sombras de las interfaces modernas imitan una física concreta: Material Design (Google, 2014) definió la pantalla como hojas de papel a distintas alturas bajo una luz cenital. Cuanto más "elevado" un elemento, más grande y difusa su sombra — igual que en tu escritorio.',
  },
];
