// Renderiza el texto de una lección: párrafos separados por línea en blanco
// y fragmentos de código entre acentos graves (`así`) resaltados. Sin
// dependencias de markdown: las descripciones solo necesitan estas dos cosas.

function renderInline(paragraph) {
  return paragraph.split(/(`[^`]+`)/).map((part, i) =>
    part.startsWith('`') && part.endsWith('`') ? (
      <code
        key={i}
        className="font-mono text-[0.9em] text-amber-200 bg-gray-800 rounded px-1 py-px break-words"
      >
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    )
  );
}

export default function RichText({ text, className = '' }) {
  if (!text) return null;
  return (
    <div className={`space-y-2 ${className}`}>
      {text.split(/\n\s*\n/).map((paragraph, i) => (
        <p key={i} className="leading-relaxed">
          {renderInline(paragraph)}
        </p>
      ))}
    </div>
  );
}
