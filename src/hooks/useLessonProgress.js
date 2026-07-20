import { useState, useCallback, useEffect } from 'react';

export function useLessonProgress(lesson) {
  const [completedCount, setCompleted] = useState(0);

  // Reset when the lesson changes
  useEffect(() => {
    setCompleted(0);
  }, [lesson?.id]);

  const checkObjective = useCallback(
    (sandboxState) => {
      if (!lesson) return;
      const objectives = lesson.objectives ?? [];
      let count = 0;
      for (const obj of objectives) {
        if (obj.validate(sandboxState)) count++;
        else break;
      }
      setCompleted(count);
    },
    [lesson]
  );

  const isComplete = lesson
    ? completedCount >= (lesson.objectives?.length ?? 0) && (lesson.objectives?.length ?? 0) > 0
    : false;

  return { completedCount, isComplete, checkObjective };
}
