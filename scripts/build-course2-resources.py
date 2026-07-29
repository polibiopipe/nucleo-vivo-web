"""Genera la familia editorial PDF del curso Cuando enseñar agota.

Los documentos siguen el estándar académico de Aula Sembrar:
- portada institucional, palabras clave y cita sugerida;
- tabla de contenidos, jerarquía de títulos y marcadores;
- texto seleccionable, enlaces activos y metadatos;
- encabezados, pies, numeración y cierre de propiedad intelectual;
- estructura preparada para un futuro proceso de etiquetado PDF/UA.
"""

from __future__ import annotations

import html
import re
from pathlib import Path
from typing import Iterable

from pypdf import PdfReader, PdfWriter
from pypdf.generic import BooleanObject, DictionaryObject, NameObject, TextStringObject
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    KeepTogether,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "sembrar" / "aula" / "curso" / "cuando-ensenar-agota" / "recursos"
LOGO = ROOT / "assets" / "nucleo-vivo-logotipo-exacto-del-moodboard.png"
ISOTYPE = ROOT / "assets" / "nucleo-vivo-isotipo-exacto-del-moodboard.png"
IMAGE_DIR = ROOT / "assets" / "images" / "aula" / "cuando-ensenar-agota"

NAVY = colors.HexColor("#173F4D")
DEEP_NAVY = colors.HexColor("#102F3A")
TEAL = colors.HexColor("#1D6870")
TURQUOISE = colors.HexColor("#2F9CA3")
GOLD = colors.HexColor("#A98A3A")
TERRACOTTA = TEAL
CREAM = colors.HexColor("#FFFFFF")
MINT = colors.HexColor("#F3F6F6")
PALE_GOLD = colors.HexColor("#F7F7F4")
WHITE = colors.HexColor("#FFFFFF")
INK = colors.HexColor("#20292D")
MUTED = colors.HexColor("#5B676C")
LINE = colors.HexColor("#D7DEE0")
LINK = colors.HexColor("#15636B")

YEAR = 2026
VERSION = "1.0"
SITE_URL = "https://nucleovivo.net/sembrar/"
COURSE_TITLE = "Cuando enseñar agota"
INSTITUTION = "Núcleo Vivo · Aula Sembrar"


def register_fonts() -> None:
    fonts = {
        "NVBody": Path(r"C:\Windows\Fonts\calibri.ttf"),
        "NVBodyBold": Path(r"C:\Windows\Fonts\calibrib.ttf"),
        "NVBodyItalic": Path(r"C:\Windows\Fonts\calibrii.ttf"),
        "NVDisplay": Path(r"C:\Windows\Fonts\georgia.ttf"),
        "NVDisplayBold": Path(r"C:\Windows\Fonts\georgiab.ttf"),
        "NVDisplayItalic": Path(r"C:\Windows\Fonts\georgiai.ttf"),
    }
    for name, path in fonts.items():
        if path.exists():
            pdfmetrics.registerFont(TTFont(name, str(path)))
    pdfmetrics.registerFontFamily(
        "NVBody",
        normal="NVBody",
        bold="NVBodyBold",
        italic="NVBodyItalic",
        boldItalic="NVBodyBold",
    )
    pdfmetrics.registerFontFamily(
        "NVDisplay",
        normal="NVDisplay",
        bold="NVDisplayBold",
        italic="NVDisplayItalic",
        boldItalic="NVDisplayBold",
    )


register_fonts()

BASE_STYLES = getSampleStyleSheet()
STYLES: dict[str, ParagraphStyle] = {}


def add_style(name: str, parent: str = "BodyText", **kwargs) -> None:
    STYLES[name] = ParagraphStyle(name=name, parent=BASE_STYLES[parent], **kwargs)


add_style(
    "CoverEyebrow",
    fontName="NVBodyBold",
    fontSize=8.4,
    leading=11,
    textColor=TEAL,
    spaceAfter=8,
    textTransform="uppercase",
)
add_style(
    "CoverTitle",
    parent="Title",
    fontName="NVDisplayBold",
    fontSize=27,
    leading=31,
    textColor=DEEP_NAVY,
    spaceAfter=12,
)
add_style(
    "CoverSubtitle",
    fontName="NVBody",
    fontSize=12.2,
    leading=17,
    textColor=MUTED,
    spaceAfter=18,
)
add_style(
    "CoverMetaLabel",
    fontName="NVBodyBold",
    fontSize=7.8,
    leading=10.5,
    textColor=TEAL,
    textTransform="uppercase",
)
add_style(
    "CoverMeta",
    fontName="NVBody",
    fontSize=8.7,
    leading=12.4,
    textColor=INK,
)
add_style(
    "CoverFootnote",
    fontName="NVBody",
    fontSize=8.2,
    leading=11.5,
    textColor=MUTED,
    spaceBefore=7,
)
add_style(
    "TOCTitle",
    parent="Title",
    fontName="NVDisplayBold",
    fontSize=23,
    leading=28,
    textColor=DEEP_NAVY,
    spaceAfter=18,
)
add_style(
    "ChapterTitle",
    parent="Heading1",
    fontName="NVDisplayBold",
    fontSize=20.5,
    leading=25,
    textColor=DEEP_NAVY,
    spaceBefore=5,
    spaceAfter=13,
    keepWithNext=True,
)
add_style(
    "SectionTitle",
    parent="Heading2",
    fontName="NVDisplayBold",
    fontSize=14.2,
    leading=18.5,
    textColor=NAVY,
    spaceBefore=14,
    spaceAfter=8,
    keepWithNext=True,
)
add_style(
    "SubTitle",
    parent="Heading3",
    fontName="NVBodyBold",
    fontSize=10.8,
    leading=14.5,
    textColor=TEAL,
    spaceBefore=9,
    spaceAfter=5.5,
    keepWithNext=True,
)
add_style(
    "Body",
    fontName="NVBody",
    fontSize=10.2,
    leading=15.6,
    textColor=INK,
    spaceAfter=7.5,
    splitLongWords=False,
)
add_style(
    "BodyCompact",
    fontName="NVBody",
    fontSize=9.4,
    leading=13.8,
    textColor=INK,
    spaceAfter=5.5,
)
add_style(
    "Small",
    fontName="NVBody",
    fontSize=8.6,
    leading=12,
    textColor=INK,
    spaceAfter=4,
)
add_style(
    "SmallBold",
    fontName="NVBodyBold",
    fontSize=8.6,
    leading=12,
    textColor=NAVY,
    spaceAfter=4,
)
add_style(
    "Kicker",
    fontName="NVBodyBold",
    fontSize=7.8,
    leading=10,
    textColor=TEAL,
    spaceAfter=6,
    tracking=0.8,
)
add_style(
    "Notice",
    fontName="NVBody",
    fontSize=9.5,
    leading=14.2,
    textColor=INK,
    backColor=MINT,
    borderColor=LINE,
    borderWidth=0.45,
    borderPadding=8,
    leftIndent=1,
    rightIndent=1,
    spaceBefore=6,
    spaceAfter=13,
)
add_style(
    "GoldNotice",
    fontName="NVBody",
    fontSize=9.5,
    leading=14.2,
    textColor=INK,
    backColor=PALE_GOLD,
    borderColor=GOLD,
    borderWidth=0.45,
    borderPadding=8,
    spaceBefore=6,
    spaceAfter=13,
)
add_style(
    "Quote",
    fontName="NVDisplayItalic",
    fontSize=10.6,
    leading=16.2,
    textColor=NAVY,
    leftIndent=12,
    rightIndent=10,
    borderColor=TURQUOISE,
    borderWidth=0,
    borderPadding=8,
    spaceBefore=5,
    spaceAfter=10,
)
add_style(
    "CaptionTitle",
    fontName="NVBodyBold",
    fontSize=9,
    leading=12.2,
    textColor=INK,
    spaceBefore=8,
    spaceAfter=3,
)
add_style(
    "Caption",
    fontName="NVBody",
    fontSize=8.3,
    leading=11.5,
    textColor=MUTED,
    spaceAfter=11,
)
add_style(
    "Reference",
    fontName="NVBody",
    fontSize=9.1,
    leading=13.4,
    textColor=INK,
    leftIndent=12.7 * mm,
    firstLineIndent=-12.7 * mm,
    spaceAfter=8,
    splitLongWords=True,
)
add_style(
    "Centered",
    fontName="NVBody",
    fontSize=9.5,
    leading=13,
    textColor=MUTED,
    alignment=TA_CENTER,
)
add_style(
    "Legal",
    fontName="NVBody",
    fontSize=9.4,
    leading=14.5,
    textColor=INK,
    alignment=TA_LEFT,
    spaceAfter=10,
)


def esc(value: str) -> str:
    return html.escape(value, quote=False)


def para(text: str, style: str = "Body") -> Paragraph:
    return Paragraph(text, STYLES[style])


def plain(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text).replace("&amp;", "&")


def draw_sembrar_lockup(canvas, x: float, y: float, *, compact: bool = False) -> None:
    """Lockup editorial subordinado a Núcleo Vivo, sin metáforas vegetales."""
    node_radius = 1.05 * mm if not compact else 0.72 * mm
    gap = 4.6 * mm if not compact else 3.3 * mm
    line_y = y + (6.2 * mm if not compact else 3.2 * mm)
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.65 if not compact else 0.45)
    canvas.line(x, line_y, x + gap * 2, line_y)
    for index, color in enumerate((NAVY, TURQUOISE, GOLD)):
        canvas.setFillColor(color)
        canvas.circle(x + gap * index, line_y, node_radius, fill=1, stroke=0)
    text_x = x + gap * 2 + (4.2 * mm if not compact else 3 * mm)
    if compact:
        canvas.setFillColor(TEAL)
        canvas.setFont("NVBodyBold", 7.1)
        canvas.drawString(text_x, y + 1.1 * mm, "AULA SEMBRAR")
        canvas.setFillColor(MUTED)
        canvas.setFont("NVBody", 5.8)
        canvas.drawString(text_x, y - 1.8 * mm, "NÚCLEO VIVO")
        return
    canvas.setFillColor(TEAL)
    canvas.setFont("NVBodyBold", 7.2)
    canvas.drawString(text_x, y + 6.5 * mm, "AULA")
    canvas.setFillColor(DEEP_NAVY)
    canvas.setFont("NVDisplayBold", 12.5)
    canvas.drawString(text_x, y + 1.1 * mm, "Sembrar")
    canvas.setFillColor(MUTED)
    canvas.setFont("NVBody", 6.4)
    canvas.drawString(text_x, y - 2.6 * mm, "UNA INICIATIVA DE NÚCLEO VIVO")


