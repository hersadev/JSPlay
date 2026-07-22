import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { exportProgress, importProgress } from '../../utils/persistence';
import { LEVELS, DEFAULT_LEVEL } from '../../lessons';
import ConfirmDialog from '../ui/ConfirmDialog';

export default function Header({
  onReset,
  onOpenLessons,
  onToggleSandbox,
  onOpenBadges,
  sandboxMode,
  level = DEFAULT_LEVEL,
  onSwitchLevel,
  lessonIndex = 0,
  totalLessons = 0,
  earnedCount = 0,
  totalBadges = 0,
}) {
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const [justSaved, setJustSaved] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Menú "Más": se cierra al pinchar fuera o con Escape, como el resto de
  // paneles flotantes de la app.
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  function handleConfirmReset() {
    setConfirmResetOpen(false);
    onReset?.();
  }

  function handleExport() {
    const data = exportProgress();
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jsplay-progreso-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite recargar el mismo archivo otra vez
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let data;
      try {
        data = JSON.parse(reader.result);
      } catch {
        window.alert('No se pudo leer el archivo: no es un JSON válido.');
        return;
      }
      if (!importProgress(data)) {
        window.alert('El archivo no es un guardado válido de JSPlay.');
        return;
      }
      if (window.confirm('Progreso cargado. Se recargará la app para aplicarlo. ¿Continuar?')) {
        window.location.reload();
      }
    };
    reader.readAsText(file);
  }

  const pct = totalLessons > 0 ? Math.round((lessonIndex / totalLessons) * 100) : 0;

  const currentLevel = LEVELS.find((l) => l.id === level) ?? LEVELS[0];
  const otherLevel = LEVELS.find((l) => l.id !== level);

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-700 gap-6">
      <div className="flex items-center gap-4 min-w-0">
        <span className="text-white font-bold text-xl">JSPlay</span>
        <span
          className={`text-xs border rounded-full px-2 py-0.5 whitespace-nowrap ${currentLevel.chipClass}`}
          title={currentLevel.tagline}
        >
          {currentLevel.icon} {currentLevel.name}
        </span>
        {!sandboxMode && totalLessons > 0 && (
          <div
            className="flex items-center gap-2 min-w-[180px]"
            title={`${lessonIndex} de ${totalLessons} lecciones completadas`}
          >
            <span className="text-xs text-gray-500 font-mono whitespace-nowrap">
              {lessonIndex}/{totalLessons}
            </span>
            <div className="relative h-1.5 w-32 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 font-mono">{pct}%</span>
          </div>
        )}
      </div>

      <nav className="flex items-center gap-5 text-gray-300 text-sm">
        <button onClick={onOpenLessons} className="hover:text-white transition-colors">
          Lecciones
        </button>
        <button
          onClick={onOpenBadges}
          className="hover:text-yellow-300 transition-colors flex items-center gap-1.5"
          title="Logros"
        >
          <span>🏆</span>
          <span className="text-xs text-gray-500 font-mono">
            {earnedCount}/{totalBadges}
          </span>
        </button>
        <button
          onClick={onToggleSandbox}
          className={`transition-colors flex items-center gap-1.5 ${sandboxMode ? 'text-yellow-400 hover:text-yellow-300' : 'hover:text-white'}`}
        >
          <span>{sandboxMode ? '↩️' : '🎮'}</span>
          <span>{sandboxMode ? 'Volver a lecciones' : 'Sandbox'}</span>
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            title="Más opciones"
            className={`transition-colors px-2 py-1 rounded ${menuOpen ? 'text-white bg-gray-800' : 'hover:text-white'}`}
          >
            ⋯
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl py-1.5 z-10 flex flex-col">
              {otherLevel && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onSwitchLevel();
                  }}
                  className="text-left px-3 py-2 hover:bg-gray-800 transition-colors flex items-center gap-2"
                  title={otherLevel.tagline}
                >
                  <span>{otherLevel.icon}</span>
                  <span>{level === DEFAULT_LEVEL ? 'Ir al nivel medio' : 'Volver al básico'}</span>
                </button>
              )}
              <button
                onClick={handleExport}
                className={`text-left px-3 py-2 hover:bg-gray-800 transition-colors flex items-center gap-2 ${justSaved ? 'text-green-400' : ''}`}
                title="Descargar tu progreso como archivo"
              >
                <span>{justSaved ? '✓' : '💾'}</span>
                <span>{justSaved ? 'Guardado' : 'Guardar progreso'}</span>
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  fileInputRef.current?.click();
                }}
                className="text-left px-3 py-2 hover:bg-gray-800 transition-colors flex items-center gap-2"
                title="Cargar un progreso guardado"
              >
                <span>📂</span>
                <span>Cargar progreso</span>
              </button>
              <div className="my-1 border-t border-gray-800" />
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmResetOpen(true);
                }}
                className="text-left px-3 py-2 text-red-400 hover:bg-red-950/40 transition-colors"
              >
                Reiniciar todo
              </button>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImportFile}
          className="hidden"
        />
      </nav>

      <AnimatePresence>
        {confirmResetOpen && (
          <ConfirmDialog
            title="¿Reiniciar todo el progreso?"
            message="Perderás la lección actual, tu código y los logros. Esta acción no se puede deshacer."
            hint="💡 Consejo: puedes descargar una copia antes con el botón 💾 Guardar."
            confirmLabel="Sí, reiniciar"
            cancelLabel="Cancelar"
            danger
            onConfirm={handleConfirmReset}
            onCancel={() => setConfirmResetOpen(false)}
          />
        )}
      </AnimatePresence>
    </header>
  );
}
