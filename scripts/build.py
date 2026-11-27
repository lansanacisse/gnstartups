"""Construit site/data/registre.json à partir des CSV : fiches publiées, jointures et indicateurs.

Usage : python scripts/build.py
Lancer validate.py avant : build.py suppose un référentiel valide.
"""
from __future__ import annotations

import json
from datetime import date, datetime, timezone

from sg import FRESHNESS_DAYS, ROOT, load_all, load_schema, today

OUT = ROOT / "site" / "data" / "registre.json"
PRIMARY_SOURCES = {"site_officiel", "registre", "communique", "entretien"}
# Champs essentiels pour le taux de complétude d'une fiche
ESSENTIAL = ["description", "secteur_id", "ville_id", "annee_creation", "site_web",
             "forme_juridique", "effectif", "linkedin_url"]


def pct(n: int, d: int) -> float | None:
    return round(100 * n / d, 1) if d else None


def main():
    schema = load_schema()
    d = load_all(schema)
    t = today()
    sources = {s["id"]: s for s in d["sources"]}
    orgs = {o["id"]: o for o in d["organisations"]}
    secteurs = {s["id"]: s for s in d["secteurs"]}
    villes = {v["id"]: v for v in d["villes"]}

    def srcs(ids):
        return [{k: sources[i][k] for k in ("id", "type", "titre", "url", "editeur", "date_publication", "archive_url")} for i in ids]

    def group(table):
        g = {}
        for r in d[table]:
            g.setdefault(r["startup_id"], []).append(r)
        return g

    fond, fin, acc, ver, evt = (group(x) for x in ("fondateurs", "financements", "accompagnements", "verifications", "evenements"))

    startups, all_rounds, all_events = [], [], []
    for s in d["startups"]:
        if s["publie"] is not True:
            continue
        sid = s["id"]
        rounds = sorted(fin.get(sid, []), key=lambda r: r["date"], reverse=True)
        verifs = sorted(ver.get(sid, []), key=lambda v: v["date"], reverse=True)
        if any(r["statut"] == "en_cours_declare" for r in rounds):
            statut_fin = "en_cours_declare"
        elif rounds:
            statut_fin = "levee_documentee"
        else:
            statut_fin = "aucune_levee_connue"
        last = s["date_derniere_verification"]
        age = (t - date.fromisoformat(last)).days if last else None
        filled = sum(1 for f in ESSENTIAL if s.get(f) not in (None, "", []))
        filled += 1 if fond.get(sid) else 0
        rounds_out = [{
            "id": r["id"], "date": r["date"], "type_financement": r["type_financement"], "tour": r["tour"],
            "statut": r["statut"], "montant": r["montant"], "devise": r["devise"], "montant_usd": r["montant_usd"],
            "investisseurs": [orgs[i]["nom"] for i in r["investisseur_ids"]] or ([r["investisseurs_non_identifies"]] if r["investisseurs_non_identifies"] else []),
            "notes": r["notes"], "sources": srcs(r["source_ids"]),
        } for r in rounds]
        rec = {
            "id": sid, "nom": s["nom"], "categorie": s["categorie"], "description": s["description"],
            "secteur": secteurs[s["secteur_id"]]["libelle"], "secteur_id": s["secteur_id"],
            "ville": villes[s["ville_id"]]["nom"], "ville_id": s["ville_id"], "region": villes[s["ville_id"]]["region"],
            "annee_creation": s["annee_creation"], "site_web": s["site_web"], "linkedin_url": s["linkedin_url"],
            "x_url": s["x_url"], "facebook_url": s["facebook_url"], "instagram_url": s["instagram_url"],
            "raison_sociale": s["raison_sociale"], "forme_juridique": s["forme_juridique"],
            "pays_immatriculation": s["pays_immatriculation"], "rccm": s["rccm"],
            "date_creation_juridique": s["date_creation_juridique"], "effectif": s["effectif"],
            "statut_activite": s["statut_activite"], "statut_verification": s["statut_verification"],
            "niveau_confiance": s["niveau_confiance"], "statut_financement": statut_fin,
            "date_derniere_verification": last, "a_actualiser": s["statut_activite"] == "active" and (age is None or age > FRESHNESS_DAYS),
            "completude": pct(filled, len(ESSENTIAL) + 1), "date_ajout": s["date_ajout"], "demo": s["demo"],
            "sources": srcs(s["source_ids"]),
            "fondateurs": [{"nom": f["nom"], "role": f["role"], "linkedin_url": f["linkedin_url"], "sources": srcs(f["source_ids"])} for f in fond.get(sid, [])],
            "financements": rounds_out,
            "accompagnements": [{"organisation": orgs[a["organisation_id"]]["nom"], "type": orgs[a["organisation_id"]]["type"],
                                 "programme": a["programme"], "annee": a["annee"], "sources": srcs(a["source_ids"])} for a in acc.get(sid, [])],
            "verifications": [{"date": v["date"], "methode": v["methode"], "statut_constate": v["statut_constate"],
                               "resume": v["resume"], "sources": srcs(v["source_ids"])} for v in verifs],
            "evenements": [{"date": e["date"], "champ": e["champ"], "ancienne_valeur": e["ancienne_valeur"],
                            "nouvelle_valeur": e["nouvelle_valeur"], "motif": e["motif"], "sources": srcs(e["source_ids"])}
                           for e in sorted(evt.get(sid, []), key=lambda e: e["date"], reverse=True)],
        }
        startups.append(rec)
        all_rounds += [dict(r, startup_id=sid, startup=s["nom"]) for r in rounds_out]
        all_events += [dict(e, startup_id=sid, startup=s["nom"]) for e in rec["evenements"]]

    all_rounds.sort(key=lambda r: r["date"], reverse=True)
    all_events.sort(key=lambda e: e["date"], reverse=True)

    # Indicateurs de pilotage (qualité avant volume)
    est = [s for s in d["startups"] if s["categorie"] == "startup"]
    pub = [s for s in startups if s["categorie"] == "startup"]
    verified = [s for s in pub if s["statut_verification"] == "verifiee"]
    delays = []
    for s in d["startups"]:
        vs = sorted(v["date"] for v in ver.get(s["id"], []))
        if vs and s["statut_verification"] == "verifiee":
            delays.append((date.fromisoformat(vs[0]) - date.fromisoformat(s["date_ajout"])).days)
    documented = [r for r in all_rounds if r["statut"] == "documente"]
    usd = [r["montant_usd"] for r in documented if r["montant_usd"] is not None]
    statuts = {k: sum(1 for s in pub if s["statut_activite"] == k) for k in schema["enums"]["statut_activite"]}
    indicateurs = {
        "startups_identifiees": len(est),
        "projets_precoces": sum(1 for s in d["startups"] if s["categorie"] == "projet_precoce"),
        "fiches_publiees": len(pub),
        "fiches_verifiees": len(verified),
        "taux_verification": pct(len(verified), len(pub)),
        "taux_completude": round(sum(s["completude"] for s in pub) / len(pub), 1) if pub else None,
        "taux_sources_primaires": pct(sum(1 for s in pub if any(x["type"] in PRIMARY_SOURCES for x in s["sources"])), len(pub)),
        "fiches_a_actualiser": sum(1 for s in pub if s["a_actualiser"]),
        "delai_moyen_validation_jours": round(sum(delays) / len(delays)) if delays else None,
        "financements_documentes": len(documented),
        "financements_avec_montant": sum(1 for r in documented if r["montant"] is not None),
        "total_documente_usd": sum(usd),
        "en_levee": sum(1 for s in pub if s["statut_financement"] == "en_cours_declare"),
        "par_statut_activite": statuts,
    }

    out = {
        "genere_le": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "date_reference": t.isoformat(),
        "version_schema": schema["version"],
        "contient_demo": any(s["demo"] for s in startups),
        "definitions": schema["enums"],
        "secteurs": [{"id": s["id"], "libelle": s["libelle"]} for s in d["secteurs"]],
        "villes": [{"id": v["id"], "nom": v["nom"], "region": v["region"]} for v in d["villes"]],
        "indicateurs": indicateurs,
        "startups": sorted(startups, key=lambda s: s["nom"].lower()),
        "financements": all_rounds,
        "evenements": all_events,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{OUT.relative_to(ROOT)} : {len(startups)} fiches publiées, {len(all_rounds)} financements, {len(all_events)} événements.")


if __name__ == "__main__":
    main()
