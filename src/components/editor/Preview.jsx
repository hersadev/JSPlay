import { useEffect, useRef } from 'react';
import { buildSrcDoc, readSandboxState } from '../../engine/sandboxRunner';
import { useSandboxStore } from '../../store/sandboxStore';

const DEBOUNCE_MS = 400;

// Dueño del <iframe> de vista previa: reconstruye su srcdoc (con debounce)
// cada vez que cambia el código, y cuando termina de cargar lee el estado
// resultante (DOM, consola, errores) y lo publica en el store para que las
// lecciones puedan validar sus objetivos contra él.
//
// sandbox="allow-scripts allow-same-origin": el contenido es el propio
// código del alumno (no una web externa), así que acceder a su
// contentDocument/contentWindow desde el padre es seguro y es justo lo que
// necesitamos para leer el resultado sin un protocolo de mensajes aparte.
export default function Preview() {
  const iframeRef = useRef(null);
  const timeoutRef = useRef(null);
  const code = useSandboxStore((s) => s.code);
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
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;
      iframe.srcdoc = buildSrcDoc(code);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timeoutRef.current);
  }, [code]);

  function handleLoad() {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const state = readSandboxState(iframe, code);
    if (state) setSandboxState(state);
  }

  return (
    <iframe
      ref={iframeRef}
      title="Vista previa"
      onLoad={handleLoad}
      sandbox="allow-scripts allow-same-origin"
      className="w-full h-full bg-white border-0"
    />
  );
}
