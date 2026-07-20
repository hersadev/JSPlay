// Arma el documento que corre dentro del iframe de vista previa y expone una
// pequeña "sonda" que el padre puede leer directamente después: el iframe usa
// sandbox="allow-scripts allow-same-origin", así que su contentDocument y
// contentWindow son accesibles desde fuera sin necesidad de postMessage.
//
// La sonda hace tres cosas antes/durante de que corra el script del alumno:
//  1. Sobreescribe console.log/warn/error/info para guardar cada llamada en
//     window.__consoleLog (con el tipo de cada argumento, no solo su texto).
//  2. Captura errores de ejecución (síncronos y de listeners) en window.__errors.
//  3. Dejar que el propio DOM resultante y las variables/funciones globales
//     que declare el alumno con `var`/`function` quedan accesibles tal cual
//     en window — no hace falta serializarlas aparte.

const PROBE_SCRIPT = `
window.__consoleLog = [];
window.__errors = [];
function __classify(v) {
  if (Array.isArray(v)) return 'array';
  if (v === null) return 'null';
  return typeof v;
}
function __stringify(v) {
  try { return JSON.stringify(v); } catch (_) { return String(v); }
}
['log', 'warn', 'error', 'info'].forEach(function (level) {
  var original = console[level] ? console[level].bind(console) : function () {};
  console[level] = function () {
    var args = Array.prototype.slice.call(arguments).map(function (v) {
      return { type: __classify(v), raw: __stringify(v) };
    });
    window.__consoleLog.push({ level: level, args: args });
    original.apply(console, arguments);
  };
});
window.addEventListener('error', function (e) {
  window.__errors.push(e.message);
});
`;

export function buildSrcDoc({ html = '', css = '', js = '' }) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>${css}</style>
</head>
<body>
${html}
<script>${PROBE_SCRIPT}</script>
<script>
try {
${js}
} catch (err) {
  window.__errors.push(err.message);
}
</script>
</body>
</html>`;
}

// Lee el estado resultante de un iframe ya cargado. Se llama desde el
// handler onLoad del <iframe>, una vez que su srcdoc terminó de ejecutarse.
export function readSandboxState(iframe, code) {
  const win = iframe.contentWindow;
  const doc = iframe.contentDocument;
  if (!win || !doc) return null;
  return {
    win,
    doc,
    consoleLog: win.__consoleLog ?? [],
    errors: win.__errors ?? [],
    code,
  };
}
