import { useState, useCallback, useRef } from 'react';

export function useLessonProgress(lesson) {
  const [completedCount, setCompleted] = useState(0);
  const [warning, setWarning] = useState(null);
  const [prevLessonId, setPrevLessonId] = useState(lesson?.id);
  // Cuántos objetivos, de izquierda a derecha, están ya confirmados para la
  // lección actual. Una vez confirmado uno, se queda confirmado — no se
  // vuelve a pedir su validate() en cada revalidación (ver checkObjective):
  // por lo demás cada cambio de sandboxState repetía, desde el objetivo 0,
  // ida-y-vuelta de postMessage ya resueltas antes, solo para llegar otra
  // vez al mismo objetivo pendiente. Es también coherente con el resto de
  // validadores (tagInSection, textNotEmpty…), que ya son permisivos con
  // "lo dejaste bien en algún momento": el progreso no debería retroceder
  // porque una lección posterior toque algo que ya sirvió.
  const lockedCountRef = useRef(0);

  // Reset síncrono al cambiar de lección, durante el propio render. Si se
  // hiciera en un useEffect, habría un render intermedio donde isComplete
  // se calcula con el recuento de la lección anterior, y ese valor obsoleto
  // dispara de nuevo el aviso de "lección completada".
  if (lesson?.id !== prevLessonId) {
    setPrevLessonId(lesson?.id);
    setCompleted(0);
    setWarning(null);
    lockedCountRef.current = 0;
  }

  // Devuelve (en una promesa) el recuento recién calculado, además de
  // guardarlo en el estado. Los validadores son todos async (ver
  // lessons/_helpers.js: leen el DOM del iframe por postMessage, que no es
  // instantáneo), así que se comprueban en orden con await — igual que
  // antes, se corta en el primer objetivo que falla, ahora esperando a que
  // cada uno responda antes de pasar al siguiente. El primer objetivo sin
  // cumplir puede traer un `warn`: una explicación de POR QUÉ no cuenta
  // (p. ej. una etiqueta que existe pero está en la sección equivocada).
  const checkObjective = useCallback(
    async (sandboxState) => {
      if (!lesson) return 0;
      const objectives = lesson.objectives ?? [];
      let count = Math.min(lockedCountRef.current, objectives.length);
      let nextWarning = null;
      for (let i = count; i < objectives.length; i++) {
        if (await objectives[i].validate(sandboxState)) {
          count++;
          continue;
        }
        nextWarning = (await objectives[i].warn?.(sandboxState)) ?? null;
        break;
      }
      lockedCountRef.current = count;
      setCompleted(count);
      setWarning(nextWarning);
      return count;
    },
    [lesson]
  );

  const isComplete = lesson
    ? completedCount >= (lesson.objectives?.length ?? 0) && (lesson.objectives?.length ?? 0) > 0
    : false;

  return { completedCount, isComplete, checkObjective, warning };
}
