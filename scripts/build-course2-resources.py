"""Genera los recursos PDF del curso Cuando enseñar agota.

Los archivos mantienen texto seleccionable, contraste alto, marcadores de sección,
metadatos y espacio suficiente para escritura manual.
"""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "sembrar" / "aula" / "curso" / "cuando-ensenar-agota" / "recursos"

NAVY = colors.HexColor("#173B4D")
TEAL = colors.HexColor("#276F73")
TERRACOTTA = colors.HexColor("#D97745")
CREAM = colors.HexColor("#FBF7EF")
MINT = colors.HexColor("#EEF4EC")
INK = colors.HexColor("#263D46")
MUTED = colors.HexColor("#526A74")
LINE = colors.HexColor("#CBD8D5")

STYLES = getSampleStyleSheet()
STYLES.add(ParagraphStyle(
    name="CourseTitle",
    parent=STYLES["Title"],
    fontName="Helvetica-Bold",
    fontSize=26,
    leading=31,
    textColor=NAVY,
    spaceAfter=12,
    alignment=TA_LEFT,
))
STYLES.add(ParagraphStyle(
    name="CourseSubtitle",
    parent=STYLES["Normal"],
    fontName="Helvetica",
    fontSize=12,
    leading=18,
    textColor=MUTED,
    spaceAfter=18,
))
STYLES.add(ParagraphStyle(
    name="SectionTitle",
    parent=STYLES["Heading1"],
    fontName="Helvetica-Bold",
    fontSize=18,
    leading=22,
    textColor=NAVY,
    spaceBefore=10,
    spaceAfter=10,
))
STYLES.add(ParagraphStyle(
    name="SubTitle",
    parent=STYLES["Heading2"],
    fontName="Helvetica-Bold",
    fontSize=12.5,
    leading=16,
    textColor=TEAL,
    spaceBefore=7,
    spaceAfter=6,
))
STYLES.add(ParagraphStyle(
    name="BodyNV",
    parent=STYLES["BodyText"],
    fontName="Helvetica",
    fontSize=10.3,
    leading=15.2,
    textColor=INK,
    spaceAfter=7,
))
STYLES.add(ParagraphStyle(
    name="SmallNV",
    parent=STYLES["BodyText"],
    fontName="Helvetica",
    fontSize=8.5,
    leading=12,
    textColor=MUTED,
    spaceAfter=4,
))
STYLES.add(ParagraphStyle(
    name="Notice",
    parent=STYLES["BodyText"],
    fontName="Helvetica-Bold",
    fontSize=10,
    leading=15,
    textColor=NAVY,
    backColor=MINT,
    borderColor=TEAL,
    borderWidth=0.7,
    borderPadding=10,
    spaceAfter=14,
))
STYLES.add(ParagraphStyle(
    name="CenteredSmall",
    parent=STYLES["SmallNV"],
    alignment=TA_CENTER,
))


