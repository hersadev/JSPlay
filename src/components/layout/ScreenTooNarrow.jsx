// El layout de tres columnas (lección + editor + vista previa) necesita
// sitio de verdad: por debajo de MIN_WIDTH la cabecera se solapa y el
// editor deja de ser usable. En vez de mostrar esa versión rota, se avisa
// y se sugiere pasar a un ordenador.
export default function ScreenTooNarrow() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-white p-6 text-center gap-3">
      <p className="text-4xl">🖥️</p>
      <h1 className="text-lg font-bold">JSPlay necesita más pantalla</h1>
      <p className="text-sm text-gray-400 max-w-xs leading-snug">
        El editor de código, la lección y la vista previa necesitan sitio para convivir. Abre
        JSPlay desde un ordenador o una pantalla más ancha.
      </p>
    </div>
  );
}
