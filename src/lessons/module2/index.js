// Módulo 2 — Dale vida con JavaScript (8 lecciones)
// Cada lección arranca con su propia mini página para centrarse en un
// concepto: variables, condicionales, funciones, arrays, bucles, objetos,
// y por último seleccionar y modificar el DOM.

import {
  globalIsFunction,
  callFunction,
  consoleHasType,
  consoleHasValue,
  consoleCountAtLeast,
  sourceIncludes,
} from '../_helpers';
import {
  L1_JS,
  L2_JS,
  L3_JS,
  L4_JS,
  L5_JS,
  L6_JS,
  L7_HTML,
  L7_JS,
  L8_HTML,
  L8_CSS,
  L8_JS,
} from './fixtures';

export const module2 = [
  {
    id: 'm2-l1',
    title: 'Variables y tipos',
    description:
      'Una variable guarda un valor con un nombre para poder usarlo después: se declara con `let` (si va a cambiar) o `const` (si no). Los tipos más básicos son el texto (string, entre comillas), el número y el booleano (`true`/`false`). Declara una variable de cada tipo y muéstralas con `console.log()` — su salida aparece en el panel de Consola, abajo.',
    objectives: [
      { label: 'Registra en consola un texto (string)', validate: consoleHasType('string') },
      { label: 'Registra en consola un número', validate: consoleHasType('number') },
      { label: 'Registra en consola un valor booleano', validate: consoleHasType('boolean') },
    ],
    hints: [
      'let nombre = "Ana"; console.log(nombre);',
      'let edad = 16; console.log(edad);',
      'const esFanDeJS = true; console.log(esFanDeJS);',
    ],
    setupFiles: { html: '', css: '', js: L1_JS },
    curiosity:
      'JavaScript se creó en solo 10 días en mayo de 1995, obra de Brendan Eich en Netscape. Iba a llamarse Mocha, luego LiveScript, y acabó llamándose JavaScript por una decisión de marketing para aprovechar la fama de Java — aunque los dos lenguajes apenas tienen relación entre sí.',
  },
  {
    id: 'm2-l2',
    title: 'Operadores y condicionales',
    description:
      'Con operadores de comparación (`>=`, `===`...) construyes condiciones, y con `if`/`else` decides qué código se ejecuta según si esa condición es verdadera o falsa. Declara una variable `edad` y muestra en consola un mensaje distinto según si es mayor o menor de edad.',
    objectives: [
      { label: 'Usa una condición if/else en tu código', validate: sourceIncludes('js', /if\s*\(/) },
      { label: 'Muestra en consola un mensaje según la condición', validate: consoleHasType('string') },
    ],
    hints: [
      'let edad = 16;',
      'if (edad >= 18) { console.log("Eres mayor de edad"); } else { console.log("Eres menor de edad"); }',
    ],
    setupFiles: { html: '', css: '', js: L2_JS },
    curiosity:
      'En JavaScript, "5" == 5 da true, pero "5" === 5 da false: el doble igual convierte los tipos antes de comparar, y el triple igual no. Por eso casi todas las guías de estilo recomiendan usar siempre === para evitar sorpresas.',
  },
  {
    id: 'm2-l3',
    title: 'Funciones',
    description:
      'Una función empaqueta código para reutilizarlo: recibe parámetros y puede devolver un resultado con `return`. Declara una función `saludar(nombre)` que devuelva un saludo que incluya ese nombre, y muéstrala en consola llamándola con algún nombre.',
    objectives: [
      {
        label: 'Declara una función llamada saludar que reciba un nombre',
        validate: globalIsFunction('saludar'),
      },
      {
        label: 'La función devuelve un saludo que incluye el nombre recibido',
        validate: callFunction('saludar', ['Ada'], (r) => typeof r === 'string' && r.includes('Ada')),
      },
      { label: 'Llama a la función y muestra el resultado en consola', validate: consoleHasType('string') },
    ],
    hints: [
      'function saludar(nombre) { return "Hola, " + nombre + "!"; }',
      'console.log(saludar("Ada"));',
    ],
    setupFiles: { html: '', css: '', js: L3_JS },
    curiosity:
      'Una función declarada con "function nombre(){}" queda disponible en todo su ámbito desde el principio (hoisting): puedes llamarla en una línea anterior a donde la escribiste, porque el motor ya la registró entera al leer el archivo.',
  },
  {
    id: 'm2-l4',
    title: 'Arrays y sus métodos',
    description:
      'Un array guarda una lista ordenada de valores entre corchetes: `["rojo", "verde", "azul"]`. Crea un array con al menos 3 elementos y muéstralo en consola; después añade uno más con `.push()` y vuelve a mostrarlo.',
    objectives: [
      { label: 'Muestra en consola un array', validate: consoleHasType('array') },
      {
        label: 'El array tiene al menos 3 elementos',
        validate: consoleHasValue((raw, type) => type === 'array' && JSON.parse(raw).length >= 3),
      },
      {
        label: 'Usa push() para añadir un elemento y muestra el array de nuevo',
        validate: (s) =>
          sourceIncludes('js', /\.push\(/)(s) &&
          consoleHasValue((raw, type) => type === 'array' && JSON.parse(raw).length >= 4)(s),
      },
    ],
    hints: [
      'let colores = ["rojo", "verde", "azul"]; console.log(colores);',
      'colores.push("amarillo"); console.log(colores);',
    ],
    setupFiles: { html: '', css: '', js: L4_JS },
    curiosity:
      'Los arrays de JavaScript no tienen un tipo fijo: puedes mezclar números, texto e incluso otros arrays en el mismo array, y su tamaño crece o encoge solo, sin que tengas que declararlo de antemano.',
  },
  {
    id: 'm2-l5',
    title: 'Bucles',
    description:
      'Un bucle repite código sin copiarlo y pegarlo a mano. `for (let i = 0; i < N; i++) { ... }` es el más clásico: inicializa un contador, comprueba una condición y avanza en cada vuelta. Usa un bucle para mostrar varios valores en consola.',
    objectives: [
      {
        label: 'Usa un bucle for (o while) en tu código',
        validate: sourceIncludes('js', /for\s*\(|while\s*\(/),
      },
      { label: 'El bucle muestra al menos 3 valores en consola', validate: consoleCountAtLeast(3) },
    ],
    hints: ['for (let i = 1; i <= 5; i++) { console.log(i); }'],
    setupFiles: { html: '', css: '', js: L5_JS },
    curiosity:
      'La sintaxis for (inicio; condición; paso) de JavaScript viene directamente de C, uno de los lenguajes más influyentes de la historia: apenas ha cambiado desde los años 70.',
  },
  {
    id: 'm2-l6',
    title: 'Objetos',
    description:
      'Un objeto agrupa datos relacionados en propiedades con nombre: `{ nombre: "Ada", edad: 30 }`. Dentro de un objeto también puedes definir métodos (funciones), que acceden a las demás propiedades con `this`. Crea un objeto `persona` con al menos dos propiedades y un método que devuelva un texto usando `this`, y muéstralo en consola.',
    objectives: [
      {
        label: 'Muestra en consola un objeto con al menos dos propiedades',
        validate: consoleHasValue(
          (raw, type) => type === 'object' && Object.keys(JSON.parse(raw) ?? {}).length >= 2
        ),
      },
      {
        label: 'El objeto tiene un método que usa this y devuelve un texto',
        validate: (s) => sourceIncludes('js', /this\.\w+/)(s) && consoleHasType('string')(s),
      },
    ],
    hints: [
      'let persona = { nombre: "Ada", edad: 30, saludar() { return "Hola, soy " + this.nombre; } };',
      'console.log(persona); console.log(persona.saludar());',
    ],
    setupFiles: { html: '', css: '', js: L6_JS },
    curiosity:
      'En JavaScript casi todo se comporta como un objeto, incluso los arrays y las funciones. Dentro de un método, this apunta al objeto que lo llamó — pero su valor puede cambiar según cómo se invoque la función, uno de los rincones que más confunde al empezar.',
  },
  {
    id: 'm2-l7',
    title: 'Selecciona el DOM',
    description:
      'El DOM es la representación de tu HTML que JavaScript puede leer y tocar. `document.querySelector("#id")` busca un elemento por su selector CSS. La página ya tiene un `<p id="mensaje">`: selecciónalo y muestra su texto en consola con `.textContent`.',
    objectives: [
      {
        label: 'Selecciona el párrafo con id "mensaje" usando querySelector',
        validate: sourceIncludes('js', /querySelector\(\s*['"]#mensaje['"]\s*\)/),
      },
      {
        label: 'Muestra su texto en consola',
        validate: consoleHasValue((raw, type) => type === 'string' && raw.includes('Hola')),
      },
    ],
    hints: [
      'const mensaje = document.querySelector("#mensaje");',
      'console.log(mensaje.textContent);',
    ],
    setupFiles: { html: L7_HTML, css: '', js: L7_JS },
    curiosity:
      'querySelector acepta cualquier selector CSS válido, así que puedes usar la misma sintaxis para buscar un elemento en JavaScript que para darle estilos en una hoja CSS.',
  },
  {
    id: 'm2-l8',
    title: 'Modifica el DOM y eventos',
    description:
      'Un event listener ejecuta código cuando algo ocurre: `elemento.addEventListener("click", () => { ... })`. Dentro puedes cambiar `.textContent` para actualizar un texto, o `.classList.add("clase")` para aplicar estilos. Haz que, al pulsar el botón, el párrafo cambie de texto y se resalte con la clase "resaltado" (ya tiene estilos definidos en el CSS).',
    objectives: [
      {
        label: 'Añade un listener de click al botón',
        validate: sourceIncludes('js', /addEventListener\(\s*['"]click['"]/),
      },
      {
        label: 'Al hacer click, el texto del párrafo cambia',
        validate: (s) => {
          const boton = s.doc.querySelector('#boton');
          const mensaje = s.doc.querySelector('#mensaje');
          if (!boton || !mensaje) return false;
          boton.click();
          return mensaje.textContent.trim() !== 'Hola, mundo';
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
      'boton.addEventListener("click", () => { mensaje.textContent = "¡Hiciste click!"; mensaje.classList.add("resaltado"); });',
    ],
    setupFiles: { html: L8_HTML, css: L8_CSS, js: L8_JS },
    curiosity:
      'addEventListener no solo detecta clics: hay eventos para el teclado, el scroll, cuando cambia el tamaño de la ventana o cuando se envía un formulario. Es el mismo mecanismo para todos — solo cambia el nombre del evento.',
  },
];
