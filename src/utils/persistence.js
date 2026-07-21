import { ALL_LESSONS, lessonIndexOf } from '../lessons';

const CODE_KEY = 'jsplay:code';
const CODE_LESSON_KEY = 'jsplay:codeLessonId';
const LESSON_KEY = 'jsplay:lesson';
const LESSON_ID_KEY = 'jsplay:lessonId';
const LESSON_MAX_KEY = 'jsplay:lessonMax';
const LESSON_MAX_ID_KEY = 'jsplay:lessonMaxId';
const WELCOME_KEY = 'jsplay:welcomed';
const BADGES_KEY = 'jsplay:badges';

// La lección actual se guarda por id además de por índice numérico: si una
// versión futura inserta o divide lecciones, el índice se desplaza pero el
// id sigue apuntando a la misma lección. El índice queda como fallback para
// guardados antiguos.
const DONE_ID = '__done__'; // curso terminado (índice más allá de la última lección)

function lessonIdAt(index) {
  return ALL_LESSONS[index]?.id ?? DONE_ID;
}

function indexFromSaved(idKey, numericKey) {
  const id = localStorage.getItem(idKey);
  if (id === DONE_ID) return ALL_LESSONS.length;
  if (id) {
    const i = lessonIndexOf(id);
    if (i >= 0) return i;
  }
  const n = Math.max(0, parseInt(localStorage.getItem(numericKey) ?? '0') || 0);
  return Math.min(n, ALL_LESSONS.length);
}

// Bumpea la versión cuando cambia el esquema serializado del código guardado.
const SCHEMA_VERSION = 1;

// El código en curso se guarda junto al id de la lección a la que pertenece:
// así, si el jugador recarga a mitad de una lección, recupera justo lo que
// tenía escrito; si ya avanzó a otra lección, se descarta y se siembra de
// nuevo desde el setupFiles de la lección nueva.
export function saveCode(lessonId, code) {
  try {
    localStorage.setItem(CODE_KEY, JSON.stringify({ _v: SCHEMA_VERSION, code }));
    localStorage.setItem(CODE_LESSON_KEY, lessonId ?? '');
  } catch (_) {}
}

export function loadCode(lessonId) {
  try {
    if (localStorage.getItem(CODE_LESSON_KEY) !== lessonId) return null;
    const raw = localStorage.getItem(CODE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (d._v !== SCHEMA_VERSION) return null;
    return d.code ?? null;
  } catch (_) {
    return null;
  }
}

export function saveLessonIndex(index) {
  try {
    localStorage.setItem(LESSON_KEY, String(index));
    localStorage.setItem(LESSON_ID_KEY, lessonIdAt(index));
  } catch (_) {}
}

export function loadLessonIndex() {
  try {
    return indexFromSaved(LESSON_ID_KEY, LESSON_KEY);
  } catch (_) {
    return 0;
  }
}

// Índice de la lección más avanzada alcanzada (para desbloquear en el selector).
export function saveLessonMax(index) {
  try {
    localStorage.setItem(LESSON_MAX_KEY, String(index));
    localStorage.setItem(LESSON_MAX_ID_KEY, lessonIdAt(index));
  } catch (_) {}
}

export function loadLessonMax() {
  try {
    if (
      localStorage.getItem(LESSON_MAX_ID_KEY) === null &&
      localStorage.getItem(LESSON_MAX_KEY) === null
    ) {
      return loadLessonIndex();
    }
    return indexFromSaved(LESSON_MAX_ID_KEY, LESSON_MAX_KEY);
  } catch (_) {
    return 0;
  }
}

export function clearProgress() {
  try {
    localStorage.removeItem(CODE_KEY);
    localStorage.removeItem(CODE_LESSON_KEY);
    localStorage.removeItem(LESSON_KEY);
    localStorage.removeItem(LESSON_ID_KEY);
    localStorage.removeItem(LESSON_MAX_KEY);
    localStorage.removeItem(LESSON_MAX_ID_KEY);
    localStorage.removeItem(WELCOME_KEY);
    localStorage.removeItem(BADGES_KEY);
  } catch (_) {}
}

// Modal de bienvenida: se muestra a usuarios nuevos y tras reiniciar el juego.
export function loadWelcomeSeen() {
  try { return localStorage.getItem(WELCOME_KEY) === '1'; } catch (_) { return true; }
}

export function saveWelcomeSeen() {
  try { localStorage.setItem(WELCOME_KEY, '1'); } catch (_) {}
}

export function loadEarnedBadgeIds() {
  try {
    const raw = JSON.parse(localStorage.getItem(BADGES_KEY) ?? '[]');
    return Array.isArray(raw) ? raw : [];
  } catch (_) {
    return [];
  }
}

export function saveEarnedBadgeIds(ids) {
  try { localStorage.setItem(BADGES_KEY, JSON.stringify(ids)); } catch (_) {}
}

const EXPORT_VERSION = 1;

// Empaqueta todo el progreso (código, lección y logros) tal cual está en
// localStorage para descargarlo como archivo. El progreso ya se auto-guarda;
// esto permite además hacer copia de seguridad y llevarlo a otro navegador.
export function exportProgress() {
  try {
    return {
      _app: 'jsplay',
      _export: EXPORT_VERSION,
      savedAt: new Date().toISOString(),
      code: localStorage.getItem(CODE_KEY),
      codeLessonId: localStorage.getItem(CODE_LESSON_KEY),
      lesson: localStorage.getItem(LESSON_KEY),
      lessonId: localStorage.getItem(LESSON_ID_KEY),
      lessonMax: localStorage.getItem(LESSON_MAX_KEY),
      lessonMaxId: localStorage.getItem(LESSON_MAX_ID_KEY),
      badges: localStorage.getItem(BADGES_KEY),
    };
  } catch (_) {
    return null;
  }
}

// Restaura un progreso exportado. Devuelve true si el archivo es válido.
// El llamador debe recargar la app para que el store se reinicialice.
export function importProgress(data) {
  try {
    if (!data || data._app !== 'jsplay') return false;
    const set = (key, value) => {
      if (typeof value === 'string') localStorage.setItem(key, value);
      else localStorage.removeItem(key);
    };
    set(CODE_KEY, data.code);
    set(CODE_LESSON_KEY, data.codeLessonId);
    set(LESSON_KEY, data.lesson);
    set(LESSON_ID_KEY, data.lessonId);
    set(LESSON_MAX_KEY, data.lessonMax);
    set(LESSON_MAX_ID_KEY, data.lessonMaxId);
    set(BADGES_KEY, data.badges);
    return true;
  } catch (_) {
    return false;
  }
}
