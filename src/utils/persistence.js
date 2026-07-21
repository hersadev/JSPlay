import { LEVEL_LESSONS, DEFAULT_LEVEL } from '../lessons';

// Cada nivel es una sección independiente: guarda su propia lección actual
// y su máximo alcanzado. El nivel básico conserva las claves históricas
// (sin sufijo) para no perder el progreso de guardados anteriores; los
// demás niveles llevan la clave con ":<nivel>".
const CODE_KEY = 'jsplay:code';
const CODE_LESSON_KEY = 'jsplay:codeLessonId';
const LESSON_KEY = 'jsplay:lesson';
const LESSON_ID_KEY = 'jsplay:lessonId';
const LESSON_MAX_KEY = 'jsplay:lessonMax';
const LESSON_MAX_ID_KEY = 'jsplay:lessonMaxId';
const WELCOME_KEY = 'jsplay:welcomed';
const PROFILE_KEY = 'jsplay:profile';
const LEVEL_KEY = 'jsplay:level';

const levelKey = (base, level) => (level === DEFAULT_LEVEL ? base : `${base}:${level}`);

// La lección actual se guarda por id además de por índice numérico: si una
// versión futura inserta o divide lecciones, el índice se desplaza pero el
// id sigue apuntando a la misma lección. El índice queda como fallback para
// guardados antiguos.
const DONE_ID = '__done__'; // nivel terminado (índice más allá de la última lección)

function lessonsOf(level) {
  return LEVEL_LESSONS[level] ?? [];
}

function lessonIdAt(level, index) {
  return lessonsOf(level)[index]?.id ?? DONE_ID;
}

function indexFromSaved(level, idKey, numericKey) {
  const lessons = lessonsOf(level);
  const id = localStorage.getItem(levelKey(idKey, level));
  if (id === DONE_ID) return lessons.length;
  if (id) {
    const i = lessons.findIndex((l) => l.id === id);
    if (i >= 0) return i;
  }
  const n = Math.max(0, parseInt(localStorage.getItem(levelKey(numericKey, level)) ?? '0') || 0);
  return Math.min(n, lessons.length);
}

// Bumpea la versión cuando cambia el esquema serializado del código guardado.
const SCHEMA_VERSION = 1;

// El código en curso se guarda junto al id de la lección a la que pertenece:
// así, si el jugador recarga a mitad de una lección, recupera justo lo que
// tenía escrito; si ya avanzó a otra lección, se descarta y se siembra de
// nuevo desde el setupFiles de la lección nueva. Los ids de lección son
// únicos entre niveles, así que un único hueco de guardado basta.
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

// Nivel (sección) activo.
export function saveLevel(level) {
  try {
    localStorage.setItem(LEVEL_KEY, level);
  } catch (_) {}
}

export function loadLevel() {
  try {
    const level = localStorage.getItem(LEVEL_KEY);
    return level && LEVEL_LESSONS[level] ? level : DEFAULT_LEVEL;
  } catch (_) {
    return DEFAULT_LEVEL;
  }
}

export function saveLessonIndex(level, index) {
  try {
    localStorage.setItem(levelKey(LESSON_KEY, level), String(index));
    localStorage.setItem(levelKey(LESSON_ID_KEY, level), lessonIdAt(level, index));
  } catch (_) {}
}

export function loadLessonIndex(level) {
  try {
    return indexFromSaved(level, LESSON_ID_KEY, LESSON_KEY);
  } catch (_) {
    return 0;
  }
}

// Índice de la lección más avanzada alcanzada (para desbloquear en el selector).
export function saveLessonMax(level, index) {
  try {
    localStorage.setItem(levelKey(LESSON_MAX_KEY, level), String(index));
    localStorage.setItem(levelKey(LESSON_MAX_ID_KEY, level), lessonIdAt(level, index));
  } catch (_) {}
}

