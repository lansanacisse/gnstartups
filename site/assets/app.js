/* Startup Guinée : site statique alimenté par data/registre.json (généré par scripts/build.py). */
{
const REPO = 'lansanacisse/gnstartups';
const ISSUE = (template, title, body) => `https://github.com/${REPO}/issues/new?template=${template}&title=${encodeURIComponent(title)}${body ? '&body=' + encodeURIComponent(body) : ''}`;

const L = {
  statut_activite: { active: 'Active', interrompue: 'Activité interrompue', fermee: 'Fermée', inconnue: 'Statut inconnu' },
  statut_verification: { verifiee: 'Vérifiée', a_verifier: 'À vérifier', contestee: 'Contestée' },
  statut_financement: { aucune_levee_connue: 'Aucune levée connue', levee_documentee: 'Levée documentée', en_cours_declare: 'Levée en cours déclarée' },
  niveau_confiance: { eleve: 'Élevé', moyen: 'Moyen', faible: 'Faible' },
  type_financement: { investissement: 'Investissement', subvention: 'Subvention', prix: 'Prix ou concours', dette: 'Dette', autre: 'Autre' },
  tour: { pre_seed: 'pré-seed', seed: 'seed', serie_a: 'série A', serie_b: 'série B', serie_c_plus: 'série C ou plus', non_applicable: '', inconnu: 'tour non communiqué' },
  methode_verification: { entretien: 'entretien', verification_en_ligne: 'vérification en ligne', registre: 'registre officiel', tiers: 'confirmation par un tiers', visite: 'visite sur place' },
  type_source: { site_officiel: 'site officiel', registre: 'registre', communique: 'communiqué', presse: 'presse', entretien: 'entretien', incubateur: 'incubateur', reseau_professionnel: 'réseau professionnel', contribution: 'contribution', autre: 'autre' },
  champ: { ajout: 'Ajout au registre', statut_activite: 'Changement de statut', statut_verification: 'Vérification', financement: 'Financement' },
  categorie: { startup: 'Startup', projet_precoce: 'Projet précoce' }
};
const EVENT_FLAG = { ajout: 'fl-neu', statut_verification: 'fl-ok', financement: 'fl-info' };
const STATUS_FLAG = { active: 'fl-ok', interrompue: 'fl-warn', fermee: 'fl-bad', inconnue: 'fl-neu' };
const MO = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeUrl = u => /^https?:\/\//.test(u || '') ? esc(u) : '#';
const ext = (href, text, cls) => `<a${cls ? ` class="${cls}"` : ''} href="${safeUrl(href)}" target="_blank" rel="noopener noreferrer">${text}<span class="sr"> (nouvel onglet)</span></a>`;
const lab = (k, v) => (L[k] && L[k][v] !== undefined) ? L[k][v] : v;
const fdate = d => { if (!d) return ''; const p = d.split('-'); return parseInt(p[2], 10) + ' ' + MO[parseInt(p[1], 10) - 1] + ' ' + p[0]; };
const usd = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace('.0', '').replace('.', ',') + ' M$' : Math.round(n / 1000) + ' k$';
const money = (m, dev) => m == null ? '<span class="undisclosed">Non divulgué</span>' : dev === 'USD' ? usd(m) : new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(m) + ' ' + esc(dev);
const pct = v => v == null ? '–' : String(v).replace('.', ',') + ' %';
const status = s => `<span class="status st-${esc(s)}">${esc(lab('statut_activite', s))}</span>`;
const flag = (text, cls) => `<span class="flag ${cls}">${esc(text)}</span>`;
const kind = r => esc(lab('type_financement', r.type_financement)) + (lab('tour', r.tour) ? ', ' + esc(lab('tour', r.tour)) : '');
const srcLine = (list, prefix = true) => list && list.length ? `<p class="src">${prefix ? (list.length > 1 ? 'Sources : ' : 'Source : ') : ''}${list.map(s => (s.url ? ext(s.url, esc(s.titre)) : esc(s.titre)) + ` (${esc(lab('type_source', s.type))}${s.date_publication ? ', ' + fdate(s.date_publication) : ''})`).join(' ; ')}</p>` : '';
const chev = '<svg class="chev" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
const searchIco = '<svg class="ico" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';

let D = null;
const st = { q: '', secteur: '', ville: '', statut: 'tous', ftype: '' };
const view = document.getElementById('view');

/* Exceptions à signaler sur une fiche : le statut principal est affiché à part */
function flags(s) {
  const f = [];
  if (s.statut_verification !== 'verifiee') f.push(flag(lab('statut_verification', s.statut_verification), s.statut_verification === 'contestee' ? 'fl-bad' : 'fl-neu'));
  if (s.statut_financement === 'en_cours_declare') f.push(flag('En levée', 'fl-info'));
  if (s.a_actualiser) f.push(flag('À actualiser', 'fl-warn'));
  return f.length ? `<div class="flags">${f.join('')}</div>` : '';
}
const finLabel = s => {
  const done = s.financements.filter(r => r.statut === 'documente');
  if (!done.length) return 'aucune levée connue';
  const tot = done.reduce((a, r) => a + (r.montant_usd || 0), 0);
  const n = done.length + ' opération' + (done.length > 1 ? 's' : '');
  return tot ? `${usd(tot)} (${n})` : n;
};

/* Répertoire */
const STATUTS = [['tous', 'Toutes'], ['active', 'Actives'], ['levee', 'En levée'], ['interrompue', 'Interrompues'], ['fermee', 'Fermées'], ['a_verifier', 'À vérifier']];
const matchStatut = (s, k) => k === 'tous' || (k === 'levee' ? s.statut_financement === 'en_cours_declare' : k === 'a_verifier' ? s.statut_verification !== 'verifiee' : s.statut_activite === k);

function repertoire() {
  const S = D.startups;
  const opt = (arr, v, all) => `<option value="">${all}</option>` + arr.map(x => `<option value="${esc(x.id)}"${x.id === v ? ' selected' : ''}>${esc(x.libelle || x.nom)}</option>`).join('');
  const usedS = D.secteurs.filter(x => S.some(s => s.secteur_id === x.id));
  const usedV = D.villes.filter(x => S.some(s => s.ville_id === x.id));
  view.innerHTML = `<div class="stack">
  <div class="page-head"><div><h1 tabindex="-1">Répertoire des startups guinéennes</h1>
   <p class="intro">Chaque fiche indique le statut d’activité, la preuve qui le justifie et la date de la dernière vérification.</p></div>
   <span class="wide">${ext(ISSUE('nouvelle-startup.yml', 'Nouvelle startup : '), 'Proposer une startup', 'btn')}</span></div>
  <div class="filters" role="search">
   <label class="field grow">${searchIco}<span class="sr">Rechercher par nom, activité ou fondateur</span><input id="q" type="search" placeholder="Nom, activité, fondateur" value="${esc(st.q)}" autocomplete="off"></label>
   <label class="field"><span class="label">Secteur</span><select id="secteur">${opt(usedS, st.secteur, 'Tous les secteurs')}</select>${chev}</label>
   <label class="field"><span class="label">Ville</span><select id="ville">${opt(usedV, st.ville, 'Toutes les villes')}</select>${chev}</label>
  </div>
  <div class="toolbar"><div class="seg" role="group" aria-label="Filtrer par statut">${STATUTS.map(x => `<button type="button" data-statut="${x[0]}" aria-pressed="false">${x[1]} <span class="count">${S.filter(s => matchStatut(s, x[0])).length}</span></button>`).join('')}</div>
   <div class="result"><span id="rc" aria-live="polite"></span><button type="button" id="reset" class="linkbtn">Réinitialiser les filtres</button></div></div>
  <ul class="entries" id="list"></ul><p class="empty" id="empty" hidden>Aucune startup ne correspond à ces filtres.</p>
  <p class="narrow propose">Une startup manque ? ${ext(ISSUE('nouvelle-startup.yml', 'Nouvelle startup : '), 'Proposer une startup', 'btn')}</p></div>`;
  list();
  document.getElementById('q').addEventListener('input', e => { st.q = e.target.value; list(); });
  document.getElementById('secteur').addEventListener('change', e => { st.secteur = e.target.value; list(); });
  document.getElementById('ville').addEventListener('change', e => { st.ville = e.target.value; list(); });
}
function list() {
  const q = st.q.trim().toLowerCase();
  const f = D.startups.filter(s => (!st.secteur || s.secteur_id === st.secteur) && (!st.ville || s.ville_id === st.ville) && matchStatut(s, st.statut) &&
    (!q || [s.nom, s.description, ...s.fondateurs.map(x => x.nom)].join(' ').toLowerCase().includes(q)));
  document.querySelectorAll('[data-statut]').forEach(b => { const on = b.dataset.statut === st.statut; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  document.getElementById('list').innerHTML = f.map(s => `<li><a class="entry" href="#fiche-${esc(s.id)}">
   <div class="entry-head"><h2>${esc(s.nom)}</h2>${status(s.statut_activite)}</div>
   <p class="entry-meta">${esc(s.secteur)} · ${esc(s.ville)}${s.annee_creation ? ' · ' + s.annee_creation : ''}</p>
   <p class="entry-desc">${esc(s.description)}</p>${flags(s)}
   <p class="entry-foot"><span>Financement : <b>${finLabel(s)}</b></span><span>${s.date_derniere_verification ? 'Vérifiée le ' + fdate(s.date_derniere_verification) : 'Pas encore vérifiée'}</span></p></a></li>`).join('');
  document.getElementById('empty').hidden = f.length > 0;
  document.getElementById('rc').textContent = f.length + ' fiche' + (f.length > 1 ? 's' : '') + ' sur ' + D.startups.length;
  document.getElementById('reset').hidden = !(st.q.trim() || st.secteur || st.ville || st.statut !== 'tous');
}

/* Fiche */
function fiche(id) {
  const s = D.startups.find(x => x.id === id);
  if (!s) { view.innerHTML = `<div class="stack"><h1 tabindex="-1">Fiche introuvable</h1><p>Cette fiche n’existe pas ou n’est pas encore publiée. <a href="#repertoire">Retour au répertoire</a></p></div>`; return; }
  const last = s.verifications[0];
  const meta = [s.secteur, s.ville === s.region ? s.ville : `${s.ville} (région de ${s.region})`, s.annee_creation && 'créée en ' + s.annee_creation].filter(Boolean).map(esc).join(' · ');
  const facts = [['Raison sociale', s.raison_sociale], ['Forme juridique', s.forme_juridique], ['Pays d’immatriculation', s.pays_immatriculation], ['RCCM', s.rccm],
    ['Date d’immatriculation', fdate(s.date_creation_juridique)], ['Effectif', s.effectif], ['Catégorie', lab('categorie', s.categorie)]];
  const known = facts.filter(f => f[1]), missing = facts.filter(f => !f[1]).map(f => f[0] === 'RCCM' ? f[0] : f[0].toLowerCase());
  const links = [s.site_web && ext(s.site_web, 'Site officiel'), s.linkedin_url && ext(s.linkedin_url, 'Page LinkedIn')].filter(Boolean);
  // Un événement « vérification » le même jour qu'une ligne de vérification fait doublon : on garde la vérification
  const vDates = new Set(s.verifications.map(v => v.date));
  const hist = [...s.verifications.map(v => ({ date: v.date, html: `<p><b>Vérification par ${esc(lab('methode_verification', v.methode))}</b></p><p>${esc(v.resume)}</p><p class="small mute">Statut constaté : ${esc(lab('statut_activite', v.statut_constate))}</p>${srcLine(v.sources)}` })),
    ...s.evenements.filter(e => !(e.champ === 'statut_verification' && vDates.has(e.date))).map(e => ({ date: e.date, html: `<p><b>${esc(lab('champ', e.champ))}</b></p><p>${esc(e.motif)}</p>${srcLine(e.sources)}` }))]
    .sort((a, b) => a.date < b.date ? 1 : -1);
  const body = `Fiche : ${s.nom} (${location.origin}${location.pathname}#fiche-${s.id})\n\nInformation à corriger :\n\nValeur correcte :\n\nSource (lien ou explication) :\n`;
  view.innerHTML = `<div class="stack">
  <nav class="crumbs" aria-label="Fil d’Ariane"><a href="#repertoire">Répertoire</a><span aria-hidden="true">/</span><span aria-current="page">${esc(s.nom)}</span></nav>
  <header class="fiche-head"><h1 tabindex="-1">${esc(s.nom)}</h1><p class="mute">${meta}</p><p class="lead">${esc(s.description)}</p>
   ${links.length ? `<p class="links">${links.join('')}</p>` : ''}${srcLine(s.sources)}</header>
  <div class="fiche">
   <aside class="side" aria-label="Statut et vérification">
    <div class="panel">${status(s.statut_activite)}${flags(s)}
     ${last ? `<p>${esc(last.resume)}</p><p class="small mute">Vérifiée le ${fdate(last.date)}, par ${esc(lab('methode_verification', last.methode))}.</p>` : '<p class="mute">Cette fiche n’a pas encore été vérifiée.</p>'}
     ${s.a_actualiser ? '<p class="small">La dernière vérification date de plus de 6 mois : la fiche est à actualiser.</p>' : ''}
     <dl class="kv"><dt>Niveau de confiance</dt><dd>${esc(lab('niveau_confiance', s.niveau_confiance))}</dd></dl>
     <div><dl class="kv"><dt>Complétude</dt><dd>${pct(s.completude)}</dd></dl><div class="meter" aria-hidden="true"><i style="width:${Number(s.completude) || 0}%"></i></div></div>
     <p class="note">Dans le registre depuis le ${fdate(s.date_ajout)}.</p></div>
    ${ext(ISSUE('correction.yml', 'Correction : ' + s.nom, body), 'Signaler une information incorrecte', 'btn')}
    <p class="small">Vous dirigez cette startup ? ${ext(ISSUE('revendication.yml', 'Revendication de fiche : ' + s.nom), 'Revendiquer la fiche')}</p>
    <p class="note">Les corrections sont vérifiées avant publication. Les entreprises ne modifient pas directement leur fiche.</p>
   </aside>
   <div class="fiche-main">
    <section class="section"><h2>Entreprise</h2>
     ${known.length ? `<dl class="facts">${known.map(f => `<div><dt>${f[0]}</dt><dd>${esc(f[1])}</dd></div>`).join('')}</dl>` : ''}
     ${missing.length ? `<p class="note">Non renseigné : ${esc(missing.join(', '))}.</p>` : ''}</section>
    <section class="section"><h2>Fondateurs</h2>${s.fondateurs.length ? `<ul class="rows">${s.fondateurs.map(f => `<li><div><p><b>${esc(f.nom)}</b>, ${esc(f.role)}</p>${srcLine(f.sources)}</div>${f.linkedin_url ? ext(f.linkedin_url, 'LinkedIn') : ''}</li>`).join('')}</ul>` : '<p class="mute">Fondateurs non renseignés.</p>'}</section>
    <section class="section"><div class="section-head"><h2>Financements</h2><span class="small mute">${esc(lab('statut_financement', s.statut_financement))}</span></div>
     ${s.financements.length ? `<ul class="rows">${s.financements.map(r => `<li><div><p><b>${kind(r)}</b>, ${fdate(r.date)}${r.statut === 'en_cours_declare' ? ' ' + flag('En cours', 'fl-info') : ''}</p><p class="small mute">${esc(r.investisseurs.join(', ') || 'Financeurs non communiqués')}</p>${r.notes ? `<p class="small">${esc(r.notes)}</p>` : ''}${srcLine(r.sources)}</div><span class="amount">${money(r.montant, r.devise)}</span></li>`).join('')}</ul>` : '<p class="mute">Aucune levée connue. Cela ne signifie pas que l’entreprise n’a jamais levé de fonds.</p>'}</section>
    ${s.accompagnements.length ? `<section class="section"><h2>Accompagnement</h2><ul class="rows">${s.accompagnements.map(a => `<li><div><p><b>${esc(a.organisation)}</b>${a.programme ? ', ' + esc(a.programme) : ''}${a.annee ? ' (' + a.annee + ')' : ''}</p>${srcLine(a.sources)}</div></li>`).join('')}</ul></section>` : ''}
    <section class="section"><h2>Historique</h2>${hist.length ? `<ol class="tl">${hist.map(h => `<li><p class="when">${fdate(h.date)}</p>${h.html}</li>`).join('')}</ol>` : '<p class="mute">Aucun événement enregistré.</p>'}</section>
   </div></div></div>`;
}

/* Financements */
function financements() {
  const R = D.financements;
  const done = R.filter(r => r.statut === 'documente');
  const tot = done.reduce((a, r) => a + (r.montant_usd || 0), 0);
  const known = done.filter(r => r.montant != null).length;
  const pending = R.filter(r => r.statut === 'en_cours_declare').length;
  const types = [...new Set(R.map(r => r.type_financement))];
  view.innerHTML = `<div class="stack">
  <div><h1 tabindex="-1">Financements documentés</h1><p class="intro">Investissements, subventions, prix et dette, chacun avec sa source. Les montants sont affichés dans leur devise d’origine ; les totaux utilisent la contre-valeur en dollars.</p></div>
  <p class="summary"><b>${usd(tot)}</b> documentés sur <b>${done.length}</b> opération${done.length > 1 ? 's' : ''}${known < done.length ? `, dont ${known} avec un montant connu` : ''}. <b>${pending}</b> levée${pending > 1 ? 's' : ''} en cours déclarée${pending > 1 ? 's' : ''}.</p>
  <div class="seg" role="group" aria-label="Filtrer par type de financement"><button type="button" data-ftype="" aria-pressed="false">Tous</button>${types.map(t => `<button type="button" data-ftype="${esc(t)}" aria-pressed="false">${esc(lab('type_financement', t))}</button>`).join('')}</div>
  <div class="scroll"><table class="rtable"><caption class="sr">Opérations de financement, de la plus récente à la plus ancienne</caption>
  <thead><tr><th scope="col">Date</th><th scope="col">Startup</th><th scope="col">Type</th><th scope="col" class="num">Montant</th><th scope="col">Financeurs</th><th scope="col">Source</th></tr></thead><tbody id="rounds"></tbody></table></div></div>`;
  rounds();
}
function rounds() {
  document.querySelectorAll('[data-ftype]').forEach(b => { const on = b.dataset.ftype === st.ftype; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  document.getElementById('rounds').innerHTML = D.financements.filter(r => !st.ftype || r.type_financement === st.ftype).map(r => `<tr>
   <td data-l="Date" class="nowrap mute">${fdate(r.date)}</td><td data-l="Startup"><a href="#fiche-${esc(r.startup_id)}"><b>${esc(r.startup)}</b></a></td>
   <td data-l="Type">${kind(r)}${r.statut === 'en_cours_declare' ? ' ' + flag('En cours', 'fl-info') : ''}</td><td data-l="Montant" class="num"><b>${money(r.montant, r.devise)}</b></td>
   <td data-l="Financeurs">${esc(r.investisseurs.join(', ')) || '<span class="mute">Non communiqués</span>'}</td><td data-l="Source">${srcLine(r.sources, false)}</td></tr>`).join('');
}

/* Indicateurs */
function indicateurs() {
  const I = D.indicateurs, S = D.startups;
  const quality = [['Fiches vérifiées', pct(I.taux_verification), `${I.fiches_verifiees} sur ${I.fiches_publiees} fiches publiées`],
    ['Complétude moyenne', pct(I.taux_completude), 'Part des champs essentiels renseignés'],
    ['Fiches avec une source primaire', pct(I.taux_sources_primaires), 'Entreprise, registre officiel ou financeur'],
    ['Fiches à actualiser', I.fiches_a_actualiser, 'Fiches actives vérifiées il y a plus de 6 mois'],
    ['Délai moyen de validation', I.delai_moyen_validation_jours == null ? '–' : I.delai_moyen_validation_jours + ' jours', 'De l’ajout au registre à la première vérification']];
  const scope = [['Startups identifiées', I.startups_identifiees, 'Publiées ou non'], ['Fiches publiées', I.fiches_publiees, 'Fiches suffisamment documentées'],
    ['Projets précoces', I.projets_precoces, 'Sans activité identifiable, comptés à part'], ['En levée', I.en_levee, 'Levée en cours déclarée par l’entreprise']];
  const table = (rows, cap) => `<table class="rtable ind"><caption class="sr">${cap}</caption><thead><tr><th scope="col">Indicateur</th><th scope="col" class="num">Valeur</th><th scope="col">Ce qu’il mesure</th></tr></thead><tbody>${rows.map(r => `<tr><td data-l="Indicateur">${r[0]}</td><td data-l="Valeur" class="num"><b>${r[1]}</b></td><td data-l="Mesure" class="mute">${r[2]}</td></tr>`).join('')}</tbody></table>`;
  const bars = (rows, total) => `<ul class="bars">${rows.map(([l, v, shown]) => `<li class="bar"><span>${esc(l)}</span><span class="track" aria-hidden="true"><span class="fill" style="width:${total ? Math.max(1, Math.round(v / total * 100)) : 0}%"></span></span><span class="num">${shown ?? v}</span></li>`).join('')}</ul>`;
  const sec = {}; S.forEach(s => sec[s.secteur] = (sec[s.secteur] || 0) + 1);
  const secRows = Object.entries(sec).sort((a, b) => b[1] - a[1]);
  const by = {}; D.financements.filter(r => r.statut === 'documente').forEach(r => { const y = r.date.slice(0, 4); by[y] = (by[y] || 0) + (r.montant_usd || 0); });
  const yRows = Object.keys(by).sort().map(y => [y, by[y], usd(by[y])]);
  view.innerHTML = `<div class="stack">
  <div><h1 tabindex="-1">Indicateurs</h1><p class="intro">La qualité du référentiel passe avant son volume. Ces chiffres sont recalculés à chaque mise à jour des données.</p></div>
  <section class="stack"><h2>Qualité des données</h2>${table(quality, 'Indicateurs de qualité des données')}</section>
  <section class="stack"><h2>Périmètre</h2>${table(scope, 'Périmètre du registre')}</section>
  <div class="cols">
   <section class="stack"><h2>Statut d’activité</h2>${bars(Object.entries(I.par_statut_activite).map(([k, v]) => [lab('statut_activite', k), v]), I.fiches_publiees)}</section>
   <section class="stack"><h2>Fiches par secteur</h2>${bars(secRows, secRows.length ? secRows[0][1] : 0)}</section>
  </div>
  <section class="stack"><div><h2>Montants documentés par année</h2><p class="small mute">Contre-valeur en dollars US, opérations réalisées uniquement.</p></div>${bars(yRows, Math.max(0, ...yRows.map(r => r[1])))}</section>
  </div>`;
}

/* Évolutions */
function evolutions() {
  const E = D.evenements;
  view.innerHTML = `<div class="stack">
  <div><h1 tabindex="-1">Évolutions</h1><p class="intro">Ajouts au registre, vérifications, levées, interruptions et fermetures, du plus récent au plus ancien. Chaque changement cite sa preuve.</p></div>
  ${E.length ? `<ol class="tl">${E.map(e => `<li><p class="when">${fdate(e.date)}</p><p class="flags">${flag(lab('champ', e.champ), e.champ === 'statut_activite' ? (STATUS_FLAG[e.nouvelle_valeur] || 'fl-neu') : (EVENT_FLAG[e.champ] || 'fl-neu'))}<a href="#fiche-${esc(e.startup_id)}"><b>${esc(e.startup)}</b></a></p><p>${esc(e.motif)}</p>${srcLine(e.sources)}</li>`).join('')}</ol>` : '<p class="empty">Aucun événement enregistré.</p>'}</div>`;
}

/* Méthodologie */
function methodologie() {
  const d = D.definitions;
  const defs = k => `<dl class="defs">${Object.entries(d[k]).map(([v, t]) => `<dt>${esc(lab(k, v)).replace(/^./, c => c.toUpperCase())}</dt><dd>${esc(t)}</dd>`).join('')}</dl>`;
  const gh = p => `https://github.com/${REPO}/blob/main/${p}`;
  view.innerHTML = `<article class="prose">
  <h1 tabindex="-1">Méthodologie</h1>
  <p>Startup Guinée est un registre indépendant des startups créées en Guinée ou qui développent leur activité sur le marché guinéen. L’objectif n’est pas d’en recenser le plus possible, mais de tenir la base la plus fiable possible.</p>
  <h2>Ce que nous recensons</h2>
  <p>Une startup est une entreprise qui a une activité innovante identifiable et une ambition de croissance reproductible. Les PME traditionnelles, associations, ONG et projets étudiants n’en font pas partie. Les projets sans activité identifiable sont classés à part, comme projets précoces.</p>
  <h2>Nos règles</h2>
  <ul><li><b>Exhaustivité progressive.</b> Nous recensons les entreprises identifiables, sans prétendre couvrir tout l’écosystème.</li>
  <li><b>Traçabilité.</b> Chaque information importante a une source et une date de vérification.</li>
  <li><b>Neutralité.</b> Visibilité médiatique, activité réelle et réussite commerciale sont des choses distinctes.</li>
  <li><b>Actualisation.</b> Au-delà de 6 mois sans vérification, une fiche active est signalée « à actualiser ».</li></ul>
  <h2>Statut d’activité</h2>${defs('statut_activite')}
  <p class="small mute">Une absence d’information récente ne constitue jamais une preuve de fermeture.</p>
  <h2>Statut de vérification</h2>${defs('statut_verification')}
  <h2>Niveau de confiance</h2>${defs('niveau_confiance')}
  <h2>Types de financement</h2>${defs('type_financement')}
  <p class="small mute">« Aucune levée connue » ne veut pas dire que l’entreprise n’a jamais levé de fonds. Aucun montant n’est publié sans source.</p>
  <h2>Contribuer</h2>
  <p>Vous pouvez ${ext(ISSUE('nouvelle-startup.yml', 'Nouvelle startup : '), 'proposer une startup')} ou signaler une correction depuis chaque fiche. Toute contribution est vérifiée avant publication.</p>
  <p class="small">Documents de référence : ${ext(gh('docs/protocole-verification.md'), 'protocole de vérification')}, ${ext(gh('docs/dictionnaire-donnees.md'), 'dictionnaire de données')}, ${ext(gh('docs/definition-startup.md'), 'définition d’une startup')}.</p>
  </article>`;
}

const VIEWS = { repertoire, financements, indicateurs, evolutions, methodologie };
const TITLES = { repertoire: 'Répertoire', financements: 'Financements', indicateurs: 'Indicateurs', evolutions: 'Évolutions', methodologie: 'Méthodologie' };
let first = true;
function route() {
  const h = location.hash.slice(1) || 'repertoire';
  const v = h.startsWith('fiche-') ? 'fiche' : (VIEWS[h] ? h : 'repertoire');
  document.querySelectorAll('#nav a').forEach(a => {
    const on = a.dataset.v === v || (v === 'fiche' && a.dataset.v === 'repertoire');
    a.classList.toggle('on', on);
    if (a.dataset.v === v) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    // Sur mobile, la navigation défile : on garde l'onglet actif visible
    if (on) a.parentElement.scrollLeft = Math.max(0, a.offsetLeft - a.parentElement.offsetLeft - 8);
  });
  if (v === 'fiche') { const s = D.startups.find(x => x.id === h.slice(6)); fiche(h.slice(6)); document.title = (s ? s.nom : 'Fiche introuvable') + ' | Startup Guinée'; }
  else { VIEWS[v](); document.title = TITLES[v] + ' | Startup Guinée'; }
  // Au changement de vue : retour en haut et focus sur le titre, pour le clavier et les lecteurs d'écran
  if (!first) { window.scrollTo(0, 0); const h1 = view.querySelector('h1'); if (h1) h1.focus({ preventScroll: true }); }
  first = false;
}

document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.statut !== undefined) { st.statut = b.dataset.statut; list(); }
  else if (b.dataset.ftype !== undefined) { st.ftype = b.dataset.ftype; rounds(); }
  else if (b.id === 'reset') {
    Object.assign(st, { q: '', secteur: '', ville: '', statut: 'tous' });
    ['q', 'secteur', 'ville'].forEach(id => { document.getElementById(id).value = ''; });
    list(); document.getElementById('q').focus();
  }
});
window.addEventListener('hashchange', route);

fetch('data/registre.json', { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error('erreur ' + r.status); return r.json(); }).then(data => {
  D = data;
  document.getElementById('demo').hidden = !D.contient_demo;
  document.getElementById('meta').textContent = `Données mises à jour le ${fdate(D.genere_le.slice(0, 10))}`;
  route();
}).catch(err => {
  view.innerHTML = `<div class="stack"><h1>Le registre n’a pas pu être chargé</h1><p>${esc(err.message)}. Réessayez dans quelques instants. En local, lancez <code>python -m http.server -d site</code> après <code>python scripts/build.py</code>.</p></div>`;
});
}
