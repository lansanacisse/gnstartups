-- Schéma PostgreSQL du référentiel StartupGuineeIQ (cible : Supabase).
-- Fichier généré par scripts/gen_docs.py depuis schema/tables.json. Ne pas modifier à la main.
-- Version du schéma : 0.2.0

begin;

create type categorie as enum ('startup', 'projet_precoce');
create type statut_activite as enum ('active', 'interrompue', 'fermee', 'inconnue');
create type statut_verification as enum ('a_verifier', 'verifiee', 'contestee');
create type niveau_confiance as enum ('eleve', 'moyen', 'faible');
create type type_source as enum ('site_officiel', 'registre', 'communique', 'presse', 'entretien', 'incubateur', 'reseau_professionnel', 'contribution', 'autre');
create type type_financement as enum ('investissement', 'subvention', 'prix', 'dette', 'autre');
create type tour as enum ('pre_seed', 'seed', 'serie_a', 'serie_b', 'serie_c_plus', 'non_applicable', 'inconnu');
create type statut_financement_operation as enum ('documente', 'en_cours_declare');
create type type_organisation as enum ('investisseur', 'incubateur', 'programme', 'entreprise', 'institution');
create type methode_verification as enum ('entretien', 'verification_en_ligne', 'registre', 'tiers', 'visite');

-- Référentiel des secteurs d'activité.
create table secteurs (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  libelle text not null,
  description text
);

comment on table secteurs is 'Référentiel des secteurs d''activité.';
comment on column secteurs.id is 'Identifiant (kebab-case).';
comment on column secteurs.libelle is 'Nom affiché.';
comment on column secteurs.description is 'Périmètre du secteur.';

-- Référentiel des villes (siège ou implantation).
create table villes (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nom text not null,
  region text not null,
  pays text not null
);

comment on table villes is 'Référentiel des villes (siège ou implantation).';
comment on column villes.id is 'Identifiant (kebab-case).';
comment on column villes.nom is 'Nom de la ville.';
comment on column villes.region is 'Région administrative.';
comment on column villes.pays is 'Code pays ISO 3166-1 alpha-2.';

-- Toute preuve utilisée dans le référentiel. Chaque information importante renvoie à au moins une source.
create table sources (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  type type_source not null,
  titre text not null,
  url text check (url ~ '^https?://'),
  editeur text,
  date_publication date,
  date_collecte date not null,
  archive_url text check (archive_url ~ '^https?://'),
  demo boolean not null,
  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);

comment on table sources is 'Toute preuve utilisée dans le référentiel. Chaque information importante renvoie à au moins une source.';
comment on column sources.id is 'Identifiant (kebab-case).';
comment on column sources.type is 'Nature de la source.';
comment on column sources.titre is 'Titre ou description courte de la preuve.';
comment on column sources.url is 'Lien vers la preuve. Obligatoire sauf pour les entretiens et contributions.';
comment on column sources.editeur is 'Média, organisation ou personne à l''origine de la source.';
comment on column sources.date_publication is 'Date de publication de la source.';
comment on column sources.date_collecte is 'Date à laquelle la source a été collectée.';
comment on column sources.archive_url is 'Copie archivée (web.archive.org...) pour garder la preuve si la page disparaît.';
comment on column sources.demo is 'true si la ligne est fictive (données de démonstration).';

-- Une ligne par entreprise recensée. Regroupe les domaines Startup, Identification et Activité.
create table startups (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nom text not null,
  categorie categorie not null,
  description text not null,
  secteur_id text references secteurs(id) not null,
  ville_id text references villes(id) not null,
  annee_creation integer,
  site_web text check (site_web ~ '^https?://'),
  linkedin_url text check (linkedin_url ~ '^https?://'),
  x_url text check (x_url ~ '^https?://'),
  facebook_url text check (facebook_url ~ '^https?://'),
  instagram_url text check (instagram_url ~ '^https?://'),
  raison_sociale text,
  forme_juridique text,
  pays_immatriculation text,
  rccm text,
  date_creation_juridique date,
  effectif text,
  statut_activite statut_activite not null,
  statut_verification statut_verification not null,
  niveau_confiance niveau_confiance not null,
  date_derniere_verification date,
  publie boolean not null,
  date_ajout date not null,
  demo boolean not null,
  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);

