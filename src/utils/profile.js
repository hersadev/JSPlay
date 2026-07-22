// Perfil del jugador: el nombre y la presentación que escribe en las
// primeras lecciones. Se extraen de su HTML mientras trabaja y se vuelven
// a inyectar en el código de partida de las lecciones siguientes, para que
// la página que va construyendo sea la suya y no la de "Tu nombre".
//
// Este módulo es lógica pura (sin storage) para poder importarse desde las
// fixtures de lecciones sin crear ciclos; el guardado vive en persistence.js.

export const NOMBRE_GENERICO = 'Tu nombre';
export const PRESENTACION_GENERICA = 'Hola, estoy aprendiendo a hacer páginas web.';

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// replaceAll interpreta patrones especiales ($$, $&, $`, $') en su segundo
// argumento incluso cuando el primero es un string plano, no una regex. Si
// el nombre o la presentación del jugador contuviera un "$" (p. ej. "$$Juan"),
// se colaría sin escapar y saldría corrompido en la lección siguiente:
// duplicar cada "$" hace que replaceAll lo devuelva a un solo "$" literal.
const escapeDollar = (s) => s.replace(/\$/g, '$$$$');

// Saca del HTML del jugador su nombre (primer <h1>) y su presentación
// (primer <p>). Devuelve solo los campos que haya personalizado de verdad,
// o null si no hay ninguno.
export function extractProfile(html) {
  if (!html) return null;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const nombre = doc.querySelector('h1')?.textContent.trim() ?? '';
  const presentacion = doc.querySelector('p')?.textContent.trim() ?? '';

  const profile = {};
  if (nombre && nombre !== NOMBRE_GENERICO) profile.nombre = nombre;
  if (presentacion && presentacion !== PRESENTACION_GENERICA) profile.presentacion = presentacion;
  return Object.keys(profile).length > 0 ? profile : null;
}

// Sustituye en unos setupFiles los textos genéricos por los del perfil.
// Se reemplaza la etiqueta <h1> completa para no tocar apariciones de
// "Tu nombre" en comentarios o pistas.
export function applyProfile(files, profile) {
  if (!profile || !files?.html) return files;
  let html = files.html;
  if (profile.nombre) {
    const safeName = escapeDollar(escapeHtml(profile.nombre));
    html = html.replaceAll(`<h1>${NOMBRE_GENERICO}</h1>`, `<h1>${safeName}</h1>`);
  }
  if (profile.presentacion) {
    html = html.replaceAll(PRESENTACION_GENERICA, escapeDollar(escapeHtml(profile.presentacion)));
  }
  return { ...files, html };
}
