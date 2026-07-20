import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from './components/layout/MainLayout';
import ResizeHandle from './components/layout/ResizeHandle';
import CodeTabs from './components/editor/CodeTabs';
import Preview from './components/editor/Preview';
import ConsolePanel from './components/console/ConsolePanel';
import LessonPanel from './components/lesson/LessonPanel';
import LessonSelector from './components/lesson/LessonSelector';
import BadgesPanel from './components/badges/BadgesPanel';
import BadgeModal from './components/badges/BadgeModal';
import StuckHelpModal from './components/lesson/StuckHelpModal';
import WelcomeModal from './components/onboarding/WelcomeModal';
import { useSandbox } from './hooks/useSandbox';
import { useLessonProgress } from './hooks/useLessonProgress';
import { useBadges } from './hooks/useBadges';
import { BADGES } from './utils/badges';
import {
  saveCode,
  loadCode,
  saveLessonIndex,
  loadLessonIndex,
  saveLessonMax,
  loadLessonMax,
  clearProgress,
  loadWelcomeSeen,
  saveWelcomeSeen,
} from './utils/persistence';
import { ALL_LESSONS } from './lessons';

const clampWidth = (px, min, max) => Math.max(min, Math.min(max, px));

const SANDBOX_ID = '__sandbox__';
const SANDBOX_STARTER = {
  html: '<h1>Sandbox libre</h1>\n<p>Escribe lo que quieras, sin objetivos.</p>\n',
  css: 'body { font-family: sans-serif; padding: 16px; }\n',
  js: 'console.log("¡A jugar!");\n',
};

const STUCK_IDLE_MS = 60000; // tiempo sin avanzar objetivos antes de ofrecer ayuda