def draw_cover(canvas, doc) -> None:
    width, height = A4
    canvas.saveState()
    canvas.setTitle(doc.title)
    canvas.setAuthor("Núcleo Vivo")
    canvas.setCreator(INSTITUTION)
    canvas.setSubject(doc.subject)
    canvas.setKeywords(doc.keywords)
    canvas.setFillColor(WHITE)
    canvas.rect(0, 0, width, height, fill=1, stroke=0)
    canvas.setFillColor(TEAL)
    canvas.rect(0, height - 1.5 * mm, width, 1.5 * mm, fill=1, stroke=0)
    if LOGO.exists():
        canvas.drawImage(
            str(LOGO),
            20 * mm,
            height - 53 * mm,
            width=24 * mm,
            height=28 * mm,
            preserveAspectRatio=True,
            mask="auto",
            anchor="c",
        )
    draw_sembrar_lockup(canvas, width - 74 * mm, height - 35 * mm)
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.7)
    canvas.line(20 * mm, height - 65 * mm, width - 20 * mm, height - 65 * mm)
    canvas.setStrokeColor(TEAL)
    canvas.setLineWidth(1.2)
    canvas.line(20 * mm, 24 * mm, 47 * mm, 24 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("NVBody", 6.8)
    canvas.drawString(20 * mm, 19 * mm, f"EDICIÓN {YEAR} · VERSIÓN {VERSION}")
    canvas.restoreState()


def draw_main_page(canvas, doc) -> None:
    width, height = A4
    canvas.saveState()
    canvas.setTitle(doc.title)
    canvas.setAuthor("Núcleo Vivo")
    canvas.setCreator(INSTITUTION)
    canvas.setSubject(doc.subject)
    canvas.setKeywords(doc.keywords)
    canvas.setFillColor(WHITE)
    canvas.rect(0, 0, width, height, fill=1, stroke=0)
    canvas.setFillColor(TEAL)
    canvas.rect(0, height - 1.2 * mm, width, 1.2 * mm, fill=1, stroke=0)
    draw_sembrar_lockup(canvas, 17 * mm, height - 13.2 * mm, compact=True)
    canvas.setFillColor(MUTED)
    canvas.setFont("NVBody", 7.3)
    canvas.drawRightString(width - 17 * mm, height - 10.2 * mm, doc.short_title)
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.45)
    canvas.line(17 * mm, height - 16.5 * mm, width - 17 * mm, height - 16.5 * mm)
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.45)
    canvas.line(17 * mm, 15 * mm, width - 17 * mm, 15 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("NVBody", 7.3)
    canvas.drawString(17 * mm, 9.5 * mm, doc.footer_title)
    canvas.drawRightString(width - 17 * mm, 9.5 * mm, f"Página {doc.page}")
    canvas.restoreState()


class AulaSembrarDoc(BaseDocTemplate):
    outline_styles = {"ChapterTitle": 0, "SectionTitle": 1}

    def __init__(
        self,
        filename: str,
        *,
        title: str,
        short_title: str,
        subject: str,
        keywords: Iterable[str],
    ):
        super().__init__(
            filename,
            pagesize=A4,
            leftMargin=19 * mm,
            rightMargin=18 * mm,
            topMargin=22 * mm,
            bottomMargin=20 * mm,
            title=title,
            author="Núcleo Vivo",
            subject=subject,
            creator=INSTITUTION,
        )
        self.title = title
        self.short_title = short_title
        self.footer_title = title
        self.subject = subject
        self.keywords = ", ".join(keywords)
        self._bookmark_counter = 0
        cover_frame = Frame(
            self.leftMargin,
            self.bottomMargin,
            self.width,
            self.height,
            id="cover-frame",
        )
        main_frame = Frame(
            self.leftMargin,
            self.bottomMargin,
            self.width,
            self.height,
            id="main-frame",
        )
        self.addPageTemplates(
            [
                PageTemplate(id="cover", frames=[cover_frame], onPage=draw_cover),
                PageTemplate(id="main", frames=[main_frame], onPage=draw_main_page),
            ]
        )

    def beforeDocument(self) -> None:
        self._bookmark_counter = 0

    def afterFlowable(self, flowable) -> None:
        if not isinstance(flowable, Paragraph):
            return
        level = self.outline_styles.get(flowable.style.name)
        if level is None:
            return
        title = flowable.getPlainText()
        self._bookmark_counter += 1
        key = f"section-{self._bookmark_counter}"
        self.canv.bookmarkPage(key)
        self.canv.addOutlineEntry(title, key, level=level, closed=False)
        self.notify("TOCEntry", (level, title, self.page, key))


def cover_metadata(rows: list[tuple[str, str]]) -> Table:
    data = [[para(label, "CoverMetaLabel"), para(value, "CoverMeta")] for label, value in rows]
    table = Table(data, colWidths=[34 * mm, 136 * mm], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LINEABOVE", (0, 0), (-1, 0), 0.65, TEAL),
                ("LINEBELOW", (0, 0), (-1, -2), 0.35, LINE),
                ("LINEBELOW", (0, -1), (-1, -1), 0.65, LINE),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (0, -1), 8),
                ("RIGHTPADDING", (1, 0), (1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    return table


def cover_story(
    title: str,
    subtitle: str,
    *,
    material_type: str,
    keywords: list[str],
    citation: str,
) -> list:
    keyword_text = " · ".join(keywords)
    return [
        Spacer(1, 68 * mm),
        para(f"AULA SEMBRAR · {material_type.upper()}", "CoverEyebrow"),
        para(esc(title), "CoverTitle"),
        para(esc(subtitle), "CoverSubtitle"),
        Spacer(1, 7 * mm),
        cover_metadata(
            [
                ("Palabras clave", esc(keyword_text)),
                ("Cita sugerida", citation),
                ("Datos editoriales", f"Núcleo Vivo · Aula Sembrar · Versión {VERSION} · Julio de {YEAR}"),
            ]
        ),
        Spacer(1, 5 * mm),
        para(
            "Material educativo de Núcleo Vivo. Puede estudiarse fuera del aula y complementa "
            "las experiencias interactivas de Aula Sembrar.",
            "CoverFootnote",
        ),
        NextPageTemplate("main"),
        PageBreak(),
    ]


def toc_story(lead: str) -> tuple[list, TableOfContents]:
    toc = TableOfContents()
    toc.levelStyles = [
        ParagraphStyle(
            name="TOCLevel0",
            fontName="NVBodyBold",
            fontSize=10,
            leading=14.5,
            leftIndent=0,
            firstLineIndent=0,
            textColor=INK,
            spaceBefore=5.5,
        ),
        ParagraphStyle(
            name="TOCLevel1",
            fontName="NVBody",
            fontSize=9.1,
            leading=13.2,
            leftIndent=14,
            firstLineIndent=0,
            textColor=MUTED,
            spaceBefore=2,
        ),
    ]
    return (
        [
            para("Contenido", "TOCTitle"),
            para(lead, "Body"),
            Spacer(1, 3 * mm),
            toc,
            PageBreak(),
        ],
        toc,
    )


def info_table(rows: list[tuple[str, str]], widths=(42 * mm, 128 * mm)) -> Table:
    data = [[para(f"<b>{label}</b>", "Small"), para(value, "Small")] for label, value in rows]
    table = Table(data, colWidths=list(widths), hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("TEXTCOLOR", (0, 0), (0, -1), TEAL),
                ("LINEABOVE", (0, 0), (-1, 0), 0.55, TEAL),
                ("LINEBELOW", (0, 0), (-1, -1), 0.35, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (0, -1), 0),
                ("LEFTPADDING", (1, 0), (1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 6.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6.5),
            ]
        )
    )
    return table


def title_block(kicker: str, title: str, objective: str | None = None) -> list:
    block = [para(esc(kicker.upper()), "Kicker"), para(esc(title), "ChapterTitle")]
    if objective:
        block.append(para(f"<b>Propósito de aprendizaje:</b> {esc(objective)}", "Notice"))
    return block


def bullet_table(items: list[str], *, color=TEAL, style="BodyCompact") -> Table:
    data = [[para("●", "SmallBold"), para(item, style)] for item in items]
    table = Table(data, colWidths=[7 * mm, 163 * mm], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("TEXTCOLOR", (0, 0), (0, -1), color),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 1),
                ("RIGHTPADDING", (0, 0), (-1, -1), 2),
                ("TOPPADDING", (0, 0), (-1, -1), 2),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]
        )
    )
    return table


def numbered_questions(items: list[str]) -> Table:
    data = [[para(str(index), "SmallBold"), para(esc(item), "BodyCompact")] for index, item in enumerate(items, 1)]
    table = Table(data, colWidths=[8 * mm, 162 * mm], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), MINT),
                ("TEXTCOLOR", (0, 0), (0, -1), TEAL),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LINEBELOW", (0, 0), (-1, -2), 0.3, LINE),
            ]
        )
    )
    return table


def synthesis_table(title: str, headers: list[str], rows: list[list[str]], widths: list[float]) -> list:
    data = [[para(f"<b>{esc(cell)}</b>", "SmallBold") for cell in headers]]
    data.extend([[para(esc(cell), "Small") for cell in row] for row in rows])
    table = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), MINT),
                ("TEXTCOLOR", (0, 0), (-1, 0), DEEP_NAVY),
                ("LINEABOVE", (0, 0), (-1, 0), 0.7, TEAL),
                ("LINEBELOW", (0, 0), (-1, 0), 0.55, TEAL),
                ("LINEBELOW", (0, 1), (-1, -1), 0.3, LINE),
                ("LINEBEFORE", (1, 0), (-1, -1), 0.3, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, colors.HexColor("#FAFBFB")]),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    return [para(esc(title), "CaptionTitle"), table, Spacer(1, 4 * mm)]


def worksheet_lines(count=4, label: str | None = None, width=170 * mm) -> list:
    flowables: list = []
    if label:
        flowables.append(para(esc(label), "SubTitle"))
    table = Table([[""] for _ in range(count)], colWidths=[width], rowHeights=[8 * mm] * count)
    table.setStyle(
        TableStyle(
            [
                ("LINEBELOW", (0, 0), (-1, -1), 0.55, LINE),
                ("LEFTPADDING", (0, 0), (-1, -1), 2),
                ("RIGHTPADDING", (0, 0), (-1, -1), 2),
            ]
        )
    )
    flowables.append(table)
    return flowables


def figure_story(
    image_path: Path,
    *,
    title: str,
    description: str,
    max_width=155 * mm,
    max_height=155 * mm,
) -> list:
    if not image_path.exists():
        return []
    image = Image(str(image_path))
    ratio = min(max_width / image.imageWidth, max_height / image.imageHeight)
    image.drawWidth = image.imageWidth * ratio
    image.drawHeight = image.imageHeight * ratio
    image.hAlign = "CENTER"
    return [
        para(esc(title), "CaptionTitle"),
        image,
        para(f"<b>Descripción:</b> {esc(description)}", "Caption"),
    ]


def legal_page(document_title: str) -> list:
    return [
        PageBreak(),
        para("Propiedad intelectual y condiciones de uso", "ChapterTitle"),
        Spacer(1, 12 * mm),
        para(
            f"© {YEAR} Núcleo Vivo. Este documento forma parte de Aula Sembrar y fue creado "
            "para fines educativos y de desarrollo profesional.",
            "Legal",
        ),
        para(
            "Se autoriza su descarga, impresión y uso personal o institucional interno por quienes "
            "participan en actividades de Núcleo Vivo. No se autoriza su venta, redistribución comercial, "
            "alteración de autoría ni publicación total o parcial como obra propia.",
            "Legal",
        ),
        para(
            "Las referencias académicas conservan los derechos de sus respectivas personas autoras y "
            "editoriales. Los enlaces se incluyen con fines de estudio y trazabilidad.",
            "Legal",
        ),
        para(
            "Este material es educativo y no clínico. No sustituye atención profesional, evaluación de "
            "riesgos ni protocolos institucionales. Cada persona decide qué registra y comparte; se "
            "recomienda no incluir diagnósticos, datos de salud ni información identificable de terceros.",
            "GoldNotice",
        ),
        para(
            f"<link href='{SITE_URL}' color='{LINK.hexval()}'>{SITE_URL}</link>",
            "Centered",
        ),
        Spacer(1, 18 * mm),
        para(f"{INSTITUTION} · {document_title} · Versión {VERSION}", "Centered"),
    ]


def finalize_pdf(path: Path, *, title: str, subject: str, keywords: list[str]) -> None:
    reader = PdfReader(str(path))
    writer = PdfWriter()
    writer.clone_document_from_reader(reader)
    writer.add_metadata(
        {
            "/Title": title,
            "/Author": "Núcleo Vivo",
            "/Subject": subject,
            "/Creator": INSTITUTION,
            "/Keywords": ", ".join(keywords),
            "/Language": "es-CL",
        }
    )
    writer._root_object[NameObject("/Lang")] = TextStringObject("es-CL")
    writer._root_object[NameObject("/ViewerPreferences")] = DictionaryObject(
        {NameObject("/DisplayDocTitle"): BooleanObject(True)}
    )
    writer.page_mode = "/UseOutlines"
    temporary = path.with_suffix(".tmp.pdf")
    with temporary.open("wb") as stream:
        writer.write(stream)
    temporary.replace(path)


