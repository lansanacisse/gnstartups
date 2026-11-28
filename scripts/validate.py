"""Valide le référentiel : structure des CSV, types, références et règles métier.

Usage : python scripts/validate.py [--strict]
  --strict  traite aussi les avertissements comme des erreurs, et refuse les lignes de démonstration
            (à utiliser à partir du lancement public).
Code de sortie 1 en cas d'erreur.
"""
from __future__ import annotations

import sys
import unicodedata
from datetime import date
from difflib import SequenceMatcher

from sg import ROOT, FRESHNESS_DAYS, ID_RE, load_all, load_schema, parse_value, read_csv, today


class Report:
    def __init__(self):
        self.errors: list[str] = []
        self.warnings: list[str] = []

    def err(self, where: str, msg: str):
        self.errors.append(f"{where} : {msg}")

    def warn(self, where: str, msg: str):
        self.warnings.append(f"{where} : {msg}")


def as_date(value) -> date | None:
    try:
        return date.fromisoformat(value) if value else None
    except (TypeError, ValueError):
        return None


def norm(name: str) -> str:
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode().lower()
    return "".join(ch for ch in s if ch.isalnum())


def check_structure(schema: dict, rep: Report) -> bool:
    """En-têtes, types, énumérations, obligatoires, unicité des id. Renvoie False si un fichier est illisible."""
    readable = True
    enums = schema["enums"]
    for table in schema["tables"]:
        path = ROOT / table["file"]
        rel = table["file"]
        expected = [c["name"] for c in table["columns"]]
        if not path.exists():
            rep.err(rel, "fichier manquant")
            readable = False
            continue
        header, rows = read_csv(path)
        if header != expected:
            rep.err(rel, f"en-tête attendu : {','.join(expected)}")
            readable = False
            continue
        seen = set()
        for i, row in enumerate(rows, start=2):
            where = f"{rel}:{i}"
            for col in table["columns"]:
                raw = row.get(col["name"], "")
                if raw == "":
                    if col["required"]:
                        rep.err(where, f"« {col['name']} » est obligatoire")
                    continue
                try:
                    val = parse_value(col, raw)
                except ValueError as e:
                    rep.err(where, f"« {col['name']} » : {e}")
                    continue
                if col["type"] == "id" and not ID_RE.match(val):
                    rep.err(where, f"identifiant « {val} » invalide (kebab-case attendu)")
                if col["type"] == "enum" and val not in enums[col["enum"]]:
                    rep.err(where, f"« {col['name']} » = « {val} » hors liste ({', '.join(enums[col['enum']])})")
                if col["type"] == "url" and not val.startswith(("https://", "http://")):
                    rep.err(where, f"« {col['name']} » doit commencer par https://")
                if col["type"] == "date" and date.fromisoformat(val) > today():
                    rep.err(where, f"« {col['name']} » est dans le futur")
            rid = row.get("id")
            if rid in seen:
                rep.err(where, f"identifiant « {rid} » en double")
            seen.add(rid)
    return readable


def check_refs(schema: dict, data: dict, rep: Report):
    ids = {t: {r.get("id"): r for r in rows} for t, rows in data.items()}
    for table in schema["tables"]:
        for i, row in enumerate(data[table["name"]], start=2):
            where = f"{table['file']}:{i}"
            for col in table["columns"]:
                if col["type"] not in ("ref", "ref_list"):
                    continue
                vals = row[col["name"]]
                vals = vals if isinstance(vals, list) else ([vals] if vals else [])
                for v in vals:
                    target = ids[col["ref"]].get(v)
                    if target is None:
                        rep.err(where, f"« {col['name']} » : « {v} » introuvable dans {col['ref']}")
                    elif row.get("demo") is False and target.get("demo") is True:
                        rep.err(where, f"ligne réelle qui cite la ligne de démonstration « {v} »")
    return ids


LOGO_DIR = ROOT / "data" / "logos"
LOGO_EXT = (".svg", ".png", ".webp")
LOGO_MAX = 200 * 1024


def check_logos(data: dict, rep: Report):
    """Chaque logo indiqué existe dans data/logos/, au bon format, sans contenu actif."""
    for i, s in enumerate(data["startups"], start=2):
        name = s.get("logo")
        if not name:
            continue
        where = f"data/startups.csv:{i}"
        path = LOGO_DIR / name
        if "/" in name or "\\" in name or not name.lower().endswith(LOGO_EXT):
            rep.err(where, f"logo « {name} » : nom de fichier simple attendu, en {', '.join(LOGO_EXT)}")
        elif not path.is_file():
            rep.err(where, f"logo « {name} » introuvable dans data/logos/")
        elif path.stat().st_size > LOGO_MAX:
            rep.err(where, f"logo « {name} » trop lourd (200 Ko au plus)")
        elif name.lower().endswith(".svg"):
            svg = path.read_text(encoding="utf-8", errors="replace").lower()
            if any(k in svg for k in ("<script", "javascript:", "<foreignobject", " onload", " onclick", "href=\"http")):
                rep.err(where, f"logo « {name} » : le SVG ne doit contenir ni script ni ressource externe")


