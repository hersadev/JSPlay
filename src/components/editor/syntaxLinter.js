import { syntaxTree } from '@codemirror/language';
import { linter } from '@codemirror/lint';

// Cuando el árbol de sintaxis marca un tramo como error con longitud cero
// (el caso típico: "aquí esperaba algo y no lo hubo"), lezer sitúa ese
// punto justo DESPUÉS del último token válido — que muchas veces es un
// salto de línea o los espacios de la sangría siguiente. Si se expandiera
// hacia delante sin más, el subrayado terminaría bajo el primer carácter
// de la LÍNEA SIGUIENTE en vez de bajo el código real que causó el fallo
// (el caso típico: olvidar la "}" final de una función — el error cae al
// final del documento, en el salto de línea de después del código). Por
// eso se ancla hacia atrás, saltando espacios/saltos de línea, hasta el
// último carácter real anterior: así el aviso siempre aparece en la misma
// línea donde está el problema.
function anchorZeroWidth(doc, pos) {
  let p = Math.min(pos, doc.length);
  while (p > 0 && /\s/.test(doc.sliceString(p - 1, p))) p--;
  if (p > 0) return { from: p - 1, to: p };
  return { from: 0, to: Math.min(1, doc.length) };
}

function diagnosticRange(doc, from, to) {
  if (to > from) return { from, to: Math.min(to, doc.length) };
  return anchorZeroWidth(doc, from);
}

// A diferencia de JS/CSS, en HTML una etiqueta sin cerrar NO es un error de
// gramática para el parser: HTML es tolerante y la da por cerrada sola al
// llegar al final, así que nunca aparece como nodo de error normal. Hay que
// detectarlo aparte: cualquier nodo Element con etiqueta de apertura pero
// sin su CloseTag correspondiente. El aviso se ancla sobre el propio nombre
// de la etiqueta de apertura, que es justo donde el alumno debe mirar.
function unclosedTagDiagnostics(state) {
  const diagnostics = [];
  const unclosedRanges = [];
  syntaxTree(state).iterate({
    enter: (node) => {
      if (node.name !== 'Element') return;
      const openTag = node.node.getChild('OpenTag');
      if (!openTag || node.node.getChild('CloseTag')) return;
      const tagName = openTag.getChild('TagName');
      const from = tagName ? tagName.from : openTag.from;
      const to = tagName ? tagName.to : openTag.to;
      const name = tagName ? state.doc.sliceString(tagName.from, tagName.to) : '';
      diagnostics.push({
        from,
        to,
        severity: 'error',
        message: name ? `Falta la etiqueta de cierre </${name}>` : 'Falta la etiqueta de cierre',
      });
      unclosedRanges.push([node.from, node.to]);
    },
  });
  return { diagnostics, unclosedRanges };
}

function insideAny(ranges, pos) {
  return ranges.some(([from, to]) => pos >= from && pos <= to);
}

// CodeMirror ya parsea el código para el resaltado de sintaxis (con lezer),
// así que su árbol trae marcados los tramos que no encajan en la gramática
// como nodos de error. Reusar ese árbol basta para señalarlos con el mismo
// subrayado rojo ondulado que usa VSCode, sin añadir un parser aparte por
// lenguaje.
export const syntaxErrorLinter = linter(
  (view) => {
    const { state } = view;
    const doc = state.doc;
    const { diagnostics, unclosedRanges } = unclosedTagDiagnostics(state);

    syntaxTree(state).iterate({
      enter: (node) => {
        if (!node.type.isError) return;
        // Esta misma etiqueta sin cerrar ya se señaló arriba, más clara;
        // no dupliques el aviso.
        if (insideAny(unclosedRanges, node.from)) return;
        diagnostics.push({
          ...diagnosticRange(doc, node.from, node.to),
          severity: 'error',
          message: 'Error de sintaxis',
        });
      },
    });

    return diagnostics;
  },
  // El delay por defecto (750ms) hace que el subrayado tarde en aparecer.
  // Con 300ms se ve casi al instante en cuanto el alumno hace la pausa
  // natural entre una palabra y la siguiente, sin llegar a relintar en
  // cada pulsación (que marcaría como error tokens a medio escribir).
  { delay: 300 }
);
