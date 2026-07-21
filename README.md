# JSPlay

Un editor para aprender HTML, CSS y JavaScript desde el navegador. Escribes código de
verdad en tres pestañas, pulsas "Ver en web" para ver el resultado, y avanzas por
lecciones que validan lo que realmente construiste — no lo que crees que escribiste.

La gracia es que todo corre en local, dentro de tu propio navegador: tu código se
ejecuta en una vista previa aislada, así que puedes romper lo que quieras, provocar
errores a propósito o experimentar sin miedo. Si algo se lía, reinicias y ya.

## Qué tiene

- Un editor con pestañas HTML / CSS / JavaScript y resaltado de sintaxis, más una
  vista previa que se renderiza al pulsar "Ver en web" (así no muestra etiquetas a
  medio escribir) y se actualiza sola al cambiar de lección o entrar al Sandbox.
- Una consola que muestra tus `console.log()` y los errores de verdad, y que además
  funciona como mini-REPL: escribe una expresión y ejecútala contra tu código actual.
  Es plegable: se abre sola en las lecciones que la usan y se muestra u oculta con
  un clic en su barra.
- 23 lecciones del nivel básico pensadas para quien nunca ha programado: cada una
  introduce un único concepto y lo explica desde cero. Dos módulos: maquetar una
  página con HTML y CSS (etiquetas, listas, enlaces, imágenes, cómo se enlaza una
  hoja de estilos, selectores, el modelo de caja, Flexbox, tipografía y color), y
  darle vida con JavaScript (cómo se enlaza un script, la consola, variables,
  booleanos, condicionales, funciones y parámetros, arrays, bucles, objetos y
  métodos, y seleccionar y modificar el DOM con eventos). Cada lección valida sus
  objetivos mirando el resultado real — el DOM, los estilos aplicados o la consola —
  y trae pistas por si te atascas.
- Un modo Sandbox para jugar libre, sin objetivos ni auto-avance.
- Logros que se van desbloqueando, con el progreso guardado solo en tu navegador:
  cierras y sigues donde estabas.

## Cómo ejecutarlo

Si tienes Node 20 o superior:

```bash
git clone https://github.com/hersadev/JSPlay.git
cd JSPlay
npm install
npm run dev
```

y abre http://localhost:5173.

Si prefieres Docker y no instalar Node:

```bash
git clone https://github.com/hersadev/JSPlay.git
cd JSPlay
docker compose up --build
```

y abre http://localhost:8080. Si cambias código, acuérdate de repetir el `--build`.

## Si quieres tocar el código

Es React 18 con Vite, Tailwind y Zustand, sin backend. El "motor" es un `<iframe>`
sandboxeado que ejecuta tu HTML/CSS/JS de verdad — no hay ningún intérprete simulado —
y vive en [src/engine/sandboxRunner.js](src/engine/sandboxRunner.js). Las lecciones
están en [src/lessons/](src/lessons/), un módulo por carpeta, y sus validadores
reutilizables en [src/lessons/_helpers.js](src/lessons/_helpers.js). Hay lint
(`npm run lint`).

Por ahora solo está el nivel básico (HTML/CSS + fundamentos de JavaScript); niveles
medio y avanzado quedan para una próxima entrega. Si se te ocurre una lección nueva,
abre un issue o manda un PR.