def check_rules(data: dict, ids: dict, rep: Report, strict: bool):
    t = today()
    by_startup: dict[str, list[dict]] = {}
    for v in data["verifications"]:
        by_startup.setdefault(v["startup_id"], []).append(v)

    for s in data["sources"]:
        if not s["url"] and s["type"] not in ("entretien", "contribution"):
            rep.err(f"sources/{s['id']}", "URL obligatoire pour ce type de source")

    names: list[tuple[str, str]] = []
    for s in data["startups"]:
        where = f"startups/{s['id']}"
        verifs = sorted(by_startup.get(s["id"], []), key=lambda v: str(v["date"]))
        last = verifs[-1] if verifs else None
        if s["publie"] is True:
            if not s["source_ids"]:
                rep.err(where, "fiche publiée sans source")
            if not s["date_derniere_verification"]:
                rep.err(where, "fiche publiée sans date de dernière vérification")
        if s["statut_verification"] == "verifiee" and not verifs:
            rep.err(where, "statut « verifiee » sans ligne dans verifications")
        if last and s["date_derniere_verification"] and s["date_derniere_verification"] != last["date"]:
            rep.err(where, f"date_derniere_verification ({s['date_derniere_verification']}) ≠ dernière vérification ({last['date']})")
        if s["statut_activite"] in ("interrompue", "fermee"):
            if not any(v["statut_constate"] == s["statut_activite"] for v in verifs):
                rep.err(where, f"statut « {s['statut_activite']} » sans vérification qui le constate")
        last_check = as_date(s["date_derniere_verification"])
        if s["statut_activite"] == "active" and last_check:
            age = (t - last_check).days
            if age > FRESHNESS_DAYS:
                rep.warn(where, f"active mais vérifiée il y a {age} jours : à actualiser")
        if strict and s["demo"] is True:
            rep.err(where, "ligne de démonstration interdite en mode strict")
        names.append((s["id"], norm(s["nom"] or "")))

    for i, (a_id, a) in enumerate(names):
        for b_id, b in names[i + 1:]:
            if a and b and (a == b or SequenceMatcher(None, a, b).ratio() >= 0.85):
                rep.warn(f"startups/{a_id}", f"doublon possible avec « {b_id} »")

    for f in data["financements"]:
        where = f"financements/{f['id']}"
        if f["montant"] is not None and not f["devise"]:
            rep.err(where, "montant sans devise")
        if f["devise"] and len(f["devise"]) != 3:
            rep.err(where, "devise attendue en code ISO 4217 (3 lettres)")
        if f["type_financement"] in ("subvention", "prix", "dette") and f["tour"] != "non_applicable":
            rep.err(where, f"un financement « {f['type_financement']} » a pour tour « non_applicable »")
        if f["type_financement"] == "investissement" and f["tour"] == "non_applicable":
            rep.err(where, "un investissement a un tour (ou « inconnu »)")
        if f["montant"] is not None and f["devise"] == "USD" and f["montant_usd"] not in (None, f["montant"]):
            rep.err(where, "montant_usd différent du montant alors que la devise est USD")
        if f["montant"] is not None and f["montant_usd"] is None and f["devise"] != "USD":
            rep.warn(where, "montant_usd manquant : l'opération est exclue des totaux")
        if strict and f["demo"] is True:
            rep.err(where, "ligne de démonstration interdite en mode strict")

    for e in data["evenements"]:
        sid = e["startup_id"]
        if e["champ"] == "statut_activite" and e["nouvelle_valeur"] in ("interrompue", "fermee"):
            if not any(v["statut_constate"] == e["nouvelle_valeur"] for v in by_startup.get(sid, [])):
                rep.err(f"evenements/{e['id']}", "changement vers un statut d'arrêt sans vérification correspondante")


def main() -> int:
    strict = "--strict" in sys.argv
    schema = load_schema()
    rep = Report()
    if check_structure(schema, rep):
        data = load_all(schema)
        ids = check_refs(schema, data, rep)
        check_rules(data, ids, rep, strict)
        check_logos(data, rep)
    for w in rep.warnings:
        print(f"AVERTISSEMENT  {w}")
    for e in rep.errors:
        print(f"ERREUR         {e}")
    if strict and rep.warnings:
        rep.errors.extend(rep.warnings)
    n = sum(len(read_csv(ROOT / t["file"])[1]) for t in schema["tables"])
    print(f"\n{n} lignes contrôlées, {len(rep.errors)} erreur(s), {len(rep.warnings)} avertissement(s).")
    return 1 if rep.errors else 0


if __name__ == "__main__":
    sys.exit(main())
