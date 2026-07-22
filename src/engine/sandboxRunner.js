// Arma el documento que corre dentro del iframe de vista previa.
//
// El iframe se carga con una URL data: (ver Preview.jsx), que SIEMPRE tiene
// un origen opaco distinto al de la app, sin importar el atributo `sandbox`.
// Antes se usaba srcdoc con sandbox="allow-scripts allow-same-origin", que
// heredaba el origen de la propia app: cualquier JS del alumno (pegado desde
// cualquier sitio) podía entonces hacer window.parent.document... y leer o
// reescribir la app real, o su localStorage — un escape de sandbox completo
// y bien documentado de esa combinación concreta. Con origen opaco de
// verdad, el único canal entre iframe y app es postMessage (ver
// sandboxBridge.js), así que ya no hay contentDocument/contentWindow que
// leer directamente desde fuera.
//
// La sonda que se inyecta en el documento hace estas cosas:
//  1. Sobreescribe console.log/warn/error/info y el listener de errores
//     globales para EMPUJAR cada entrada al padre por postMessage en cuanto
//     ocurre (antes se guardaban en window.__consoleLog para que el padre
//     las leyera al final; ya no es posible leerlas desde fuera).
//  2. Responde a preguntas del padre (¿existe este selector?, ¿cuál es su
//     texto/atributo/estilo computado?, ¿es tal nombre global una función?,
//     llama a esta función con estos argumentos, evalúa esta expresión…)
//     también por postMessage — ver sandboxBridge.js en el lado del padre.
//  3. Simula localStorage con un polyfill en memoria: con origen opaco, el
//     localStorage real lanza un error de seguridad. El polyfill parte de
//     una foto inicial que le pasa el padre (lo último que se guardó) y, en
//     cada escritura, además de actualizarse a sí mismo, avisa al padre para
//     que la persista de verdad — así una lección como "recuerda el tema
//     con localStorage" sigue sobreviviendo a pulsar «Ver en web».
//  4. Anula la navegación de los <a href="...">: seguir un enlace real
//     sacaría al alumno de su propio código. Si el href es una URL http(s)
//     de verdad, se abre en una pestaña nueva con window.open — LLAMADO AQUÍ
//     MISMO, de forma síncrona dentro del propio handler del clic: si en vez
//     de esto se avisa al padre por postMessage y es el padre quien llama a
//     window.open, el navegador ya no lo considera "originado por un gesto
//     del usuario" y el bloqueador de popups lo descarta en silencio. Por
//     eso el iframe necesita el permiso "allow-popups" (ver sandbox en
//     <Preview>). Los href relativos, "#", etc. no abren nada — salvo que no
//     empiecen por "#", en cuyo caso se avisa por consola de que falta el
//     "https://", el error típico de un principiante al escribir un enlace.
//  5. Avisa al padre de cualquier clic (kind: "activity"): el padre no puede
//     escuchar clics directamente dentro de un documento de otro origen, y
//     necesita saber cuándo algo pudo cambiar (p. ej. un listener del propio
//     alumno) para volver a comprobar los objetivos de la lección.
const BRIDGE_TAG = '__jsplay__'; // debe coincidir con TAG en sandboxBridge.js

const STORAGE_POLYFILL = `
(function () {
  var __store = window.__jsplayStorageInit || {};
  function __keys() { return Object.keys(__store); }
  var api = {
    getItem: function (key) {
      key = String(key);
      return Object.prototype.hasOwnProperty.call(__store, key) ? __store[key] : null;
    },
    setItem: function (key, value) {
      key = String(key);
      __store[key] = String(value);
      try {
        window.parent.postMessage({ tag: '${BRIDGE_TAG}', kind: 'storageSet', key: key, value: String(value) }, '*');
      } catch (e) {}
    },
    removeItem: function (key) {
      key = String(key);
      delete __store[key];
      try {
        window.parent.postMessage({ tag: '${BRIDGE_TAG}', kind: 'storageRemove', key: key }, '*');
      } catch (e) {}
    },
    clear: function () {
      __store = {};
      try {
        window.parent.postMessage({ tag: '${BRIDGE_TAG}', kind: 'storageClear' }, '*');
      } catch (e) {}
    },
    key: function (i) { return __keys()[i] ?? null; },
  };
  Object.defineProperty(api, 'length', { get: function () { return __keys().length; } });
  try {
    Object.defineProperty(window, 'localStorage', { value: api, configurable: true });
  } catch (e) {}
})();
`;

