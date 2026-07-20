// Fuente única del orden pedagógico de los módulos y su agrupación en niveles.
// La usan App (secuencia de lecciones), LessonSelector (agrupación) y
// badges (umbrales calculados a partir de la posición de cada lección).

import { module1 } from './module1';
import { module2 } from './module2';

export const LEVELS = [
  {
    id: 'basico',
    name: 'Nivel básico',
    icon: '🥉',
    tagline: 'Maquetar una página con HTML y CSS, y darle vida con JavaScript.',
    chipClass: 'text-green-400 border-green-800',
  },
  // Niveles medio y avanzado: pendientes de una próxima entrega.
];

export const MODULES = [
  { id: 'module-1', name: 'Módulo 1 — Maqueta tu primera página', icon: '1️⃣', level: 'basico', lessons: module1 },
  { id: 'module-2', name: 'Módulo 2 — Dale vida con JavaScript', icon: '2️⃣', level: 'basico', lessons: module2 },
];

export const ALL_LESSONS = MODULES.flatMap((m) => m.lessons);

// Índice del módulo (0-based) al que pertenece cada lección, en el mismo
// orden que ALL_LESSONS.
export const LESSON_MODULE_INDEX = MODULES.flatMap((m, mi) => m.lessons.map(() => mi));

// Índice global (0-based) de una lección a partir de su id. Lo usan los
// logros para fijar umbrales sin hardcodear números que se desincronicen
// si cambia el contenido de las lecciones.
export function lessonIndexOf(lessonId) {
  return ALL_LESSONS.findIndex((l) => l.id === lessonId);
}