def build_document(
    filename: str,
    *,
    title: str,
    short_title: str,
    subject: str,
    keywords: list[str],
    story: list,
) -> Path:
    path = OUTPUT / filename
    doc = AulaSembrarDoc(
        str(path),
        title=title,
        short_title=short_title,
        subject=subject,
        keywords=keywords,
    )
    doc.multiBuild(story)
    finalize_pdf(path, title=title, subject=subject, keywords=keywords)
    return path


REFERENCES: dict[str, tuple[str, str]] = {
    "cast": (
        "CAST. (2024). <i>Universal Design for Learning guidelines version 3.0.</i>",
        "https://udlguidelines.cast.org/",
    ),
    "cepeda": (
        "Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., &amp; Rohrer, D. (2006). "
        "Distributed practice in verbal recall tasks: A review and quantitative synthesis. "
        "<i>Psychological Bulletin, 132</i>(3), 354-380.",
        "https://doi.org/10.1037/0033-2909.132.3.354",
    ),
    "chang": (
        "Chang, M.-L. (2009). An appraisal perspective of teacher burnout: Examining the "
        "emotional work of teachers. <i>Educational Psychology Review, 21</i>(3), 193-218.",
        "https://doi.org/10.1007/s10648-009-9106-y",
    ),
    "demerouti": (
        "Demerouti, E., Bakker, A. B., Nachreiner, F., &amp; Schaufeli, W. B. (2001). "
        "The job demands-resources model of burnout. <i>Journal of Applied Psychology, 86</i>(3), 499-512.",
        "https://doi.org/10.1037/0021-9010.86.3.499",
    ),
    "hakanen": (
        "Hakanen, J. J., Bakker, A. B., &amp; Schaufeli, W. B. (2006). Burnout and work engagement "
        "among teachers. <i>Journal of School Psychology, 43</i>(6), 495-513.",
        "https://doi.org/10.1016/j.jsp.2005.11.001",
    ),
    "iancu": (
        "Iancu, A. E., Rusu, A., Măroiu, C., Păcurar, R., &amp; Maricuțoiu, L. P. (2018). "
        "The effectiveness of interventions aimed at reducing teacher burnout: A meta-analysis. "
        "<i>Educational Psychology Review, 30</i>(2), 373-396.",
        "https://doi.org/10.1007/s10648-017-9420-8",
    ),
    "klingbeil": (
        "Klingbeil, D. A., &amp; Renshaw, T. L. (2018). Mindfulness-based interventions for teachers: "
        "A meta-analysis of the emerging evidence base. <i>School Psychology Quarterly, 33</i>(4), 501-511.",
        "https://doi.org/10.1037/spq0000291",
    ),
    "kurtessis": (
        "Kurtessis, J. N., Eisenberger, R., Ford, M. T., Buffardi, L. C., Stewart, K. A., "
        "&amp; Adis, C. S. (2017). Perceived organizational support: A meta-analytic evaluation "
        "of organizational support theory. <i>Journal of Management, 43</i>(6), 1854-1884.",
        "https://doi.org/10.1177/0149206315575554",
    ),
    "maslach": (
        "Maslach, C., Schaufeli, W. B., &amp; Leiter, M. P. (2001). Job burnout. "
        "<i>Annual Review of Psychology, 52</i>, 397-422.",
        "https://doi.org/10.1146/annurev.psych.52.1.397",
    ),
    "mineduc": (
        "Ministerio de Educación de Chile. (2024). <i>Taller diagnóstico participativo para el "
        "bienestar de los equipos educativos.</i>",
        "https://reactivacioneducativa.mineduc.cl/wp-content/uploads/sites/127/2024/09/2024.09-Manual-Taller-Diagnostico-Bienestar.pdf",
    ),
    "oecd": (
        "OECD. (2025). <i>Results from TALIS 2024: Country notes - Chile.</i>",
        "https://www.oecd.org/en/publications/results-from-talis-2024-country-notes_e127f9e2-en/chile_e31949b6-en.html",
    ),
    "roediger": (
        "Roediger, H. L., III, &amp; Karpicke, J. D. (2006). Test-enhanced learning: Taking memory "
        "tests improves long-term retention. <i>Psychological Science, 17</i>(3), 249-255.",
        "https://doi.org/10.1111/j.1467-9280.2006.01693.x",
    ),
    "skaalvik": (
        "Skaalvik, E. M., &amp; Skaalvik, S. (2018). Job demands and job resources as predictors "
        "of teacher motivation and well-being. <i>Social Psychology of Education, 21</i>(5), 1251-1275.",
        "https://doi.org/10.1007/s11218-018-9464-8",
    ),
    "sonnentag": (
        "Sonnentag, S., &amp; Fritz, C. (2015). Recovery from job stress: The stressor-detachment "
        "model as an integrative framework. <i>Journal of Organizational Behavior, 36</i>(S1), S72-S103.",
        "https://doi.org/10.1002/job.1924",
    ),
    "suseso": (
        "Superintendencia de Seguridad Social. (s. f.). <i>Cuestionario de evaluación del ambiente "
        "laboral-salud mental/SUSESO (CEAL-SM/SUSESO).</i>",
        "https://www.suseso.cl/606/w3-propertyvalue-614691.html",
    ),
    "who2019": (
        "World Health Organization. (2019, May 28). <i>Burn-out an occupational phenomenon: "
        "International Classification of Diseases.</i>",
        "https://www.who.int/news/item/28-05-2019-burn-out-an-occupational-phenomenon-international-classification-of-diseases",
    ),
    "who2022": (
        "World Health Organization. (2022). <i>WHO guidelines on mental health at work.</i>",
        "https://www.who.int/publications/i/item/9789240053052",
    ),
    "w3c": (
        "World Wide Web Consortium. (2023). <i>Web Content Accessibility Guidelines (WCAG) 2.2.</i>",
        "https://www.w3.org/TR/WCAG22/",
    ),
}

REFERENCE_ORDER = [
    "cast",
    "cepeda",
    "chang",
    "demerouti",
    "hakanen",
    "iancu",
    "klingbeil",
    "kurtessis",
    "maslach",
    "mineduc",
    "oecd",
    "roediger",
    "skaalvik",
    "sonnentag",
    "suseso",
    "who2019",
    "who2022",
    "w3c",
]


def reference_story(keys: Iterable[str]) -> list:
    selected = set(keys)
    flowables: list = []
    for key in REFERENCE_ORDER:
        if key not in selected:
            continue
        citation, url = REFERENCES[key]
        flowables.append(
            para(
                f"{citation}<br/><link href='{url}' color='{LINK.hexval()}'>{esc(url)}</link>",
                "Reference",
            )
        )
    return flowables