const PROBE_SCRIPT = `
function __classify(v) {
  if (Array.isArray(v)) return 'array';
  if (v === null) return 'null';
  return typeof v;
}
function __stringify(v) {
  try { return JSON.stringify(v); } catch (_) { return String(v); }
}
function __post(msg) {
  try { window.parent.postMessage(msg, '*'); } catch (e) {}
}
['log', 'warn', 'error', 'info'].forEach(function (level) {
  var original = console[level] ? console[level].bind(console) : function () {};
  console[level] = function () {
    var args = Array.prototype.slice.call(arguments).map(function (v) {
      return { type: __classify(v), raw: __stringify(v) };
    });
    __post({ tag: '${BRIDGE_TAG}', kind: 'console', entry: { level: level, args: args } });
    original.apply(console, arguments);
  };
});
window.addEventListener('error', function (e) {
  __post({ tag: '${BRIDGE_TAG}', kind: 'error', message: e.message });
});

function __reply(id, result) {
  try {
    window.parent.postMessage({ tag: '${BRIDGE_TAG}', id: id, result: result }, '*');
  } catch (e) {
    try {
      window.parent.postMessage(
        { tag: '${BRIDGE_TAG}', id: id, result: { __uncloneable: true, text: String(result) } },
        '*'
      );
    } catch (e2) {}
  }
}
function __handleQuery(msg) {
  switch (msg.kind) {
    case 'exists':
      return !!document.querySelector(msg.selector);
    case 'count':
      return document.querySelectorAll(msg.selector).length;
    case 'text': {
      var elText = document.querySelector(msg.selector);
      return elText ? elText.textContent : null;
    }
    case 'attr': {
      var elAttr = document.querySelector(msg.selector);
      return elAttr ? elAttr.getAttribute(msg.attr) : null;
    }
    case 'computedStyle': {
      var elStyle = document.querySelector(msg.selector);
      if (!elStyle) return null;
      return window.getComputedStyle(elStyle)[msg.prop];
    }
    case 'globalIsFunction':
      return typeof window[msg.name] === 'function';
    case 'callFunction': {
      var fn = window[msg.name];
      if (typeof fn !== 'function') return { notFunction: true };
      return { value: fn.apply(null, msg.args || []) };
    }
    case 'evalExpr': {
      var value, errMsg;
      try {
        value = window.eval(msg.expr);
      } catch (err) {
        errMsg = err.message;
      }
      if (errMsg != null) return { ok: false, output: errMsg };
      var output;
      if (value === undefined) {
        output = 'undefined';
      } else {
        try { output = JSON.stringify(value); } catch (_) { output = undefined; }
        if (output === undefined) output = String(value);
      }
      return { ok: true, output: output };
    }
    default:
      return null;
  }
}
window.addEventListener('message', function (e) {
  var msg = e.data;
  if (!msg || msg.tag !== '${BRIDGE_TAG}' || msg.id == null) return;
  var result = null;
  try {
    result = __handleQuery(msg);
  } catch (err) {
    result = null;
  }
  __reply(msg.id, result);
});

document.addEventListener('click', function (e) {
  var el = e.target;
  while (el && el !== document) {
    if (el.tagName === 'A' && el.hasAttribute('href')) {
      e.preventDefault();
      var href = el.getAttribute('href') || '';
      if (/^(https?:)?\\/\\//i.test(href)) {
        window.open(href, '_blank', 'noopener,noreferrer');
      } else if (href === '') {
        console.warn('El enlace no tiene destino: el atributo href está vacío.');
      } else if (href.charAt(0) !== '#') {
        var suggestion = href.indexOf(':') === -1 ? ' Prueba con "https://' + href + '".' : '';
        console.warn('El enlace "' + href + '" no se abrió: la vista previa solo abre URLs completas (con "https://").' + suggestion);
      }
      return;
    }
    el = el.parentNode;
  }
}, true);
document.addEventListener('click', function () {
  __post({ tag: '${BRIDGE_TAG}', kind: 'activity' });
});
`;

