import { useState, useCallback } from 'react';

export function useLessonProgress(lesson) {
  const [completedCount, setCompleted] = useState(0);
  const [warning, setWarning] = useState(null);
  const [prevLessonId, setPrevLessonId] = useState(lesson?.id);

  // Reset síncrono al cambiar de lección, durante el propio render. Si se
  // hiciera en un useEffect, habría un render intermedio donde isComplete
  // se calcula con el recuento de la lección anterior, y ese valor obsoleto
  // dispara de nuevo el aviso de "lección completada".
  if (lesson?.id !== prevLessonId) {
    setPrevLessonId(lesson?.id);
    setCompleted(0);
    setWarning(null);
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
      let count = 0;
      let nextWarning = null;
      for (const obj of objectives) {
        if (await obj.validate(sandboxState)) {
          count++;
          continue;
        }
        nextWarning = (await obj.warn?.(sandboxState)) ?? null;
        break;
      }
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
