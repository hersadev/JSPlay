import { useEffect, useState } from 'react';
import { BADGES_BY_LEVEL, loadEarnedBadges, saveEarnedBadges, clearEarnedBadges } from '../utils/badges';

// Logros del nivel activo. Cada nivel es una sección independiente con su
// propia colección y almacenamiento; al cambiar de nivel se recargan los
// ganados de ese nivel (reset síncrono durante el render, para no evaluar
// nunca los checks de un nivel contra el estado del otro).
export function useBadges({ level, sandboxState, lessonIndex, totalLessons, isComplete }) {
  const [earned, setEarned] = useState(() => loadEarnedBadges(level));
  const [queue, setQueue] = useState([]); // logros recién ganados pendientes de anunciar
  const [prevLevel, setPrevLevel] = useState(level);

  if (level !== prevLevel) {
    setPrevLevel(level);
    setEarned(loadEarnedBadges(level));
    setQueue([]);
  }

  const badges = BADGES_BY_LEVEL[level] ?? [];

  useEffect(() => {
    let cancelled = false;
    const ctx = { sandboxState, lessonIndex, totalLessons, isComplete };
    // b.check puede ser async (los que miran el DOM del iframe preguntan por
    // postMessage, ver lessons/_helpers.js): se comprueban en orden con
    // await, y si el efecto se cancela a mitad (cambió algo antes de
    // terminar) se descarta el resultado en vez de conceder logros con
    // datos ya obsoletos.
    (async () => {
      const newly = [];
      const next = new Set(earned);
      for (const b of badges) {
        if (next.has(b.id)) continue;
        let ok = false;
        try {
          ok = await b.check(ctx);
        } catch {
          // un check defectuoso no debe romper la app
        }
        if (ok) {
          next.add(b.id);
          newly.push(b);
        }
      }
      if (cancelled) return;
      if (newly.length) {
        setEarned(next);
        saveEarnedBadges(level, next);
        setQueue((q) => [...q, ...newly]);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, sandboxState, lessonIndex, totalLessons, isComplete, earned]);

  function reset() {
    clearEarnedBadges(level);
    setEarned(new Set());
    setQueue([]);
  }

  return {
    earned,
    badges,
    recent: queue[0] ?? null,
    reset,
    dismissRecent: () => setQueue((q) => q.slice(1)),
  };
}