MODULES = [
    {
        "number": "M0",
        "title": "Bienvenida, cuidado y punto de partida",
        "objective": "Reconocer cómo llegas al recorrido y elegir qué deseas comprender, cuidar o transformar.",
        "keywords": ["agencia", "privacidad", "meta de aprendizaje", "autocuidado reflexivo"],
        "opening": [
            "Un curso sobre desgaste docente necesita comenzar sin convertir a la persona en objeto de evaluación. "
            "Por eso el punto de partida no es una prueba clínica, sino una pausa pedagógica. Detenerse permite "
            "reconocer señales, nombrar expectativas y decidir qué vale la pena aprender.",
            "La participación se apoya en tres principios: cada persona controla lo que registra, puede trabajar "
            "con el caso ficticio de Andrea y no necesita revelar experiencias privadas. Esta agencia favorece "
            "un aprendizaje seguro y coherente con el Diseño Universal para el Aprendizaje (CAST, 2024).",
        ],
        "sections": [
            (
                "0.1 Una pausa que abre preguntas",
                [
                    "La observación inicial no busca una respuesta correcta. Una palabra, una metáfora o un hecho "
                    "concreto puede ayudar a reconocer cómo se llega a la jornada. Decir “hoy releí tres veces el "
                    "mismo correo” ofrece más información que juzgarse como incapaz o poco comprometido.",
                    "Observar no equivale a interpretar. Entre una señal y una conclusión existe un espacio para "
                    "preguntar por contexto, frecuencia, apoyos y necesidades. Ese espacio protege la dignidad y "
                    "mejora la calidad de las decisiones.",
                ],
            ),
            (
                "0.2 Agencia, privacidad y consentimiento",
                [
                    "La bitácora pertenece a quien aprende. Puede contener apuntes breves, dibujos o decisiones, "
                    "pero no requiere nombres de estudiantes, colegas u organizaciones. Tampoco solicita datos de "
                    "salud. Trabajar con Andrea permite practicar sin exponer situaciones reales.",
                    "El consentimiento también opera durante el aprendizaje: es válido dejar una pregunta en "
                    "blanco, usar una situación ficticia o cambiar de meta. La seguridad no reduce la profundidad; "
                    "crea condiciones para pensar con mayor honestidad.",
                ],
            ),
            (
                "0.3 Elegir una meta de aprendizaje",
                [
                    "Una meta útil se formula como comprensión o capacidad: distinguir conceptos, reconocer una "
                    "demanda, abrir una conversación o proponer un cambio. No necesita prometer bienestar permanente. "
                    "Basta con orientar la atención durante el recorrido.",
                    "La meta puede revisarse al finalizar. Aprender también implica descubrir que la pregunta inicial "
                    "era incompleta y formular una mejor.",
                ],
            ),
        ],
        "andrea": "Andrea llega con el café en la mano y la lista de pendientes activa. Antes de entrar a clases, "
        "se detiene. Registra que tiene sueño, que piensa en lo pendiente y que una conversación con una estudiante "
        "le devolvió sentido. Su meta será comprender por qué el descanso del fin de semana no siempre le devuelve energía.",
        "synthesis": [
            ["Señal", "Un dato que invita a observar", "Releer varias veces un mensaje"],
            ["Interpretación", "Una explicación provisional", "“No estoy rindiendo como antes”"],
            ["Meta", "Una capacidad que orienta el curso", "Comprender qué demanda recuperación"],
        ],
        "questions": [
            "¿Qué deseas comprender, cuidar o transformar durante este recorrido?",
            "¿Qué información prefieres mantener fuera de tu registro?",
            "¿Cómo sabrás que tu meta se volvió más clara al finalizar?",
        ],
        "refs": ["cast", "who2022", "w3c"],
    },
    {
        "number": "M1",
        "title": "No es solo cansancio",
        "objective": "Distinguir cansancio, estrés, agotamiento emocional y burnout sin convertir señales en diagnósticos.",
        "keywords": ["estrés", "agotamiento emocional", "burnout", "patrón"],
        "opening": [
            "El lenguaje importa porque orienta las decisiones. Cansancio, estrés, agotamiento emocional y burnout "
            "describen fenómenos relacionados, pero no equivalentes. Usarlos como sinónimos puede simplificar en "
            "exceso una experiencia compleja.",
            "Este capítulo ofrece distinciones conceptuales y cuatro lentes de observación. Su propósito no es "
            "diagnosticar, sino formular preguntas mejor fundadas y reconocer cuándo conviene activar apoyo.",
        ],
        "sections": [
            (
                "1.1 Cuatro conceptos que conviene separar",
                [
                    "El cansancio cotidiano suele aparecer después de un esfuerzo acotado y puede disminuir con "
                    "descanso suficiente. El estrés es una respuesta frente a demandas percibidas; puede ser breve "
                    "o prolongarse cuando las exigencias superan los recursos disponibles.",
                    "El agotamiento emocional alude a sentirse sin energía afectiva para responder. Es una dimensión "
                    "central del burnout, pero no lo confirma por sí sola. Maslach, Schaufeli y Leiter (2001) "
                    "describen el burnout como un proceso ocupacional multidimensional.",
                    "La Organización Mundial de la Salud ubica el burnout como fenómeno ocupacional asociado con "
                    "estrés crónico de trabajo que no se ha gestionado con éxito y no lo clasifica como enfermedad "
                    "médica (WHO, 2019). Esta precisión evita convertir una etiqueta general en conclusión individual.",
                ],
            ),
            (
                "1.2 Persistencia, frecuencia, intensidad e impacto",
                [
                    "Una señal aislada ofrece poca información. La persistencia pregunta cuánto dura; la frecuencia, "
                    "cuántas veces aparece; la intensidad, con qué fuerza; y el impacto, qué cambia en el trabajo, "
                    "las relaciones o la vida cotidiana.",
                    "Estas cuatro preguntas convierten impresiones vagas en descripciones comparables. También ayudan "
                    "a reconocer límites: si el patrón se intensifica, persiste o deteriora de manera importante el "
                    "funcionamiento, la formación debe complementarse con orientación profesional.",
                ],
            ),
            (
                "1.3 El dato poblacional no explica a una persona",
                [
                    "TALIS 2024 informa que 27 % del profesorado chileno declara sentir mucho estrés en su trabajo, "
                    "frente a 19 % del promedio OCDE (OECD, 2025). La cifra describe una población y aporta contexto; "
                    "no permite inferir qué ocurre con Andrea ni estimar burnout individual.",
                    "El trabajo emocional de enseñar, las demandas y los recursos ayudan a ampliar la explicación. "
                    "Chang (2009) muestra que la interpretación de situaciones escolares y la regulación emocional "
                    "son piezas relevantes para comprender el desgaste docente.",
                ],
            ),
        ],
        "andrea": "Andrea descansó el fin de semana, pero vuelve sin energía. Durante tres semanas ha releído correos, "
        "postergado conversaciones difíciles y terminado la jornada con tensión. La hipótesis más responsable reconoce "
        "que puede existir estrés sostenido o agotamiento emocional, pero que todavía falta información.",
        "synthesis": [
            ["Cansancio", "Esfuerzo acotado", "Suele responder al descanso"],
            ["Estrés", "Respuesta ante demandas", "Puede ser transitorio o sostenido"],
            ["Agotamiento emocional", "Falta de recursos afectivos", "Es una dimensión, no un diagnóstico"],
            ["Burnout", "Fenómeno ocupacional multidimensional", "Requiere evaluación competente"],
        ],
        "questions": [
            "¿Qué hecho del caso de Andrea es observable y qué parte sigue siendo hipótesis?",
            "¿Qué cambia al mirar persistencia, frecuencia, intensidad e impacto?",
            "¿Cómo evitarías usar un dato poblacional como explicación individual?",
        ],
        "refs": ["maslach", "who2019", "who2022", "oecd", "chang"],
        "figure": (
            "infografia-agotamiento-original.png",
            "Figura 1. Estrés, agotamiento emocional y burnout",
            "Infografía del curso que diferencia los conceptos y recuerda que una señal aislada no confirma burnout.",
        ),
    },
    {
        "number": "M2",
        "title": "La mochila invisible",
        "objective": "Analizar demandas y recursos para distribuir la responsabilidad y priorizar una acción posible.",
        "keywords": ["demandas laborales", "recursos laborales", "control", "equidad"],
        "opening": [
            "El modelo demandas-recursos propone que el bienestar no depende solo de la cantidad de tareas. Importa "
            "la relación entre lo que el trabajo exige y los recursos disponibles para responder.",
            "Esta mirada permite dejar de preguntar únicamente “¿qué debería hacer mejor la persona?” y sumar preguntas "
            "sobre autonomía, apoyo, claridad, tiempo, reconocimiento y participación.",
        ],
        "sections": [
            (
                "2.1 Demandas y recursos laborales",
                [
                    "Las demandas requieren esfuerzo físico, cognitivo o emocional sostenido. No todas son negativas: "
                    "una tarea desafiante puede favorecer aprendizaje. El problema aparece cuando las demandas se "
                    "acumulan, se vuelven crónicas o no existen oportunidades de recuperación.",
                    "Los recursos ayudan a alcanzar objetivos, reducen costos y facilitan aprendizaje o motivación "
                    "(Demerouti et al., 2001). En educación pueden incluir apoyo entre pares, claridad de rol, "
                    "autonomía, acceso a materiales, tiempo protegido y liderazgo disponible.",
                ],
            ),
            (
                "2.2 La misma demanda puede pesar distinto",
                [
                    "Dos escuelas pueden enfrentar un cambio curricular similar y vivirlo de manera diferente. Si una "
                    "cuenta con tiempo, apoyo técnico y participación, la demanda puede resultar exigente pero abordable. "
                    "Sin esos recursos, la misma tarea puede acelerar el desgaste.",
                    "En docentes, la presión de tiempo y los conflictos pueden asociarse con menor bienestar, mientras "
                    "el apoyo y la consonancia de valores operan como recursos (Hakanen et al., 2006; Skaalvik & "
                    "Skaalvik, 2018).",
                ],
            ),
            (
                "2.3 Priorizar con control y equidad",
                [
                    "Una prioridad útil combina impacto, frecuencia, posibilidad de cambio, riesgo y equidad. Después "
                    "se identifica el nivel de control: algunas tareas pueden soltarse, otras compartirse, renegociarse "
                    "o escalarse a quien tiene autoridad para decidir.",
                    "La equidad recuerda que una regla aparentemente igual puede afectar de modo distinto a personas "
                    "con responsabilidades de cuidado, jornadas parciales o menor acceso a apoyos. Una respuesta "
                    "responsable nombra quién decide, quién ejecuta y quién necesita soporte.",
                ],
            ),
        ],
        "andrea": "Andrea vacía su mochila: correcciones, cambios de horario, conflictos, planificación y trabajo "
        "doméstico. También aparecen apoyo entre pares y experiencia profesional. Prioriza los cambios con menos de "
        "24 horas porque son frecuentes, alteran su planificación y requieren una decisión de coordinación.",
        "synthesis": [
            ["Soltar", "Tarea de bajo valor", "Control directo"],
            ["Compartir", "Carga distribuible", "Acuerdo entre pares"],
            ["Renegociar", "Regla o plazo ajustable", "Interlocución con responsable"],
            ["Escalar", "Riesgo o condición estructural", "Autoridad y protocolo"],
        ],
        "questions": [
            "¿Qué demanda concreta conviene priorizar y por qué?",
            "¿Qué recurso ya existe y cuál falta?",
            "¿La acción propuesta corresponde al nivel real de control?",
        ],
        "refs": ["demerouti", "hakanen", "skaalvik"],
        "figure": (
            "bitacora-mochila-original.png",
            "Figura 2. Mi mochila invisible",
            "Lámina de trabajo que hace visibles demandas y recursos antes de decidir qué soltar, compartir, renegociar o escalar.",
        ),
    },
    {
        "number": "M3",
        "title": "Cuando funciono en automático",
        "objective": "Distinguir regulación profesional, supresión crónica y una necesidad observable.",
        "keywords": ["trabajo emocional", "regulación", "interpretación", "necesidad"],
        "opening": [
            "Enseñar implica regular emociones: sostener una conversación difícil, contener una reacción o mostrar "
            "calma para cuidar el espacio pedagógico. Esta regulación es parte del trabajo profesional.",
            "El riesgo aumenta cuando regular significa negar de manera continua lo que ocurre, sin autonomía, apoyo "
            "o tiempo para procesarlo. El automático puede mantener la jornada en marcha y, al mismo tiempo, reducir "
            "la capacidad de elegir.",
        ],
        "sections": [
            (
                "3.1 El trabajo emocional de enseñar",
                [
                    "Chang (2009) explica que las emociones docentes se relacionan con la forma en que se evalúan las "
                    "demandas del aula y con los recursos percibidos para responder. Una emoción no es una orden, pero "
                    "sí aporta información sobre lo que está en juego.",
                    "Regular es ajustar la expresión o la respuesta para cumplir una función profesional. Suprimir de "
                    "modo crónico, en cambio, puede desconectar la señal de la necesidad que intenta comunicar.",
                ],
            ),
            (
                "3.2 Del juicio global al mapa de la escena",
                [
                    "Separar hecho, interpretación, emoción o señal, respuesta y necesidad permite revisar la escena. "
                    "El hecho se describe sin atribuir intención. La interpretación se reconoce como hipótesis. La "
                    "necesidad se formula en términos observables: claridad, apoyo, tiempo, información o límite.",
                    "Este mapa no elimina la emoción. Le devuelve un lugar informativo y evita que una frase como "
                    "“no sirvo para esto” cierre prematuramente la comprensión.",
                ],
            ),
            (
                "3.3 Pedir ayuda como conducta profesional",
                [
                    "Buscar apoyo puede ser una respuesta competente cuando una demanda excede los recursos disponibles. "
                    "La petición gana claridad si nombra el hecho, el efecto, el recurso requerido y el próximo paso.",
                    "Cuando las señales son intensas, persistentes o afectan la vida cotidiana, corresponde ampliar el "
                    "apoyo y recurrir a canales profesionales o institucionales pertinentes (WHO, 2022).",
                ],
            ),
        ],
        "andrea": "Andrea tarda el doble en corregir y olvida una instrucción. En vez de concluir que es irresponsable, "
        "reconstruye la escena: recibió tres cambios, trabajó sin pausa y no tenía claridad sobre la prioridad. Su "
        "necesidad observable es acordar qué tarea puede esperar y contar con un bloque de trabajo protegido.",
        "synthesis": [
            ["Hecho", "Dato observable", "Se reprogramaron tres tareas"],
            ["Interpretación", "Hipótesis revisable", "“No puedo organizarme”"],
            ["Señal", "Información corporal o emocional", "Tensión y dificultad para concentrarse"],
            ["Necesidad", "Condición que puede solicitarse", "Prioridad y tiempo protegido"],
        ],
        "questions": [
            "¿Qué parte de una escena exigente es hecho y cuál interpretación?",
            "¿Qué necesidad puede expresarse sin diagnosticar?",
            "¿Qué apoyo profesional o institucional correspondería activar si el patrón se intensifica?",
        ],
        "refs": ["chang", "who2022"],
    },
    {
        "number": "M4",
        "title": "Descansar no siempre alcanza",
        "objective": "Distinguir descanso y recuperación, y diseñar un experimento breve con condiciones de apoyo.",
        "keywords": ["recuperación", "desconexión psicológica", "límites", "experimento"],
        "opening": [
            "Detener una tarea no garantiza que la atención se haya separado del trabajo. Es posible estar sentado "
            "y continuar resolviendo mentalmente conversaciones, correos y pendientes.",
            "La recuperación describe procesos que permiten restaurar recursos. No depende solo de voluntad: las "
            "normas, la carga y la disponibilidad esperada pueden facilitarla o bloquearla.",
        ],
        "sections": [
            (
                "4.1 Cuatro experiencias de recuperación",
                [
                    "Sonnentag y Fritz (2015) integran cuatro experiencias: desconexión psicológica, relajación, dominio "
                    "y control. Desconectarse implica dejar de responder mentalmente al trabajo por un tiempo. Relajarse "
                    "reduce activación. El dominio aparece al aprender o realizar algo desafiante por elección. El "
                    "control permite decidir cómo usar el tiempo no laboral.",
                    "No existe una combinación universal. La pregunta práctica es qué experiencia falta y qué condición "
                    "del trabajo impide que ocurra.",
                ],
            ),
            (
                "4.2 Un límite es también información",
                [
                    "Un límite pequeño puede ser cerrar una tarea, silenciar notificaciones durante un bloque o acordar "
                    "una hora de respuesta. Para probarlo se define cuándo ocurrirá, qué barrera se anticipa, qué apoyo "
                    "se necesita y qué señal permitirá evaluar.",
                    "Si el experimento falla por cambios tardíos o presión del entorno, la barrera no demuestra falta "
                    "de compromiso. Aporta evidencia sobre una condición que necesita conversación o rediseño.",
                ],
            ),
            (
                "4.3 Recuperación y responsabilidad organizacional",
                [
                    "Las prácticas personales pueden ayudar, pero no deben ocultar cargas estructurales. La OMS "
                    "recomienda combinar apoyo individual con intervenciones sobre condiciones de trabajo (WHO, 2022).",
                    "Un plan equilibrado pregunta qué puede hacer la persona, qué acuerdo necesita del equipo y qué "
                    "decisión corresponde a la organización.",
                ],
            ),
        ],
        "andrea": "Andrea decide cerrar una tarea antes de salir y proteger treinta minutos sin correos. Anticipa que "
        "los cambios de horario pueden interrumpir el plan. Por eso acuerda con coordinación un canal para urgencias y "
        "registra durante siete días si logra desconectarse.",
        "synthesis": [
            ["Desconexión", "Separarse mentalmente del trabajo", "Bloque sin correos"],
            ["Relajación", "Reducir activación", "Pausa de respiración o caminata"],
            ["Dominio", "Aprender por elección", "Actividad creativa"],
            ["Control", "Decidir sobre el tiempo", "Elegir cómo cerrar la jornada"],
        ],
        "questions": [
            "¿Qué experiencia de recuperación falta con mayor frecuencia?",
            "¿Qué barrera puede anticiparse antes de iniciar un experimento?",
            "¿Qué condición organizacional haría practicable el límite?",
        ],
        "refs": ["sonnentag", "who2022"],
        "figure": (
            "bitacora-recuperar-original.png",
            "Figura 3. Mi plan para recuperar energía",
            "Lámina de bitácora que combina una acción pequeña, una barrera, un apoyo y una fecha de revisión.",
        ),
    },
    {
        "number": "M5",
        "title": "Cuidarnos no puede ser individual",
        "objective": "Practicar una conversación cuidadosa y convertir el apoyo en un acuerdo observable.",
        "keywords": ["apoyo", "consentimiento", "conversación", "acuerdo de equipo"],
        "opening": [
            "El apoyo interpersonal puede ampliar recursos, pero una conversación bien intencionada también puede "
            "invadir, etiquetar o convertir a quien escucha en responsable de resolver una situación que excede su rol.",
            "Cuidar exige permiso, escucha, claridad sobre el apoyo y seguimiento. Después, el equipo puede traducir "
            "esa disposición en acuerdos que modifiquen prácticas cotidianas.",
        ],
        "sections": [
            (
                "5.1 Cuatro movimientos de una conversación cuidadosa",
                [
                    "Primero se pide permiso: “¿te sirve conversar ahora?”. Luego se describe lo observado sin "
                    "atribuir una condición. El tercer movimiento pregunta qué apoyo sería útil. El cuarto acuerda un "
                    "próximo paso y cómo se dará seguimiento.",
                    "El permiso puede retirarse y un “no” debe aceptarse. La conversación no requiere detalles de salud "
                    "ni autoriza a registrar información sensible.",
                ],
            ),
            (
                "5.2 Apoyo organizacional percibido",
                [
                    "El apoyo se fortalece cuando las personas perciben que la organización valora su contribución y "
                    "se preocupa por su bienestar. La justicia, el reconocimiento, la ayuda disponible y el respaldo "
                    "de la jefatura son antecedentes relevantes (Kurtessis et al., 2017).",
                    "Por eso no basta con ofrecer escucha si las prácticas de trabajo permanecen intactas. La conversación "
                    "debe poder conectar con recursos y decisiones reales.",
                ],
            ),
            (
                "5.3 Del apoyo al acuerdo verificable",
                [
                    "“Comunicarnos mejor” expresa una intención, pero no define una práctica. Un acuerdo operativo "
                    "nombra conducta, responsable, frecuencia, canal, fecha de revisión e indicador.",
                    "La privacidad puede coexistir con mejores condiciones. El equipo puede acordar agendas previas, "
                    "tiempos de cierre o canales de urgencia sin pedir que alguien justifique su necesidad mediante "
                    "información personal.",
                ],
            ),
        ],
        "andrea": "Una colega pregunta a Andrea si le sirve conversar y escucha sin corregirla. Andrea solicita claridad "
        "sobre prioridades. El equipo prueba durante tres semanas enviar agenda antes de cada reunión y cerrar con "
        "responsables, plazos y tareas que se eliminan.",
        "synthesis": [
            ["Permiso", "Protege agencia", "¿Te sirve conversar ahora?"],
            ["Observación", "Evita etiquetas", "He notado que..."],
            ["Apoyo", "Aclara la necesidad", "¿Qué sería útil?"],
            ["Seguimiento", "Convierte intención en conducta", "Revisamos el viernes"],
        ],
        "questions": [
            "¿Cómo abrirías una conversación sin asumir qué le ocurre a la otra persona?",
            "¿Qué apoyo concreto puede ofrecerse dentro del rol?",
            "¿Qué acuerdo de equipo permitiría cuidar sin pedir datos privados?",
        ],
        "refs": ["kurtessis", "who2022"],
    },
    {
        "number": "M6",
        "title": "Condiciones que cuidan",
        "objective": "Distinguir acciones cosméticas de intervenciones que modifican el diseño del trabajo.",
        "keywords": ["diseño del trabajo", "riesgos psicosociales", "participación", "indicadores"],
        "opening": [
            "Una actividad de bienestar puede ser valiosa, pero no sustituye la revisión de carga, horarios, claridad "
            "de rol, participación, violencia o apoyo de jefaturas. La prevención necesita actuar sobre condiciones.",
            "Las intervenciones organizacionales requieren evidencia suficiente para decidir, participación y una "
            "persona responsable con capacidad real de implementar el cambio.",
        ],
        "sections": [
            (
                "6.1 Intervenir sobre el diseño del trabajo",
                [
                    "La OMS prioriza intervenciones organizacionales que modifiquen condiciones de trabajo y las "
                    "complementa con formación, apoyo y retorno al trabajo cuando corresponde (WHO, 2022).",
                    "En Chile, CEAL-SM/SUSESO ofrece un marco oficial para evaluar riesgos psicosociales. Su valor no "
                    "reside solo en medir, sino en convertir los resultados en planes participativos, responsables y "
                    "seguimiento (Superintendencia de Seguridad Social, s. f.).",
                ],
            ),
            (
                "6.2 Participación y diagnóstico situado",
                [
                    "Un diagnóstico participativo combina datos disponibles con la experiencia de quienes realizan el "
                    "trabajo. El Ministerio de Educación de Chile (2024) propone espacios para identificar fortalezas, "
                    "tensiones y acciones posibles en los equipos educativos.",
                    "Participar no significa trasladar la decisión a quien tiene menos autoridad. Implica escuchar, "
                    "deliberar y hacer visible quién puede comprometer recursos o cambiar una regla.",
                ],
            ),
            (
                "6.3 Una propuesta en siete piezas",
                [
                    "Una propuesta breve incluye problema, evidencia, cambio específico, responsable, plazo, indicador "
                    "y resguardo de equidad. También declara dependencias y una fecha para revisar.",
                    "El indicador no debe convertirse en vigilancia. Su función es responder una pregunta práctica: "
                    "¿el cambio ayuda, necesita ajuste o debe escalarse?",
                ],
            ),
        ],
        "andrea": "El equipo registra seis cambios de horario con menos de 24 horas en tres semanas. Propone un plazo "
        "mínimo de 48 horas, un canal para excepciones y revisión mensual de cambios y horas afectadas. Coordinación "
        "es responsable de implementar y comunicar el acuerdo.",
        "synthesis": [
            ["Cosmética", "No cambia la demanda", "Actividad aislada sin revisión de carga"],
            ["Formativa", "Fortalece capacidades", "Conversación o herramienta"],
            ["Organizacional", "Modifica una condición", "Regla de horarios y responsable"],
        ],
        "questions": [
            "¿Qué condición del trabajo necesita rediseño y qué evidencia la muestra?",
            "¿Quién tiene capacidad real para ejecutar el cambio?",
            "¿Qué indicador permitiría ajustar sin vigilar a personas?",
        ],
        "refs": ["who2022", "suseso", "mineduc"],
    },
    {
        "number": "M7",
        "title": "Recuperar sentido sin idealizar la vocación",
        "objective": "Proteger valores profesionales mediante acciones graduadas, recursos y límites.",
        "keywords": ["sentido", "valores", "límites", "agencia"],
        "opening": [
            "El sentido del trabajo puede ser un recurso motivacional. Sin embargo, cuando se convierte en obligación "
            "de sacrificio, puede justificar cargas que deberían revisarse.",
            "Recuperar sentido no significa volver a hacer todo. Puede implicar simplificar, pedir ayuda, dejar una "
            "tarea, proteger una práctica significativa o definir qué es suficientemente bueno.",
        ],
        "sections": [
            (
                "7.1 Valores con recursos y límites",
                [
                    "La consonancia entre valores personales y organizacionales se relaciona con bienestar y motivación "
                    "docente, pero no elimina las demandas que agotan (Skaalvik & Skaalvik, 2018).",
                    "Un valor se vuelve sostenible cuando se traduce en conducta, cuenta con recursos y reconoce un "
                    "límite. “Quiero acompañar mejor” puede convertirse en proteger una conversación semanal y dejar "
                    "de duplicar un informe que no aporta a ese propósito.",
                ],
            ),
            (
                "7.2 Tres tamaños de acción",
                [
                    "Una acción pequeña se encuentra bajo control directo. Una acción compartida necesita apoyo de "
                    "pares. Una acción organizacional requiere autoridad, recursos y seguimiento.",
                    "Graduar evita pedir a la persona que resuelva sola el sistema. Cada acción incorpora fecha, apoyo "
                    "y una señal para mantener, ajustar o detener.",
                ],
            ),
            (
                "7.3 Dejar de hacer también es una decisión",
                [
                    "La agencia no se reduce a sumar hábitos. Renunciar a una tarea de bajo valor, renegociar un estándar "
                    "o pedir una priorización explícita puede proteger energía y propósito.",
                    "Una decisión suficientemente buena reconoce restricciones. No necesita demostrar compromiso a "
                    "través de disponibilidad ilimitada.",
                ],
            ),
        ],
        "andrea": "Andrea quiere recuperar conversaciones pedagógicas significativas. Decide proteger una por semana, "
        "simplificar un registro duplicado y solicitar tiempo de planificación. Cada acción tiene un tamaño distinto "
        "y necesita apoyos diferentes.",
        "synthesis": [
            ["Pequeña", "Control directo", "Proteger un bloque"],
            ["Compartida", "Acuerdo entre personas", "Alternar una tarea"],
            ["Organizacional", "Decisión y recursos", "Modificar un procedimiento"],
        ],
        "questions": [
            "¿Qué valor profesional deseas proteger y qué límite lo hace sostenible?",
            "¿Qué podrías dejar de hacer sin abandonar el propósito?",
            "¿Qué apoyo necesita cada tamaño de acción?",
        ],
        "refs": ["hakanen", "skaalvik"],
    },
    {
        "number": "M8",
        "title": "Plan Vivo de Bienestar Docente",
        "objective": "Integrar acciones personales y organizacionales, evaluar su calidad y revisarlas a 30 días.",
        "keywords": ["Plan Vivo", "corresponsabilidad", "evaluación", "práctica espaciada"],
        "opening": [
            "El cierre del curso no propone una receta universal. El Plan Vivo organiza una hipótesis de acción: qué "
            "situación se prioriza, qué recursos faltan, qué puede hacer la persona y qué debe cambiar en el entorno.",
            "Se llama vivo porque se revisa con evidencia y puede mantenerse, ajustarse, escalarse o cerrarse.",
        ],
        "sections": [
            (
                "8.1 Un plan de dos niveles",
                [
                    "Las intervenciones dirigidas a docentes muestran efectos favorables modestos y heterogéneos. La "
                    "evidencia aconseja combinar acciones según necesidades, contexto y calidad de implementación "
                    "(Iancu et al., 2018; Klingbeil & Renshaw, 2018).",
                    "El primer nivel reúne acciones personales o relacionales viables. El segundo incluye cambios "
                    "colectivos u organizacionales. Ambos nombran responsable, fecha, apoyo e indicador.",
                ],
            ),
            (
                "8.2 Criterios para revisar y mejorar",
                [
                    "Un plan competente relaciona demanda, recurso y señal; protege la privacidad; formula conductas "
                    "observables; distribuye la responsabilidad y se apoya en conceptos y fuentes.",
                    "La retroalimentación no cierra el proceso: explica un criterio y permite un nuevo intento. Privacidad "
                    "y responsabilidad organizacional son criterios críticos; si faltan, el plan debe revisarse.",
                ],
            ),
            (
                "8.3 Recuperar a 2, 7, 14 y 30 días",
                [
                    "La recuperación activa y la práctica distribuida fortalecen la retención cuando piden recordar y "
                    "usar una idea después de un intervalo (Cepeda et al., 2006; Roediger & Karpicke, 2006).",
                    "Las revisiones no requieren releer el curso completo. Piden explicar una distinción, aplicar una "
                    "decisión, revisar un indicador y transferir el aprendizaje a otro contexto.",
                ],
            ),
        ],
        "andrea": "Andrea combina dos movimientos: proteger un bloque de cierre y solicitar un plazo mínimo para cambios "
        "de horario. Define responsables, fechas e indicadores. A los 30 días decide mantener el bloque, ajustar el "
        "canal de excepciones y presentar evidencia adicional a coordinación.",
        "synthesis": [
            ["Situación", "Hechos y contexto", "Sin datos sensibles"],
            ["Dos niveles", "Agencia y corresponsabilidad", "Acción personal + organizacional"],
            ["Indicador", "Evidencia breve", "Permite decidir"],
            ["Revisión", "Mantener, ajustar, escalar o cerrar", "No exige perfección"],
        ],
        "questions": [
            "¿El plan combina una acción bajo control y otra sobre condiciones?",
            "¿Cada acción tiene responsable, fecha e indicador?",
            "¿Qué evidencia usarás para mantener, ajustar, escalar o cerrar?",
            "¿Qué recuperarás sin mirar tus notas en los días 2, 7, 14 y 30?",
        ],
        "refs": ["iancu", "klingbeil", "cepeda", "roediger", "who2022"],
    },
]


