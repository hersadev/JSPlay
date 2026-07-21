import { useState, useCallback } from 'react';

export function useLessonProgress(lesson) {
  const [completedCount, setCompleted] = useState(0);
  const [prevLessonId, setPrevLessonId] = useState(lesson?.id);

  // Reset síncrono al cambiar de lección, durante el propio render. Si se
  // hiciera en un useEffect, habría un render intermedio donde isComplete
  // se calcula con el recuento de la lección anterior, y ese valor obsoleto
  // dispara de nuevo el aviso de "lección completada".
  if (lesson?.id !== prevLessonId) {
    setPrevLessonId(lesson?.id);
    setCompleted(0);
  }

  // Devuelve el recuento recién calculado (además de guardarlo en el estado)
  // para que quien llama pueda reaccionar a él en el mismo tick, sin esperar
  // al siguiente render.
  const checkObjective = useCallback(
    (sandboxState) => {
      if (!lesson) return 0;
      const objectives = lesson.objectives ?? [];
      let count = 0;
      for (const obj of objectives) {
        if (obj.validate(sandboxState)) count++;
        else break;
      }
      setCompleted(count);
      return count;
    },
    [lesson]
  );

  const isComplete = lesson
    ? completedCount >= (lesson.objectives?.length ?? 0) && (lesson.objectives?.length ?? 0) > 0
    : false;

  return { completedCount, isComplete, checkObjective };
}
