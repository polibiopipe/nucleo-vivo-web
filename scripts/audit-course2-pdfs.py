"""Auditoría estructural de los PDF del curso Cuando enseñar agota."""

from __future__ import annotations

import sys
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
RESOURCE_DIR = ROOT / "sembrar" / "aula" / "curso" / "cuando-ensenar-agota" / "recursos"

EXPECTED = {
    "apunte-academico-cuando-ensenar-agota.pdf": {
        "min_pages": 28,
        "required": [
            "Introducción",
            "M0",
            "M1",
            "M2",
            "M3",
            "M4",
            "M5",
            "M6",
            "M7",
            "M8",
            "Andrea",
            "Conclusiones",
            "Referencias",
        ],
    },
    "material-aprendizaje-modulos.pdf": {
        "min_pages": 24,
        "required": ["M0", "M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "Transferencia"],
    },
    "resumen-conceptos-esenciales.pdf": {
        "min_pages": 8,
        "required": ["agotamiento", "recuperación", "demandas", "recursos", "práctica espaciada"],
    },
    "referencias-y-lecturas.pdf": {
        "min_pages": 10,
        "required": ["APA 7", "Maslach", "Demerouti", "Sonnentag", "World Health Organization"],
    },
    "plantilla-plan-vivo.pdf": {
        "min_pages": 12,
        "required": ["Plan Vivo", "Andrea", "30 días", "No negociaré", "Revisaré"],
    },
    "bitacora-cuando-ensenar-agota.pdf": {
        "min_pages": 22,
        "required": ["M0", "M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "Bitácora"],
    },
}

COMMON_REQUIRED = [
    "Núcleo Vivo",
    "Aula Sembrar",
    "Palabras clave",
    "Cita sugerida",
    "Contenido",
    "Propiedad intelectual",
]


class Audit:
    def __init__(self) -> None:
        self.passed = 0
        self.failures: list[str] = []

    def check(self, condition: bool, message: str) -> None:
        if condition:
            self.passed += 1
            print(f"[OK] {message}")
        else:
            self.failures.append(message)
            print(f"[FAIL] {message}")


def flattened_outline_count(items: list) -> int:
    total = 0
    for item in items:
        if isinstance(item, list):
            total += flattened_outline_count(item)
        else:
            total += 1
    return total


def main() -> int:
    audit = Audit()
    actual = {path.name for path in RESOURCE_DIR.glob("*.pdf")}
    audit.check(set(EXPECTED).issubset(actual), "Están presentes los seis PDF obligatorios")

    for filename, spec in EXPECTED.items():
        path = RESOURCE_DIR / filename
        if not path.exists():
            continue

        reader = PdfReader(str(path))
        full_text = "\n".join(page.extract_text() or "" for page in reader.pages)
        page_texts = [(page.extract_text() or "").strip() for page in reader.pages]
        root = reader.trailer["/Root"]
        annotation_count = sum(len(page.get("/Annots", [])) for page in reader.pages)
        outline_count = flattened_outline_count(reader.outline)
        metadata = reader.metadata

        audit.check(path.stat().st_size > 100_000, f"{filename}: archivo sustantivo")
        audit.check(len(reader.pages) >= spec["min_pages"], f"{filename}: extensión editorial mínima")
        audit.check(all(page_texts), f"{filename}: texto seleccionable en todas las páginas")
        audit.check(root.get("/Lang") == "es-CL", f"{filename}: idioma documental es-CL")
        audit.check(outline_count >= 5, f"{filename}: navegación mediante marcadores")
        audit.check(annotation_count >= 3, f"{filename}: enlaces internos o externos funcionales")
        audit.check(bool(metadata.title), f"{filename}: metadato de título")
        audit.check(bool(metadata.author), f"{filename}: metadato de autoría")
        audit.check(
            all(token.casefold() in full_text.casefold() for token in COMMON_REQUIRED),
            f"{filename}: arquitectura editorial institucional completa",
        )
        audit.check(
            all(token.casefold() in full_text.casefold() for token in spec["required"]),
            f"{filename}: contenido específico completo",
        )
        audit.check(
            "educativo y no clínico" in full_text.casefold(),
            f"{filename}: alcance educativo y resguardo de uso",
        )

    print(f"\nControles aprobados: {audit.passed}")
    if audit.failures:
        print(f"Controles fallidos: {len(audit.failures)}")
        for failure in audit.failures:
            print(f"- {failure}")
        return 1
    print("Controles fallidos: 0")
    return 0


if __name__ == "__main__":
    sys.exit(main())
