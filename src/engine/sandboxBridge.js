// Puente de mensajes entre la app y el iframe de vista previa.
//
// El iframe navega a una URL data: (ver Preview.jsx), que SIEMPRE tiene un
// origen opaco distinto al de la app real, pase lo que pase con el atributo
// `sandbox` — así el código del alumno no puede alcanzar el DOM ni el
// localStorage reales de la app con `window.parent`. Esa aislación tiene un
// coste: `iframe.contentDocument`/`contentWindow` ya no son accesibles
// directamente desde aquí (son de otro origen), así que toda lectura del
// estado del sandbox pasa por `postMessage`, con una respuesta emparejada
// por id. Los mensajes sin id (consola, errores, clics) se tratan como
// avisos empujados por el iframe, no como respuestas a una pregunta.
const TAG = '__jsplay__';

export function createBridge(getTargetWindow, onPush) {
  let seq = 0;
  const pending = new Map();

  function handleMessage(event) {
    const msg = event.data;
    if (!msg || msg.tag !== TAG) return;
    if (msg.id != null) {
      const entry = pending.get(msg.id);
      if (!entry) return;
      pending.delete(msg.id);
      clearTimeout(entry.timer);
      entry.resolve(msg.result);
      return;
    }
    onPush?.(msg);
  }

  window.addEventListener('message', handleMessage);

  // Pregunta algo al iframe y espera su respuesta. Si el iframe no
  // responde a tiempo (recargó a mitad de camino, por ejemplo), se resuelve
  // con `null` en vez de dejar la promesa colgada para siempre.
  function query(kind, payload = {}, timeoutMs = 1500) {
    const target = getTargetWindow();
    if (!target) return Promise.resolve(null);
    const id = ++seq;
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        resolve(null);
      }, timeoutMs);
      pending.set(id, { resolve, timer });
      target.postMessage({ tag: TAG, id, kind, ...payload }, '*');
    });
  }

  function dispose() {
    window.removeEventListener('message', handleMessage);
    pending.forEach(({ timer }) => clearTimeout(timer));
    pending.clear();
  }

  return { query, dispose };
}
