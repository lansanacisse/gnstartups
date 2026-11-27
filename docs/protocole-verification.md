# Protocole de collecte et de vérification

> Statut : **version 0.1, à valider** (phase 1 de la roadmap).

Principe : **statut = preuve + date**. Aucune information n'entre dans le référentiel sans source, et aucune fiche n'est considérée fiable indéfiniment.

## 1. Sources

### Sources prioritaires (phase 2)

| Priorité | Source | Ce qu'on y trouve |
|---|---|---|
| 1 | Incubateurs, accélérateurs et programmes d'appui en Guinée | Listes de promotions, startups accompagnées |
| 2 | Palmarès de concours et programmes (nationaux, régionaux, panafricains) | Lauréats, montants des prix |
| 3 | Bases internationales publiques (annonces d'investisseurs, rapports écosystème) | Levées de fonds |
| 4 | Presse guinéenne et panafricaine spécialisée | Lancements, levées, fermetures |
| 5 | Réseaux professionnels (pages entreprises, profils fondateurs) | Équipe, activité récente |
| 6 | Registres officiels (APIP, RCCM) | Identification juridique |
| 7 | Contributions (issues GitHub) | Nouvelles startups, corrections |

### Sources primaires et secondaires

- **Primaires** : l'entreprise elle-même (site officiel, communiqué, entretien), un registre officiel, l'investisseur ou le financeur concerné.
- **Secondaires** : presse, incubateur, réseau professionnel, contribution.

Chaque source est enregistrée **une fois** dans `data/sources.csv` avec sa date de collecte, puis citée par son identifiant. Pour les pages web importantes, on ajoute une copie archivée (`archive_url`, via web.archive.org) pour conserver la preuve si la page disparaît.

## 2. Collecte d'une nouvelle startup

1. **Vérifier le périmètre** avec `docs/definition-startup.md`. En cas de doute : `publie = false` et issue `perimetre`.
2. **Chercher un doublon** : la validation signale les noms proches, mais on cherche aussi par site web et fondateurs.
3. **Créer la fiche** dans `data/startups.csv` avec `statut_verification = a_verifier`, `niveau_confiance = faible`, `publie = false`.
4. **Enregistrer les sources** de chaque information (description, fondateurs, financements).
5. **Ajouter un événement** `ajout` dans `data/evenements.csv`.
6. Ouvrir une pull request : la CI valide le référentiel.

## 3. Vérification

### Informations essentielles à confirmer

Pour passer en `verifiee`, il faut confirmer : l'existence de l'entreprise, son activité principale (description), son secteur, sa ville et son statut d'activité.

### Méthodes, par ordre de préférence

| Méthode | Valeur `methode` | Exemples |
|---|---|---|
| Entretien | `entretien` | Échange avec un fondateur (appel, message, rencontre) |
| Registre | `registre` | Consultation APIP / RCCM |
| Tiers | `tiers` | Confirmation écrite d'un incubateur, investisseur, client |
| Visite | `visite` | Visite des locaux |
| En ligne | `verification_en_ligne` | Site actif, application mise à jour, publications récentes |

### Niveau de confiance

| Niveau | Condition |
|---|---|
| `eleve` | Une source primaire, ou deux sources secondaires indépendantes concordantes |
| `moyen` | Une seule source secondaire crédible |
| `faible` | Signal indirect ou source non vérifiable |

### Enregistrement

Chaque vérification ajoute une ligne dans `data/verifications.csv`. Cette ligne n'est **jamais modifiée** ensuite : on en ajoute une nouvelle. On met ensuite à jour `date_derniere_verification`, `statut_verification` et `niveau_confiance` dans la fiche, et on publie (`publie = true`) si les conditions sont réunies.

## 4. Statut d'activité : règles de décision

| Statut | Preuve minimale |
|---|---|
| `active` | Une preuve d'activité datée de **moins de 6 mois** (produit utilisé, publication de l'entreprise, recrutement, entretien). |
| `interrompue` | **Au moins deux signaux convergents** : site ou application hors ligne, numéro coupé, **au moins deux tentatives de contact sans réponse à 15 jours d'intervalle**, départ public des fondateurs. |
| `fermee` | Déclaration de l'entreprise ou des fondateurs, radiation au registre, ou liquidation publiée. |
| `inconnue` | Aucune preuve suffisante dans un sens ou dans l'autre. |

**Une absence de publication récente n'est jamais, à elle seule, une preuve d'arrêt.** Le passage en `interrompue` ou `fermee` exige une vérification qui constate ce statut (contrôlé par la CI).

## 5. Financements

- Aucune opération publiée sans source.
- Distinguer `investissement`, `subvention`, `prix` et `dette`. Une subvention ou un prix n'est jamais présenté comme une levée de fonds.
- Saisir le montant **dans sa devise d'origine** ; ajouter la contre-valeur `montant_usd` au taux de la date de l'opération (taux de référence de la BCRG ou de la BCE, noté dans `notes` si différent).
- Montant non communiqué : laisser `montant` vide. Ne jamais estimer.
- Une levée « en cours » annoncée par l'entreprise a le statut `en_cours_declare` ; elle passe en `documente` à l'annonce de la clôture (nouvelle ligne de financement, ancienne conservée).

## 6. Actualisation

| Situation | Délai de revérification |
|---|---|
| Startup `active` | Tous les 6 mois (la CI et le site signalent « à actualiser » au-delà) |
| Startup `interrompue` | Tous les 3 mois, pendant un an |
| Startup `inconnue` / `a_verifier` | Sous 30 jours après l'ajout |
| Fiche `contestee` | Sous 15 jours |
| Startup `fermee` | Aucune, sauf signalement |

Une campagne de vérification est organisée chaque trimestre sur les fiches à actualiser (indicateur « Fiches à actualiser »).

## 7. Corrections et revendications

- Les entreprises et le public **ne modifient pas directement** les fiches. Ils passent par les formulaires (issues GitHub : correction, revendication, nouvelle startup).
- Une correction reçue passe la fiche en `contestee` si elle remet en cause une information publiée, le temps de la vérification.
- La revendication d'une fiche par un fondateur exige une preuve d'identité professionnelle (adresse e-mail au domaine de l'entreprise, ou confirmation depuis la page officielle). Elle donne un canal de contact privilégié, pas un droit d'édition.
- Toute modification de statut ou de financement est tracée dans `data/evenements.csv` (historique public) et dans l'historique Git (historique complet).

## 8. Données personnelles

On ne collecte que des informations **professionnelles et publiques** sur les fondateurs : nom, rôle, profil professionnel public. Aucune adresse personnelle, numéro de téléphone personnel ou donnée sensible. Toute personne peut demander la suppression de ses informations personnelles via une issue ou par e-mail.