comment on table startups is 'Une ligne par entreprise recensée. Regroupe les domaines Startup, Identification et Activité.';
comment on column startups.id is 'Identifiant stable (kebab-case), ne change jamais même si le nom change.';
comment on column startups.nom is 'Nom commercial.';
comment on column startups.categorie is 'Startup établie ou projet précoce.';
comment on column startups.description is 'Ce que fait l''entreprise, en une ou deux phrases factuelles.';
comment on column startups.secteur_id is 'Secteur principal.';
comment on column startups.ville_id is 'Ville du siège ou de l''activité principale.';
comment on column startups.annee_creation is 'Année de création (ou de lancement si la date juridique est inconnue).';
comment on column startups.site_web is 'Site officiel.';
comment on column startups.linkedin_url is 'Page LinkedIn de l''entreprise.';
comment on column startups.x_url is 'Compte X (Twitter) officiel.';
comment on column startups.facebook_url is 'Page Facebook officielle.';
comment on column startups.instagram_url is 'Compte Instagram officiel.';
comment on column startups.raison_sociale is 'Dénomination juridique.';
comment on column startups.forme_juridique is 'SARL, SARLU, SA, SAS...';
comment on column startups.pays_immatriculation is 'Code pays ISO 3166-1 alpha-2 de l''entité juridique principale.';
comment on column startups.rccm is 'Numéro RCCM s''il est public.';
comment on column startups.date_creation_juridique is 'Date d''immatriculation.';
comment on column startups.effectif is 'Tranche d''effectif (1-5, 5-10, 10-25, 25-50, 50-100, 100+).';
comment on column startups.statut_activite is 'Statut de l''entreprise.';
comment on column startups.statut_verification is 'Statut de vérification de la fiche.';
comment on column startups.niveau_confiance is 'Confiance globale dans la fiche.';
comment on column startups.date_derniere_verification is 'Date de la dernière vérification (reprise de la table verifications).';
comment on column startups.publie is 'true si la fiche est visible sur le site.';
comment on column startups.date_ajout is 'Date d''entrée dans le référentiel.';
comment on column startups.demo is 'true si la ligne est fictive.';

-- Fondateurs et cofondateurs, uniquement avec des informations professionnelles publiques.
create table fondateurs (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  startup_id text references startups(id) not null,
  nom text not null,
  role text not null,
  linkedin_url text check (linkedin_url ~ '^https?://'),
  demo boolean not null,
  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);

comment on table fondateurs is 'Fondateurs et cofondateurs, uniquement avec des informations professionnelles publiques.';
comment on column fondateurs.id is 'Identifiant (kebab-case).';
comment on column fondateurs.startup_id is 'Startup concernée.';
comment on column fondateurs.nom is 'Prénom et nom.';
comment on column fondateurs.role is 'Rôle (Fondatrice et CEO, Cofondateur et CTO...).';
comment on column fondateurs.linkedin_url is 'Profil LinkedIn exact (pas une recherche).';
comment on column fondateurs.demo is 'true si la ligne est fictive.';

-- Investisseurs, incubateurs, programmes et partenaires.
create table organisations (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nom text not null,
  type type_organisation not null,
  pays text,
  site_web text check (site_web ~ '^https?://'),
  demo boolean not null,
  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);

comment on table organisations is 'Investisseurs, incubateurs, programmes et partenaires.';
comment on column organisations.id is 'Identifiant (kebab-case).';
comment on column organisations.nom is 'Nom de l''organisation.';
comment on column organisations.type is 'Nature de l''organisation.';
comment on column organisations.pays is 'Code pays ISO 3166-1 alpha-2.';
comment on column organisations.site_web is 'Site officiel.';
comment on column organisations.demo is 'true si la ligne est fictive.';

-- Opérations de financement. Investissements, subventions, prix et dette sont distingués.
create table financements (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  startup_id text references startups(id) not null,
  date date not null,
  type_financement type_financement not null,
  tour tour not null,
  statut statut_financement_operation not null,
  montant numeric(18,2),
  devise text,
  montant_usd numeric(18,2),
  investisseurs_non_identifies text,
  notes text,
  demo boolean not null,
  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);

comment on table financements is 'Opérations de financement. Investissements, subventions, prix et dette sont distingués.';
comment on column financements.id is 'Identifiant (kebab-case).';
comment on column financements.startup_id is 'Startup financée.';
comment on column financements.date is 'Date d''annonce ou de clôture.';
comment on column financements.type_financement is 'Nature du financement.';
comment on column financements.tour is 'Tour d''investissement.';
comment on column financements.statut is 'Réalisé ou en cours déclaré.';
comment on column financements.montant is 'Montant dans la devise d''origine. Vide si non divulgué.';
comment on column financements.devise is 'Code ISO 4217 (GNF, USD, EUR, XOF...). Obligatoire si montant renseigné.';
comment on column financements.montant_usd is 'Contre-valeur en USD au taux de la date de l''opération, pour les agrégats.';
comment on column financements.investisseurs_non_identifies is 'Mention libre si les financeurs ne sont pas nommés (business angels non divulgués...).';
comment on column financements.notes is 'Précisions.';
comment on column financements.demo is 'true si la ligne est fictive.';

