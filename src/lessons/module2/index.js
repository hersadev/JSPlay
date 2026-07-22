// Módulo 2 — Dale vida con JavaScript (14 lecciones)
// Cada lección arranca con su propia mini página y presenta un único
// concepto nuevo: consola, variables, booleanos, condicionales, funciones,
// parámetros, arrays, bucles, objetos, métodos, y por último leer y
// modificar el DOM y reaccionar a eventos. Pensado para quien nunca ha
// programado: las descripciones explican cada idea desde cero.
//
// `usesConsole: true` marca las lecciones cuyo resultado se ve en el panel
// de Consola: en ellas la consola se abre sola (ver App).

import {
  attrNotEmpty,
  globalIsFunction,
  callFunction,
  consoleHasType,
  consoleHasValue,
  consoleCountAtLeast,
  sourceIncludes,
  tagInSection,
} from '../_helpers';
import {
  L1_HTML,
  L2_HTML,
  L2_JS,
  L3_HTML,
  L3_JS,
  L4_HTML,
  L4_JS,
  L5_HTML,
  L5_JS,
  L6_HTML,
  L6_JS,
  L7_HTML,
  L7_JS,
  L8_HTML,
  L8_JS,
  L9_HTML,
  L9_JS,
  L10_HTML,
  L10_JS,
  L11_HTML,
  L11_JS,
  L12_HTML,
  L12_JS,
  L13_HTML,
  L13_JS,
  L14_HTML,
  L14_CSS,
  L14_JS,
} from './fixtures';

