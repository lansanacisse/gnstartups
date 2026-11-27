"""Exporte le référentiel CSV en instructions INSERT PostgreSQL (migration vers Supabase).

Usage : python scripts/export_sql.py > seed.sql
        psql "$DATABASE_URL" -f sql/schema.sql && psql "$DATABASE_URL" -f seed.sql
"""
from __future__ import annotations

import sys

from sg import load_all, load_schema


def lit(v) -> str:
    if v is None or v == "":
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return repr(v)
    return "'" + str(v).replace("'", "''") + "'"


def main():
    schema = load_schema()
    data = load_all(schema)
    out = ["begin;"]
    junctions = []
    for t in schema["tables"]:
        cols = [c for c in t["columns"] if c["type"] != "ref_list"]
        names = ", ".join(c["name"] for c in cols)
        for row in data[t["name"]]:
            out.append(f"insert into {t['name']} ({names}) values ({', '.join(lit(row[c['name']]) for c in cols)});")
        for c in t["columns"]:
            if c["type"] == "ref_list":
                jt = f"{t['name']}_{c['name'].removesuffix('_ids')}s"
                own = f"{t['name'].rstrip('s')}_id"
                other = f"{c['ref'].rstrip('s')}_id"
                other = "cible_id" if other == own else other
                for row in data[t["name"]]:
                    for v in row[c["name"]]:
                        junctions.append(f"insert into {jt} ({own}, {other}) values ({lit(row['id'])}, {lit(v)});")
    out += junctions + ["commit;"]
    sys.stdout.write("\n".join(out) + "\n")


if __name__ == "__main__":
    main()