// El alumno puede escribir un documento completo (<html><head><body>) o solo
// un fragmento suelto — DOMParser rellena head/body por su cuenta en ambos
// casos (igual que haría un navegador real), así que `parsed.head` y
// `parsed.body` siempre existen. Esto hace la vista previa tolerante con
// HTML mal formado o incompleto: nunca se rompe por eso. La corrección
// estructural de verdad (¿el alumno puso el <link> dentro de <head> en el
// texto que escribió?) se valida aparte, sobre el código fuente en bruto
// (ver tagInSection en _helpers.js) — no sobre este DOM ya reparado.
//
// `storage` es la última foto conocida del localStorage simulado del
// alumno (ver STORAGE_POLYFILL arriba y el manejo de mensajes storageSet/
// storageRemove/storageClear en Preview.jsx), para que sobreviva a recargar
// la vista previa.
// El HTML parser cierra un <script>/<style> en cuanto ve la secuencia literal
// "</script" o "</style" (sin mirar si "está dentro de una cadena" — no lo
// sabe, ni le importa: es un tokenizador de texto, no entiende JS ni CSS).
// Si el alumno escribe, por ejemplo, `console.log("</script>")` — nada
// rebuscado, es el típico experimento con strings — esa secuencia cortaría
// el <script> a la mitad, dejando el resto como texto suelto visible en la
// página y el propio script roto. Insertar una barra invertida entre "<" y
// "/" evita el corte: el tokenizador HTML ya no ve la secuencia completa,
// y en JS una barra escapada dentro de una cadena/regex sigue significando
// lo mismo ("\/" === "/"), así que el código del alumno se comporta igual.
function escapeInlineClosingTags(str) {
  return String(str).replace(/<\/(script|style)/gi, '<\\/$1');
}

// Etiquetas que solo tienen sentido dentro de <head>. El parser HTML5 del
// navegador cierra <head> en cuanto ve el primer carácter de texto suelto
// que no espera ahí (un solo carácter fuera de <html>...</html>, o incluso
// dentro de <head> si rompe sin querer un comentario) y pasa a modo "in
// body": todo lo que el alumno escribiera después pensando que iba a
// <head> — <title>, <link>, <meta> — se cuela como hijo de <body> en su
// lugar, sin ningún aviso. Es una rotura de verdad (el <title> deja de ser
// el de la pestaña, un <link> puede acabar en un sitio inesperado del
// documento), así que se recupera desde donde haya caído antes de servir
// el documento — deliberadamente no se toca <script>, cuya posición sí
// puede cambiar cuándo se ejecuta.
const HEAD_ONLY_TAGS = ['title', 'link', 'meta', 'base', 'style'];

function reclaimHeadContent(parsed) {
  HEAD_ONLY_TAGS.forEach((tag) => {
    parsed.body.querySelectorAll(tag).forEach((el) => {
      parsed.head.appendChild(el);
    });
  });
}

export function buildSrcDoc({ html = '', css = '', js = '', storage = {} }) {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  reclaimHeadContent(parsed);
  let storageInit = '{}';
  try {
    storageInit = JSON.stringify(storage);
  } catch (_) {
    storageInit = '{}';
  }
  const safeCss = escapeInlineClosingTags(css);
  const safeJs = escapeInlineClosingTags(js);
  const safeStorageInit = escapeInlineClosingTags(storageInit);
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
${parsed.head.innerHTML}
<style>${safeCss}</style>
</head>
<body>
${parsed.body.innerHTML}
<script>window.__jsplayStorageInit = ${safeStorageInit};</script>
<script>${STORAGE_POLYFILL}</script>
<script>${PROBE_SCRIPT}</script>
<script>
try {
${safeJs}
} catch (err) {
  if (window.parent) {
    window.parent.postMessage({ tag: '${BRIDGE_TAG}', kind: 'error', message: err.message }, '*');
  }
}
</script>
</body>
</html>`;
}
