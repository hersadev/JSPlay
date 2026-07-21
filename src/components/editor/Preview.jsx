import { useEffect, useRef } from 'react';
import { buildSrcDoc } from '../../engine/sandboxRunner';
import { createBridge } from '../../engine/sandboxBridge';
import { useSandboxStore } from '../../store/sandboxStore';
import { loadSandboxStorage, persistSandboxStorage } from '../../utils/persistence';

// Dueño del <iframe> de vista previa: solo reconstruye su contenido cuando el
// código se reemplaza por completo (codeRevision, cambio de lección/sandbox)
// o cuando el alumno pulsa "Ver en web" (manualRenderTick, botón en
// <CodeTabs>). No se renderiza en cada pulsación: mientras se escribe una
// etiqueta HTML a medio terminar, el navegador la da por "válida" y el
// visor mostraba resultados rotos o engañosos; con un disparo explícito,
// el alumno decide cuándo el código está listo para ver.
//
// El iframe carga una URL data: (no srcdoc): eso le da SIEMPRE un origen
// opaco distinto al de la app, así que su contentDocument/contentWindow no
// son legibles desde aquí — todo el estado (consola, errores, DOM, eval de
// la REPL) llega por postMessage a través de sandboxBridge.js. Es más
// trabajo que leer directamente, pero es la diferencia entre "sandbox de
// verdad" y "cualquier script pegado en el editor puede tocar la app real".
export default function Preview() {
  const iframeRef = useRef(null);
  const bridgeRef = useRef(null);
  const consoleLogRef = useRef([]);
  const errorsRef = useRef([]);
  const codeRef = useRef({ html: '', css: '', js: '' });
  const storageRef = useRef(loadSandboxStorage());

  const codeRevision = useSandboxStore((s) => s.codeRevision);
  const manualRenderTick = useSandboxStore((s) => s.manualRenderTick);
  const setRenderedCode = useSandboxStore((s) => s.setRenderedCode);
  const setSandboxState = useSandboxStore((s) => s.setSandboxState);
  const registerEvalRunner = useSandboxStore((s) => s.registerEvalRunner);

  function publishState() {
    setSandboxState({
      query: bridgeRef.current.query,
      consoleLog: consoleLogRef.current,
      errors: errorsRef.current,
      code: codeRef.current,
    });
  }

  // El puente y el runner de la REPL se crean una sola vez: no dependen del
  // código ni de la lección, solo de la referencia (siempre estable) al
  // propio <iframe>.
  useEffect(() => {
    bridgeRef.current = createBridge(
      () => iframeRef.current?.contentWindow,
      (msg) => {
        switch (msg.kind) {
          case 'console':
            consoleLogRef.current = [...consoleLogRef.current, msg.entry];
            publishState();
            break;
          case 'error':
            errorsRef.current = [...errorsRef.current, msg.message];
            publishState();
            break;
          case 'activity':
            // Algo pudo cambiar el DOM (p. ej. el propio listener de clic
            // del alumno): volver a publicar el estado para que se
            // revaliden los objetivos contra el DOM actual del iframe.
            publishState();
            break;
          case 'storageSet':
            storageRef.current = { ...storageRef.current, [msg.key]: msg.value };
            persistSandboxStorage(storageRef.current);
            break;
          case 'storageRemove': {
            const next = { ...storageRef.current };
            delete next[msg.key];
            storageRef.current = next;
            persistSandboxStorage(storageRef.current);
            break;
          }
          case 'storageClear':
            storageRef.current = {};
            persistSandboxStorage(storageRef.current);
            break;
          default:
            break;
        }
      }
    );

    registerEvalRunner((expr) =>
      bridgeRef.current
        .query('evalExpr', { expr })
        .then((res) => res ?? { ok: false, output: 'La vista previa aún no está lista.' })
    );

    return () => {
      bridgeRef.current?.dispose();
      registerEvalRunner(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const current = useSandboxStore.getState().code;
    setRenderedCode(current);
    codeRef.current = current;
    consoleLogRef.current = [];
    errorsRef.current = [];
    const html = buildSrcDoc({ ...current, storage: storageRef.current });
    iframe.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeRevision, manualRenderTick]);

  function handleLoad() {
    if (!bridgeRef.current) return;
    publishState();
  }

  return (
    <iframe
      ref={iframeRef}
      title="Vista previa"
      onLoad={handleLoad}
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
      className="w-full h-full bg-white border-0"
    />
  );
}
