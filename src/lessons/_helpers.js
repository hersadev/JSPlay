// Validadores reutilizables para las lecciones. Reciben el sandboxState
// ({ win, doc, consoleLog, errors, code }, ver engine/sandboxRunner.js) y
// devuelven true/false. Todos son tolerantes: si el iframe aún no cargó
// (sandboxState es null) o el selector no existe, devuelven false en vez
// de lanzar un error.

const safe = (fn) => (s) => {
  try {
    return !!fn(s);
  } catch (_) {
    return false;
  }
};

// ── DOM ────────────────────────────────────────────────────────────────

export const hasElement = (selector) => safe((s) => s.doc.querySelector(selector));

export const minCount = (selector, n) =>
  safe((s) => s.doc.querySelectorAll(selector).length >= n);

export const textNotEmpty = (selector) =>
  safe((s) => s.doc.querySelector(selector)?.textContent.trim().length > 0);

export const textContains = (selector, substring) =>
  safe((s) => s.doc.querySelector(selector)?.textContent.includes(substring));

export const attrNotEmpty = (selector, attr) =>
  safe((s) => (s.doc.querySelector(selector)?.getAttribute(attr) ?? '').trim().length > 0);

export const attrEquals = (selector, attr, expected) =>
  safe((s) => s.doc.querySelector(selector)?.getAttribute(attr) === expected);

// prop: nombre de estilo computado en camelCase (ej. 'backgroundColor').
// expected: valor exacto, o función (valor) => boolean para comparaciones flexibles.
export const computedStyle = (selector, prop, expected) =>
  safe((s) => {
    const el = s.doc.querySelector(selector);
    if (!el) return false;
    const value = s.win.getComputedStyle(el)[prop];
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

export const globalIsFunction = (name) => safe((s) => typeof s.win[name] === 'function');

export const callFunction = (name, args, expected) =>
  safe((s) => {
    const fn = s.win[name];
    if (typeof fn !== 'function') return false;
    const result = fn(...args);
    return typeof expected === 'function' ? expected(result) : result === expected;
  });

// ── Consola ──────────────────────────────────────────────────────────────

export const consoleHasType = (type) =>
  safe((s) => s.consoleLog.some((e) => e.args.some((a) => a.type === type)));

// predicate: (rawJSON, type) => boolean
export const consoleHasValue = (predicate) =>
  safe((s) => s.consoleLog.some((e) => e.args.some((a) => predicate(a.raw, a.type))));

export const consoleCountAtLeast = (n) =>
  safe((s) => s.consoleLog.length >= n);

export const noErrors = (s) => s != null && (s.errors?.length ?? 0) === 0;

// ── Código fuente ──────────────────────────────────────────────────────
// Comprobación estructural (¿usaste tal palabra clave/sintaxis?) para
// complementar validadores de resultado cuando el resultado solo no basta
// para confirmar que se usó el concepto de la lección.

export const sourceIncludes = (fileKey, pattern) =>
  safe((s) => {
    const src = s.code?.[fileKey] ?? '';
    return pattern instanceof RegExp ? pattern.test(src) : src.includes(pattern);
  });
