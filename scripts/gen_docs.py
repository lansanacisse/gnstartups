"""Génère docs/dictionnaire-donnees.md et sql/schema.sql à partir de schema/tables.json.

Usage : python scripts/gen_docs.py [--check]
  --check  échoue si les fichiers générés ne sont pas à jour (utilisé en CI).
"""
from __future__ import annotations

import sys

from sg import ROOT, load_schema

DOC = ROOT / "docs" / "dictionnaire-donnees.md"
SQL = ROOT / "sql" / "schema.sql"
TYPE_LABEL = {"id": "identifiant", "text": "texte", "url": "URL", "int": "entier", "decimal": "décimal",
              "bool": "booléen", "date": "date", "enum": "liste", "ref": "référence", "ref_list": "liste de références"}
SQL_TYPE = {"id": "text", "text": "text", "url": "text", "int": "integer", "decimal": "numeric(18,2)",
            "bool": "boolean", "date": "date"}


def gen_doc(schema: dict) -> str:
    L = ["# Dictionnaire de données", "",
         "> Fichier généré par `scripts/gen_docs.py` depuis `schema/tables.json`. Ne pas modifier à la main.", "",
         f"Version du schéma : **{schema['version']}**", "", schema["description"], "",
         "## Tables", ""]
    L += [f"- [`{t['name']}`](#{t['name']}) : {t['description']}" for t in schema["tables"]]
    for t in schema["tables"]:
        L += ["", f"## {t['name']}", "", t["description"], "", f"Fichier : `{t['file']}`", "",
              "| Champ | Type | Obligatoire | Description |", "|---|---|---|---|"]
        for c in t["columns"]:
            typ = TYPE_LABEL[c["type"]]
            if c["type"] == "enum":
                typ += f" [`{c['enum']}`](#liste-{c['enum'].replace('_', '-')})"
            elif c["type"] in ("ref", "ref_list"):
                typ += f" → [`{c['ref']}`](#{c['ref']})"
            L.append(f"| `{c['name']}` | {typ} | {'oui' if c['required'] else 'non'} | {c['description']} |")
    L += ["", "## Listes de valeurs", ""]
    for name, vals in schema["enums"].items():
        L += [f"### Liste {name}", "", "| Valeur | Définition |", "|---|---|"]
        L += [f"| `{k}` | {v} |" for k, v in vals.items()]
        L.append("")
    L += ["## Règles de validation", "", "Contrôlées par `scripts/validate.py` à chaque modification.", ""]
    L += [f"{i}. {r}" for i, r in enumerate(schema["rules"], start=1)]
    L += ["", "## Conventions CSV", "",
          "- Encodage UTF-8, séparateur virgule, guillemets doubles autour des textes qui contiennent une virgule.",
          "- Listes de références séparées par `;` (exemple : `src-a;src-b`).",
          "- Booléens : `true` ou `false`. Dates : `AAAA-MM-JJ`. Cellule vide = information inconnue.", ""]
    return "\n".join(L)


def gen_sql(schema: dict) -> str:
    L = ["-- Schéma PostgreSQL du référentiel StartupGuineeIQ (cible : Supabase).",
         "-- Fichier généré par scripts/gen_docs.py depuis schema/tables.json. Ne pas modifier à la main.",
         f"-- Version du schéma : {schema['version']}", "", "begin;", ""]
    for name, vals in schema["enums"].items():
        L.append(f"create type {name} as enum ({', '.join(repr(k) for k in vals)});")
    L.append("")
    junctions = []
    for t in schema["tables"]:
        cols = []
        for c in t["columns"]:
            if c["type"] == "ref_list":
                junctions.append((t["name"], c))
                continue
            if c["type"] == "enum":
                typ = c["enum"]
            elif c["type"] == "ref":
                typ = f"text references {c['ref']}(id)"
            else:
                typ = SQL_TYPE[c["type"]]
            line = f"  {c['name']} {typ}"
            if c["type"] == "id":
                line += " primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$')"
            elif c["required"]:
                line += " not null"
            if c["type"] == "url":
                line += f" check ({c['name']} ~ '^https?://')"
            cols.append(line)
        if t["name"] != "secteurs" and t["name"] != "villes":
            cols.append("  cree_le timestamptz not null default now()")
            cols.append("  modifie_le timestamptz not null default now()")
        L += [f"-- {t['description']}", f"create table {t['name']} (", ",\n".join(cols), ");", ""]
        L.append(f"comment on table {t['name']} is {sql_str(t['description'])};")
        for c in t["columns"]:
            if c["type"] == "ref_list":
                continue
            L.append(f"comment on column {t['name']}.{c['name']} is {sql_str(c['description'])};")
        L.append("")
    for table, c in junctions:
        jt = f"{table}_{c['name'].removesuffix('_ids')}s"
        own = f"{table.rstrip('s')}_id"
        other = f"{c['ref'].rstrip('s')}_id"
        if own == other:
            other = "cible_id"
        L += [f"-- {c['description']}", f"create table {jt} (",
              f"  {own} text not null references {table}(id) on delete cascade,",
              f"  {other} text not null references {c['ref']}(id),",
              f"  primary key ({own}, {other})", ");",
              f"comment on table {jt} is {sql_str(c['description'])};", ""]
    L += ["commit;", ""]
    return "\n".join(L)


def sql_str(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def main() -> int:
    schema = load_schema()
    outputs = {DOC: gen_doc(schema), SQL: gen_sql(schema)}
    if "--check" in sys.argv:
        stale = [p for p, c in outputs.items() if not p.exists() or p.read_text(encoding="utf-8") != c]
        for p in stale:
            print(f"Pas à jour : {p.relative_to(ROOT)} (lancer python scripts/gen_docs.py)")
        return 1 if stale else 0
    for p, c in outputs.items():
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(c, encoding="utf-8")
        print(f"Généré : {p.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
