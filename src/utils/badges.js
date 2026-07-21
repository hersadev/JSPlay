// Definiciones de logros, separados por nivel: cada nivel es una sección
// independiente con su propia colección y su propio almacenamiento.
//
// Cada check recibe { sandboxState, lessonIndex, totalLessons, isComplete }
// — lessonIndex es el índice DENTRO del nivel activo — y devuelve true
// cuando el logro se desbloquea. Una vez ganado, useBadges ya no lo vuelve
// a comprobar, así que un check puede depender del estado "actual" del
// sandbox sin miedo a que se pierda al pasar a otra lección.

import { hasElement, textNotEmpty, noErrors, sourceIncludes } from '../lessons/_helpers';
import { LEVEL_LESSONS, lessonIndexInLevel } from '../lessons';

// El nivel básico conserva su clave histórica para no perder logros ya
// ganados; los demás niveles llevan la clave con sufijo.
const storageKey = (level) => (level === 'basico' ? 'jsplay:badges' : `jsplay:badges:${level}`);

const BADGES_BASICO = [
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
    check: ({ lessonIndex }) => lessonIndex > lessonIndexInLevel('basico', 'm1-l8'),
  },
  {
    id: 'web-designer',
    name: 'Diseñador web',
    description: 'Termina el módulo 1: tu primera página con HTML y CSS.',
    icon: '🖌️',
    check: ({ lessonIndex }) => lessonIndex > lessonIndexInLevel('basico', 'm1-l9'),
  },
  {
    id: 'first-function',
    name: 'Primera función',
    description: 'Escribe y llama a tu primera función en JavaScript.',
    icon: '🧩',
    check: ({ lessonIndex }) => lessonIndex > lessonIndexInLevel('basico', 'm2-l6'),
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
    check: ({ lessonIndex }) => lessonIndex > lessonIndexInLevel('basico', 'm2-l12'),
  },
  {
    id: 'nivel-basico',
    name: 'Nivel básico completado',
    description: `Termina las ${LEVEL_LESSONS.basico.length} lecciones del nivel básico.`,
    icon: '🥉',
    check: ({ lessonIndex }) => lessonIndex >= LEVEL_LESSONS.basico.length,
  },
  {
    id: 'graduate',
    name: 'Graduado',
    description: `Completa las ${LEVEL_LESSONS.basico.length} lecciones del nivel básico.`,
    icon: '🎓',
    check: ({ lessonIndex, isComplete }) =>
      lessonIndex >= LEVEL_LESSONS.basico.length ||
      (isComplete && lessonIndex >= LEVEL_LESSONS.basico.length - 1),
  },
];

const BADGES_MEDIO = [
  {
    id: 'arquitecto',
    name: 'Arquitecto web',
    description: 'Estructura tu página con <header>, <main> y <footer>.',
    icon: '🏛️',
    check: ({ sandboxState }) =>
      !!sandboxState &&
      hasElement('header')(sandboxState) &&
      hasElement('main')(sandboxState) &&
      hasElement('footer')(sandboxState),
  },
  {
    id: 'grid-master',
    name: 'Maestro del Grid',
    description: 'Coloca tu galería con CSS Grid.',
    icon: '🧱',
    check: ({ lessonIndex }) => lessonIndex > lessonIndexInLevel('medio', 'm3-l3'),
  },
  {
    id: 'adaptable',
    name: 'Se ve bien en el móvil',
    description: 'Adapta tu web a pantallas estrechas con una media query.',
    icon: '📱',
    check: ({ sandboxState }) =>
      !!sandboxState && sourceIncludes('css', /@media[^{]*\(\s*max-width/i)(sandboxState),
  },
  {
    id: 'camaleon',
    name: 'Camaleón',
    description: 'Dale a tu web un interruptor de tema claro/oscuro.',
    icon: '🌓',
    check: ({ lessonIndex }) => lessonIndex > lessonIndexInLevel('medio', 'm3-l6'),
  },
  {
    id: 'motor-de-datos',
    name: 'Motor de datos',
    description: 'Genera las tarjetas de tu galería desde un array de objetos.',
    icon: '🗂️',
    check: ({ lessonIndex }) => lessonIndex > lessonIndexInLevel('medio', 'm3-l7'),
  },
  {
    id: 'memoria-de-elefante',
    name: 'Memoria de elefante',
    description: 'Haz que tu web recuerde al visitante con localStorage.',
    icon: '💾',
    check: ({ lessonIndex }) => lessonIndex > lessonIndexInLevel('medio', 'm3-l9'),
  },
  {
    id: 'nivel-medio',
    name: 'Nivel medio completado',
    description: `Termina las ${LEVEL_LESSONS.medio.length} fases del proyecto.`,
    icon: '🥈',
    check: ({ lessonIndex }) => lessonIndex >= LEVEL_LESSONS.medio.length,
  },
];

export const BADGES_BY_LEVEL = {
  basico: BADGES_BASICO,
  medio: BADGES_MEDIO,
};

export function loadEarnedBadges(level) {
  try {
    const raw = localStorage.getItem(storageKey(level));
    const ids = raw ? JSON.parse(raw) : [];
    const known = new Set((BADGES_BY_LEVEL[level] ?? []).map((b) => b.id));
    return new Set(ids.filter((id) => known.has(id)));
  } catch {
    return new Set();
  }
}

export function saveEarnedBadges(level, set) {
  try {
    localStorage.setItem(storageKey(level), JSON.stringify([...set]));
  } catch {}
}

export function clearEarnedBadges(level) {
  try {
    localStorage.removeItem(storageKey(level));
  } catch {}
}
