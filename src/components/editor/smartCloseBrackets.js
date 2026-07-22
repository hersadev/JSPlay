import { EditorView } from '@codemirror/view';
import { Prec } from '@codemirror/state';

const CLOSERS = { ')': true, ']': true, '}': true };
// Suficiente para cualquier bloque real de una lección; evita recorrer el
// documento entero si el cursor quedó, por lo que sea, lejos de cualquier
// cierre.
const MAX_SCAN = 400;

// closeBrackets (de @codemirror/autocomplete, parte del basicSetup) solo
// "consume" el cierre que tecleas si es LITERALMENTE el carácter siguiente,
// sin nada en medio. Pero el propio Enter del editor (insertNewlineAndIndent,
// del keymap por defecto) tiene un caso especial: si pulsas Enter con el
// cursor entre `{` y `}` recién autocompletados, separa el cierre a su
// propia línea de abajo — quedan solo espacios/una línea en blanco entre el
// cursor y él. Cuando alguien escribe a mano (como cualquier persona real,
// sin saber que el cierre ya estaba puesto) y teclea su propio `}` al
// terminar el bloque, closeBrackets ya no lo reconoce como "ya puesto" — lo
// inserta duplicado, y el cierre original queda huérfano más abajo. En
// HTML/CSS el navegador tolera el sobrante; en JS es un SyntaxError real
// con un mensaje que no tiene nada que ver con lo que el alumno escribió
// (p. ej. "Missing catch or finally after try").
//
// Esta extensión generaliza el salto de closeBrackets: si entre el cursor y
// el próximo cierre que coincide con lo que acabas de teclear solo hay
// espacio en blanco, se borra ese hueco y el cursor pasa al otro lado del
// cierre existente — como si lo hubieras escrito tú, en vez de duplicarlo.
// Prec.highest para que se pruebe antes que el inputHandler de closeBrackets
// (así el caso "carácter inmediatamente siguiente", sin hueco, se lo deja
// tal cual a closeBrackets — nosotros solo cubrimos el caso con espacio en
// medio que closeBrackets no ve).
export const smartCloseBracketSkip = Prec.highest(
  EditorView.inputHandler.of((view, from, to, insert) => {
    if (!CLOSERS[insert]) return false;
    const { state } = view;
    const sel = state.selection.main;
    if (from !== sel.from || to !== sel.to || !sel.empty) return false;

    const doc = state.doc;
    const scanEnd = Math.min(doc.length, sel.head + MAX_SCAN);
    const ahead = doc.sliceString(sel.head, scanEnd);
    const whitespace = ahead.match(/^[ \t\n\r]*/)[0];
    // Sin hueco: es el caso normal que ya resuelve closeBrackets.
    if (whitespace.length === 0) return false;
    if (ahead[whitespace.length] !== insert) return false;

    view.dispatch({
      changes: { from: sel.head, to: sel.head + whitespace.length },
      selection: { anchor: sel.head + 1 },
      scrollIntoView: true,
      userEvent: 'input.type',
    });
    return true;
  })
);