def module_reference_keys() -> list[str]:
    keys: list[str] = []
    for module in MODULES:
        for key in module["refs"]:
            if key not in keys:
                keys.append(key)
    return keys


def build_academic_note() -> Path:
    title = f"{COURSE_TITLE}: Apunte académico principal"
    keywords = [
        "bienestar docente",
        "demandas y recursos",
        "recuperación",
        "corresponsabilidad",
        "Plan Vivo",
    ]
    citation = (
        f"Núcleo Vivo. ({YEAR}). <i>{COURSE_TITLE}: Apunte académico principal</i> "
        f"(versión {VERSION}). Aula Sembrar."
    )
    story = cover_story(
        title,
        "Nueve capítulos para comprender la carga docente y construir respuestas personales, colectivas y organizacionales",
        material_type="Apunte académico",
        keywords=keywords,
        citation=citation,
    )
    toc_part, _ = toc_story(
        "La navegación reproduce la estructura M0-M8. Los marcadores del lector PDF permiten saltar entre capítulos."
    )
    story.extend(toc_part)
    story.extend(
        title_block(
            "Introducción",
            "Introducción",
            "Estudiar el curso fuera del aula y comprender cómo se relacionan conceptos, decisiones y prácticas.",
        )
    )
    story.extend(
        [
            para(
                "Enseñar es una actividad relacional, cognitiva y emocional. Su complejidad no puede explicarse "
                "únicamente por características individuales. Las demandas del trabajo, los recursos disponibles, "
                "las posibilidades de recuperación y el apoyo organizacional participan en la experiencia cotidiana.",
            ),
            para(
                "Este apunte reúne el contenido académico de los nueve módulos de Cuando enseñar agota. Mantiene "
                "una mirada preventiva y organizacional: distingue conceptos sin diagnosticar, trabaja con el caso "
                "ficticio de Andrea y propone decisiones revisables.",
            ),
            para(
                "Cada capítulo presenta una idea central, desarrollo con citas autor-año, un episodio de Andrea, "
                "un cuadro de síntesis y preguntas de reflexión. Las preguntas pueden responderse en privado o "
                "utilizando exclusivamente el caso ficticio.",
            ),
            para(
                "<b>Cómo estudiar:</b> comienza por la explicación, intenta reconstruir la idea sin mirar y luego "
                "compárala con el cuadro. Al final, aplica una pregunta al caso de Andrea o a una situación ficticia.",
                "Notice",
            ),
        ]
    )

    for module in MODULES:
        story.append(PageBreak())
        story.extend(title_block(module["number"], f"{module['number']} · {module['title']}", module["objective"]))
        story.append(
            info_table(
                [
                    ("Palabras clave", " · ".join(module["keywords"])),
                    ("Caso transversal", "Andrea, docente de una escuela ficticia"),
                ]
            )
        )
        story.append(Spacer(1, 4 * mm))
        for paragraph in module["opening"]:
            story.append(para(esc(paragraph)))
        for section_title, paragraphs in module["sections"]:
            story.append(para(esc(section_title), "SectionTitle"))
            for paragraph in paragraphs:
                story.append(para(esc(paragraph)))

        if module.get("figure"):
            filename, figure_title, description = module["figure"]
            story.extend(
                figure_story(
                    IMAGE_DIR / filename,
                    title=figure_title,
                    description=description,
                    max_width=145 * mm,
                    max_height=135 * mm,
                )
            )

        story.append(para("Andrea en contexto", "SectionTitle"))
        story.append(para(f"“{esc(module['andrea'])}”", "Quote"))
        story.extend(
            synthesis_table(
                f"Cuadro de síntesis · {module['number']}",
                ["Elemento", "Qué aporta", "Ejemplo o decisión"],
                module["synthesis"],
                [37 * mm, 63 * mm, 70 * mm],
            )
        )
        story.append(para("Preguntas para pensar", "SectionTitle"))
        story.append(numbered_questions(module["questions"]))
        story.append(para("Fuentes centrales del capítulo", "SectionTitle"))
        story.extend(reference_story(module["refs"]))

    story.extend(
        [
            PageBreak(),
            para("Conclusiones", "ChapterTitle"),
            para(
                "El desgaste docente no se comprende mediante una señal aislada ni se transforma con una única "
                "técnica. Una lectura responsable distingue conceptos, observa patrones y pregunta por demandas, "
                "recursos, recuperación, apoyo y condiciones del trabajo.",
            ),
            para(
                "La agencia personal importa, pero no sustituye la responsabilidad colectiva y organizacional. "
                "Pedir ayuda, proteger un límite o recuperar una práctica significativa necesita acuerdos, recursos "
                "y personas responsables con capacidad para actuar.",
            ),
            para(
                "El Plan Vivo reúne esta perspectiva: formula acciones en dos niveles, protege la privacidad y usa "
                "evidencia breve para decidir. Su valor no reside en prometer perfección, sino en sostener un proceso "
                "de aprendizaje y revisión.",
            ),
            para(
                "La trayectoria de Andrea muestra una transformación posible: pasar de cargar una explicación "
                "individual a reconocer la mochila completa, conversar con cuidado y proponer cambios observables.",
                "GoldNotice",
            ),
            PageBreak(),
            para("Referencias", "ChapterTitle"),
            para(
                "Las siguientes fuentes respaldan el desarrollo conceptual. Los enlaces son funcionales y permiten "
                "consultar DOI, organismos internacionales y recursos institucionales.",
            ),
        ]
    )
    story.extend(reference_story(module_reference_keys()))
    story.extend(legal_page(title))
    return build_document(
        "apunte-academico-cuando-ensenar-agota.pdf",
        title=title,
        short_title="Apunte académico · Cuando enseñar agota",
        subject="Apunte académico principal de los módulos M0-M8",
        keywords=keywords,
        story=story,
    )


