// Fuente única del orden pedagógico de los módulos y su agrupación en niveles.
// La usan App (secuencia de lecciones), LessonSelector (agrupación) y
// badges (umbrales calculados a partir de la posición de cada lección).
//
// Los niveles son secciones independientes: cada uno tiene su propia
// secuencia de lecciones, su progreso y sus logros (ver persistence.js y
// badges.js). App trabaja siempre con las lecciones del nivel activo.

import { module1 } from './module1';
import { module2 } from './module2';
import { module3 } from './module3';

export const LEVELS = [
  {
    id: 'basico',
    name: 'Nivel básico',
    icon: '🥉',
    tagline: 'Maquetar una página con HTML y CSS, y darle vida con JavaScript.',
    chipClass: 'text-green-400 border-green-800',
  },
  {
    id: 'medio',
    name: 'Nivel medio',
    icon: '🥈',
    tagline: 'Un proyecto completo: semántica, Grid, responsive, datos y memoria.',
    chipClass: 'text-blue-400 border-blue-800',
  },
  // Nivel avanzado: pendiente de una próxima entrega.
];

export const DEFAULT_LEVEL = 'basico';

export const MODULES = [
  { id: 'module-1', name: 'Módulo 1 — Maqueta tu primera página', icon: '1️⃣', level: 'basico', lessons: module1 },
  { id: 'module-2', name: 'Módulo 2 — Dale vida con JavaScript', icon: '2️⃣', level: 'basico', lessons: module2 },
  { id: 'module-3', name: 'Módulo 3 — Proyecto: tu web completa', icon: '🚀', level: 'medio', lessons: module3 },
];

export const ALL_LESSONS = MODULES.flatMap((m) => m.lessons);

// Lecciones de cada nivel, en orden pedagógico. Es la secuencia sobre la
// que trabajan App y el selector cuando ese nivel está activo.
export const LEVEL_LESSONS = Object.fromEntries(
  LEVELS.map((lvl) => [
    lvl.id,
    MODULES.filter((m) => m.level === lvl.id).flatMap((m) => m.lessons),
  ])
);

// Índice del módulo (0-based) al que pertenece cada lección, en el mismo
// orden que ALL_LESSONS.
export const LESSON_MODULE_INDEX = MODULES.flatMap((m, mi) => m.lessons.map(() => mi));

// Índice global (0-based) de una lección a partir de su id. Lo usan los
// logros para fijar umbrales sin hardcodear números que se desincronicen
// si cambia el contenido de las lecciones.
export function lessonIndexOf(lessonId) {
  return ALL_LESSONS.findIndex((l) => l.id === lessonId);
}

// Índice de una lección dentro de la secuencia de su nivel (los logros y el
// progreso trabajan con índices locales al nivel, no globales).
export function lessonIndexInLevel(levelId, lessonId) {
  return (LEVEL_LESSONS[levelId] ?? []).findIndex((l) => l.id === lessonId);
}
