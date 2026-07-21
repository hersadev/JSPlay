import { useEffect } from 'react';
import { motion } from 'framer-motion';

// Modal de introducción al nivel medio: se muestra la primera vez que se
// entra en la sección (y de nuevo tras reiniciar el juego) para contar qué
// se va a hacer y qué se va a construir. Se cierra con la X, pinchando
// fuera o con Escape.

const FASES = [
  {
    icon: '🏗️',
    title: 'Un proyecto de verdad',
    text: 'Nada de ejercicios sueltos: construirás tu web personal completa, fase a fase, desde el esqueleto hasta el último detalle.',
  },
  {
    icon: '🧱',
    title: 'Maquetación seria',
    text: 'Estructura semántica, una galería de proyectos con CSS Grid y diseño responsive que se adapta al móvil.',
  },
  {
    icon: '🌓',
    title: 'Interactiva y con memoria',
    text: 'Un botón de tema claro/oscuro, tarjetas generadas desde datos con JavaScript, un formulario que responde y localStorage para recordar al visitante.',
  },
  {
    icon: '🥈',
    title: 'Progreso y logros propios',
    text: 'El nivel medio guarda su avance y sus logros aparte. Puedes volver al básico cuando quieras: cada sección se queda donde la dejaste.',
  },
];

export default function MedioIntroModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[70] bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 12 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="relative bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Bienvenida al nivel medio"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl leading-none"
          aria-label="Cerrar"
        >
          ×
        </button>

        <div className="text-center">
          <p className="text-4xl mb-2">🚀</p>
          <h2 className="text-xl font-bold text-white">Bienvenido al nivel medio</h2>
          <p className="text-sm text-gray-400 mt-1.5 leading-snug">
            Aquí vas a construir una web completa: la tuya. Diez fases que terminan
            en una página con estilo, interactiva y con memoria.
          </p>
        </div>

        <ul className="mt-5 space-y-3">
          {FASES.map((f) => (
            <li key={f.title} className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0 leading-none mt-0.5">{f.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-100">{f.title}</p>
                <p className="text-xs text-gray-400 leading-snug">{f.text}</p>
              </div>
            </li>
          ))}
        </ul>

        <button
          onClick={onClose}
          className="mt-6 w-full px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
        >
          ¡Al proyecto! →
        </button>

        <p className="text-[11px] text-gray-500 text-center mt-3">
          Primera fase: darle a tu página un esqueleto semántico de verdad.
        </p>
      </motion.div>
    </motion.div>
  );
}
