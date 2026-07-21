// Validadores reutilizables para las lecciones. Reciben el sandboxState
// ({ query, consoleLog, errors, code }, ver engine/sandboxRunner.js /
// components/editor/Preview.jsx) y devuelven una Promise<boolean> — TODOS,
// incluso los que no tocan el DOM, para que la composición de varios
// validadores (ver los módulos de lecciones) sea uniforme: siempre se hace
// `await validador(s)`, nunca hay que recordar cuáles son síncronos.
//
// `query` es la única forma de leer el DOM/las funciones globales del
// iframe: desde que corre en un origen opaco (para que el código del alumno
// no pueda tocar la app real), ya no hay contentDocument/contentWindow que
// leer directamente — cada consulta hace un viaje de ida y vuelta por
// postMessage (ver sandboxBridge.js). Todos son tolerantes: si el iframe aún
// no cargó (sandboxState es null), el selector no existe, o la consulta
// no llega a tiempo, devuelven false en vez de lanzar un error.

const safe = (fn) => async (s) => {
  try {
    return !!(await fn(s));
  } catch (_) {
    return false;
  }
};

// ── DOM ────────────────────────────────────────────────────────────────

export const hasElement = (selector) => safe(async (s) => await s.query('exists', { selector }));

export const minCount = (selector, n) =>
  safe(async (s) => (await s.query('count', { selector })) >= n);

export const textNotEmpty = (selector) =>
  safe(async (s) => ((await s.query('text', { selector })) ?? '').trim().length > 0);

export const textContains = (selector, substring) =>
  safe(async (s) => ((await s.query('text', { selector })) ?? '').includes(substring));

export const attrNotEmpty = (selector, attr) =>
  safe(async (s) => ((await s.query('attr', { selector, attr })) ?? '').trim().length > 0);

export const attrEquals = (selector, attr, expected) =>
  safe(async (s) => (await s.query('attr', { selector, attr })) === expected);

// prop: nombre de estilo computado en camelCase (ej. 'backgroundColor').
// expected: valor exacto, o función (valor) => boolean para comparaciones flexibles.
export const computedStyle = (selector, prop, expected) =>
  safe(async (s) => {
    const value = await s.query('computedStyle', { selector, prop });
    if (value == null) return false;
    return typeof expected === 'function' ? expected(value) : value === expected;
  });

const TRANSPARENT = new Set(['', 'transparent', 'rgba(0, 0, 0, 0)']);
export const hasBackgroundColor = (selector) =>
  computedStyle(selector, 'backgroundColor', (v) => !TRANSPARENT.has(v));

// ── Variables y funciones globales ──────────────────────────────────────
// Solo `var` y `function nombre(){}` en el ámbito global quedan colgadas de
// `window`; `let`/`const` no. Por eso estos validadores se reservan para
// funciones (declaradas con `function`) — para variables con let/const se
// usan los validadores de consola de abajo.

export const globalIsFunction = (name) =>
  safe(async (s) => await s.query('globalIsFunction', { name }));

export const callFunction = (name, args, expected) =>
  safe(async (s) => {
    const res = await s.query('callFunction', { name, args });
    if (!res || res.notFunction) return false;
    const result = res.value;
    return typeof expected === 'function' ? expected(result) : result === expected;
  });

// ── Consola ──────────────────────────────────────────────────────────────
// consoleLog/errors ya son datos planos que el iframe empuja según ocurren
// (ver Preview.jsx) — no hace falta preguntarle nada al iframe para esto.

export const consoleHasType = (type) =>
  safe((s) => s.consoleLog.some((e) => e.args.some((a) => a.type === type)));

// predicate: (rawJSON, type) => boolean
export const consoleHasValue = (predicate) =>
  safe((s) => s.consoleLog.some((e) => e.args.some((a) => predicate(a.raw, a.type))));

export const consoleCountAtLeast = (n) => safe((s) => s.consoleLog.length >= n);

export const noErrors = (s) => s != null && (s.errors?.length ?? 0) === 0;

// ── Código fuente ──────────────────────────────────────────────────────
// Comprobación estructural (¿usaste tal palabra clave/sintaxis?) para
// complementar validadores de resultado cuando el resultado solo no basta
// para confirmar que se usó el concepto de la lección. Trabajan sobre
// s.code (el texto que escribió el alumno), no sobre el iframe.

export const sourceIncludes = (fileKey, pattern) =>
  safe((s) => {
    const src = s.code?.[fileKey] ?? '';
    return pattern instanceof RegExp ? pattern.test(src) : src.includes(pattern);
  });

// ¿Aparece ALGUNA coincidencia de `tagPattern` dentro de <sectionTag>...
// </sectionTag> en el HTML tal y como lo escribió el alumno? Trabaja sobre
// el texto fuente, no sobre el DOM ya reparado por el navegador: un <link>
// escrito fuera de <head> se movería solo al renderizarse (los navegadores
// son permisivos con eso), así que la única forma de detectar el error de
// verdad es mirar dónde lo puso en su propio código.
//
// Comprueba TODAS las coincidencias de tagPattern, no solo la primera: si el
// alumno deja una etiqueta mal puesta de un intento anterior y añade otra
// bien puesta sin borrar la primera, debe contar como resuelto igualmente.
export const tagInSection = (tagPattern, sectionTag) =>
  safe((s) => {
    const src = s.code?.html ?? '';
    const openMatch = new RegExp(`<${sectionTag}(?:\\s[^>]*)?>`, 'i').exec(src);
    const closeMatch = new RegExp(`</${sectionTag}\\s*>`, 'i').exec(src);
    if (!openMatch || !closeMatch) return false;
    const sectionStart = openMatch.index + openMatch[0].length;
    const sectionEnd = closeMatch.index;
    if (sectionEnd <= sectionStart) return false;
    const global = new RegExp(tagPattern.source, tagPattern.flags.includes('g') ? tagPattern.flags : tagPattern.flags + 'g');
    let match;
    while ((match = global.exec(src))) {
      if (match.index >= sectionStart && match.index < sectionEnd) return true;
      if (match[0].length === 0) global.lastIndex++; // evita bucle infinito con patrones que matchean vacío
    }
    return false;
  });