def build_module_guide() -> Path:
    title = f"{COURSE_TITLE}: Material de aprendizaje por módulos"
    keywords = ["guía de estudio", "M0-M8", "actividades", "transferencia", "Andrea"]
    citation = (
        f"Núcleo Vivo. ({YEAR}). <i>{COURSE_TITLE}: Material de aprendizaje por módulos</i> "
        f"(versión {VERSION}). Aula Sembrar."
    )
    story = cover_story(
        title,
        "Ruta de estudio, práctica y transferencia para acompañar las diecinueve experiencias",
        material_type="Guía de estudio",
        keywords=keywords,
        citation=citation,
    )
    toc_part, _ = toc_story("Cada módulo incluye propósito, ideas esenciales, una práctica y evidencia de aprendizaje.")
    story.extend(toc_part)
    story.extend(
        title_block(
            "Introducción",
            "Cómo utilizar este material",
            "Planificar el estudio y conectar cada experiencia con una evidencia concreta.",
        )
    )
    story.extend(
        [
            para(
                "Esta guía no sustituye el apunte académico ni la bitácora. Organiza el recorrido: qué comprender, "
                "qué observar en Andrea, qué practicar y qué evidencia conservar.",
            ),
            para(
                "Antes de cada módulo, intenta explicar la idea central con tus propias palabras. Después de la "
                "actividad, registra una decisión breve. En los módulos M1-M7 vuelve a esa decisión en una recuperación "
                "posterior.",
            ),
        ]
    )
    for module in MODULES:
        story.append(PageBreak())
        story.extend(title_block(module["number"], f"{module['number']} · {module['title']}", module["objective"]))
        story.append(para("Ideas esenciales", "SectionTitle"))
        key_ideas = [plain(section[1][0]) for section in module["sections"]]
        story.append(bullet_table([esc(item) for item in key_ideas]))
        story.append(para("Andrea como hilo conductor", "SectionTitle"))
        story.append(para(esc(module["andrea"])))
        story.append(para("Actividad sugerida", "SectionTitle"))
        activity = (
            f"Sin mirar el apunte, explica la relación entre {module['keywords'][0]} y "
            f"{module['keywords'][1]}. Luego aplica una decisión al caso de Andrea."
        )
        story.append(para(esc(activity), "Notice"))
        story.extend(worksheet_lines(4, "Tu respuesta o mapa breve"))
        story.append(Spacer(1, 4 * mm))
        story.extend(
            synthesis_table(
                f"Evidencia de aprendizaje · {module['number']}",
                ["Comprender", "Practicar", "Transferir"],
                [
                    [
                        f"Explicar {module['keywords'][0]}",
                        module["questions"][0],
                        "Definir un próximo paso observable",
                    ]
                ],
                [50 * mm, 65 * mm, 55 * mm],
            )
        )
        story.append(para("Preguntas de cierre", "SectionTitle"))
        story.append(numbered_questions(module["questions"]))
        story.append(para("Fuentes para profundizar", "SectionTitle"))
        story.extend(reference_story(module["refs"]))
    story.extend(
        [
            PageBreak(),
            para("Conclusiones", "ChapterTitle"),
            para(
                "La ruta avanza desde la observación cuidadosa hacia un plan de dos niveles. Cada módulo añade una "
                "capacidad y conserva la posibilidad de volver atrás, revisar y mejorar.",
            ),
            para(
                "La evidencia más importante no es una confesión personal, sino una decisión razonada: distinguir, "
                "mapear, conversar, proponer, medir o ajustar.",
                "GoldNotice",
            ),
            PageBreak(),
            para("Referencias", "ChapterTitle"),
        ]
    )
    story.extend(reference_story(module_reference_keys()))
    story.extend(legal_page(title))
    return build_document(
        "material-aprendizaje-modulos.pdf",
        title=title,
        short_title="Material de aprendizaje · M0-M8",
        subject="Guía de estudio y transferencia para los nueve módulos",
        keywords=keywords,
        story=story,
    )