-- Liens avec l'écosystème : incubation, accélération, programmes, partenariats.
create table accompagnements (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  startup_id text references startups(id) not null,
  organisation_id text references organisations(id) not null,
  programme text,
  annee integer,
  demo boolean not null,
  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);

comment on table accompagnements is 'Liens avec l''écosystème : incubation, accélération, programmes, partenariats.';
comment on column accompagnements.id is 'Identifiant (kebab-case).';
comment on column accompagnements.startup_id is 'Startup accompagnée.';
comment on column accompagnements.organisation_id is 'Organisation.';
comment on column accompagnements.programme is 'Nom du programme ou de la promotion.';
comment on column accompagnements.annee is 'Année de l''accompagnement.';
comment on column accompagnements.demo is 'true si la ligne est fictive.';

-- Journal des vérifications. Une ligne par vérification, jamais modifiée après coup.
create table verifications (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  startup_id text references startups(id) not null,
  date date not null,
  methode methode_verification not null,
  statut_constate statut_activite not null,
  resume text not null,
  verifie_par text not null,
  demo boolean not null,
  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);

comment on table verifications is 'Journal des vérifications. Une ligne par vérification, jamais modifiée après coup.';
comment on column verifications.id is 'Identifiant (kebab-case).';
comment on column verifications.startup_id is 'Startup vérifiée.';
comment on column verifications.date is 'Date de la vérification.';
comment on column verifications.methode is 'Méthode utilisée.';
comment on column verifications.statut_constate is 'Statut d''activité constaté à cette date.';
comment on column verifications.resume is 'Ce qui a été constaté, en une phrase.';
comment on column verifications.verifie_par is 'Initiales ou pseudonyme de la personne qui a vérifié.';
comment on column verifications.demo is 'true si la ligne est fictive.';

-- Historique public des changements de statut (détection, confirmation, interruption, fermeture, levée). Alimente Watch.
create table evenements (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  startup_id text references startups(id) not null,
  date date not null,
  champ text not null,
  ancienne_valeur text,
  nouvelle_valeur text not null,
  motif text not null,
  demo boolean not null,
  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);

comment on table evenements is 'Historique public des changements de statut (détection, confirmation, interruption, fermeture, levée). Alimente Watch.';
comment on column evenements.id is 'Identifiant (kebab-case).';
comment on column evenements.startup_id is 'Startup concernée.';
comment on column evenements.date is 'Date de l''événement.';
comment on column evenements.champ is 'Champ modifié (statut_activite, statut_verification, financement, ajout...).';
comment on column evenements.ancienne_valeur is 'Valeur avant le changement (vide pour un ajout).';
comment on column evenements.nouvelle_valeur is 'Valeur après le changement.';
comment on column evenements.motif is 'Raison du changement, en une phrase.';
comment on column evenements.demo is 'true si la ligne est fictive.';

-- Sources des informations générales, séparées par ';'.
create table startups_sources (
  startup_id text not null references startups(id) on delete cascade,
  source_id text not null references sources(id),
  primary key (startup_id, source_id)
);
comment on table startups_sources is 'Sources des informations générales, séparées par '';''.';

-- Preuves du rôle.
create table fondateurs_sources (
  fondateur_id text not null references fondateurs(id) on delete cascade,
  source_id text not null references sources(id),
  primary key (fondateur_id, source_id)
);
comment on table fondateurs_sources is 'Preuves du rôle.';

-- Investisseurs ou financeurs connus, séparés par ';'.
create table financements_investisseurs (
  financement_id text not null references financements(id) on delete cascade,
  organisation_id text not null references organisations(id),
  primary key (financement_id, organisation_id)
);
comment on table financements_investisseurs is 'Investisseurs ou financeurs connus, séparés par '';''.';

-- Preuves de l'opération. Aucune levée publiée sans source.
create table financements_sources (
  financement_id text not null references financements(id) on delete cascade,
  source_id text not null references sources(id),
  primary key (financement_id, source_id)
);
comment on table financements_sources is 'Preuves de l''opération. Aucune levée publiée sans source.';

-- Preuves.
create table accompagnements_sources (
  accompagnement_id text not null references accompagnements(id) on delete cascade,
  source_id text not null references sources(id),
  primary key (accompagnement_id, source_id)
);
comment on table accompagnements_sources is 'Preuves.';

-- Preuves.
create table verifications_sources (
  verification_id text not null references verifications(id) on delete cascade,
  source_id text not null references sources(id),
  primary key (verification_id, source_id)
);
comment on table verifications_sources is 'Preuves.';

-- Preuves.
create table evenements_sources (
  evenement_id text not null references evenements(id) on delete cascade,
  source_id text not null references sources(id),
  primary key (evenement_id, source_id)
);
comment on table evenements_sources is 'Preuves.';

commit;
