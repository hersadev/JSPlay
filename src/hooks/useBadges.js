import { useEffect, useState } from 'react';
import { BADGES, loadEarnedBadges, saveEarnedBadges, clearEarnedBadges } from '../utils/badges';

export function useBadges({ sandboxState, lessonIndex, totalLessons, isComplete }) {
  const [earned, setEarned] = useState(() => loadEarnedBadges());
  const [queue, setQueue] = useState([]); // logros recién ganados pendientes de anunciar

  useEffect(() => {
    const ctx = { sandboxState, lessonIndex, totalLessons, isComplete };
    const newly = [];
    const next = new Set(earned);
    for (const b of BADGES) {
      if (next.has(b.id)) continue;
      try {
        if (b.check(ctx)) {
          next.add(b.id);
          newly.push(b);
        }
      } catch {
        // un check defectuoso no debe romper la app
      }
    }
    if (newly.length) {
      setEarned(next);
      saveEarnedBadges(next);
      setQueue((q) => [...q, ...newly]);
    }
  }, [sandboxState, lessonIndex, totalLessons, isComplete, earned]);

  function reset() {
    clearEarnedBadges();
    setEarned(new Set());
    setQueue([]);
  }

  return {
    earned,
    recent: queue[0] ?? null,
    reset,
    dismissRecent: () => setQueue((q) => q.slice(1)),
  };
}
