# Startup Guinée

**La base de référence de l'écosystème startup guinéen.** Un registre indépendant, structuré et vérifié des startups créées en Guinée ou développant leur activité sur le marché guinéen.

Chaque information importante a une source et une date de vérification. Une absence d'information récente ne vaut jamais preuve de fermeture.

> ⚠️ Le référentiel contient pour l'instant des **données de démonstration fictives** (colonne `demo = true`), affichées avec un bandeau sur le site. Elles seront retirées avant le lancement public.

## Organisation du dépôt

```
schema/tables.json        Modèle de données : SOURCE UNIQUE (tables, champs, listes de valeurs, règles)
data/                     Le référentiel, en CSV (une table = un fichier)
  referentiels/           Secteurs et villes
docs/
  definition-startup.md   Ce qu'on recense, ce qu'on exclut
  protocole-verification.md  Collecte, vérification, statuts, actualisation
  dictionnaire-donnees.md Généré depuis le schéma
  roadmap.md              Cap à six mois
sql/schema.sql            Schéma PostgreSQL (Supabase), généré depuis le schéma
scripts/
  validate.py             Contrôle structure, références et règles métier
  build.py                Génère site/data/registre.json (fiches publiées + indicateurs)
  gen_docs.py             Génère le dictionnaire et le SQL
  export_sql.py           Exporte les CSV en INSERT PostgreSQL
site/                     Site statique publié sur GitHub Pages
```

## Travailler en local

Python 3.10 ou plus, aucune dépendance.

```bash
python scripts/validate.py          # contrôle le référentiel
python scripts/build.py             # génère site/data/registre.json
python -m http.server -d site 8000  # puis ouvrir http://localhost:8000
```

Après une modification de `schema/tables.json` : `python scripts/gen_docs.py`.

## Ajouter ou modifier des données

1. Créer une branche.
2. Modifier les CSV de `data/` en suivant le [protocole](docs/protocole-verification.md) et le [dictionnaire](docs/dictionnaire-donnees.md).
3. `python scripts/validate.py` doit afficher 0 erreur.
4. Ouvrir une pull request : la CI revalide tout. À la fusion sur `main`, le site est republié automatiquement.

Règles essentielles :

- un identifiant ne change jamais, même si le nom de l'entreprise change ;
- toute information importante cite une source de `data/sources.csv` ;
- une ligne de `verifications.csv` n'est jamais modifiée, on en ajoute une ;
- tout changement de statut ou de financement ajoute une ligne dans `evenements.csv`.

## Contribuer sans toucher au code

Depuis le site ou l'onglet [Issues](https://github.com/lansanacisse/gnstartups/issues/new/choose) : proposer une startup, signaler une information incorrecte, revendiquer une fiche. Chaque contribution est vérifiée avant publication.

## Publication

Le workflow `.github/workflows/deploy.yml` valide, construit et publie `site/` sur GitHub Pages à chaque push sur `main`. Dans les réglages du dépôt : **Settings → Pages → Source : GitHub Actions**.
