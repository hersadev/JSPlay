// Arma el documento que corre dentro del iframe de vista previa y expone una
// pequeña "sonda" que el padre puede leer directamente después: el iframe usa
// sandbox="allow-scripts allow-same-origin", así que su contentDocument y
// contentWindow son accesibles desde fuera sin necesidad de postMessage.
//
// La sonda hace estas cosas antes/durante de que corra el script del alumno:
//  1. Sobreescribe console.log/warn/error/info para guardar cada llamada en
//     window.__consoleLog (con el tipo de cada argumento, no solo su texto).
//  2. Captura errores de ejecución (síncronos y de listeners) en window.__errors.
//  3. Dejar que el propio DOM resultante y las variables/funciones globales
//     que declare el alumno con `var`/`function` quedan accesibles tal cual
//     en window — no hace falta serializarlas aparte.
//  4. Anula la navegación de los <a href="...">: dentro de un iframe con
//     srcdoc no hay una URL real detrás, así que seguir un enlace (a MDN, a
//     "#", a una página relativa que no existe...) saca al alumno de su
//     propio código y "rompe" la vista previa. Si el href es una URL http(s)
//     de verdad, se abre en una pestaña nueva con window.open — LLAMADO AQUÍ
//     MISMO, de forma síncrona dentro del propio handler del clic: si en vez
//     de esto se avisa al padre por postMessage y es el padre quien llama a
//     window.open, el navegador ya no lo considera "originado por un gesto
//     del usuario" (la llamada llega en una tarea async aparte) y el
//     bloqueador de popups lo descarta en silencio. Por eso el iframe
//     necesita el permiso "allow-popups" (ver sandbox en <Preview>). Los
//     href relativos, "#", etc. no abren nada — salvo que no empiecen por
//     "#", en cuyo caso se avisa por consola (con console.warn, así el
//     alumno lo ve en el panel de Consola) de que le falta el "https://",
//     que es el error típico de un principiante al escribir un enlace.

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
document.addEventListener('click', function (e) {
  var el = e.target;
  while (el && el !== document) {
    if (el.tagName === 'A' && el.getAttribute('href')) {
      e.preventDefault();
      var href = el.getAttribute('href');
      if (/^(https?:)?\\/\\//i.test(href)) {
        window.open(href, '_blank', 'noopener,noreferrer');
      } else if (href.charAt(0) !== '#') {
        var suggestion = href.indexOf(':') === -1 ? ' Prueba con "https://' + href + '".' : '';
        console.warn('El enlace "' + href + '" no se abrió: la vista previa solo abre URLs completas (con "https://").' + suggestion);
      }
      return;
    }
    el = el.parentNode;
  }
}, true);
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
