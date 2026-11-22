"""Genera el sitio de mate (los .html de la raíz y assets/) desde fuente/ con el motor de cursos.

Uso: python fuente/generar.py

El motor (plantillas, Markdown, bloques :::, style.css y lab.js) vive en el repositorio motor-cursos, al lado
de este (../motor-cursos) o donde diga la variable de entorno MOTOR_CURSOS.

- fuente/modulos/NN-slug.html o .md: un módulo por archivo, con su ficha entre líneas «---»
  (clave: "valor" en JSON). Con formato "html", el cuerpo se publica tal cual: sus <script> van al final de
  la página, después de lab.js. Con formato "md", el cuerpo usa el Markdown y los bloques ::: del motor.
- fuente/inicio.html: la cabecera de la portada; las etapas y sus tarjetas salen de las fichas.
- fuente/curso.css: estilos propios de mate, que se agregan al style.css del motor.
"""
import json
import os
import sys
from pathlib import Path

FUENTE = Path(__file__).resolve().parent
MATE = FUENTE.parent
sys.path.insert(0, os.environ.get("MOTOR_CURSOS", str(MATE.parent / "motor-cursos")))
import motor  # noqa: E402

DESCRIPCION = "Repaso visual e interactivo de matemáticas para Machine Learning, IA y redes neuronales."
ETAPAS = [(1, "Bases"), (2, "Álgebra lineal"), (3, "Cálculo y probabilidad"), (4, "Aprender de los datos"),
          (5, "Redes neuronales"), (6, "Agentes que deciden")]
PIE = ('<span>Material de repaso para el equipo del curso de Machine Learning.</span><span>Código fuente: '
       '<a href="https://github.com/aaramirez/mate" target="_blank" rel="noopener">github.com/aaramirez/mate</a></span>')


def curso() -> motor.Curso:
    return motor.Curso(salida=MATE, nombre="Mate para ML", marca="Mate para <b>ML</b>",
                       eyebrow="Repaso de matemáticas para el curso de Machine Learning", pie=PIE,
                       prefijo="mate-ml-", aria_pager="Módulo anterior y siguiente",
                       meta_extra='<meta name="claude:viewport-fit-sides" content="cover">',
                       extra_css=(FUENTE / "curso.css").read_text(encoding="utf-8"))


def leer(ruta: Path) -> tuple[dict, str]:
    """Ficha (entre «---») y cuerpo de un módulo."""
    texto = ruta.read_text(encoding="utf-8")
    if not texto.startswith("---\n"):
        raise ValueError(f"{ruta.name}: falta la ficha entre líneas ---")
    fin = texto.index("\n---\n", 4)
    ficha = {}
    for linea in texto[4:fin].splitlines():
        clave, _, valor = linea.partition(": ")
        ficha[clave.strip()] = json.loads(valor)
    return ficha, texto[fin + 5:]


def modulos() -> list[motor.Pagina]:
    rutas = sorted(FUENTE.glob("modulos/*.*"), key=lambda r: (not r.name[:2].isdigit(), r.name))
    total = sum(r.name[:2].isdigit() for r in rutas)
    paginas = []
    for ruta in rutas:
        f, cuerpo = leer(ruta)
        if f.get("formato") == "md":
            scripts = []
            contenido = motor.render_cuerpo(motor.Fuentes(figuras=FUENTE / "figuras", labs=FUENTE / "labs"),
                                            cuerpo.splitlines(), scripts, motor.Textos(unidad="módulo"))
        else:
            contenido, scripts = motor.separar_scripts(cuerpo.rstrip("\n"))
        numero = f.get("id", "")
        paginas.append(motor.Pagina(
            slug=f["slug"], archivo=ruta.stem, numero=numero, corto=f["corto"], titulo=f["titulo"],
            contenido=contenido, titulo_pagina=f.get("titulo_pagina", f["corto"]), descripcion=DESCRIPCION,
            lede=f.get("lede", ""), rotulo=f.get("rotulo", f"MÓDULO {numero} DE {total}" if numero else ""),
            etapa=f["etapa"], scripts=scripts, resumen=f.get("resumen", ""), tarjeta=f.get("tarjeta", ""),
            n_portada=f.get("n_portada", ""), marcar=f.get("marcar") != "no"))
    return paginas


def generar() -> int:
    cfg, paginas = curso(), modulos()
    etapas_nav = [[k, f"Etapa {k} · {nombre}"] for k, nombre in ETAPAS]
    motor.escribir_assets(cfg, *motor.datos_navegacion(paginas, etapas_nav))
    etapas = "".join(
        motor.bloque_etapa(f"etapa-{k}", f'<span class="pn">Etapa {k}</span> {nombre}',
                           [p for p in paginas if p.etapa == k], abierta=k == 1, cuenta=str(k))
        for k, nombre in ETAPAS)
    inicio = (FUENTE / "inicio.html").read_text(encoding="utf-8").rstrip("\n")
    (MATE / "index.html").write_text(motor.portada_html(cfg, inicio, etapas, "", DESCRIPCION), encoding="utf-8")
    for p in paginas:
        (MATE / f"{p.archivo}.html").write_text(motor.pagina_html(cfg, p), encoding="utf-8")
    return len(paginas)


if __name__ == "__main__":
    print(f"{generar()} páginas generadas")
