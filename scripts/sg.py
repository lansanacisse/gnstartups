"""Fonctions communes : lecture du schéma et des fichiers CSV du référentiel.

Aucune dépendance externe : bibliothèque standard Python 3.10+ uniquement.
"""
from __future__ import annotations

import csv
import json
import os
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCHEMA_PATH = ROOT / "schema" / "tables.json"
ID_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
LIST_SEP = ";"
FRESHNESS_DAYS = 183  # au-delà, une fiche « active » est à actualiser


def today() -> date:
    """Date du jour, surchargeable par SG_TODAY=AAAA-MM-JJ pour des builds reproductibles."""
    forced = os.environ.get("SG_TODAY")
    return date.fromisoformat(forced) if forced else date.today()


def load_schema() -> dict:
    with SCHEMA_PATH.open(encoding="utf-8") as f:
        return json.load(f)


def read_csv(path: Path) -> tuple[list[str], list[dict]]:
    if not path.exists():
        return [], []
    with path.open(encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        rows = [{k: (v or "").strip() for k, v in row.items()} for row in reader]
        return list(reader.fieldnames or []), rows


def split_list(value: str) -> list[str]:
    return [v.strip() for v in value.split(LIST_SEP) if v.strip()] if value else []


def parse_value(col: dict, raw: str):
    """Convertit une valeur brute CSV selon le type du schéma. Lève ValueError si invalide."""
    if raw == "":
        return [] if col["type"] == "ref_list" else None
    t = col["type"]
    if t in ("id", "text", "url", "enum", "ref"):
        return raw
    if t == "int":
        return int(raw)
    if t == "decimal":
        return float(raw)
    if t == "bool":
        if raw not in ("true", "false"):
            raise ValueError("booléen attendu : true ou false")
        return raw == "true"
    if t == "date":
        if not DATE_RE.match(raw):
            raise ValueError("date attendue au format AAAA-MM-JJ")
        return date.fromisoformat(raw).isoformat()
    if t == "ref_list":
        return split_list(raw)
    raise ValueError(f"type inconnu : {t}")


def load_all(schema: dict | None = None) -> dict[str, list[dict]]:
    """Charge toutes les tables, valeurs converties (les valeurs invalides restent brutes)."""
    schema = schema or load_schema()
    data = {}
    for table in schema["tables"]:
        _, rows = read_csv(ROOT / table["file"])
        cols = {c["name"]: c for c in table["columns"]}
        parsed = []
        for row in rows:
            out = {}
            for name, col in cols.items():
                raw = row.get(name, "")
                try:
                    out[name] = parse_value(col, raw)
                except ValueError:
                    out[name] = raw
            parsed.append(out)
        data[table["name"]] = parsed
    return data