export function loadLessonMax(level) {
  try {
    if (
      localStorage.getItem(levelKey(LESSON_MAX_ID_KEY, level)) === null &&
      localStorage.getItem(levelKey(LESSON_MAX_KEY, level)) === null
    ) {
      return loadLessonIndex(level);
    }
    return indexFromSaved(level, LESSON_MAX_ID_KEY, LESSON_MAX_KEY);
  } catch (_) {
    return 0;
  }
}

// Perfil del jugador (nombre y presentación extraídos de su HTML). Se guarda
// mezclando con lo ya conocido: un campo solo se pisa si llega con valor.
export function saveProfile(profile) {
  try {
    const merged = { ...loadProfile(), ...profile };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
  } catch (_) {}
}

export function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    return d && typeof d === 'object' ? d : null;
  } catch (_) {
    return null;
  }
}

// Borra TODO lo de JSPlay, de todos los niveles (código, progreso, logros,
// perfil y nivel activo). Se recorre por prefijo para no olvidar claves
// nuevas al añadir niveles.
export function clearProgress() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith('jsplay:')) localStorage.removeItem(key);
    }
  } catch (_) {}
}

// Modal de bienvenida: se muestra a usuarios nuevos y tras reiniciar el juego.
export function loadWelcomeSeen() {
  try { return localStorage.getItem(WELCOME_KEY) === '1'; } catch (_) { return true; }
}

export function saveWelcomeSeen() {
  try { localStorage.setItem(WELCOME_KEY, '1'); } catch (_) {}
}

// Modal de introducción al nivel medio: primera visita a la sección
// (y otra vez tras reiniciar, porque clearProgress borra la marca).
const MEDIO_INTRO_KEY = 'jsplay:welcomed:medio';

export function loadMedioIntroSeen() {
  try { return localStorage.getItem(MEDIO_INTRO_KEY) === '1'; } catch (_) { return true; }
}

export function saveMedioIntroSeen() {
  try { localStorage.setItem(MEDIO_INTRO_KEY, '1'); } catch (_) {}
}

const EXPORT_VERSION = 2;

// Empaqueta todo el progreso (código, lección, logros, perfil y nivel) tal
// cual está en localStorage para descargarlo como archivo. Desde la versión
// 2 se exporta cualquier clave con el prefijo jsplay:, así los niveles
// nuevos viajan sin tener que enumerarlos.
export function exportProgress() {
  try {
    const entries = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('jsplay:')) entries[key] = localStorage.getItem(key);
    }
    return {
      _app: 'jsplay',
      _export: EXPORT_VERSION,
      savedAt: new Date().toISOString(),
      entries,
    };
  } catch (_) {
    return null;
  }
}

// Restaura un progreso exportado (formato actual con `entries` o el formato
// 1, que enumeraba campos sueltos). Devuelve true si el archivo es válido.
// El llamador debe recargar la app para que el store se reinicialice.
export function importProgress(data) {
  try {
    if (!data || data._app !== 'jsplay') return false;
    if (data.entries && typeof data.entries === 'object') {
      for (const [key, value] of Object.entries(data.entries)) {
        if (key.startsWith('jsplay:') && typeof value === 'string') {
          localStorage.setItem(key, value);
        }
      }
      return true;
    }
    // Formato 1: campos sueltos, todos del nivel básico.
    const legacy = {
      [CODE_KEY]: data.code,
      [CODE_LESSON_KEY]: data.codeLessonId,
      [LESSON_KEY]: data.lesson,
      [LESSON_ID_KEY]: data.lessonId,
      [LESSON_MAX_KEY]: data.lessonMax,
      [LESSON_MAX_ID_KEY]: data.lessonMaxId,
      'jsplay:badges': data.badges,
      [PROFILE_KEY]: data.profile,
    };
    for (const [key, value] of Object.entries(legacy)) {
      if (typeof value === 'string') localStorage.setItem(key, value);
      else localStorage.removeItem(key);
    }
    return true;
  } catch (_) {
    return false;
  }
}
