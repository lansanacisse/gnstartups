# Roadmap : six mois, la qualité des données avant les fonctionnalités

Positionnement : **référence**. Priorité : **data**. StartupGuineeIQ est un data product ; le site n'est que l'interface de consultation.

Le suivi opérationnel (tâches, avancement) se fait dans les [issues et jalons GitHub](https://github.com/lansanacisse/gnstartups/milestones). Ce document fixe le cap.

## Architecture par étapes

| Étape | Stockage | Saisie et validation | Publication | Quand |
|---|---|---|---|---|
| **V1 (maintenant)** | CSV versionnés dans Git | Pull requests + CI (`validate.py`) | GitHub Pages, site statique | Phases 1 à 4 |
| **V2** | PostgreSQL / Supabase (`sql/schema.sql`) | Back-office web | Next.js sur Vercel + API | Phase 5, si les seuils ci-dessous sont atteints |

Pourquoi des CSV d'abord : historique complet gratuit (Git), revue de chaque modification (pull request), validation automatique (CI), aucun serveur à maintenir. Le schéma PostgreSQL est généré dès maintenant depuis le même modèle : la migration sera un import (`scripts/export_sql.py`), pas une refonte.

**Seuils de passage en V2** (au moins deux) : plus de 300 fiches ; plus de deux personnes qui saisissent chaque semaine ; besoin d'une API pour des partenaires ; contributions trop nombreuses pour être traitées en pull requests.

## Phase 1 : Fondations (semaines 1 à 2, du 30 nov. au 13 déc. 2026)

- [x] Modèle de données : `schema/tables.json` (source unique)
- [x] Dictionnaire de données généré : `docs/dictionnaire-donnees.md`
- [x] Schéma PostgreSQL généré : `sql/schema.sql`
- [x] Règles de validation automatiques : `scripts/validate.py` + CI
- [ ] Valider la définition d'une startup guinéenne : `docs/definition-startup.md`
- [ ] Valider le référentiel des secteurs et des villes
- [ ] Valider le protocole de vérification : `docs/protocole-verification.md`
- [ ] Grille de collecte (modèle de tableur pour la saisie en lot, importable en CSV)

**Livrable :** référentiel de données et protocole de validation figés en version 1.0.

## Phase 2 : Constitution du référentiel (semaines 3 à 6, du 14 déc. 2026 au 10 janv. 2027)

- [ ] Lister et qualifier les sources prioritaires (incubateurs, programmes, concours, presse)
- [ ] Recenser les incubateurs, accélérateurs et programmes (`organisations.csv`)
- [ ] Collecter les startups connues (objectif : 40 à 80 fiches solides)
- [ ] Vérifier les informations essentielles selon le protocole
- [ ] Dédupliquer
- [ ] Lister les informations manquantes par fiche

**Livrable :** première base réelle consolidée et documentée.

## Phase 3 : Outillage de la donnée (semaines 7 à 10, du 11 janv. au 7 févr. 2027)

En V1, le « back-office » est le dépôt lui-même. Cette phase le rend confortable :

- [ ] Script d'import d'une grille de collecte vers les CSV (avec contrôle des doublons)
- [ ] Script d'archivage automatique des URL sources (web.archive.org)
- [ ] Rapport de qualité automatique dans chaque pull request (complétude, fiches à actualiser)
- [ ] Contrôle périodique des sites web (liens morts → signal à vérifier, jamais un changement de statut automatique)
- [ ] Export public des données (CSV + JSON) avec licence ouverte

**Livrable :** chaîne de gestion des données fiable et reproductible.

## Phase 4 : Lancement public (semaines 11 à 14, du 8 févr. au 7 mars 2027)

- [ ] Retirer toutes les données de démonstration ; la CI passe en mode `--strict`
- [ ] Publier le répertoire et les fiches suffisamment documentées
- [ ] Dates de vérification et sources visibles sur chaque fiche (déjà en place)
- [ ] Signalements, corrections et revendications via formulaires (déjà en place)
- [ ] Nom de domaine
- [ ] Annonce sur @etudiantguineen

**Livrable :** première version publique de StartupGuineeIQ.

## Phase 5 : Consolidation (mois 4 à 6, mars à mai 2027)

- [ ] Étendre la couverture géographique (au-delà de Conakry)
- [ ] Enrichir les données de financement
- [ ] Première campagne trimestrielle de vérification
- [ ] Indicateurs de l'écosystème
- [ ] Mesurer fraîcheur et complétude dans le temps
- [ ] Décider du passage en V2 selon les seuils

**Livrable :** référentiel régulièrement actualisé et exploitable.

## Plus tard

- Rubrique Actu : les articles enrichissent les fiches, ils ne sont pas le moteur du produit.
- API publique et accès partenaires.

## Indicateurs de pilotage

| Indicateur | Ce qu'il mesure | Cible interne |
|---|---|---|
| Startups identifiées | Taille du périmètre connu | – |
| Taux de vérification (fiches vérifiées / fiches publiées) | Fiabilité | ≥ 90 % |
| Taux de complétude | Champs essentiels renseignés | ≥ 75 % |
| Fiches avec source primaire | Traçabilité | ≥ 80 % |
| Fiches à actualiser | Dette de vérification | < 10 % des fiches actives |
| Délai moyen de validation | Efficacité du processus | < 30 jours |
| Doublons détectés | Qualité de la déduplication | 0 à la publication |
| Financements publiés avec source | Couverture du financement | 100 % (bloquant en CI) |

Ce sont des cibles de pilotage, pas des résultats à annoncer avant de les avoir atteints.

## Erreurs à éviter

1. Chercher à afficher 500 startups au lancement : 80 fiches solides valent mieux.
2. Confondre données publiques et données vérifiées.
3. Publier des montants sans preuve, ou présenter une subvention comme une levée.
4. Construire un média avant le référentiel.
5. Laisser les entreprises modifier librement leur fiche.
6. Ne pas conserver l'historique.
