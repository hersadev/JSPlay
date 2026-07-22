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

// Extrae los selectores que el alumno le pasó a querySelector(...) en su
// código y comprueba, ejecutándolos de verdad contra el DOM, si alguno
// apunta al MISMO elemento que targetSelector. No exige un selector
// concreto — 'p#mensaje', '#mensaje' y '[id="mensaje"]' son todos válidos y
// dan el mismo resultado — a diferencia de comparar el texto fuente contra
// un único patrón fijo, que rechaza selectores igual de correctos solo por
// no coincidir carácter a carácter.
export const queryTargetsElement = (fileKey, targetSelector) =>
  safe(async (s) => {
    const src = s.code?.[fileKey] ?? '';
    const pattern = /querySelector\(\s*(['"])(.*?)\1\s*\)/g;
    let match;
    while ((match = pattern.exec(src))) {
      if (await s.query('selectorMatchesElement', { selector: match[2], targetSelector })) return true;
      if (match[0].length === 0) pattern.lastIndex++;
    }
    return false;
  });

export const minCount = (selector, n) =>
  safe(async (s) => (await s.query('count', { selector })) >= n);

// 'texts'/'attrs' (plural) devuelven un array con TODOS los elementos que
// casan el selector, no solo el primero (a diferencia de 'text'/'attr', que
// siguen existiendo para el puñado de sitios que consultan un selector de
// id, necesariamente único). Sin esto, si el alumno deja un <li> vacío de
// un intento anterior y añade otro con el texto bueno sin borrar el
// primero, `document.querySelector` se queda con el vacío y el objetivo no
// se marca aunque el alumno lo haya hecho bien — el mismo punto ciego que
// tenía tagInSection antes de comprobar todas las coincidencias.
export const textNotEmpty = (selector) =>
  safe(async (s) => {
    const texts = (await s.query('texts', { selector })) ?? [];
    return texts.some((t) => (t ?? '').trim().length > 0);
  });

export const textContains = (selector, substring) =>
  safe(async (s) => {
    const texts = (await s.query('texts', { selector })) ?? [];
    return texts.some((t) => (t ?? '').includes(substring));
  });

export const attrNotEmpty = (selector, attr) =>
  safe(async (s) => {
    const attrs = (await s.query('attrs', { selector, attr })) ?? [];
    return attrs.some((v) => (v ?? '').trim().length > 0);
  });

export const attrEquals = (selector, attr, expected) =>
  safe(async (s) => {
    const attrs = (await s.query('attrs', { selector, attr })) ?? [];
    return attrs.some((v) => v === expected);
  });

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
// El nombre se busca con un eval indirecto dentro del iframe (ver
// 'globalIsFunction'/'callFunction' en sandboxRunner.js), así que da igual
// cómo se haya declarado la función — `function nombre(){}`, `var`, `let` o
// `const nombre = () => {}` — todas quedan igual de accesibles: solo hace
// falta que estén en el ámbito superior del script (no dentro de un bloque,
// una función, etc.).

export const globalIsFunction = (name) =>
  safe(async (s) => await s.query('globalIsFunction', { name }));

export const callFunction = (name, args, expected) =>
  safe(async (s) => {
    const res = await s.query('callFunction', { name, args });
    if (!res || res.notFunction) return false;
    const result = res.value;
    return typeof expected === 'function' ? expected(result) : result === expected;
  });

// ¿Alguna llamada a expr (evaluada dentro del iframe, con acceso a las
// variables globales del alumno) da exactamente `true`? Para comprobaciones
// que necesitan el estado/comportamiento real del código del alumno y no
// solo su forma — p. ej. que un método que usa `this` devuelva de verdad el
// valor esperado, no que su fuente contenga el texto "this.algo" (ver
// m2-l11: un método declarado como función flecha rompe `this` pero su
// fuente seguiría casando ese patrón).
export const evalTrue = (expr) =>
  safe(async (s) => {
    const res = await s.query('evalExpr', { expr });
    return res?.ok === true && res.output === 'true';
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
// Busca <sectionTag>...</sectionTag> en el texto fuente y devuelve dónde
// empieza y acaba su contenido, o null si la sección no está completa (falta
// la apertura, el cierre, o el cierre viene antes que la apertura). Factorizado
// aparte de tagInSection para poder distinguir, en los avisos de las
// lecciones, "la etiqueta está fuera de sitio" de "la sección en sí está
// rota o no existe" — son errores distintos y confundirlos despista al
// alumno (ver sectionExists más abajo).
function findSection(src, sectionTag) {
  const openMatch = new RegExp(`<${sectionTag}(?:\\s[^>]*)?>`, 'i').exec(src);
  const closeMatch = new RegExp(`</${sectionTag}\\s*>`, 'i').exec(src);
  if (!openMatch || !closeMatch) return null;
  const sectionStart = openMatch.index + openMatch[0].length;
  const sectionEnd = closeMatch.index;
  if (sectionEnd <= sectionStart) return null;
  return { sectionStart, sectionEnd };
}

// Comprueba TODAS las coincidencias de tagPattern, no solo la primera: si el
// alumno deja una etiqueta mal puesta de un intento anterior y añade otra
// bien puesta sin borrar la primera, debe contar como resuelto igualmente.
export const tagInSection = (tagPattern, sectionTag) =>
  safe((s) => {
    const src = s.code?.html ?? '';
    const section = findSection(src, sectionTag);
    if (!section) return false;
    const { sectionStart, sectionEnd } = section;
    const global = new RegExp(tagPattern.source, tagPattern.flags.includes('g') ? tagPattern.flags : tagPattern.flags + 'g');
    let match;
    while ((match = global.exec(src))) {
      if (match.index >= sectionStart && match.index < sectionEnd) return true;
      if (match[0].length === 0) global.lastIndex++; // evita bucle infinito con patrones que matchean vacío
    }
    return false;
  });

// ¿Tiene el alumno un <sectionTag>...</sectionTag> completo en su HTML? Para
// usar en los `warn` que acompañan a tagInSection: si esto da false, el
// problema no es que la etiqueta esté fuera de sitio (tagInSection ya
// descartó eso) sino que la sección misma falta o está mal escrita, y el
// aviso debe decir eso en vez de "muévela a head/body".
export const sectionExists = (sectionTag) =>
  safe((s) => findSection(s.code?.html ?? '', sectionTag) != null);
