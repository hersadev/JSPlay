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
// Cuántos ms de calma esperar tras el último clic dentro del iframe antes de
// revalidar objetivos/logros. Un clic aislado se nota igual (el aviso llega
// casi al instante); una ráfaga de clics — típica en lecciones con contador
// — colapsa en una sola revalidación al final en vez de relanzar todo el
// pipeline (postMessage de ida y vuelta por cada objetivo, más logros) por
// cada clic suelto de la ráfaga.
const ACTIVITY_DEBOUNCE_MS = 150;

// Tope de entradas de consola/errores que se guardan. Sin límite, un bucle o
// un setInterval al que se le olvida el clearInterval (un error muy típico
// de principiante) llena la lista sin parar mientras el iframe siga vivo, y
// con ella la lista que renderiza <ConsolePanel> — de tirón de memoria a
// tirón de rendimiento del propio editor. Se descartan las entradas más
// antiguas primero (ventana deslizante), de sobra para cualquier lección real.
const MAX_CONSOLE_ENTRIES = 500;

export default function Preview() {
  const iframeRef = useRef(null);
  const bridgeRef = useRef(null);
  const consoleLogRef = useRef([]);
  const errorsRef = useRef([]);
  const codeRef = useRef({ html: '', css: '', js: '' });
  const storageRef = useRef(loadSandboxStorage());
  const activityTimerRef = useRef(null);

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
            consoleLogRef.current = [...consoleLogRef.current, msg.entry].slice(-MAX_CONSOLE_ENTRIES);
            publishState();
            break;
          case 'error':
            errorsRef.current = [...errorsRef.current, msg.message].slice(-MAX_CONSOLE_ENTRIES);
            publishState();
            break;
          case 'activity':
            // Algo pudo cambiar el DOM (p. ej. el propio listener de clic
            // del alumno): volver a publicar el estado para que se
            // revaliden los objetivos contra el DOM actual del iframe.
            // Con debounce (ver ACTIVITY_DEBOUNCE_MS): cada clic dispara esto,
            // y sin él una ráfaga de clics relanzaría el pipeline completo de
            // objetivos + logros una vez por clic.
            clearTimeout(activityTimerRef.current);
            activityTimerRef.current = setTimeout(publishState, ACTIVITY_DEBOUNCE_MS);
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
      clearTimeout(activityTimerRef.current);
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
    clearTimeout(activityTimerRef.current);
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
