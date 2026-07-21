// Código de partida para cada lección del módulo 2 (JavaScript).
// Cada lección arranca con una mini página propia, aislada de las demás,
// para poder centrarse en un único concepto a la vez. En las lecciones que
// trabajan sobre la consola, el HTML lo recuerda para que la vista previa
// "vacía" no despiste.

const consolePage = (titulo) => `<h1>${titulo}</h1>
<p>El resultado de esta lección no se ve aquí: míralo en la <strong>Consola</strong>, abajo. 👇</p>
`;

export const L1_HTML = `<h1>Antes de programar</h1>
<p>Tu página necesita saber dónde está su JavaScript.</p>

<!-- Añade aquí el <script src> -->
`;

export const L2_HTML = consolePage('Tu primer mensaje');
export const L2_JS = `// Escribe aquí tus console.log() y pulsa «Ver en web»
`;

export const L3_HTML = consolePage('Variables');
export const L3_JS = `// Crea tus variables y muéstralas con console.log()
`;

export const L4_HTML = consolePage('Verdadero o falso');
export const L4_JS = `// Declara una variable "edad" y muestra el resultado de compararla
`;

export const L5_HTML = consolePage('Decisiones');
export const L5_JS = `// Según el valor de "edad", muestra un mensaje u otro
`;

export const L6_HTML = consolePage('Funciones');
export const L6_JS = `// Define aquí tu función saludar, llámala y muestra el resultado
`;

export const L7_HTML = consolePage('Parámetros');
export const L7_JS = `// Haz que saludar reciba un nombre y lo use en el saludo
`;

export const L8_HTML = consolePage('Arrays');
export const L8_JS = `// Crea un array, muéstralo, añade un elemento con push y muéstralo otra vez
`;

export const L9_HTML = consolePage('Bucles');
export const L9_JS = `// Usa un bucle para mostrar varios números en la consola
`;

export const L10_HTML = consolePage('Objetos');
export const L10_JS = `// Crea un objeto "persona", muéstralo entero y muestra una de sus propiedades
`;

export const L11_HTML = consolePage('Métodos');
export const L11_JS = `// Añade a "persona" un método presentarse que use this, y muestra su resultado
`;

export const L12_HTML = `<p id="mensaje">Hola, mundo</p>
`;
export const L12_JS = `// Selecciona el párrafo con id "mensaje" y muestra su texto en la consola
`;

export const L13_HTML = `<p id="mensaje">Hola, mundo</p>
`;
export const L13_JS = `// Selecciona el párrafo y cámbiale el texto: mira la vista previa
`;

export const L14_HTML = `<p id="mensaje">Hola, mundo</p>
<button id="boton">Haz clic</button>
`;
export const L14_CSS = `.resaltado {
  color: #fabd2f;
  font-weight: bold;
}
`;
export const L14_JS = `// Al hacer clic en el botón: cambia el texto del párrafo
// y añádele la clase "resaltado"
`;
