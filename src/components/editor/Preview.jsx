import { useEffect, useRef } from 'react';
import { buildSrcDoc, readSandboxState } from '../../engine/sandboxRunner';
import { useSandboxStore } from '../../store/sandboxStore';

// Dueño del <iframe> de vista previa: solo reconstruye su srcdoc cuando el
// código se reemplaza por completo (codeRevision, cambio de lección/sandbox)
// o cuando el alumno pulsa "Ver en web" (manualRenderTick, botón en
// <CodeTabs>). No se renderiza en cada pulsación: mientras se escribe una
// etiqueta HTML a medio terminar, el navegador la da por "válida" y el
// visor mostraba resultados rotos o engañosos; con un disparo explícito,
// el alumno decide cuándo el código está listo para ver.
//
// Cuando termina de cargar, lee el estado resultante (DOM, consola, errores)
// y lo publica en el store para que las lecciones puedan validar sus
// objetivos contra él.
//
// sandbox="allow-scripts allow-same-origin": el contenido es el propio
// código del alumno (no una web externa), así que acceder a su
// contentDocument/contentWindow desde el padre es seguro y es justo lo que
// necesitamos para leer el resultado sin un protocolo de mensajes aparte.
// "allow-popups allow-popups-to-escape-sandbox": deja que los <a href> con
// URL real se abran en una pestaña nueva (ver sandboxRunner.js) y que esa
// pestaña nueva sea una página normal, no una que arrastre las mismas
// restricciones del sandbox.
export default function Preview() {
  const iframeRef = useRef(null);
  const codeRevision = useSandboxStore((s) => s.codeRevision);
  const manualRenderTick = useSandboxStore((s) => s.manualRenderTick);
  const renderedCode = useSandboxStore((s) => s.renderedCode);
  const setRenderedCode = useSandboxStore((s) => s.setRenderedCode);
  const setSandboxState = useSandboxStore((s) => s.setSandboxState);
  const registerEvalRunner = useSandboxStore((s) => s.registerEvalRunner);

  useEffect(() => {
    registerEvalRunner((expr) => {
      const win = iframeRef.current?.contentWindow;
      if (!win) return { ok: false, output: 'La vista previa aún no está lista.' };
      try {
        const result = win.eval(expr);
        return { ok: true, output: result === undefined ? 'undefined' : JSON.stringify(result) ?? String(result) };
      } catch (err) {
        return { ok: false, output: err.message };
      }
    });
    return () => registerEvalRunner(null);
  }, [registerEvalRunner]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const current = useSandboxStore.getState().code;
    setRenderedCode(current);
    iframe.srcdoc = buildSrcDoc(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeRevision, manualRenderTick]);

  function handleLoad() {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const state = readSandboxState(iframe, renderedCode);
    if (state) setSandboxState(state);

    // El estado del sandbox solo se lee aquí, al cargar. Pero gracias a
    // allow-same-origin también podemos escuchar los clics dentro del propio
    // documento del iframe desde fuera: así, si un clic genera console.log
    // nuevo (el aviso de "falta https://" de un enlace, o un console.log que
    // el alumno ponga en su propio listener), se vuelve a leer el estado y
    // aparece en el panel de Consola sin esperar a la próxima carga.
    const doc = iframe.contentDocument;
    const win = iframe.contentWindow;
    if (!doc || !win) return;
    doc.addEventListener('click', function () {
      setTimeout(() => {
        if (iframeRef.current?.contentWindow !== win) return;
        const latest = readSandboxState(iframeRef.current, renderedCode);
        if (latest) setSandboxState(latest);
      }, 0);
    });
  }

  return (
    <iframe
      ref={iframeRef}
      title="Vista previa"
      onLoad={handleLoad}
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      className="w-full h-full bg-white border-0"
    />
  );
}
