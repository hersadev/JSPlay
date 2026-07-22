// Instrumenta el JS del alumno para que un bucle sin condición de salida
// (el error más típico de la lección de bucles: olvidar el i++, o una
// condición que nunca se vuelve falsa) no cuelgue la pestaña entera. El
// iframe de la vista previa corre en el mismo hilo que la propia app (ver
// sandboxRunner.js), así que un `for`/`while` que no termina nunca bloquea
// tanto el iframe como el resto de la interfaz — el botón «Ver en web»
// incluido — sin ningún aviso, solo el diálogo de "la página no responde"
// del navegador.
//
// La solución: envolver el cuerpo de cada bucle con una llamada a una
// función guardia (definida en PROBE_SCRIPT, ver sandboxRunner.js) que
// lanza un error si el bucle lleva demasiado tiempo dando vueltas sin
// ceder el hilo. Se hace con el parser JS de lezer que ya trae
// @codemirror/lang-javascript para el resaltado/lint del editor (ver
// syntaxLinter.js) — así se distingue un `for` de verdad de un `for` suelto
// dentro de una cadena, un comentario o una plantilla, algo que un regex no
// puede garantizar.
import { javascriptLanguage } from '@codemirror/lang-javascript';

const GUARD_FN = '__jsplayLoopGuard';

function lineAt(code, pos) {
  let line = 1;
  for (let i = 0; i < pos; i++) {
    if (code.charCodeAt(i) === 10) line++;
  }
  return line;
}

// Para for/while el cuerpo es siempre el último hijo; para do...while es el
// hijo justo después de la palabra clave "do" (el orden es do, cuerpo,
// while, condición). Cubre for-in y for-of igual que un for normal: todos
// comparten el nodo ForStatement en la gramática de lezer.
function bodyChildOf(node) {
  if (node.name === 'ForStatement' || node.name === 'WhileStatement') return node.lastChild;
  if (node.name === 'DoStatement') return node.firstChild ? node.firstChild.nextSibling : null;
  return null;
}

// Los accessors de SyntaxNode (firstChild, lastChild, nextSibling...)
// devuelven un objeto nuevo en cada llamada, así que dos referencias al
// mismo nodo no son === entre sí — hay que comparar por posición.
function sameNode(a, b) {
  return !!a && !!b && a.from === b.from && a.to === b.to;
}

export function guardLoops(code) {
  let tree;
  try {
    tree = javascriptLanguage.parser.parse(code);
  } catch (_) {
    return code;
  }

  // Reconstruye el texto de `node` recorriendo sus hijos y conservando los
  // huecos entre ellos (espacios, comentarios) tal cual estaban: por
  // construcción, el resultado es idéntico al original salvo en los
  // cuerpos de bucle, que quedan envueltos en la llamada a la guardia.
  function rebuild(node) {
    const bodyChild = bodyChildOf(node);
    let result = '';
    let pos = node.from;
    let child = node.firstChild;
    while (child) {
      result += code.slice(pos, child.from);
      const childText = rebuild(child);
      result += sameNode(child, bodyChild)
        ? `{${GUARD_FN}(${lineAt(code, node.from)});${childText}}`
        : childText;
      pos = child.to;
      child = child.nextSibling;
    }
    result += code.slice(pos, node.to);
    return result;
  }

  try {
    return rebuild(tree.topNode);
  } catch (_) {
    return code;
  }
}