def _header_footer(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setFillColor(NAVY)
    canvas.rect(0, height - 13 * mm, width, 13 * mm, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 8.5)
    canvas.drawString(18 * mm, height - 8.2 * mm, "NÚCLEO VIVO · AULA SEMBRAR")
    canvas.setStrokeColor(LINE)
    canvas.line(18 * mm, 15 * mm, width - 18 * mm, 15 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(18 * mm, 10 * mm, doc.title)
    canvas.drawRightString(width - 18 * mm, 10 * mm, f"Página {doc.page}")
    canvas.restoreState()


class AccessibleDocTemplate(BaseDocTemplate):
    def __init__(self, filename, title, subject):
        super().__init__(
            filename,
            pagesize=A4,
            leftMargin=18 * mm,
            rightMargin=18 * mm,
            topMargin=23 * mm,
            bottomMargin=20 * mm,
            title=title,
            author="Núcleo Vivo",
            subject=subject,
            creator="Núcleo Vivo · Aula Sembrar",
        )
        self.title = title
        frame = Frame(
            self.leftMargin,
            self.bottomMargin,
            self.width,
            self.height,
            id="content",
        )
        self.addPageTemplates(PageTemplate(id="main", frames=[frame], onPage=_header_footer))

    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph):
            style = flowable.style.name
            if style in {"CourseTitle", "SectionTitle"}:
                level = 0 if style == "CourseTitle" else 1
                text = flowable.getPlainText()
                key = f"bookmark-{self.page}-{abs(hash(text))}"
                self.canv.bookmarkPage(key)
                self.canv.addOutlineEntry(text, key, level=level, closed=False)


def p(text, style="BodyNV"):
    return Paragraph(text, STYLES[style])


def lines(count=4, label=None):
    rows = []
    if label:
        rows.append([p(label, "SmallNV")])
    rows.extend([[""] for _ in range(count)])
    table = Table(rows, colWidths=[174 * mm], rowHeights=[8 * mm] * len(rows))
    table.setStyle(TableStyle([
        ("LINEBELOW", (0, 0), (-1, -1), 0.6, LINE),
        ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
        ("LEFTPADDING", (0, 0), (-1, -1), 2),
        ("RIGHTPADDING", (0, 0), (-1, -1), 2),
    ]))
    return table


def checklist(items):
    rows = [[p("[ ]", "BodyNV"), p(item, "BodyNV")] for item in items]
    table = Table(rows, colWidths=[8 * mm, 166 * mm])
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 2),
        ("RIGHTPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return table


def cover(title, subtitle):
    return [
        Spacer(1, 18 * mm),
        p(title, "CourseTitle"),
        p(subtitle, "CourseSubtitle"),
        Spacer(1, 8 * mm),
        p(
            "Este material es educativo y no clínico. No solicita diagnósticos, datos de salud "
            "ni información que identifique a terceras personas.",
            "Notice",
        ),
        p("Nombre o seudónimo: ________________________________________________", "BodyNV"),
        p("Fecha de inicio: ____________________   Fecha de revisión: ____________________", "BodyNV"),
        Spacer(1, 15 * mm),
        p("Reconocer la carga. Recuperar recursos. Transformar condiciones.", "SubTitle"),
        p("Versión 1.0 · Julio de 2026", "SmallNV"),
        PageBreak(),
    ]


def build_journal():
    path = OUTPUT / "bitacora-cuando-ensenar-agota.pdf"
    doc = AccessibleDocTemplate(
        str(path),
        "Bitácora · Cuando enseñar agota",
        "Bitácora privada y descargable para el curso Cuando enseñar agota",
    )
    story = cover(
        "Bitácora de aprendizaje",
        "Cuando enseñar agota · Comprender, prevenir y transformar el desgaste emocional docente",
    )
    modules = [
        ("M0 · Abrir la mochila", [
            "¿Cómo llegas hoy? Registra una palabra o una metáfora, sin explicar datos privados.",
            "¿Qué esperas aprender para cuidar mejor el trabajo docente?",
        ]),
        ("M1 · Observar sin diagnosticar", [
            "Anota tres hechos observables del caso de Andrea.",
            "¿Qué interpretación apresurada conviene evitar?",
            "Después del video: ¿qué cambió en tu decisión inicial y por qué?",
        ]),
        ("M2 · Demandas y recursos", [
            "Demandas visibles e invisibles que aparecen en el caso.",
            "Recursos personales, sociales y organizacionales disponibles o ausentes.",
            "¿Qué desequilibrio parece más relevante para intervenir?",
        ]),
        ("M3 · Señales y trayectoria", [
            "Clasifica señales observables por patrón, duración, intensidad y contexto.",
            "Escribe una frase descriptiva que no etiquete a la persona.",
        ]),
        ("M4 · Privacidad y conversación", [
            "¿Qué información es necesaria para ofrecer apoyo?",
            "¿Qué dato no corresponde registrar ni compartir?",
            "Redacta una apertura de conversación basada en hechos y consentimiento.",
        ]),
        ("M5 · Condiciones organizacionales", [
            "Identifica una práctica de trabajo que aumenta la carga.",
            "Propón un cambio pequeño, responsable y observable en el equipo.",
        ]),
        ("M6 · Recuperación posible", [
            "Elige una acción personal viable que no traslade toda la responsabilidad a la persona.",
            "¿Qué condición organizacional necesita acompañarla?",
        ]),
        ("M7 · Sentido, límites y agencia", [
            "¿Qué valor profesional deseas proteger?",
            "¿Qué límite concreto ayuda a sostener ese valor sin idealizar la sobrecarga?",
        ]),
        ("M8 · Plan Vivo", [
            "Integra una acción personal y una organizacional para los próximos 30 días.",
            "Define responsable, plazo, apoyo necesario e indicador observable.",
            "¿Cómo sabrás que debes ajustar el plan o activar apoyo especializado?",
        ]),
    ]
    for index, (title, prompts) in enumerate(modules):
        story.append(p(title, "SectionTitle"))
        for prompt in prompts:
            story.append(KeepTogether([p(prompt, "SubTitle"), lines(3)]))
            story.append(Spacer(1, 3 * mm))
        if index < len(modules) - 1:
            story.append(PageBreak())

    story.extend([
        PageBreak(),
        p("Práctica espaciada", "SectionTitle"),
        p("Vuelve sin mirar tus notas. Recupera primero; después compara y ajusta.", "Notice"),
    ])
    for day, question in [
        ("Día 2", "¿Qué diferencia recuerdas entre cansancio cotidiano, agotamiento emocional y burnout?"),
        ("Día 7", "Explica el modelo demandas-recursos con un ejemplo distinto al de Andrea."),
        ("Día 14", "¿Qué harías para abrir una conversación de apoyo sin diagnosticar ni invadir privacidad?"),
        ("Día 30", "¿Qué cambió en tu Plan Vivo? Conserva, ajusta o reemplaza una acción y justifica."),
    ]:
        story.append(p(day, "SubTitle"))
        story.append(p(question))
        story.append(lines(4))
        story.append(Spacer(1, 4 * mm))
    doc.build(story)
    return path


def build_plan():
    path = OUTPUT / "plantilla-plan-vivo.pdf"
    doc = AccessibleDocTemplate(
        str(path),
        "Plantilla · Plan Vivo de Bienestar Docente",
        "Plantilla final del curso Cuando enseñar agota",
    )
    story = cover(
        "Plan Vivo de Bienestar Docente",
        "Una propuesta breve, corresponsable, observable y ajustable",
    )
    story.extend([
        p("1 · Situación priorizada", "SectionTitle"),
        p("Describe el problema con hechos observables. No incluyas nombres, diagnósticos ni datos de salud."),
        lines(5),
        p("2 · Lectura demandas-recursos", "SectionTitle"),
    ])
    data = [
        [p("<b>Demandas relevantes</b>"), p("<b>Recursos disponibles</b>"), p("<b>Recurso que falta</b>")],
        ["", "", ""],
        ["", "", ""],
    ]
    table = Table(data, colWidths=[58 * mm, 58 * mm, 58 * mm], rowHeights=[11 * mm, 25 * mm, 25 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), MINT),
        ("BOX", (0, 0), (-1, -1), 0.7, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.extend([
        table,
        PageBreak(),
        p("3 · Acciones en dos niveles", "SectionTitle"),
    ])
    actions = [
        [p("<b>Nivel</b>"), p("<b>Acción concreta</b>"), p("<b>Responsable</b>"), p("<b>Plazo</b>")],
        [p("Personal o relacional"), "", "", ""],
        [p("Organizacional"), "", "", ""],
    ]
    table2 = Table(actions, colWidths=[34 * mm, 76 * mm, 39 * mm, 25 * mm], rowHeights=[11 * mm, 32 * mm, 32 * mm])
    table2.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), MINT),
        ("BOX", (0, 0), (-1, -1), 0.7, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.extend([
        table2,
        p("4 · Indicadores y resguardos", "SectionTitle"),
        p("Indicador observable a 7 o 14 días:"),
        lines(3),
        p("Resguardo de privacidad y criterio para pedir apoyo adicional:"),
        lines(3),
        p("5 · Revisión antes de entregar", "SectionTitle"),
        checklist([
            "La situación está descrita sin diagnosticar ni identificar a terceras personas.",
            "La propuesta combina acciones personales/relacionales y organizacionales.",
            "Cada acción tiene responsable, plazo e indicador observable.",
            "El plan reconoce límites y no promete eliminar por completo el desgaste.",
            "La propuesta indica cuándo ajustar el plan o activar apoyo especializado.",
        ]),
        p("Decisión a 30 días:  [ ] Conservar   [ ] Ajustar   [ ] Reemplazar", "Notice"),
    ])
    doc.build(story)
    return path


def build_summary():
    path = OUTPUT / "resumen-conceptos-esenciales.pdf"
    doc = AccessibleDocTemplate(
        str(path),
        "Resumen de conceptos esenciales · Cuando enseñar agota",
        "Síntesis académica y no diagnóstica del curso",
    )
    story = cover(
        "Conceptos esenciales",
        "Guía de consulta rápida · Cuando enseñar agota",
    )
    concepts = [
        ("Cansancio cotidiano", "Respuesta esperable a una demanda acotada. Suele disminuir con descanso suficiente. Por sí solo no confirma agotamiento emocional ni burnout."),
        ("Agotamiento emocional", "Experiencia de sentirse emocionalmente exhausto o sin recursos para responder. Conviene observar patrón, duración, intensidad y contexto; no se determina mediante una escena aislada."),
        ("Burnout", "Fenómeno ocupacional vinculado con estrés crónico en el trabajo que no se ha gestionado con éxito. Incluye agotamiento, distanciamiento mental o cinismo y menor eficacia profesional. Este curso no diagnostica."),
        ("Modelo demandas-recursos", "El riesgo aumenta cuando las demandas se sostienen y los recursos son insuficientes. Intervenir implica revisar carga, autonomía, claridad, apoyo, tiempo, reconocimiento y participación."),
        ("Corresponsabilidad", "El cuidado no descansa solamente en hábitos individuales. Una respuesta sólida combina acciones personales o relacionales con cambios organizacionales."),
        ("Privacidad", "Se trabaja con hechos necesarios, consentimiento y mínima exposición. No se registran diagnósticos, datos de salud, nombres de terceros ni inferencias psicológicas."),
        ("Recuperación", "Incluye desconexión, descanso, control del tiempo y experiencias que restauren recursos. Debe ser viable y acompañarse de condiciones de trabajo compatibles."),
        ("Conversación cuidadosa", "Describe lo observado, expresa preocupación sin etiquetar, pregunta qué apoyo sería útil, acuerda próximos pasos y deriva cuando corresponde."),
    ]
    for title, body in concepts:
        story.append(KeepTogether([p(title, "SectionTitle"), p(body)]))
    story.extend([
        PageBreak(),
        p("Secuencia para responder responsablemente", "SectionTitle"),
        checklist([
            "Observar hechos y contexto.",
            "Distinguir una señal de un diagnóstico.",
            "Preguntar y escuchar con consentimiento.",
            "Proteger datos personales y de salud.",
            "Mapear demandas y recursos.",
            "Acordar una acción personal o relacional viable.",
            "Acordar una acción organizacional con responsable y plazo.",
            "Revisar el efecto y ajustar.",
        ]),
        p("Mensaje de cuidado", "SectionTitle"),
        p(
            "Si una situación genera riesgo inmediato, sufrimiento intenso o deterioro importante, "
            "la formación no reemplaza atención profesional ni los protocolos institucionales correspondientes.",
            "Notice",
        ),
    ])
    doc.build(story)
    return path


def build_references():
    path = OUTPUT / "referencias-y-lecturas.pdf"
    doc = AccessibleDocTemplate(
        str(path),
        "Referencias y lecturas · Cuando enseñar agota",
        "Referencias académicas en formato APA para el curso",
    )
    story = cover(
        "Referencias y lecturas",
        "Selección académica utilizada en el diseño del curso",
    )
    references = [
        "CAST. (2024). <i>Universal Design for Learning guidelines version 3.0.</i> https://udlguidelines.cast.org/",
        "Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., &amp; Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. <i>Psychological Bulletin, 132</i>(3), 354-380. https://doi.org/10.1037/0033-2909.132.3.354",
        "Chang, M.-L. (2009). An appraisal perspective of teacher burnout: Examining the emotional work of teachers. <i>Educational Psychology Review, 21</i>(3), 193-218. https://doi.org/10.1007/s10648-009-9106-y",
        "Demerouti, E., Bakker, A. B., Nachreiner, F., &amp; Schaufeli, W. B. (2001). The job demands-resources model of burnout. <i>Journal of Applied Psychology, 86</i>(3), 499-512. https://doi.org/10.1037/0021-9010.86.3.499",
        "Hakanen, J. J., Bakker, A. B., &amp; Schaufeli, W. B. (2006). Burnout and work engagement among teachers. <i>Journal of School Psychology, 43</i>(6), 495-513. https://doi.org/10.1016/j.jsp.2005.11.001",
        "Iancu, A. E., Rusu, A., Măroiu, C., Păcurar, R., &amp; Maricuțoiu, L. P. (2018). The effectiveness of interventions aimed at reducing teacher burnout: A meta-analysis. <i>Educational Psychology Review, 30</i>(2), 373-396. https://doi.org/10.1007/s10648-017-9420-8",
        "Klingbeil, D. A., &amp; Renshaw, T. L. (2018). Mindfulness-based interventions for teachers: A meta-analysis of the emerging evidence base. <i>School Psychology Quarterly, 33</i>(4), 501-511. https://doi.org/10.1037/spq0000291",
        "Maslach, C., Schaufeli, W. B., &amp; Leiter, M. P. (2001). Job burnout. <i>Annual Review of Psychology, 52</i>, 397-422. https://doi.org/10.1146/annurev.psych.52.1.397",
        "Ministerio de Educación de Chile. (2024). <i>Taller diagnóstico participativo para el bienestar de los equipos educativos.</i>",
        "OECD. (2025). <i>Results from TALIS 2024: Country notes - Chile.</i> https://www.oecd.org/en/publications/results-from-talis-2024-country-notes_e127f9e2-en/chile_e31949b6-en.html",
        "Skaalvik, E. M., &amp; Skaalvik, S. (2018). Job demands and job resources as predictors of teacher motivation and well-being. <i>Social Psychology of Education, 21</i>(5), 1251-1275. https://doi.org/10.1007/s11218-018-9464-8",
        "Sonnentag, S., &amp; Fritz, C. (2015). Recovery from job stress: The stressor-detachment model as an integrative framework. <i>Journal of Organizational Behavior, 36</i>(S1), S72-S103. https://doi.org/10.1002/job.1924",
        "World Health Organization. (2019, May 28). <i>Burn-out an occupational phenomenon: International Classification of Diseases.</i>",
        "World Health Organization. (2022). <i>WHO guidelines on mental health at work.</i>",
        "World Wide Web Consortium. (2023). <i>Web Content Accessibility Guidelines (WCAG) 2.2.</i> https://www.w3.org/TR/WCAG22/",
    ]
    story.extend([
        p("Criterio de lectura", "SectionTitle"),
        p("Las referencias respaldan la distinción conceptual, el enfoque demandas-recursos, la corresponsabilidad y las decisiones de accesibilidad. No constituyen instrumentos de diagnóstico."),
    ])
    for item in references:
        story.append(p(item))
        story.append(Spacer(1, 1.5 * mm))
    story.extend([
        p("Nota sobre la evidencia", "SectionTitle"),
        p(
            "La cifra TALIS usada en el curso compara profesorado de Chile (27 %) con el promedio "
            "de la OCDE (19 %) que reporta mucho estrés en su trabajo. Se presenta como contexto poblacional, "
            "no como explicación causal de una experiencia individual.",
            "Notice",
        ),
    ])
    doc.build(story)
    return path


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    paths = [build_journal(), build_plan(), build_summary(), build_references()]
    for path in paths:
        print(path.relative_to(ROOT))


if __name__ == "__main__":
    main()