def build_summary() -> Path:
    title = f"{COURSE_TITLE}: Resumen de conceptos esenciales"
    keywords = ["conceptos esenciales", "consulta rápida", "burnout", "recuperación", "corresponsabilidad"]
    citation = (
        f"Núcleo Vivo. ({YEAR}). <i>{COURSE_TITLE}: Resumen de conceptos esenciales</i> "
        f"(versión {VERSION}). Aula Sembrar."
    )
    story = cover_story(
        title,
        "Guía de consulta rápida para recordar, comparar y transferir",
        material_type="Resumen académico",
        keywords=keywords,
        citation=citation,
    )
    toc_part, _ = toc_story("El resumen organiza conceptos, decisiones y una secuencia de respuesta responsable.")
    story.extend(toc_part)
    story.extend(
        title_block(
            "Introducción",
            "Introducción",
            "Recuperar las distinciones centrales sin reemplazar el desarrollo del apunte principal.",
        )
    )
    story.append(
        para(
            "Utiliza este documento después de intentar recordar. La consulta rápida ayuda más cuando primero "
            "formulas una explicación propia y luego comparas. Esta práctica espaciada fortalece la recuperación "
            "activa y permite volver sobre los conceptos en distintos momentos del curso.",
            "Notice",
        )
    )
    concepts = [
        (
            "1. Cansancio cotidiano",
            "Respuesta esperable ante un esfuerzo acotado. Suele disminuir con descanso suficiente. Por sí solo no "
            "confirma agotamiento emocional ni burnout.",
            "M1",
        ),
        (
            "2. Estrés",
            "Respuesta frente a demandas percibidas. Puede ser transitorio o sostenido. Se comprende mejor al mirar "
            "contexto, persistencia, frecuencia, intensidad e impacto.",
            "M1",
        ),
        (
            "3. Agotamiento emocional",
            "Experiencia de sentirse sin recursos afectivos o energéticos. Es una dimensión relevante del burnout, "
            "pero no equivale a un diagnóstico (Maslach et al., 2001).",
            "M1",
        ),
        (
            "4. Burnout",
            "Fenómeno ocupacional asociado con estrés crónico de trabajo que no se ha gestionado con éxito. La OMS no "
            "lo clasifica como enfermedad médica (WHO, 2019).",
            "M1",
        ),
        (
            "5. Demandas y recursos",
            "Las demandas requieren esfuerzo; los recursos ayudan a alcanzar objetivos, reducir costos y aprender. "
            "La relación entre ambos orienta el análisis (Demerouti et al., 2001).",
            "M2",
        ),
        (
            "6. Trabajo emocional",
            "Regulación de emociones y expresiones para cumplir una función profesional. Necesita autonomía, apoyo y "
            "tiempo para procesar lo ocurrido (Chang, 2009).",
            "M3",
        ),
        (
            "7. Recuperación",
            "Proceso de restauración que puede incluir desconexión, relajación, dominio y control "
            "(Sonnentag & Fritz, 2015).",
            "M4",
        ),
        (
            "8. Conversación cuidadosa",
            "Pide permiso, describe hechos, escucha sin diagnosticar, pregunta por apoyo y acuerda seguimiento.",
            "M5",
        ),
        (
            "9. Corresponsabilidad",
            "Combina agencia personal con acciones colectivas y organizacionales. Evita trasladar toda la carga a la "
            "persona.",
            "M5-M8",
        ),
        (
            "10. Plan Vivo",
            "Hipótesis de acción en dos niveles, con responsables, fechas, indicadores, privacidad y revisión.",
            "M8",
        ),
    ]
    story.append(para("Conceptos", "ChapterTitle"))
    for heading, body, module in concepts:
        story.append(
            KeepTogether(
                [
                    para(esc(heading), "SectionTitle"),
                    para(f"<b>Ubicación:</b> {esc(module)}", "SmallBold"),
                    para(esc(body)),
                ]
            )
        )
    story.append(PageBreak())
    story.append(para("Cuadros de síntesis", "ChapterTitle"))
    story.extend(
        synthesis_table(
            "Cuadro 1. Observar antes de concluir",
            ["Pregunta", "Función", "Ejemplo"],
            [
                ["¿Cuánto dura?", "Persistencia", "Tres semanas"],
                ["¿Cuántas veces?", "Frecuencia", "Cuatro jornadas"],
                ["¿Con qué fuerza?", "Intensidad", "Interrumpe concentración"],
                ["¿Qué cambia?", "Impacto", "Posterga conversaciones"],
            ],
            [45 * mm, 45 * mm, 80 * mm],
        )
    )
    story.extend(
        synthesis_table(
            "Cuadro 2. Responder en el nivel adecuado",
            ["Nivel", "Ejemplo", "Responsabilidad"],
            [
                ["Personal", "Proteger un bloque", "Persona"],
                ["Relacional", "Pedir apoyo o compartir", "Pares"],
                ["Organizacional", "Modificar una regla", "Liderazgo o institución"],
            ],
            [40 * mm, 65 * mm, 65 * mm],
        )
    )
    story.append(para("Secuencia de respuesta responsable", "ChapterTitle"))
    story.append(
        bullet_table(
            [
                "Observar hechos y contexto.",
                "Distinguir señal, interpretación y concepto.",
                "Preguntar y escuchar con consentimiento.",
                "Proteger datos personales y de salud.",
                "Mapear demandas y recursos.",
                "Elegir una acción en el nivel real de control.",
                "Nombrar responsable, plazo e indicador.",
                "Revisar el efecto y ajustar.",
            ]
        )
    )
    story.append(para("Preguntas de recuperación", "SectionTitle"))
    story.append(
        numbered_questions(
            [
                "¿Qué diferencia recuerdas entre agotamiento emocional y burnout?",
                "¿Cómo explicarías el modelo demandas-recursos con un ejemplo nuevo?",
                "¿Qué convierte una intención en un acuerdo verificable?",
                "¿Qué hace que un Plan Vivo sea corresponsable?",
            ]
        )
    )
    story.extend(
        [
            PageBreak(),
            para("Conclusiones", "ChapterTitle"),
            para(
                "Las distinciones ayudan a evitar conclusiones apresuradas. La mirada se completa al relacionar "
                "señales, demandas, recursos, recuperación, apoyo y diseño del trabajo.",
            ),
            para(
                "Este resumen orienta la memoria; el apunte principal desarrolla los argumentos, autores y ejemplos.",
                "GoldNotice",
            ),
            PageBreak(),
            para("Referencias", "ChapterTitle"),
        ]
    )
    story.extend(reference_story(module_reference_keys()))
    story.extend(legal_page(title))
    return build_document(
        "resumen-conceptos-esenciales.pdf",
        title=title,
        short_title="Resumen de conceptos esenciales",
        subject="Síntesis académica y no diagnóstica del curso",
        keywords=keywords,
        story=story,
    )


def build_references() -> Path:
    title = f"{COURSE_TITLE}: Referencias y lecturas"
    keywords = ["referencias APA 7", "lecturas", "evidencia", "bienestar docente"]
    citation = (
        f"Núcleo Vivo. ({YEAR}). <i>{COURSE_TITLE}: Referencias y lecturas</i> "
        f"(versión {VERSION}). Aula Sembrar."
    )
    story = cover_story(
        title,
        "Fuentes utilizadas en el curso y rutas sugeridas para profundizar",
        material_type="Guía bibliográfica",
        keywords=keywords,
        citation=citation,
    )
    toc_part, _ = toc_story("Las rutas agrupan las fuentes por pregunta; la lista final conserva formato APA 7 y enlaces.")
    story.extend(toc_part)
    story.extend(
        title_block(
            "Introducción",
            "Cómo leer esta selección",
            "Consultar las fuentes según una pregunta de aprendizaje y distinguir evidencia de aplicación.",
        )
    )
    story.extend(
        [
            para(
                "Las referencias sostienen las distinciones conceptuales, el modelo demandas-recursos, la recuperación, "
                "las intervenciones y las decisiones de accesibilidad. No son instrumentos de diagnóstico.",
            ),
            para(
                "Una fuente puede aportar un marco teórico, una síntesis de evidencia o una orientación institucional. "
                "Antes de transferirla, conviene preguntar qué población estudia, qué diseño utiliza y qué límites declara.",
            ),
        ]
    )
    routes = [
        (
            "Ruta 1. Comprender estrés, agotamiento emocional y burnout",
            ["maslach", "who2019", "chang", "oecd"],
            "Útil para separar conceptos, reconocer el carácter ocupacional del burnout y situar los datos de TALIS.",
        ),
        (
            "Ruta 2. Analizar demandas, recursos y sentido",
            ["demerouti", "hakanen", "skaalvik"],
            "Conecta el diseño del trabajo con bienestar, motivación y compromiso docente.",
        ),
        (
            "Ruta 3. Recuperación, apoyo e intervenciones",
            ["sonnentag", "kurtessis", "iancu", "klingbeil", "who2022"],
            "Ayuda a distinguir mecanismos de recuperación, apoyo percibido e intervenciones con efectos heterogéneos.",
        ),
        (
            "Ruta 4. Contexto chileno y transformación organizacional",
            ["suseso", "mineduc", "oecd"],
            "Aporta marcos institucionales para diagnóstico participativo y riesgos psicosociales.",
        ),
        (
            "Ruta 5. Aprendizaje y accesibilidad",
            ["cepeda", "roediger", "cast", "w3c"],
            "Fundamenta práctica espaciada, recuperación activa y opciones de acceso al contenido.",
        ),
    ]
    for heading, keys, description in routes:
        story.append(PageBreak())
        story.append(para(esc(heading), "ChapterTitle"))
        story.append(para(esc(description), "Notice"))
        story.extend(reference_story(keys))
        story.append(para("Preguntas para valorar una fuente", "SectionTitle"))
        story.append(
            numbered_questions(
                [
                    "¿Qué pregunta responde la fuente?",
                    "¿Qué población, contexto o tipo de evidencia utiliza?",
                    "¿Qué conclusión permite y cuál no?",
                    "¿Cómo se conecta con una decisión del curso?",
                ]
            )
        )
    story.extend(
        [
            PageBreak(),
            para("Referencias completas en APA 7", "ChapterTitle"),
            para(
                "Los DOI y enlaces se mantienen activos. La fecha de consulta no se agrega cuando APA 7 no la requiere.",
            ),
        ]
    )
    story.extend(reference_story(REFERENCE_ORDER))
    story.extend(
        [
            PageBreak(),
            para("Conclusiones", "ChapterTitle"),
            para(
                "La evidencia orienta decisiones cuando se interpreta con atención a contexto y límites. Ninguna "
                "fuente aislada reemplaza el análisis situado ni autoriza inferencias clínicas sobre una persona.",
                "GoldNotice",
            ),
        ]
    )
    story.extend(legal_page(title))
    return build_document(
        "referencias-y-lecturas.pdf",
        title=title,
        short_title="Referencias y lecturas",
        subject="Referencias académicas en APA 7 y rutas de lectura",
        keywords=keywords,
        story=story,
    )


