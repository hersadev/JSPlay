import { create } from 'zustand';

// Estado del "motor" de JSPlay: el código que el alumno está editando (html/
// css/js) y el último sandboxState leído del iframe de vista previa
// ({ win, doc, consoleLog, errors, code }, ver engine/sandboxRunner.js).
// evalInSandbox se registra desde el propio <Preview>, que es quien tiene la
// referencia al iframe: así el panel de Consola puede evaluar expresiones
// sueltas sin tener que conocer el DOM del iframe.
export const useSandboxStore = create((set) => ({
  code: { html: '', css: '', js: '' },
  sandboxState: null,
  evalInSandbox: null,

  replaceCode: (code) =>
    set({ code: { html: code?.html ?? '', css: code?.css ?? '', js: code?.js ?? '' } }),

  setCode: (patch) => set((s) => ({ code: { ...s.code, ...patch } })),

  setSandboxState: (sandboxState) => set({ sandboxState }),

  registerEvalRunner: (fn) => set({ evalInSandbox: fn }),
}));
