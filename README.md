# Mate para ML

Repaso visual e interactivo de las matemáticas que hay detrás de Machine Learning, IA y redes neuronales. Va desde la aritmética y las razones hasta límites, integrales, probabilidad y una neurona completa, y sigue con los modelos de ML, las redes convolucionales, los LLM, los agentes y el aprendizaje por refuerzo. Lo preparamos para el equipo que va a hacer el curso de ML.

**Ver en línea:** https://aaramirez.github.io/mate/

## Módulos

| # | Módulo | Qué incluye |
|---|--------|-------------|
| 01 | Aritmética y razones | Operaciones, porcentajes, razón entre dos magnitudes y entre dos funciones, normalización, matriz de confusión |
| 02 | Notación sin miedo | Σ, ŷ, θ, η, ∂, ∇ y el MSE paso a paso |
| 03 | Funciones | Recta, parábola, exponencial, logaritmo, sigmoide y ReLU; prueba de la recta horizontal, funciones biyectivas e inversas |
| 04 | Vectores | Producto punto y similitud coseno |
| 05 | Matrices | Multiplicación paso a paso, transformaciones del plano, autovalores y autovectores, componentes principales (PCA) |
| 06 | Límites y continuidad | Límites laterales, definición ε-δ, tipos de discontinuidad |
| 07 | Derivadas | La derivada como límite, regla de la cadena, derivadas parciales |
| 08 | Integrales | Integrabilidad, sumas de Riemann, el límite que define la integral, teorema fundamental |
| 09 | Probabilidad | Función de masa, densidad, distribución, la normal, probabilidad condicional como cambio de punto de vista y Bayes |
| 10 | Descenso del gradiente | Entrenar un peso paso a paso |
| 11 | Regresión y error | Residuos, MAE, MSE, RMSE, R², descenso por la superficie de error, sobreajuste |
| 12 | Modelos clásicos de ML | Regresión logística, k vecinos, árboles (Gini), k-means, Naive Bayes, SVM y ensambles |
| 13 | La neurona y la red | Neurona, softmax, entropía cruzada y ciclo de entrenamiento |
| 14 | Redes convolucionales | Convolución paso a paso, filtros, stride, padding, max pooling y parámetros compartidos |
| 15 | Cómo funciona un LLM | Tokens, embeddings, softmax con temperatura, bigramas, atención Q·K·V, entropía cruzada |
| 16 | Agentes | Proceso de decisión de Markov, política, retorno, Bellman, ε-greedy y el bucle de un agente con LLM |
| 17 | Aprendizaje por refuerzo | Q-learning y error de diferencia temporal, gradiente de política (REINFORCE), DQN, PPO y RLHF |

El orden sigue las dependencias: bases y álgebra lineal (01–05), cálculo y probabilidad (06–09), aprender de los datos (10–12), redes neuronales (13–15) y agentes (16–17).

Cada módulo tiene laboratorios interactivos, un recuadro de «Dónde aparece en ML», preguntas de autoevaluación y videos de apoyo. Entre ellos hay capítulos concretos de [3Blue1Brown](https://www.youtube.com/@3blue1brown). La página `recursos.html` reúne los canales recomendados y un plan de 6 semanas.

Cada módulo trae además **prácticas** (de 1 a 3) para hacer fuera de la página, en la terminal con Python o en el navegador con herramientas gratuitas y sin registro, y una lista de **preguntas para investigar** sobre lo que el módulo nombra pero no explica, sin respuestas publicadas. Para agregarlas a un módulo nuevo: cada práctica es un `<div class="practica">` dentro de la sección que ejercita, con `<div class="practica-title"><span class="tag">En la terminal</span><h3>…</h3></div>` (o `<span class="tag web">En el navegador</span>`), un `<p class="para">` con para qué sirve, un `<ol>` de pasos (el código va en `<pre><code>`) y un `<p class="obs"><b>Qué observar:</b> …</p>`. Las preguntas van en un `<div class="investiga">` con `<h3>Para investigar</h3>` y un `<ol>`; cada `<li>` lleva su pista en `<span class="pista">`. Ese bloque se ubica después de «Pruébate» y antes de los videos. Prueba los comandos y las URL antes de publicarlos.

## Usarlo localmente

No necesita instalación ni servidor: abre `index.html` en el navegador. El avance («Lo tengo claro») se guarda en el `localStorage` de cada navegador.

## Estructura

```
index.html            Portada y mapa de la ruta
01-…17-*.html         Un archivo por módulo (HTML + script del laboratorio)
recursos.html         Canales de YouTube, ruta de 3Blue1Brown y plan de estudio
assets/style.css      Estilos compartidos (tema claro y oscuro)
assets/lab.js         Utilidades de gráficas, navegación y avance
```

Las gráficas se dibujan con Canvas y JavaScript sin librerías; solo se cargan fuentes de Google Fonts.

Cada página carga Google Tag Manager (`GTM-KX76XF8R`): un bloque al inicio de `<head>` y un `<noscript>` al inicio de `<body>`. Toda página nueva debe llevar los dos; cópialos de `index.html`.

Los comandos van en bloques `.cmds`: pestañas por sistema operativo (`.cmd-tabs` con botones `role="tab"` y `data-so="win"`, `"mac linux"`…, y un `.cmd-panel role="tabpanel"` por pestaña) y una línea `.cmd-l` por comando, con su `<code>` y un botón `.copiar`. Los comentarios van en `.cmd-c`, sin botón. Un programa que se guarda en un archivo va en `.code-copia` con un solo botón `.copiar copiar-todo`. `assets/lab.js` elige la pestaña del sistema del lector, la recuerda (`mate-so`) y copia al portapapeles.
