// Cubre tanto ErrorEvent.message del navegador ("Uncaught ReferenceError: x
// is not defined", ver el listener 'error' en sandboxRunner.js) como
// err.message de una excepción atrapada ("x is not defined", sin el prefijo
// "Uncaught <Tipo>Error: " — así lo entrega evalExpr para la REPL de
// <ConsolePanel>): el prefijo es opcional para que las mismas reglas sirvan
// para las dos fuentes.
const PREFIX = '(?:Uncaught \\w*Error: )?';

const RULES = [
  {
    pattern: new RegExp(`^${PREFIX}(.+) is not defined$`),
    translate: (name) =>
      `No existe ninguna variable o función llamada "${name}". Revisa que esté bien escrita, o que la hayas declarado (con let/const) antes de usarla.`,
  },
  {
    pattern: new RegExp(`^${PREFIX}(.+) is not a function$`),
    translate: (name) =>
      `"${name}" no es una función. Revisa que el nombre esté bien escrito y que sea realmente una función (o un método que exista de verdad).`,
  },
  {
    // Chrome/V8 recientes: "Cannot read properties of undefined (reading 'push')"
    pattern: new RegExp(`^${PREFIX}Cannot read properties of (undefined|null) \\(reading '([^']+)'\\)$`),
    translate: (value, prop) =>
      `Intentaste usar ".${prop}" sobre algo que vale ${value}. Puede que la variable no se haya creado bien, o que un elemento que buscaste con querySelector no exista en la página.`,
  },
  {
    // Formato antiguo de V8 / otros motores: "Cannot read property 'push' of undefined"
    pattern: new RegExp(`^${PREFIX}Cannot read propert(?:y|ies) '?([^'" ]+)'? of (undefined|null)$`),
    translate: (prop, value) =>
      `Intentaste usar ".${prop}" sobre algo que vale ${value}. Puede que la variable no se haya creado bien, o que un elemento que buscaste con querySelector no exista en la página.`,
  },
  {
    pattern: new RegExp(`^${PREFIX}Assignment to constant variable\\.$`),
    translate: () =>
      `Estás intentando cambiar el valor de una variable declarada con const, y las variables const no se pueden reasignar. Usa let si necesitas que su valor cambie.`,
  },
  {
    pattern: new RegExp(`^${PREFIX}(.+) is not iterable$`),
    translate: (name) => `"${name}" no se puede recorrer con un bucle: probablemente no es un array.`,
  },
  {
    pattern: new RegExp(`^${PREFIX}Missing catch or finally after try$`),
    translate: () =>
      `Hay un bloque try{...} sin su catch, o al que le sobra una llave de cierre "}" que lo ha cerrado antes de tiempo. Cuenta tus llaves { y } una por una: seguramente hay una de más o de menos.`,
  },
  {
    pattern: new RegExp(`^${PREFIX}Unexpected end of input$`),
    translate: () =>
      `El código termina de forma inesperada. Seguramente falta cerrar una llave "{", un paréntesis "(" o una comilla que abriste antes.`,
  },
  {
    pattern: new RegExp(`^${PREFIX}Unexpected token '?(.*?)'?$`),
    translate: (token) =>
      `Hay un error de sintaxis${token ? ` cerca de "${token}"` : ''}. Revisa que no falten ni sobren llaves {}, paréntesis () o comillas.`,
  },
  {
    pattern: new RegExp(`^${PREFIX}Invalid or unexpected token$`),
    translate: () =>
      `Hay un carácter que el navegador no esperaba ahí — a menudo una comilla sin cerrar o mal emparejada. Revisa las comillas de esa línea.`,
  },
  {
    pattern: new RegExp(`^${PREFIX}SyntaxError: (.+)$`),
    translate: (rest) => `Error de sintaxis: ${rest}. Revisa llaves, paréntesis y comillas.`,
  },
];

// message: el texto crudo (ErrorEvent.message) que llega desde el iframe.
// Devuelve siempre un string — el original si ninguna regla encaja.
export function translateError(message) {
  if (!message) return message;
  for (const rule of RULES) {
    const match = rule.pattern.exec(message);
    if (match) return rule.translate(...match.slice(1));
  }
  return message;
}
