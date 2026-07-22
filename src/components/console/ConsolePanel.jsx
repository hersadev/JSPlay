import { useEffect, useRef, useState } from 'react';
import { useSandboxStore } from '../../store/sandboxStore';
import { translateError } from '../../utils/errorMessages';

const LEVEL_COLOR = {
  log: 'text-gray-200',
  info: 'text-blue-300',
  warn: 'text-yellow-300',
  error: 'text-red-400',
};

function formatArg(a) {
  if (a.type === 'string') {
    // console.log guarda strings como JSON (con comillas); se muestran sin
    // comillas, como en las devtools del navegador.
    try {
      return JSON.parse(a.raw);
    } catch (_) {
      return a.raw;
    }
  }
  return a.raw;
}

// Panel plegable: App decide su estado inicial según la lección (las de
// HTML/CSS no la necesitan) y esta barra permite mostrarla u ocultarla a
// mano. Plegada, avisa con un contador si hay errores o mensajes sin ver.
export default function ConsolePanel({ open = true, onToggle }) {
  const sandboxState = useSandboxStore((s) => s.sandboxState);
  const evalInSandbox = useSandboxStore((s) => s.evalInSandbox);
  const [input, setInput] = useState('');
  const [replLines, setReplLines] = useState([]);
  const scrollRef = useRef(null);

  const logLines = sandboxState?.consoleLog ?? [];
  const errors = sandboxState?.errors ?? [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [logLines.length, errors.length, replLines.length]);

  async function handleSubmit(e) {
    e.preventDefault();
    const expr = input.trim();
    if (!expr || !evalInSandbox) return;
    setInput('');
    const result = await evalInSandbox(expr);
    setReplLines((lines) => [...lines, { expr, ...result }]);
  }

  const isEmpty = logLines.length === 0 && errors.length === 0 && replLines.length === 0;

  return (
    <div className="flex flex-col h-full bg-gray-950 border-t border-gray-800">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        title={open ? 'Ocultar la consola' : 'Mostrar la consola'}
        className="flex-shrink-0 flex items-center gap-2 w-full px-3 py-1.5 bg-gray-900/60 border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-200 hover:bg-gray-900 transition-colors"
      >
        <span
          className={`text-[9px] transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
          aria-hidden="true"
        >
          ▶
        </span>
        <span aria-hidden="true">🖥️</span>
        <span>Consola</span>
        {!open && errors.length > 0 && (
          <span className="normal-case tracking-normal px-1.5 py-px rounded-full bg-red-900/60 text-red-300 font-mono">
            ⚠ {errors.length}
          </span>
        )}
        {!open && errors.length === 0 && logLines.length > 0 && (
          <span className="normal-case tracking-normal px-1.5 py-px rounded-full bg-gray-800 text-gray-400 font-mono">
            {logLines.length}
          </span>
        )}
      </button>
      {open && (
        <>
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 py-2 font-mono text-sm space-y-1"
          >
            {isEmpty && (
              <p className="text-gray-600 italic">
                Usa console.log() en tu código, o escribe una expresión abajo.
              </p>
            )}
            {logLines.map((entry, i) => (
              <div key={`log-${i}`} className={LEVEL_COLOR[entry.level] ?? 'text-gray-200'}>
                {entry.args.map((a, j) => (
                  <span key={j} className="mr-2">
                    {String(formatArg(a))}
                  </span>
                ))}
              </div>
            ))}
            {errors.map((err, i) => (
              <div key={`err-${i}`} className="text-red-400">
                ⚠ {translateError(err.message)}
                {err.line != null && <span className="text-red-500/70"> (línea {err.line})</span>}
              </div>
            ))}
            {replLines.map((line, i) => (
              <div key={`repl-${i}`}>
                <div className="text-gray-500">
                  <span className="text-green-400">{'>'}</span> {line.expr}
                </div>
                <div className={line.ok ? 'text-gray-200' : 'text-red-400'}>
                  {line.ok ? line.output : translateError(line.output)}
                </div>
              </div>
            ))}
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex-shrink-0 flex items-center gap-2 border-t border-gray-800 px-3 py-2"
          >
            <span className="text-green-400 font-mono text-sm">{'>'}</span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe una expresión JS y pulsa Enter…"
              className="flex-1 bg-transparent text-sm font-mono text-gray-100 placeholder-gray-600 outline-none"
            />
          </form>
        </>
      )}
    </div>
  );
}