export default function App() {
  const { code, sandboxState, replaceCode } = useSandbox();

  const [lessonIndex, setLessonIndex] = useState(() => loadLessonIndex());
  const [maxReached, setMaxReached] = useState(() => Math.max(loadLessonIndex(), loadLessonMax()));
  const [showSuccess, setShowSuccess] = useState(false);
  const [sandboxMode, setSandboxMode] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [badgesOpen, setBadgesOpen] = useState(false);
  const [stuckOpen, setStuckOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(() => !loadWelcomeSeen());

  const [leftWidth, setLeftWidth] = useState(320);
  const [rightWidth, setRightWidth] = useState(420);
  const [consoleHeight, setConsoleHeight] = useState(200);

  const prevIsComplete = useRef(false);

  const currentLesson = sandboxMode ? null : ALL_LESSONS[lessonIndex] ?? null;
  const currentCodeKey = sandboxMode ? SANDBOX_ID : currentLesson?.id;

  const { completedCount, isComplete, checkObjective } = useLessonProgress(currentLesson);

  const { earned, recent, reset: resetBadges, dismissRecent } = useBadges({
    sandboxState,
    lessonIndex,
    totalLessons: ALL_LESSONS.length,
    isComplete,
  });

  // Persistir índice de lección y el máximo alcanzado (desbloqueo del selector).
  useEffect(() => {
    saveLessonIndex(lessonIndex);
    if (lessonIndex > maxReached) {
      setMaxReached(lessonIndex);
      saveLessonMax(lessonIndex);
    }
  }, [lessonIndex, maxReached]);

  // Al entrar en una lección (o en el sandbox), recuperar el código que
  // hubiera guardado o, si no hay, sembrar el código de partida.
  useEffect(() => {
    if (!currentCodeKey) return;
    const saved = loadCode(currentCodeKey);
    if (saved) {
      replaceCode(saved);
    } else if (currentLesson?.setupFiles) {
      replaceCode(currentLesson.setupFiles);
    } else if (sandboxMode) {
      replaceCode(SANDBOX_STARTER);
    }
    prevIsComplete.current = false;
    setStuckOpen(false);
  }, [currentCodeKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Guardar el código en curso (con un pequeño debounce) bajo la lección actual.
  useEffect(() => {
    if (!currentCodeKey) return;
    const t = setTimeout(() => saveCode(currentCodeKey, code), 300);
    return () => clearTimeout(t);
  }, [code, currentCodeKey]);

  // Revalidar objetivos cada vez que cambia el resultado del sandbox.
  useEffect(() => {
    if (!currentLesson || !sandboxState) return;
    checkObjective(sandboxState);
  }, [sandboxState, checkObjective, currentLesson]);

  // Detectar "atasco": llevar un buen rato sin que avancen los objetivos de
  // la lección actual, para ofrecer ayuda proactiva. Se mide en tiempo real
  // sin progreso (no en cuántas veces se reevalúa el código al teclear):
  // así no depende de cuánto código haya que escribir en cada lección, que
  // es lo que antes hacía que esto casi nunca disparara en lecciones cortas
  // y disparara de más en las que requieren teclear más.
  useEffect(() => {
    if (!currentLesson || isComplete) return;
    const timer = setTimeout(() => setStuckOpen(true), STUCK_IDLE_MS);
    return () => clearTimeout(timer);
  }, [currentLesson, completedCount, isComplete]);

  // Si la lección se completa, la ayuda de atasco no debe quedar abierta ni
  // coincidir con el aviso de éxito.
  useEffect(() => {
    if (isComplete) setStuckOpen(false);
  }, [isComplete]);

  // Avanza solo en la transición false → true (no al cargar la lección ya completa).
  useEffect(() => {
    const wasComplete = prevIsComplete.current;
    prevIsComplete.current = isComplete;

    if (!isComplete || wasComplete || sandboxMode) return;
    if (lessonIndex >= ALL_LESSONS.length) return;

    setShowSuccess(true);
    const timer = setTimeout(() => {
      setShowSuccess(false);
      setLessonIndex((i) => Math.min(i + 1, ALL_LESSONS.length));
    }, 2200);

    return () => clearTimeout(timer);
  }, [isComplete, lessonIndex, sandboxMode]);

  function handleReset() {
    clearProgress();
    resetBadges();
    setLessonIndex(0);
    setMaxReached(0);
    setSandboxMode(false);
    setSelectorOpen(false);
    setBadgesOpen(false);
    setStuckOpen(false);
    setWelcomeOpen(true);
    replaceCode(ALL_LESSONS[0]?.setupFiles ?? { html: '', css: '', js: '' });
  }

  function handleCloseWelcome() {
    saveWelcomeSeen();
    setWelcomeOpen(false);
  }

  function handleSelectLesson(index) {
    if (index > maxReached) return;
    setLessonIndex(index);
    setSandboxMode(false);
    setSelectorOpen(false);
  }

  function handleToggleSandbox() {
    setSandboxMode((m) => !m);
    setSelectorOpen(false);
  }

  return (
    <MainLayout
      onReset={handleReset}
      onOpenLessons={() => setSelectorOpen(true)}
      onToggleSandbox={handleToggleSandbox}
      onOpenBadges={() => setBadgesOpen(true)}
      sandboxMode={sandboxMode}
      lessonIndex={Math.min(lessonIndex, ALL_LESSONS.length)}
      totalLessons={ALL_LESSONS.length}
      earnedCount={earned.size}
      totalBadges={BADGES.length}
    >
      <div style={{ width: leftWidth }} className="flex flex-shrink-0 [&>aside]:w-full">
        {sandboxMode ? (
          <aside className="w-80 flex flex-col gap-3 p-4 bg-gray-900 border-r border-gray-700">
            <span className="text-xs text-yellow-400 uppercase tracking-wider">Modo Sandbox</span>
            <h2 className="text-base font-semibold text-white leading-snug">Juega libre con código</h2>
            <p className="text-gray-400 text-sm">
              Sin objetivos, sin auto-avance. Escribe cualquier HTML, CSS o JavaScript y experimenta.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Pulsa <span className="text-yellow-400">Volver a lecciones</span> para retomar tu progreso.
            </p>
          </aside>
        ) : (
          <LessonPanel
            key={currentLesson?.id}
            lesson={currentLesson}
            lessonIndex={lessonIndex}
            total={ALL_LESSONS.length}
            progress={completedCount}
            isComplete={isComplete}
          />
        )}
      </div>

      <ResizeHandle onResize={(dx) => setLeftWidth((w) => clampWidth(w + dx, 240, 560))} />

      <div className="flex flex-col flex-1 overflow-hidden relative">
        <div className="flex-1 overflow-hidden">
          <CodeTabs />
        </div>

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 text-sm font-semibold"
            >
              <span className="text-lg">✓</span>
              ¡Lección completada! Cargando la siguiente…
            </motion.div>
          )}
        </AnimatePresence>

        <ResizeHandle
          orientation="horizontal"
          onResize={(dy) => setConsoleHeight((h) => clampWidth(h - dy, 96, 480))}
        />

        <div style={{ height: consoleHeight }} className="flex-shrink-0">
          <ConsolePanel />
        </div>
      </div>

      <ResizeHandle onResize={(dx) => setRightWidth((w) => clampWidth(w - dx, 260, 640))} />

      <div style={{ width: rightWidth }} className="flex-shrink-0 flex flex-col">
        <Preview />
      </div>

      {selectorOpen && (
        <LessonSelector
          currentIndex={lessonIndex}
          maxUnlockedIndex={maxReached}
          onSelect={handleSelectLesson}
          onClose={() => setSelectorOpen(false)}
        />
      )}

      <AnimatePresence>
        {badgesOpen && <BadgesPanel earned={earned} onClose={() => setBadgesOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {stuckOpen && currentLesson && (
          <StuckHelpModal
            lesson={currentLesson}
            progress={completedCount}
            onClose={() => setStuckOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {recent && <BadgeModal badge={recent} onClose={dismissRecent} />}
      </AnimatePresence>

      <AnimatePresence>
        {welcomeOpen && <WelcomeModal onClose={handleCloseWelcome} />}
      </AnimatePresence>
    </MainLayout>
  );
}
