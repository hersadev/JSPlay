import { motion } from 'framer-motion';
import LessonObjective from './LessonObjective';
import HintSystem from './HintSystem';
import ProgressBar from './ProgressBar';
import Curiosity from './Curiosity';
import RichText from './RichText';

export default function LessonPanel({ lesson, lessonIndex, total, progress, isComplete, warning }) {
  if (!lesson) {
    return (
      <aside className="w-80 flex flex-col items-center justify-center p-6 bg-gray-900 border-r border-gray-700 text-center">
        <p className="text-green-400 text-2xl mb-2">🎉</p>
        <p className="text-white font-semibold">¡Has completado todas las lecciones!</p>
        <p className="text-gray-400 text-sm mt-2">Usa el Sandbox para seguir experimentando.</p>
      </aside>
    );
  }

  return (
    <aside className="w-80 flex flex-col gap-4 p-4 bg-gray-900 border-r border-gray-700 overflow-y-auto">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-wider">
          Lección {lessonIndex + 1} de {total}
        </span>
        {isComplete && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-xs text-green-400 font-semibold"
          >
            Completada ✓
          </motion.span>
        )}
      </div>

      <div>
        <h2 className="text-base font-semibold text-white leading-snug">{lesson.title}</h2>
        <RichText text={lesson.description} className="text-gray-400 text-sm mt-1.5" />
      </div>

      <LessonObjective objectives={lesson.objectives} progress={progress} />
      {warning && (
        <p className="text-xs text-yellow-300 bg-yellow-900/30 border border-yellow-800 rounded px-2 py-1.5">
          ⚠ {warning}
        </p>
      )}
      <HintSystem hints={lesson.hints} />
      <ProgressBar value={progress} max={lesson.objectives?.length ?? 1} />
      <Curiosity text={lesson.curiosity} />
    </aside>
  );
}