export const module2 = [
  {
    id: 'm2-l1',
    title: 'Cómo se enlaza un script',
    description: [
      'Con HTML y CSS tu página se ve bien, pero no hace nada: no reacciona, no calcula, no cambia. Para eso está JavaScript, el tercer lenguaje de la web y el primero «de programación» que vas a usar: sirve para darle instrucciones al navegador.',
      'Igual que el CSS, el JavaScript vive en su propio archivo (`script.js`) y el HTML tiene que enlazarlo, esta vez con la etiqueta `<script src="script.js"></script>`, normalmente justo antes de cerrar `</body>` — no en el `<head>`, como el `<link>` del CSS: un script se coloca al final para que el navegador termine de construir la página antes de ejecutarlo.',
      'En JSPlay la pestaña script.js se ejecuta sola — el editor enlaza ese archivo por ti — pero fuera de aquí esta etiqueta es imprescindible. Añádela dentro del `<body>`, justo antes de `</body>`.',
    ].join('\n\n'),
    objectives: [
      {
        label: 'Enlaza un script externo con <script src> al final del <body>',
        validate: async (s) =>
          (await attrNotEmpty('script[src]', 'src')(s)) &&
          (await tagInSection(/<script\b[^>]*\bsrc=/i, 'body')(s)),
        warn: async (s) => {
          if (!(await attrNotEmpty('script[src]', 'src')(s))) return null;
          if (await tagInSection(/<script\b[^>]*\bsrc=/i, 'body')(s)) return null;
          return 'Tu <script src> está fuera de <body>. Muévelo dentro, justo antes de </body>.';
        },
      },
    ],
    hints: [
      '<script src="script.js"></script>',
      'Va dentro de <body>, en la última línea, justo antes de </body>.',
      'Esta etiqueta no cambia nada aquí — apunta a un archivo que no existe en este editor — pero el objetivo se marcará igualmente, siempre que esté en el sitio correcto.',
    ],
    setupFiles: { html: L1_HTML, css: '', js: '' },
    curiosity:
      'Colocar el <script> justo antes de cerrar </body> no es capricho: si el navegador se topa con un <script> mientras aún está leyendo el HTML, para de construir la página hasta que termina de descargarlo y ejecutarlo — por eso ponerlo al final (o usar el atributo defer) evita que la página se quede en blanco mientras carga el JavaScript.',
  },
  {
    id: 'm2-l2',
    title: 'Tu primer mensaje en la consola',
    usesConsole: true,
    description: [
      'Programar es escribir instrucciones que el ordenador ejecuta en orden, de arriba abajo. Tu primera instrucción: `console.log()`, que muestra un mensaje en la consola — el panel que se acaba de abrir ahí abajo. Los programadores la usan a todas horas para ver qué pasa dentro de su programa.',
      'Lo que pongas entre los paréntesis es lo que se muestra. Si es texto, va entre comillas: `console.log("Hola")`. Si es un número, va sin comillas: `console.log(42)`. Para el ordenador, texto y números son cosas distintas.',
      'Escribe en la pestaña script.js un `console.log()` con un saludo y otro con tu número favorito, y pulsa «Ver en web» para ejecutarlos.',
    ].join('\n\n'),
    objectives: [
      { label: 'Muestra un texto (entre comillas) en la consola', validate: consoleHasType('string') },
      { label: 'Muestra un número (sin comillas) en la consola', validate: consoleHasType('number') },
    ],
    hints: [
      'console.log("¡Hola, mundo!");',
      'Debajo, en otra línea: console.log(7);',
      'El código se ejecuta al pulsar «Ver en web»; el resultado aparece en el panel Consola, abajo.',
    ],
    setupFiles: { html: L2_HTML, css: '', js: L2_JS },
    curiosity:
      'JavaScript se creó en solo 10 días en mayo de 1995, obra de Brendan Eich en Netscape. Iba a llamarse Mocha, luego LiveScript, y acabó llamándose JavaScript por una decisión de marketing para aprovechar la fama de Java — aunque los dos lenguajes apenas tienen relación entre sí.',
  },
  {
    id: 'm2-l3',
    title: 'Variables: cajas con nombre',
    usesConsole: true,
    description: [
      'Una variable es una caja con nombre donde guardas un valor para usarlo después. Se crea con la palabra `let`: `let edad = 30;`. A partir de ahí, escribir `edad` vale tanto como escribir `30`. Si el valor no va a cambiar nunca, se declara con `const` (de constante) en vez de `let`.',
      'El nombre lo eliges tú, sin espacios ni tildes. El valor puede ser un texto (entre comillas) o un número. Ojo con la diferencia: `nombre` es una variable, pero `"nombre"` es el texto literal nombre.',
      'Crea una variable con tu nombre y otra con tu edad, y muéstralas con `console.log()`. Fíjate: al pasarle una variable sin comillas, la consola muestra su valor.',
    ].join('\n\n'),
    objectives: [
      { label: 'Declara variables con let o const', validate: sourceIncludes('js', /\b(let|const)\b/) },
      { label: 'Muestra en consola una variable con texto', validate: consoleHasType('string') },
      { label: 'Muestra en consola una variable con un número', validate: consoleHasType('number') },
    ],
    hints: [
      'let nombre = "Ana";',
      'console.log(nombre); — sin comillas: quieres su valor, no la palabra nombre.',
      'let edad = 25; console.log(edad);',
    ],
    setupFiles: { html: L3_HTML, css: '', js: L3_JS },
    curiosity:
      'Como los nombres de variable no admiten espacios, en JavaScript se pegan las palabras poniendo mayúscula al empezar cada una nueva: miColorFavorito, puntosDelJugador. El estilo se llama camelCase, por las jorobas de camello que dibujan las mayúsculas. 🐫',
  },
  {
    id: 'm2-l4',
    title: 'Compara valores: verdadero o falso',
    usesConsole: true,
    description: [
      'Además de textos y números existe un tercer tipo de valor con solo dos posibilidades: `true` (verdadero) y `false` (falso). Se llama booleano, y es como el programa responde preguntas de sí o no.',
      'Las preguntas se hacen con operadores de comparación: `>` (mayor que), `<` (menor que), `>=` (mayor o igual), `===` (¿es exactamente igual?), `!==` (¿es distinto?). Toda comparación produce un booleano: `5 > 3` vale `true`, y `edad === 18` vale `true` solo si la variable edad guarda un 18.',
      'Declara una variable `edad` y muestra en consola el resultado de compararla con 18. Cambia luego su valor y ejecuta otra vez: la respuesta cambia sola.',
    ].join('\n\n'),
    objectives: [
      {
        label: 'Usa un operador de comparación (>, <, >=, ===…)',
        validate: sourceIncludes('js', /[<>]=?|===|!==/),
      },
      { label: 'Muestra en consola el resultado (true o false)', validate: consoleHasType('boolean') },
    ],
    hints: [
      'let edad = 16;',
      'console.log(edad >= 18); — la consola mostrará true o false.',
      'Cambia el valor de edad y vuelve a pulsar «Ver en web»: el resultado cambia.',
    ],
    setupFiles: { html: L4_HTML, css: '', js: L4_JS },
    curiosity:
      'Los booleanos se llaman así por George Boole, un matemático inglés del siglo XIX que inventó un álgebra donde todo se reduce a verdadero o falso. Murió en 1864, décadas antes del primer ordenador — sin sospechar que su idea acabaría dentro de todos ellos.',
  },
  {
    id: 'm2-l5',
    title: 'Toma decisiones con if y else',
    usesConsole: true,
    description: [
      'Aquí los programas empiezan a decidir: `if` ejecuta un bloque de código solo si una condición es verdadera. La condición va entre paréntesis y el código entre llaves: `if (edad >= 18) { ... }`.',
      'Puedes añadir un plan B con `else`: su bloque se ejecuta cuando la condición es falsa. De los dos caminos siempre se ejecuta uno, y solo uno.',
      'Usa tu variable `edad` para mostrar en consola «Eres mayor de edad» o «Eres menor de edad», según su valor. Prueba a cambiar el número y ejecutar de nuevo: debería salir el otro mensaje.',
    ].join('\n\n'),
    objectives: [
      { label: 'Escribe una condición con if', validate: sourceIncludes('js', /if\s*\(/) },
      { label: 'Añade el camino alternativo con else', validate: sourceIncludes('js', /\belse\b/) },
      { label: 'Muestra en consola el mensaje que toque', validate: consoleHasType('string') },
    ],
    hints: [
      'let edad = 16;',
      'if (edad >= 18) { console.log("Eres mayor de edad"); }',
      'Justo después de la llave de cierre: else { console.log("Eres menor de edad"); }',
    ],
    setupFiles: { html: L5_HTML, css: '', js: L5_JS },
    curiosity:
      'En JavaScript, "5" == 5 da true, pero "5" === 5 da false: el doble igual convierte los tipos antes de comparar, y el triple igual no. Por eso casi todas las guías de estilo recomiendan usar siempre === para evitar sorpresas.',
  },
  {
    id: 'm2-l6',
    title: 'Tu primera función',
    usesConsole: true,
    description: [
      'Una función es un trozo de código con nombre que puedes ejecutar tantas veces como quieras. Se define una vez con la palabra `function`, y sus llaves guardan el código: `function saludar() { ... }`. Definirla no la ejecuta: para eso hay que llamarla, escribiendo su nombre con paréntesis: `saludar()`.',
      'Dentro, la palabra `return` indica qué resultado devuelve la función a quien la llamó. En cuanto un `return` se ejecuta, la función termina.',
      'Define una función `saludar` que devuelva un saludo, y muestra en consola el resultado de llamarla.',
    ].join('\n\n'),
    objectives: [
      { label: 'Define una función llamada saludar', validate: globalIsFunction('saludar') },
      {
        label: 'La función devuelve un texto con return',
        validate: callFunction('saludar', [], (r) => typeof r === 'string' && r.trim().length > 0),
      },
      { label: 'Llámala y muestra el resultado en consola', validate: consoleHasType('string') },
    ],
    hints: [
      'Usa exactamente el nombre saludar, con la palabra function delante.',
      'function saludar() { return "¡Hola!"; }',
      'console.log(saludar()); — los paréntesis son los que la ejecutan.',
    ],
    setupFiles: { html: L6_HTML, css: '', js: L6_JS },
    curiosity:
      'Una función declarada con "function nombre(){}" queda disponible en todo su ámbito desde el principio (hoisting): puedes llamarla en una línea anterior a donde la escribiste, porque el motor ya la registró entera al leer el archivo.',
  },
  {
    id: 'm2-l7',
    title: 'Funciones con parámetros',
    usesConsole: true,
    description: [
      'Las funciones se vuelven útiles de verdad cuando aceptan datos. Un parámetro es una variable que se declara entre los paréntesis de la función: `function saludar(nombre) { ... }`. Al llamarla le pasas el valor concreto — `saludar("Ada")` — y, dentro de la función, `nombre` vale `"Ada"`.',
      'Así la misma función produce resultados distintos según lo que le pases: esa es la gracia de escribir el código una sola vez.',
      'Mejora tu función `saludar` para que reciba un nombre y lo incluya en el saludo que devuelve. Los textos se pegan con el signo `+`: `"Hola, " + nombre`.',
    ].join('\n\n'),
    objectives: [
      {
        label: 'saludar recibe un nombre y lo usa en el saludo (pruébala con varios)',
        validate: async (s) =>
          (await callFunction('saludar', ['Ada'], (r) => typeof r === 'string' && r.includes('Ada'))(s)) &&
          (await callFunction('saludar', ['Leo'], (r) => typeof r === 'string' && r.includes('Leo'))(s)),
      },
      { label: 'Llámala con un nombre y muestra el resultado', validate: consoleHasType('string') },
    ],
    hints: [
      'function saludar(nombre) { return "Hola, " + nombre + "!"; }',
      'console.log(saludar("Ada"));',
      'Llámala dos veces con nombres distintos: mismo código, saludos diferentes.',
    ],
    setupFiles: { html: L7_HTML, css: '', js: L7_JS },
    curiosity:
      'Aunque casi todo el mundo los mezcla, tienen nombre distinto: parámetro es la variable de la definición (nombre) y argumento es el valor real que pasas al llamar ("Ada"). Un truco: el parámetro es el hueco; el argumento, lo que lo rellena.',
  },
  {
    id: 'm2-l8',
    title: 'Arrays: listas de valores',
    usesConsole: true,
    description: [
      'Un array es una lista ordenada de valores guardada en una sola variable. Se escribe entre corchetes, separando los valores con comas: `let colores = ["rojo", "verde", "azul"];`.',
      'Cada elemento ocupa una posición numerada — ¡empezando por 0! — a la que accedes con corchetes: `colores[0]` es `"rojo"`. Además, todo array trae herramientas incorporadas: `.push()` añade un elemento al final y `.length` dice cuántos hay.',
      'Crea un array con al menos 3 elementos y muéstralo en consola; después añade uno más con `.push()` y muéstralo otra vez para ver la diferencia.',
    ].join('\n\n'),
    objectives: [
      { label: 'Muestra un array en la consola', validate: consoleHasType('array') },
      {
        label: 'El array tiene al menos 3 elementos',
        validate: consoleHasValue((raw, type) => type === 'array' && JSON.parse(raw).length >= 3),
      },
      {
        label: 'Añade otro con push() y muestra el array de nuevo',
        validate: async (s) =>
          (await sourceIncludes('js', /\.push\(/)(s)) &&
          (await consoleHasValue((raw, type) => type === 'array' && JSON.parse(raw).length >= 4)(s)),
      },
    ],
    hints: [
      'let colores = ["rojo", "verde", "azul"];',
      'console.log(colores);',
      'colores.push("amarillo"); console.log(colores);',
    ],
    setupFiles: { html: L8_HTML, css: '', js: L8_JS },
    curiosity:
      'Casi todos los lenguajes cuentan las posiciones desde 0 porque, en los orígenes, ese número indicaba el desplazamiento desde el inicio: el primer elemento está a 0 pasos. La costumbre quedó — y confundir el 0 con el 1 sigue siendo, décadas después, uno de los despistes más clásicos de la programación.',
  },
  {
    id: 'm2-l9',
    title: 'Bucles: repite sin copiar y pegar',
    usesConsole: true,
    description: [
      'Cuando algo hay que hacerlo muchas veces, no se copia y pega: se usa un bucle. El más común es `for`, que se apoya en una variable contadora. Sus paréntesis llevan tres partes separadas por punto y coma: el arranque (`let i = 1`), la condición para seguir (`i <= 5`) y el paso tras cada vuelta (`i++`, que suma 1 a `i`).',
      'El código entre llaves se ejecuta una vez por vuelta, y dentro puedes usar `i`, que cada vez vale un número distinto.',
      'Escribe un bucle que muestre en consola los números del 1 al 5: cinco líneas en la consola con un solo `console.log` en tu código.',
    ].join('\n\n'),
    objectives: [
      {
        label: 'Escribe un bucle for (o while)',
        validate: sourceIncludes('js', /for\s*\(|while\s*\(/),
      },
      { label: 'El bucle muestra al menos 3 valores en consola', validate: consoleCountAtLeast(3) },
    ],
    hints: [
      'for (let i = 1; i <= 5; i++) { console.log(i); }',
      'Cambia el 5 por 100 y pulsa «Ver en web»: acabas de ahorrarte escribir 100 líneas.',
    ],
    setupFiles: { html: L9_HTML, css: '', js: L9_JS },
    curiosity:
      'La sintaxis for (inicio; condición; paso) de JavaScript viene directamente de C, uno de los lenguajes más influyentes de la historia: apenas ha cambiado desde los años 70.',
  },
  {
    id: 'm2-l10',
    title: 'Objetos: datos con nombre',
    usesConsole: true,
    description: [
      'Un array guarda valores por posición; un objeto los guarda por nombre. Se escribe entre llaves, como parejas `propiedad: valor` separadas por comas: `let persona = { nombre: "Ada", edad: 36 };`.',
      'Para leer una propiedad se usa el punto: `persona.nombre` vale `"Ada"`. Los objetos juntan en un solo sitio todo lo que describe a una cosa — una persona, un producto, un jugador — y son el pan de cada día de JavaScript.',
      'Crea un objeto `persona` con al menos dos propiedades, una de ellas `nombre` con un texto. Muestra en consola el objeto entero y, aparte, su `nombre` usando el punto.',
    ].join('\n\n'),
    objectives: [
      {
        label: 'Muestra en consola un objeto con al menos dos propiedades',
        validate: consoleHasValue(
          (raw, type) => type === 'object' && Object.keys(JSON.parse(raw) ?? {}).length >= 2
        ),
      },
      {
        label: 'Accede a una propiedad con el punto (persona.nombre)',
        validate: async (s) =>
          (await sourceIncludes('js', /persona\.\w+/)(s)) && (await consoleHasType('string')(s)),
      },
    ],
    hints: [
      'let persona = { nombre: "Ada", edad: 36 };',
      'console.log(persona);',
      'console.log(persona.nombre);',
    ],
    setupFiles: { html: L10_HTML, css: '', js: L10_JS },
    curiosity:
      'El formato en el que las aplicaciones de medio mundo intercambian datos — JSON — significa "JavaScript Object Notation": es la sintaxis de los objetos que acabas de escribir, convertida en estándar universal. Hasta las apps que no usan JavaScript hablan JSON.',
  },
  {
    id: 'm2-l11',
    title: 'Métodos y this',
    usesConsole: true,
    description: [
      'Las propiedades de un objeto también pueden ser funciones; cuando lo son, se llaman métodos. Ya has usado alguno sin saberlo: `.push()` es un método de los arrays.',
      'Dentro de un método, la palabra `this` significa «este mismo objeto», y permite usar sus demás propiedades: con `this.nombre`, el método lee la propiedad `nombre` del objeto que lo contiene.',
      'Añade a tu objeto `persona` un método `presentarse` que devuelva un saludo usando `this.nombre`, y muestra en consola el resultado de llamarlo: `persona.presentarse()`.',
    ].join('\n\n'),
    objectives: [
      {
        label: 'El método usa this para leer una propiedad',
        validate: sourceIncludes('js', /this\.\w+/),
      },
      {
        label: 'Llama a persona.presentarse() y muestra el texto en consola',
        validate: async (s) =>
          (await sourceIncludes('js', /persona\.presentarse\s*\(\s*\)/)(s)) &&
          (await consoleHasType('string')(s)),
      },
    ],
    hints: [
      'let persona = { nombre: "Ada", presentarse() { return "Hola, soy " + this.nombre; } };',
      'console.log(persona.presentarse());',
    ],
    setupFiles: { html: L11_HTML, css: '', js: L11_JS },
    curiosity:
      'En JavaScript casi todo se comporta como un objeto, incluso los arrays y las funciones. Dentro de un método, this apunta al objeto que lo llamó — pero su valor puede cambiar según cómo se invoque la función, uno de los rincones que más confunde al empezar.',
  },
  {
    id: 'm2-l12',
    title: 'Selecciona elementos de la página',
    usesConsole: true,
    description: [
      'Toca juntarlo todo: JavaScript puede leer y tocar tu página. El navegador convierte el HTML en un conjunto de objetos — sí, como los que ya conoces — llamado DOM, y te lo entrega en la variable `document`.',
      'Su método más útil es `document.querySelector("...")`: le pasas un selector con la misma sintaxis que en CSS (`"p"`, `".menu"`, `"#mensaje"`) y devuelve el primer elemento que encaja. El `#` busca por `id`, un atributo que da un nombre único a un elemento del HTML.',
      'La página de esta lección trae un `<p id="mensaje">`. Selecciónalo, guárdalo en una variable y muestra en consola su propiedad `.textContent`: el texto que contiene.',
    ].join('\n\n'),
    objectives: [
      {
        label: 'Selecciona el párrafo con querySelector("#mensaje")',
        validate: sourceIncludes('js', /querySelector\(\s*['"]#mensaje['"]\s*\)/),
      },
      {
        label: 'Muestra su .textContent en la consola',
        validate: consoleHasValue((raw, type) => type === 'string' && raw.includes('Hola')),
      },
    ],
    hints: [
      'const mensaje = document.querySelector("#mensaje");',
      'console.log(mensaje.textContent);',
    ],
    setupFiles: { html: L12_HTML, css: '', js: L12_JS },
    curiosity:
      'querySelector acepta cualquier selector CSS válido, así que puedes usar la misma sintaxis para buscar un elemento en JavaScript que para darle estilos en una hoja CSS.',
  },
  {
    id: 'm2-l13',
    title: 'Cambia la página desde el código',
    description: [
      'Los elementos que devuelve `querySelector` no son de solo lectura: si cambias sus propiedades, la página cambia al instante. La propiedad `.textContent` que leíste en la lección anterior también se puede escribir, con un signo `=`: `elemento.textContent = "Otro texto";`.',
      'Esta es la idea central de casi todo lo que JavaScript hace en la web: seleccionar un elemento y modificarlo.',
      'Selecciona el `<p id="mensaje">` y cámbiale el texto por uno tuyo. Esta vez el resultado no está en la consola: míralo en la vista previa.',
    ].join('\n\n'),
    objectives: [
      {
        label: 'Selecciona el párrafo con querySelector',
        validate: sourceIncludes('js', /querySelector\(\s*['"]#mensaje['"]\s*\)/),
      },
      {
        label: 'Cámbiale el texto con .textContent =',
        validate: async (s) => {
          if (!(await sourceIncludes('js', /\.textContent\s*=/)(s))) return false;
          const text = ((await s.query('text', { selector: '#mensaje' })) ?? '').trim();
          return text !== '' && text !== 'Hola, mundo';
        },
      },
    ],
    hints: [
      'const mensaje = document.querySelector("#mensaje");',
      'mensaje.textContent = "¡He cambiado este texto desde JavaScript!";',
    ],
    setupFiles: { html: L13_HTML, css: '', js: L13_JS },
    curiosity:
      'Además de .textContent existe .innerHTML, que interpreta etiquetas HTML dentro del texto. Es más potente y más peligrosa: insertar con ella texto que escribió un usuario puede colar código ajeno en tu página — el clásico agujero de seguridad llamado XSS. Para poner texto, .textContent es siempre la opción segura.',
  },
  {
    id: 'm2-l14',
    title: 'Eventos: reacciona a los clics',
    description: [
      'Hasta ahora tu código se ejecuta una vez, al cargar la página. Los eventos le permiten reaccionar: `boton.addEventListener("click", () => { ... })` deja al botón «escuchando», y ejecuta el código de las llaves cada vez que alguien le hace clic. La parte `() => { ... }` es una función abreviada y sin nombre: «cuando pase, haz esto».',
      'Dentro puedes hacer lo que ya sabes — cambiar textos con `.textContent` — y también tocar estilos: `elemento.classList.add("resaltado")` le añade una clase CSS, con todas las reglas que esa clase tenga definidas.',
      'La página tiene un botón y un párrafo, y el CSS trae la clase `resaltado` preparada. Haz que al pulsar el botón el párrafo cambie de texto y se resalte. Pruébalo tú en la vista previa: es tu primera página interactiva.',
    ].join('\n\n'),
    objectives: [
      {
        label: 'Añade un listener de click al botón',
        validate: sourceIncludes('js', /addEventListener\(\s*['"]click['"]/),
      },
      {
        label: 'Haz clic en el botón de la vista previa: el texto del párrafo cambia',
        validate: async (s) => {
          const text = ((await s.query('text', { selector: '#mensaje' })) ?? '').trim();
          return text !== '' && text !== 'Hola, mundo';
        },
      },
      {
        label: 'Usa classList para resaltar el párrafo',
        validate: sourceIncludes('js', /classList\.(add|toggle)\(/),
      },
    ],
    hints: [
      'const boton = document.querySelector("#boton");',
      'const mensaje = document.querySelector("#mensaje");',
      'boton.addEventListener("click", () => { mensaje.textContent = "¡Hiciste clic!"; mensaje.classList.add("resaltado"); });',
      'Este objetivo se comprueba de verdad: pulsa el botón en la vista previa (a la derecha) para que se marque.',
    ],
    setupFiles: { html: L14_HTML, css: L14_CSS, js: L14_JS },
    curiosity:
      'addEventListener no solo detecta clics: hay eventos para el teclado, el scroll, cuando cambia el tamaño de la ventana o cuando se envía un formulario. Es el mismo mecanismo para todos — solo cambia el nombre del evento.',
  },
];