def build_plan() -> Path:
    title = "Plantilla Plan Vivo de Bienestar Docente"
    keywords = ["Plan Vivo", "plantilla", "dos niveles", "indicadores", "revisión"]
    citation = (
        f"Núcleo Vivo. ({YEAR}). <i>{title}</i> (versión {VERSION}). Aula Sembrar."
    )
    story = cover_story(
        title,
        "Una propuesta corresponsable, observable y ajustable",
        material_type="Plantilla de trabajo",
        keywords=keywords,
        citation=citation,
    )
    toc_part, _ = toc_story("Completa solo información necesaria. Puedes usar el caso ficticio de Andrea.")
    story.extend(toc_part)
    story.extend(
        title_block(
            "Introducción",
            "Antes de completar",
            "Construir una hipótesis de acción en dos niveles sin prometer una solución universal.",
        )
    )
    story.extend(
        [
            para(
                "El Plan Vivo articula situación, demandas, recursos, acciones, responsables, fechas e indicadores. "
                "Su objetivo es aprender de una prueba y revisar condiciones, no evaluar el estado emocional.",
            ),
            para(
                "No incluyas nombres de terceros, diagnósticos, datos de salud ni información que identifique a una "
                "comunidad educativa. Cuando lo prefieras, completa toda la plantilla con Andrea.",
                "Notice",
            ),
            para(
                "<b>Tres anclas para decidir:</b> No negociaré un resguardo básico; sí pondré a prueba una acción "
                "acotada; revisaré la evidencia antes de mantener, ajustar, escalar o cerrar.",
                "GoldNotice",
            ),
            PageBreak(),
            para("1. Situación priorizada", "ChapterTitle"),
            para(
                "Describe hechos, frecuencia y contexto. Distingue lo observado de la interpretación.",
            ),
        ]
    )
    story.extend(worksheet_lines(7, "Situación descrita con hechos"))
    story.extend(worksheet_lines(4, "¿Qué interpretación sigue siendo provisional?"))
    story.append(PageBreak())
    story.append(para("2. Lectura demandas-recursos", "ChapterTitle"))
    story.extend(
        synthesis_table(
            "Cuadro 1. Mapa inicial",
            ["Demandas relevantes", "Recursos disponibles", "Recurso que falta"],
            [["", "", ""], ["", "", ""], ["", "", ""]],
            [57 * mm, 57 * mm, 56 * mm],
        )
    )
    story.extend(worksheet_lines(4, "¿Qué nivel de control tiene cada elemento?"))
    story.append(PageBreak())
    story.append(para("3. Acciones en dos niveles", "ChapterTitle"))
    story.extend(
        synthesis_table(
            "Cuadro 2. Acciones",
            ["Nivel", "Conducta concreta", "Responsable", "Fecha"],
            [
                ["Personal o relacional", "", "", ""],
                ["Colectivo u organizacional", "", "", ""],
            ],
            [35 * mm, 70 * mm, 40 * mm, 25 * mm],
        )
    )
    story.extend(worksheet_lines(4, "Apoyo o recurso necesario"))
    story.extend(worksheet_lines(4, "Barrera prevista y respuesta"))
    story.append(PageBreak())
    story.append(para("4. Indicadores y resguardos", "ChapterTitle"))
    story.extend(
        synthesis_table(
            "Cuadro 3. Evidencia para decidir",
            ["Indicador", "Fuente no sensible", "Fecha de revisión", "Criterio"],
            [["", "", "", ""], ["", "", "", ""]],
            [47 * mm, 47 * mm, 38 * mm, 38 * mm],
        )
    )
    story.extend(worksheet_lines(4, "Resguardo de privacidad"))
    story.extend(worksheet_lines(4, "Cuándo pedir apoyo adicional o activar un protocolo"))
    story.append(PageBreak())
    story.append(para("5. Ejemplo completo: Andrea", "ChapterTitle"))
    story.append(
        info_table(
            [
                ("Situación", "Seis cambios de horario con menos de 24 horas durante tres semanas."),
                ("Demanda", "Replanificación frecuente y conflicto con responsabilidades de cuidado."),
                ("Recursos", "Apoyo entre pares; falta un plazo compartido y un canal de excepciones."),
                ("Acción personal", "Proteger un bloque de cierre tres días por semana."),
                ("Acción organizacional", "Plazo mínimo de 48 horas y canal de excepciones."),
                ("Responsable", "Andrea para el bloque; coordinación para el procedimiento."),
                ("Indicador", "Número de cambios tardíos y horas de planificación recuperadas."),
                ("Revisión", "A 14 y 30 días: mantener, ajustar, escalar o cerrar."),
            ]
        )
    )
    story.append(para("Por qué el ejemplo es competente", "SectionTitle"))
    story.append(
        bullet_table(
            [
                "Describe una situación sin diagnosticar.",
                "Relaciona demanda y recurso.",
                "Combina agencia personal y responsabilidad organizacional.",
                "Nombra responsables, fechas e indicadores.",
                "Utiliza evidencia operacional y protege privacidad.",
            ]
        )
    )
    story.append(PageBreak())
    story.append(para("6. Revisión antes del segundo intento", "ChapterTitle"))
    review_rows = [
        ["Criterio", "Sí", "Revisar"],
        ["Relaciona demanda, recurso y señal", "□", "□"],
        ["Incluye dos niveles de acción", "□", "□"],
        ["Define conducta, responsable, fecha e indicador", "□", "□"],
        ["Protege privacidad y evita diagnósticos", "□", "□"],
        ["Usa conceptos y fuentes pertinentes", "□", "□"],
    ]
    review_table = Table(
        [[para(f"<b>{cell}</b>", "SmallBold") if row == 0 else para(cell, "Small") for cell in cells] for row, cells in enumerate(review_rows)],
        colWidths=[125 * mm, 22 * mm, 23 * mm],
    )
    review_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), MINT),
                ("TEXTCOLOR", (0, 0), (-1, 0), DEEP_NAVY),
                ("LINEABOVE", (0, 0), (-1, 0), 0.7, TEAL),
                ("LINEBELOW", (0, 0), (-1, -1), 0.35, LINE),
                ("LINEBEFORE", (1, 0), (-1, -1), 0.3, LINE),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (1, 1), (-1, -1), "CENTER"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(review_table)
    story.extend(worksheet_lines(5, "¿Qué mejorarás en el segundo intento?"))
    story.append(PageBreak())
    story.append(para("7. Decisión a 30 días", "ChapterTitle"))
    story.append(
        para(
            "□ Mantener &nbsp;&nbsp;&nbsp; □ Ajustar &nbsp;&nbsp;&nbsp; □ Escalar "
            "&nbsp;&nbsp;&nbsp; □ Cerrar",
            "GoldNotice",
        )
    )
    story.extend(worksheet_lines(6, "Evidencia que sostiene tu decisión"))
    story.extend(worksheet_lines(5, "Próximo paso, responsable y fecha"))
    story.extend(
        [
            PageBreak(),
            para("Conclusiones", "ChapterTitle"),
            para(
                "Un Plan Vivo no es una promesa de perfección. Es una propuesta razonada, corresponsable y abierta "
                "a revisión.",
                "GoldNotice",
            ),
            PageBreak(),
            para("Referencias", "ChapterTitle"),
        ]
    )
    story.extend(reference_story(["demerouti", "who2022", "iancu", "klingbeil", "cepeda"]))
    story.extend(legal_page(title))
    return build_document(
        "plantilla-plan-vivo.pdf",
        title=title,
        short_title="Plantilla Plan Vivo",
        subject="Plantilla práctica del Plan Vivo de Bienestar Docente",
        keywords=keywords,
        story=story,
    )


def build_journal() -> Path:
    title = f"Bitácora de aprendizaje: {COURSE_TITLE}"
    keywords = ["bitácora", "cuaderno de trabajo", "reflexión", "Andrea", "práctica espaciada"]
    citation = (
        f"Núcleo Vivo. ({YEAR}). <i>{title}</i> (versión {VERSION}). Aula Sembrar."
    )
    story = cover_story(
        title,
        "Cuaderno privado para observar, decidir, practicar y volver",
        material_type="Bitácora",
        keywords=keywords,
        citation=citation,
    )
    toc_part, _ = toc_story("La bitácora acompaña la práctica. No reemplaza el apunte académico ni recibe calificación.")
    story.extend(toc_part)
    story.extend(
        title_block(
            "Introducción",
            "Esta bitácora te pertenece",
            "Registrar decisiones sin revelar información privada y recuperar el aprendizaje a lo largo del tiempo.",
        )
    )
    story.extend(
        [
            para(
                "Puedes escribir, dibujar o trabajar solamente con Andrea. No necesitas completar todas las líneas. "
                "La bitácora conserva su sentido cuando ayuda a pensar, no cuando se convierte en evidencia de exposición.",
            ),
            para(
                "Evita nombres, diagnósticos, datos de salud e información identificable de estudiantes, colegas u "
                "organizaciones. Si una pregunta no te resulta adecuada, déjala en blanco o cambia el escenario.",
                "Notice",
            ),
            para("Nombre o seudónimo: _________________________________________________", "Body"),
            para("Fecha de inicio: ___________________  Revisión a 30 días: ___________________", "Body"),
        ]
    )
    image_pages = {
        "M0": (
            "bitacora-como-llegue-original.png",
            "Lámina 1. ¿Cómo llegué hoy?",
            "Página ilustrada para reconocer energía, emociones y un momento que hizo bien.",
        ),
        "M2": (
            "bitacora-mochila-original.png",
            "Lámina 2. Mi mochila invisible",
            "Página ilustrada para hacer visibles demandas, recursos y responsabilidades.",
        ),
        "M4": (
            "bitacora-recuperar-original.png",
            "Lámina 3. Mi plan para recuperar energía",
            "Página ilustrada para diseñar una acción, anticipar barreras y pedir apoyo.",
        ),
    }
    for module in MODULES:
        story.append(PageBreak())
        story.extend(title_block(module["number"], f"{module['number']} · {module['title']}", module["objective"]))
        story.append(para("Andrea como punto de partida", "SectionTitle"))
        story.append(para(esc(module["andrea"])))
        story.append(para("Tu página de trabajo", "SectionTitle"))
        for question in module["questions"]:
            story.extend(worksheet_lines(4, question))
            story.append(Spacer(1, 2 * mm))
        story.append(para("Una decisión para conservar", "SectionTitle"))
        story.extend(worksheet_lines(4))
        if module["number"] in image_pages:
            filename, figure_title, description = image_pages[module["number"]]
            story.append(PageBreak())
            story.extend(
                figure_story(
                    IMAGE_DIR / filename,
                    title=figure_title,
                    description=description,
                    max_width=165 * mm,
                    max_height=215 * mm,
                )
            )

    story.extend(
        [
            PageBreak(),
            para("Práctica espaciada", "ChapterTitle"),
            para(
                "Recupera primero sin mirar tus notas. Después compara, corrige y decide qué conservar.",
                "Notice",
            ),
        ]
    )
    spaced = [
        ("Día 2", "Distingue cansancio, estrés, agotamiento emocional y burnout con tus propias palabras."),
        ("Día 7", "Explica el modelo demandas-recursos mediante un ejemplo distinto al de Andrea."),
        ("Día 14", "Escribe cómo abrirías una conversación de cuidado con permiso y privacidad."),
        ("Día 30", "Revisa tu Plan Vivo: mantén, ajusta, escala o cierra una acción y explica la evidencia."),
    ]
    for day, question in spaced:
        story.append(para(day, "SectionTitle"))
        story.extend(worksheet_lines(6, question))
    story.extend(
        [
            PageBreak(),
            para("Conclusiones", "ChapterTitle"),
            para(
                "Tu bitácora no necesita estar completa para tener valor. Puede mostrar preguntas mejores, decisiones "
                "más cuidadosas y cambios que todavía están en proceso.",
                "GoldNotice",
            ),
            PageBreak(),
            para("Referencias", "ChapterTitle"),
        ]
    )
    story.extend(reference_story(["cast", "cepeda", "roediger", "who2022", "w3c"]))
    story.extend(legal_page(title))
    return build_document(
        "bitacora-cuando-ensenar-agota.pdf",
        title=title,
        short_title="Bitácora · Cuando enseñar agota",
        subject="Cuaderno privado y descargable para las experiencias M0-M8",
        keywords=keywords,
        story=story,
    )


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    paths = [
        build_academic_note(),
        build_module_guide(),
        build_summary(),
        build_references(),
        build_plan(),
        build_journal(),
    ]
    for path in paths:
        print(path.relative_to(ROOT))


if __name__ == "__main__":
    main()
