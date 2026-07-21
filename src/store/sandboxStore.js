import { create } from 'zustand';

// Estado del "motor" de JSPlay: el código que el alumno está editando (html/
// css/js) y el último sandboxState leído del iframe de vista previa
// ({ win, doc, consoleLog, errors, code }, ver engine/sandboxRunner.js).
// evalInSandbox se registra desde el propio <Preview>, que es quien tiene la
// referencia al iframe: así el panel de Consola puede evaluar expresiones
// sueltas sin tener que conocer el DOM del iframe.
//
// codeRevision solo sube cuando el código se reemplaza por completo (cambio
// de lección, sandbox, reset, importar progreso), nunca al teclear: es la
// señal que usa <Preview> para renderizar automáticamente el código de
// partida sin re-renderizar en cada pulsación mientras el alumno escribe.
// manualRenderTick sube cada vez que el alumno pulsa "Ver en web" (el botón
// vive en <CodeTabs>, junto al editor). renderedCode guarda el código que
// hay realmente pintado en el iframe, para que ese mismo botón sepa si hay
// cambios sin ver (comparándolo con `code`) sin depender de <Preview>.
export const useSandboxStore = create((set) => ({
  code: { html: '', css: '', js: '' },
  codeRevision: 0,
  manualRenderTick: 0,
  renderedCode: { html: '', css: '', js: '' },
  sandboxState: null,
  evalInSandbox: null,

  // Al reemplazar el código se invalida también el sandboxState: el que hay
  // pertenece a la página anterior, y evaluarlo contra la lección/los logros
  // nuevos daría falsos positivos (p. ej. ganar "Primera página" nada más
  // reiniciar, porque el h1 de la página vieja sigue en el estado).
  replaceCode: (code) =>
    set((s) => ({
      code: { html: code?.html ?? '', css: code?.css ?? '', js: code?.js ?? '' },
      codeRevision: s.codeRevision + 1,
      sandboxState: null,
    })),

  setCode: (patch) => set((s) => ({ code: { ...s.code, ...patch } })),

  requestRender: () => set((s) => ({ manualRenderTick: s.manualRenderTick + 1 })),

  setRenderedCode: (renderedCode) => set({ renderedCode }),

  setSandboxState: (sandboxState) => set({ sandboxState }),

  registerEvalRunner: (fn) => set({ evalInSandbox: fn }),
}));
