// Definiciones de logros. Cada check recibe { sandboxState, lessonIndex, totalLessons, isComplete }
// y devuelve true cuando el logro se desbloquea. Una vez ganado, useBadges ya
// no lo vuelve a comprobar — así que un check puede depender del estado
// "actual" del sandbox sin miedo a que se pierda al pasar a otra lección.

import { hasElement, textNotEmpty, noErrors } from '../lessons/_helpers';
import { ALL_LESSONS, LEVELS, MODULES, lessonIndexOf } from '../lessons';

const STORAGE_KEY = 'jsplay:badges';

export const BADGES = [
  {
    id: 'first-page',
    name: 'Primera página',
    description: 'Muestra tu primer <h1> con texto en la vista previa.',
    icon: '📄',
    check: ({ sandboxState }) =>
      !!sandboxState && hasElement('h1')(sandboxState) && textNotEmpty('h1')(sandboxState),
  },
  {
    id: 'stylist',
    name: 'Con estilo propio',
    description: 'Escribe tus primeras reglas CSS de verdad.',
    icon: '🎨',
    check: ({ sandboxState }) => (sandboxState?.code?.css ?? '').trim().length > 20,
  },
  {
    id: 'flexer',
    name: 'Domina Flexbox',
    description: 'Completa la lección de layout con Flexbox.',
    icon: '🤸',
    check: ({ lessonIndex }) => lessonIndex > lessonIndexOf('m1-l4'),
  },
  {
    id: 'web-designer',
    name: 'Diseñador web',
    description: 'Termina el módulo 1: tu primera página con HTML y CSS.',
    icon: '🖌️',
    check: ({ lessonIndex }) => lessonIndex >= MODULES[0].lessons.length,
  },
  {
    id: 'first-function',
    name: 'Primera función',
    description: 'Escribe y llama a tu primera función en JavaScript.',
    icon: '🧩',
    check: ({ lessonIndex }) => lessonIndex > lessonIndexOf('m2-l3'),
  },
  {
    id: 'bug-free',
    name: 'Cero errores',
    description: 'Ejecuta código JavaScript propio sin errores en consola.',
    icon: '🐛',
    check: ({ sandboxState }) =>
      !!sandboxState && (sandboxState.code?.js ?? '').trim().length > 0 && noErrors(sandboxState),
  },
  {
    id: 'dom-master',
    name: 'Manos en el DOM',
    description: 'Selecciona elementos del DOM con JavaScript.',
    icon: '🕹️',
    check: ({ lessonIndex }) => lessonIndex > lessonIndexOf('m2-l7'),
  },
  // Hitos por nivel: el umbral es el nº de lecciones hasta terminar el
  // último módulo del nivel, calculado desde MODULES (se ajusta solo al
  // añadir niveles medio/avanzado más adelante).
  ...LEVELS.map((lvl) => {
    const lastModuleIdx = MODULES.reduce((acc, m, i) => (m.level === lvl.id ? i : acc), -1);
    const threshold = MODULES.slice(0, lastModuleIdx + 1).reduce((n, mod) => n + mod.lessons.length, 0);
    return {
      id: `nivel-${lvl.id}`,
      name: `${lvl.name} completado`,
      description: `Termina las ${threshold} lecciones del ${lvl.name.toLowerCase()}.`,
      icon: lvl.icon,
      check: ({ lessonIndex }) => lessonIndex >= threshold,
    };
  }),
  {
    id: 'graduate',
    name: 'Graduado',
    description: `Completa las ${ALL_LESSONS.length} lecciones del curso.`,
    icon: '🎓',
    check: ({ lessonIndex, isComplete }) =>
      lessonIndex >= ALL_LESSONS.length || (isComplete && lessonIndex >= ALL_LESSONS.length - 1),
  },
];

export function loadEarnedBadges() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    const known = new Set(BADGES.map((b) => b.id));
    return new Set(ids.filter((id) => known.has(id)));
  } catch {
    return new Set();
  }
}

export function saveEarnedBadges(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {}
}

export function clearEarnedBadges() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
