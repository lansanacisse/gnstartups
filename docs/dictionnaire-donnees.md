# Dictionnaire de données

> Fichier généré par `scripts/gen_docs.py` depuis `schema/tables.json`. Ne pas modifier à la main.

Version du schéma : **0.1.0**

Modèle de données du référentiel Startup Guinée. Source unique : la validation (scripts/validate.py), le dictionnaire (docs/dictionnaire-donnees.md) et le schéma PostgreSQL (sql/schema.sql) sont générés à partir de ce fichier.

## Tables

- [`secteurs`](#secteurs) : Référentiel des secteurs d'activité.
- [`villes`](#villes) : Référentiel des villes (siège ou implantation).
- [`sources`](#sources) : Toute preuve utilisée dans le référentiel. Chaque information importante renvoie à au moins une source.
- [`startups`](#startups) : Une ligne par entreprise recensée. Regroupe les domaines Startup, Identification et Activité.
- [`fondateurs`](#fondateurs) : Fondateurs et cofondateurs, uniquement avec des informations professionnelles publiques.
- [`organisations`](#organisations) : Investisseurs, incubateurs, programmes et partenaires.
- [`financements`](#financements) : Opérations de financement. Investissements, subventions, prix et dette sont distingués.
- [`accompagnements`](#accompagnements) : Liens avec l'écosystème : incubation, accélération, programmes, partenariats.
- [`verifications`](#verifications) : Journal des vérifications. Une ligne par vérification, jamais modifiée après coup.
- [`evenements`](#evenements) : Historique public des changements de statut (détection, confirmation, interruption, fermeture, levée). Alimente Watch.

## secteurs

Référentiel des secteurs d'activité.

Fichier : `data/referentiels/secteurs.csv`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `id` | identifiant | oui | Identifiant (kebab-case). |
| `libelle` | texte | oui | Nom affiché. |
| `description` | texte | non | Périmètre du secteur. |

## villes

Référentiel des villes (siège ou implantation).

Fichier : `data/referentiels/villes.csv`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `id` | identifiant | oui | Identifiant (kebab-case). |
| `nom` | texte | oui | Nom de la ville. |
| `region` | texte | oui | Région administrative. |
| `pays` | texte | oui | Code pays ISO 3166-1 alpha-2. |

## sources

Toute preuve utilisée dans le référentiel. Chaque information importante renvoie à au moins une source.

Fichier : `data/sources.csv`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `id` | identifiant | oui | Identifiant (kebab-case). |
| `type` | liste [`type_source`](#liste-type-source) | oui | Nature de la source. |
| `titre` | texte | oui | Titre ou description courte de la preuve. |
| `url` | URL | non | Lien vers la preuve. Obligatoire sauf pour les entretiens et contributions. |
| `editeur` | texte | non | Média, organisation ou personne à l'origine de la source. |
| `date_publication` | date | non | Date de publication de la source. |
| `date_collecte` | date | oui | Date à laquelle la source a été collectée. |
| `archive_url` | URL | non | Copie archivée (web.archive.org...) pour garder la preuve si la page disparaît. |
| `demo` | booléen | oui | true si la ligne est fictive (données de démonstration). |

## startups

Une ligne par entreprise recensée. Regroupe les domaines Startup, Identification et Activité.

Fichier : `data/startups.csv`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `id` | identifiant | oui | Identifiant stable (kebab-case), ne change jamais même si le nom change. |
| `nom` | texte | oui | Nom commercial. |
| `categorie` | liste [`categorie`](#liste-categorie) | oui | Startup établie ou projet précoce. |
| `description` | texte | oui | Ce que fait l'entreprise, en une ou deux phrases factuelles. |
| `secteur_id` | référence → [`secteurs`](#secteurs) | oui | Secteur principal. |
| `ville_id` | référence → [`villes`](#villes) | oui | Ville du siège ou de l'activité principale. |
| `annee_creation` | entier | non | Année de création (ou de lancement si la date juridique est inconnue). |
| `site_web` | URL | non | Site officiel. |
| `linkedin_url` | URL | non | Page LinkedIn de l'entreprise. |
| `raison_sociale` | texte | non | Dénomination juridique. |
| `forme_juridique` | texte | non | SARL, SARLU, SA, SAS... |
| `pays_immatriculation` | texte | non | Code pays ISO 3166-1 alpha-2 de l'entité juridique principale. |
| `rccm` | texte | non | Numéro RCCM s'il est public. |
| `date_creation_juridique` | date | non | Date d'immatriculation. |
| `effectif` | texte | non | Tranche d'effectif (1-5, 5-10, 10-25, 25-50, 50-100, 100+). |
| `statut_activite` | liste [`statut_activite`](#liste-statut-activite) | oui | Statut de l'entreprise. |
| `statut_verification` | liste [`statut_verification`](#liste-statut-verification) | oui | Statut de vérification de la fiche. |
| `niveau_confiance` | liste [`niveau_confiance`](#liste-niveau-confiance) | oui | Confiance globale dans la fiche. |
| `date_derniere_verification` | date | non | Date de la dernière vérification (reprise de la table verifications). |
| `source_ids` | liste de références → [`sources`](#sources) | non | Sources des informations générales, séparées par ';'. |
| `publie` | booléen | oui | true si la fiche est visible sur le site. |
| `date_ajout` | date | oui | Date d'entrée dans le référentiel. |
| `demo` | booléen | oui | true si la ligne est fictive. |

## fondateurs

Fondateurs et cofondateurs, uniquement avec des informations professionnelles publiques.

Fichier : `data/fondateurs.csv`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `id` | identifiant | oui | Identifiant (kebab-case). |
| `startup_id` | référence → [`startups`](#startups) | oui | Startup concernée. |
| `nom` | texte | oui | Prénom et nom. |
| `role` | texte | oui | Rôle (Fondatrice et CEO, Cofondateur et CTO...). |
| `linkedin_url` | URL | non | Profil LinkedIn exact (pas une recherche). |
| `source_ids` | liste de références → [`sources`](#sources) | oui | Preuves du rôle. |
| `demo` | booléen | oui | true si la ligne est fictive. |

## organisations

Investisseurs, incubateurs, programmes et partenaires.

Fichier : `data/organisations.csv`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `id` | identifiant | oui | Identifiant (kebab-case). |
| `nom` | texte | oui | Nom de l'organisation. |
| `type` | liste [`type_organisation`](#liste-type-organisation) | oui | Nature de l'organisation. |
| `pays` | texte | non | Code pays ISO 3166-1 alpha-2. |
| `site_web` | URL | non | Site officiel. |
| `demo` | booléen | oui | true si la ligne est fictive. |

## financements

Opérations de financement. Investissements, subventions, prix et dette sont distingués.

Fichier : `data/financements.csv`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `id` | identifiant | oui | Identifiant (kebab-case). |
| `startup_id` | référence → [`startups`](#startups) | oui | Startup financée. |
| `date` | date | oui | Date d'annonce ou de clôture. |
| `type_financement` | liste [`type_financement`](#liste-type-financement) | oui | Nature du financement. |
| `tour` | liste [`tour`](#liste-tour) | oui | Tour d'investissement. |
| `statut` | liste [`statut_financement_operation`](#liste-statut-financement-operation) | oui | Réalisé ou en cours déclaré. |
| `montant` | décimal | non | Montant dans la devise d'origine. Vide si non divulgué. |
| `devise` | texte | non | Code ISO 4217 (GNF, USD, EUR, XOF...). Obligatoire si montant renseigné. |
| `montant_usd` | décimal | non | Contre-valeur en USD au taux de la date de l'opération, pour les agrégats. |
| `investisseur_ids` | liste de références → [`organisations`](#organisations) | non | Investisseurs ou financeurs connus, séparés par ';'. |
| `investisseurs_non_identifies` | texte | non | Mention libre si les financeurs ne sont pas nommés (business angels non divulgués...). |
| `source_ids` | liste de références → [`sources`](#sources) | oui | Preuves de l'opération. Aucune levée publiée sans source. |
| `notes` | texte | non | Précisions. |
| `demo` | booléen | oui | true si la ligne est fictive. |

## accompagnements

Liens avec l'écosystème : incubation, accélération, programmes, partenariats.

Fichier : `data/accompagnements.csv`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `id` | identifiant | oui | Identifiant (kebab-case). |
| `startup_id` | référence → [`startups`](#startups) | oui | Startup accompagnée. |
| `organisation_id` | référence → [`organisations`](#organisations) | oui | Organisation. |
| `programme` | texte | non | Nom du programme ou de la promotion. |
| `annee` | entier | non | Année de l'accompagnement. |
| `source_ids` | liste de références → [`sources`](#sources) | oui | Preuves. |
| `demo` | booléen | oui | true si la ligne est fictive. |

## verifications

Journal des vérifications. Une ligne par vérification, jamais modifiée après coup.

Fichier : `data/verifications.csv`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `id` | identifiant | oui | Identifiant (kebab-case). |
| `startup_id` | référence → [`startups`](#startups) | oui | Startup vérifiée. |
| `date` | date | oui | Date de la vérification. |
| `methode` | liste [`methode_verification`](#liste-methode-verification) | oui | Méthode utilisée. |
| `statut_constate` | liste [`statut_activite`](#liste-statut-activite) | oui | Statut d'activité constaté à cette date. |
| `resume` | texte | oui | Ce qui a été constaté, en une phrase. |
| `verifie_par` | texte | oui | Initiales ou pseudonyme de la personne qui a vérifié. |
| `source_ids` | liste de références → [`sources`](#sources) | oui | Preuves. |
| `demo` | booléen | oui | true si la ligne est fictive. |

## evenements

Historique public des changements de statut (détection, confirmation, interruption, fermeture, levée). Alimente Watch.

Fichier : `data/evenements.csv`

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `id` | identifiant | oui | Identifiant (kebab-case). |
| `startup_id` | référence → [`startups`](#startups) | oui | Startup concernée. |
| `date` | date | oui | Date de l'événement. |
| `champ` | texte | oui | Champ modifié (statut_activite, statut_verification, financement, ajout...). |
| `ancienne_valeur` | texte | non | Valeur avant le changement (vide pour un ajout). |
| `nouvelle_valeur` | texte | oui | Valeur après le changement. |
| `motif` | texte | oui | Raison du changement, en une phrase. |
| `source_ids` | liste de références → [`sources`](#sources) | oui | Preuves. |
| `demo` | booléen | oui | true si la ligne est fictive. |

## Listes de valeurs

### Liste categorie

| Valeur | Définition |
|---|---|
| `startup` | Entreprise innovante avec une activité identifiable et une ambition de croissance reproductible. |
| `projet_precoce` | Projet en phase d'idée ou de prototype, sans activité commerciale identifiable. Jamais compté comme startup établie. |

### Liste statut_activite

| Valeur | Définition |
|---|---|
| `active` | Activité constatée par une preuve datée de moins de 6 mois. |
| `interrompue` | Plusieurs signaux convergents d'arrêt (site hors ligne, contacts sans réponse...), sans déclaration de fermeture. |
| `fermee` | Fermeture déclarée par l'entreprise, ses fondateurs ou un registre officiel. |
| `inconnue` | Aucune preuve suffisante pour statuer. |

### Liste statut_verification

| Valeur | Définition |
|---|---|
| `a_verifier` | Fiche collectée, pas encore vérifiée. |
| `verifiee` | Informations essentielles confirmées selon le protocole. |
| `contestee` | Une information est contestée par l'entreprise ou un tiers ; vérification en cours. |

### Liste niveau_confiance

| Valeur | Définition |
|---|---|
| `eleve` | Confirmé par une source primaire (entreprise, registre, investisseur) ou deux sources indépendantes. |
| `moyen` | Une seule source secondaire crédible (presse, incubateur). |
| `faible` | Signal indirect ou source non vérifiable. |

### Liste type_source

| Valeur | Définition |
|---|---|
| `site_officiel` | Site web ou application de l'entreprise. |
| `registre` | Registre officiel (APIP, RCCM, Journal officiel...). |
| `communique` | Communiqué de l'entreprise ou d'un investisseur. |
| `presse` | Article de presse. |
| `entretien` | Entretien direct avec un fondateur ou un salarié. |
| `incubateur` | Information transmise par un incubateur, accélérateur ou programme. |
| `reseau_professionnel` | Page ou publication sur un réseau professionnel (LinkedIn...). |
| `contribution` | Contribution externe reçue via le formulaire de signalement. |
| `autre` | Autre type de source, à préciser dans le titre. |

### Liste type_financement

| Valeur | Définition |
|---|---|
| `investissement` | Prise de participation ou instrument convertible (BSA-AIR, SAFE...). |
| `subvention` | Financement non dilutif sans contrepartie en capital. |
| `prix` | Dotation d'un prix ou d'un concours. |
| `dette` | Prêt bancaire, prêt d'honneur, dette venture. |
| `autre` | Autre forme, à préciser dans les notes. |

### Liste tour

| Valeur | Définition |
|---|---|
| `pre_seed` | Pré-amorçage. |
| `seed` | Amorçage. |
| `serie_a` | Série A. |
| `serie_b` | Série B. |
| `serie_c_plus` | Série C et au-delà. |
| `non_applicable` | Pas un tour d'investissement (subvention, prix, dette). |
| `inconnu` | Type de tour non communiqué. |

### Liste statut_financement_operation

| Valeur | Définition |
|---|---|
| `documente` | Opération réalisée et attestée par une source. |
| `en_cours_declare` | Levée annoncée comme en cours par l'entreprise, non finalisée. |

### Liste type_organisation

| Valeur | Définition |
|---|---|
| `investisseur` | Fonds, business angels, réseau d'investisseurs. |
| `incubateur` | Incubateur ou accélérateur. |
| `programme` | Programme d'appui, concours, bailleur. |
| `entreprise` | Entreprise partenaire ou corporate. |
| `institution` | Institution publique ou internationale. |

### Liste methode_verification

| Valeur | Définition |
|---|---|
| `entretien` | Échange direct avec l'entreprise. |
| `verification_en_ligne` | Contrôle du site, de l'application, des réseaux. |
| `registre` | Consultation d'un registre officiel. |
| `tiers` | Confirmation par un incubateur, investisseur ou partenaire. |
| `visite` | Visite sur place. |

## Règles de validation

Contrôlées par `scripts/validate.py` à chaque modification.

1. Les identifiants sont uniques dans chaque table et en kebab-case (a-z, 0-9, tirets).
2. Chaque référence (ref, ref_list) pointe vers une ligne existante.
3. Les dates sont au format AAAA-MM-JJ et ne sont pas dans le futur.
4. Une fiche publiée (publie = true) a au moins une source et une date de dernière vérification.
5. Une fiche « verifiee » a au moins une ligne dans verifications.
6. date_derniere_verification est égale à la date la plus récente dans verifications pour cette startup.
7. Un statut « interrompue » ou « fermee » s'appuie sur au moins une vérification qui constate ce statut : l'absence de publication ne suffit jamais.
8. Un statut « active » est accompagné d'une vérification de moins de 6 mois ; au-delà, la fiche est signalée « à actualiser ».
9. Une source sans URL n'est admise que pour un entretien ou une contribution.
10. Un montant de financement est toujours accompagné de sa devise d'origine.
11. Une subvention ou un prix a pour tour « non_applicable ».
12. Une ligne réelle ne cite jamais une ligne de démonstration (demo = true). Les lignes de démonstration disparaissent avant le lancement public (validation --strict).
13. Deux startups au nom très proche déclenchent un avertissement de doublon possible.

## Conventions CSV

- Encodage UTF-8, séparateur virgule, guillemets doubles autour des textes qui contiennent une virgule.
- Listes de références séparées par `;` (exemple : `src-a;src-b`).
- Booléens : `true` ou `false`. Dates : `AAAA-MM-JJ`. Cellule vide = information inconnue.
