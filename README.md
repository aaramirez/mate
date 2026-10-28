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
| 09 | Descenso del gradiente | Entrenar un peso paso a paso |
| 10 | Probabilidad | Función de masa, función de densidad, función de distribución, la normal y Bayes |
| 11 | La neurona y la red | Neurona, softmax, entropía cruzada y ciclo de entrenamiento |
| 12 | Regresión y error | Residuos, MAE, MSE, RMSE, R², descenso por la superficie de error, sobreajuste |
| 13 | Modelos clásicos de ML | Regresión logística, k vecinos, árboles (Gini), k-means, Naive Bayes, SVM y ensambles |
| 14 | Redes convolucionales | Convolución paso a paso, filtros, stride, padding, max pooling y parámetros compartidos |
| 15 | Cómo funciona un LLM | Tokens, embeddings, softmax con temperatura, bigramas, atención Q·K·V, entropía cruzada |
| 16 | Agentes | Proceso de decisión de Markov, política, retorno, Bellman, ε-greedy y el bucle de un agente con LLM |
| 17 | Aprendizaje por refuerzo | Q-learning y error de diferencia temporal, gradiente de política (REINFORCE), DQN, PPO y RLHF |

Cada módulo tiene laboratorios interactivos, un recuadro de «Dónde aparece en ML», preguntas de autoevaluación y videos de apoyo. Entre ellos hay capítulos concretos de [3Blue1Brown](https://www.youtube.com/@3blue1brown). La página `recursos.html` reúne los canales recomendados y un plan de 6 semanas.

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
