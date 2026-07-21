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
import { useSandboxStore } from './store/sandboxStore';
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
  saveProfile,
  loadProfile,
} from './utils/persistence';
import { extractProfile, applyProfile } from './utils/profile';
import { ALL_LESSONS } from './lessons';

const clampWidth = (px, min, max) => Math.max(min, Math.min(max, px));

const SANDBOX_ID = '__sandbox__';
const SANDBOX_STARTER = {
  html: '<h1>Sandbox libre</h1>\n<p>Escribe lo que quieras, sin objetivos.</p>\n',
  css: 'body { font-family: sans-serif; padding: 16px; }\n',
  js: 'console.log("¡A jugar!");\n',
};

const STUCK_ATTEMPT_THRESHOLD = 3; // pulsaciones seguidas de "Ver en web" sin avanzar antes de ofrecer ayuda

export default function App() {
  const { code, sandboxState, replaceCode } = useSandbox();
  const manualRenderTick = useSandboxStore((s) => s.manualRenderTick);

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
  // La consola solo se muestra desplegada donde aporta: lecciones marcadas
  // con usesConsole y el sandbox. La barra del panel permite alternarla a mano.
  const [consoleOpen, setConsoleOpen] = useState(false);

  const prevIsComplete = useRef(false);
  // Cuenta pulsaciones seguidas de "Ver en web" que no mejoraron el mejor
  // recuento de objetivos alcanzado en la lección actual (ver efecto de
  // detección de atasco, más abajo).
  const stuckAttemptsRef = useRef(0);
  const bestCompletedRef = useRef(0);
  const lastHandledTickRef = useRef(0);

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
      // Sustituye los textos genéricos del código de partida (h1 "Tu nombre",
      // párrafo de presentación) por lo que el jugador escribió en lecciones
      // anteriores, para que su página siga siendo la suya.
      replaceCode(applyProfile(currentLesson.setupFiles, loadProfile()));
    } else if (sandboxMode) {
      replaceCode(SANDBOX_STARTER);
    }
    prevIsComplete.current = false;
    setStuckOpen(false);
    setConsoleOpen(sandboxMode || !!currentLesson?.usesConsole);
    stuckAttemptsRef.current = 0;
    bestCompletedRef.current = 0;
    lastHandledTickRef.current = manualRenderTick;
  }, [currentCodeKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Guardar el código en curso (con un pequeño debounce) bajo la lección
  // actual. En el módulo 1, además, extraer del HTML el nombre y la
  // presentación del jugador para reutilizarlos en lecciones posteriores.
  useEffect(() => {
    if (!currentCodeKey) return;
    const t = setTimeout(() => {
      saveCode(currentCodeKey, code);
      if (currentCodeKey.startsWith('m1-')) {
        const profile = extractProfile(code.html);
        if (profile) saveProfile(profile);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [code, currentCodeKey]);

  // Revalidar objetivos cada vez que cambia el resultado del sandbox, y de
  // paso detectar "atasco": si una pulsación de "Ver en web" (manualRenderTick
  // sube) no mejora el mejor recuento de objetivos logrado hasta ahora en la
  // lección, cuenta como intento fallido. Tras varios seguidos, se ofrece
  // ayuda proactiva. No dispara por teclear ni por quedarse quieto pensando
  // — solo por intentarlo de verdad y que no cuele.
  useEffect(() => {
    if (!currentLesson || !sandboxState) return;
    const count = checkObjective(sandboxState);

    if (count > bestCompletedRef.current) {
      bestCompletedRef.current = count;
      stuckAttemptsRef.current = 0;
    } else if (manualRenderTick !== lastHandledTickRef.current) {
      stuckAttemptsRef.current += 1;
      if (stuckAttemptsRef.current >= STUCK_ATTEMPT_THRESHOLD) setStuckOpen(true);
    }
    lastHandledTickRef.current = manualRenderTick;
    // manualRenderTick se lee aquí a propósito sin ser dependencia: solo debe
    // procesarse cuando sandboxState cambia de verdad (una vez por render real),
    // no en el instante en que sube el tick, que es antes de que el iframe
    // termine de recargar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sandboxState, checkObjective, currentLesson]);

  // Si la lección se completa, la ayuda de atasco no debe quedar abierta ni
  // coincidir con el aviso de éxito.
  useEffect(() => {
    if (isComplete) setStuckOpen(false);
  }, [isComplete]);

  // Avanza solo en la transición false → true (no al cargar la lección ya completa).
  useEffect(() => {
    const wasComplete = prevIsComplete.current;
    prevIsComplete.current = isComplete;

    if (!isComplete || wasComplete || sandboxMode || lessonIndex >= ALL_LESSONS.length) {
      // Si el aviso quedó visible y su temporizador fue cancelado (p. ej. por
      // cambiar de lección con el selector antes de que dispare), ocultarlo.
      setShowSuccess(false);
      return;
    }

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

        {consoleOpen && (
          <ResizeHandle
            orientation="horizontal"
            onResize={(dy) => setConsoleHeight((h) => clampWidth(h - dy, 96, 480))}
          />
        )}

        <div style={consoleOpen ? { height: consoleHeight } : undefined} className="flex-shrink-0">
          <ConsolePanel open={consoleOpen} onToggle={() => setConsoleOpen((o) => !o)} />
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
