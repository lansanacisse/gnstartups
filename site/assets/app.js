/* StartupGuineeIQ : site statique alimenté par data/registre.json (généré par scripts/build.py). */
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
const PAYS = { GN: 'Guinée', FR: 'France', SN: 'Sénégal', CI: 'Côte d’Ivoire', ML: 'Mali', US: 'États-Unis', GB: 'Royaume-Uni', MA: 'Maroc', NG: 'Nigeria', GH: 'Ghana' };
const fdate = d => { if (!d) return ''; const p = d.split('-'); return (parseInt(p[2], 10) === 1 ? '1er' : parseInt(p[2], 10)) + ' ' + MO[parseInt(p[1], 10) - 1] + ' ' + p[0]; };
const usd = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace('.0', '').replace('.', ',') + ' M$' : Math.round(n / 1000) + ' k$';
const money = (m, dev) => m == null ? '<span class="undisclosed">Non divulgué</span>' : dev === 'USD' ? usd(m) : new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(m) + ' ' + esc(dev);
const pct = v => v == null ? '–' : String(v).replace('.', ',') + ' %';
/* Comment une vérification a été faite : « Vérifiée en ligne le… », « Vérification en ligne » */
const VERIF_HOW = { entretien: 'par entretien', verification_en_ligne: 'en ligne', registre: 'au registre officiel', tiers: 'par un tiers', visite: 'lors d’une visite sur place' };
const VERIF_TITLE = { entretien: 'Vérification par entretien', verification_en_ligne: 'Vérification en ligne', registre: 'Vérification au registre officiel', tiers: 'Confirmation par un tiers', visite: 'Visite sur place' };
const status = s => `<span class="status st-${esc(s)}">${esc(lab('statut_activite', s))}</span>`;
const flag = (text, cls) => `<span class="flag ${cls}">${esc(text)}</span>`;
const kind = r => esc(lab('type_financement', r.type_financement)) + (lab('tour', r.tour) ? ', ' + esc(lab('tour', r.tour)) : '');
const srcLine = (list, prefix = true) => list && list.length ? `<p class="src">${prefix ? (list.length > 1 ? 'Sources : ' : 'Source : ') : ''}${list.map(s => (s.url ? ext(s.url, esc(s.titre)) : esc(s.titre)) + ` (${esc(lab('type_source', s.type))}${s.date_publication ? ', ' + fdate(s.date_publication) : ''})`).join(' ; ')}</p>` : '';
const chev = '<svg class="chev" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
const searchIco = '<svg class="ico" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';

let D = null;
const st = { q: '', secteur: '', statut: 'tous', ftype: '', fetat: '' };
const ETATS = [['', 'Toutes'], ['documente', 'Réalisées'], ['en_cours_declare', 'En cours']];
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

/* Panneau de filtres du téléphone, commun au répertoire et aux financements */
const FILTER_BTN = '<button type="button" id="open-filters" class="filter-btn narrow-flex" aria-haspopup="dialog" aria-controls="fsheet"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>Filtres<span class="n" id="fcount"></span></button>';
function bindSheet() {
  const sheet = document.getElementById('fsheet'), btn = document.getElementById('open-filters');
  btn.addEventListener('click', () => sheet.showModal());
  sheet.addEventListener('click', e => { if (e.target === sheet || e.target.closest('[data-close-sheet]')) sheet.close(); });
  sheet.addEventListener('close', () => btn.focus());
}
function setFilterCount(active) {
  const fc = document.getElementById('fcount'); if (fc) fc.textContent = active ? String(active) : '';
  const ob = document.getElementById('open-filters'); if (ob) ob.setAttribute('aria-label', active ? `Filtres, ${active} actif${active > 1 ? 's' : ''}` : 'Filtres');
}

/* Carte d'une startup (répertoire) */
const entryCard = s => `<li><a class="entry" href="#fiche-${esc(s.id)}">
   <div class="entry-head"><h2>${esc(s.nom)}</h2>${status(s.statut_activite)}</div>
   <p class="entry-meta">${esc(s.secteur)}, ${esc(s.ville)}${s.annee_creation ? ', créée en ' + s.annee_creation : ''}</p>
   <p class="entry-desc">${esc(s.description)}</p>${flags(s)}
   <p class="entry-foot"><span>Financement : <b>${finLabel(s)}</b></span><span>${s.date_derniere_verification ? 'Vérifiée le ' + fdate(s.date_derniere_verification) : 'Pas encore vérifiée'}</span></p></a></li>`;

/* Répertoire */
const STATUTS = [['tous', 'Toutes'], ['active', 'Actives'], ['levee', 'En levée'], ['interrompue', 'Interrompues'], ['fermee', 'Fermées']];
const matchStatut = (s, k) => k === 'tous' || (k === 'levee' ? s.statut_financement === 'en_cours_declare' : s.statut_activite === k);

function repertoire() {
  const S = D.startups;
  const opt = (arr, v, all) => `<option value="">${all}</option>` + arr.map(x => `<option value="${esc(x.id)}"${x.id === v ? ' selected' : ''}>${esc(x.libelle || x.nom)}</option>`).join('');
  const usedS = D.secteurs.filter(x => S.some(s => s.secteur_id === x.id));
  view.innerHTML = `<div class="stack">
  <div class="page-head"><div><h1 tabindex="-1">Répertoire des startups guinéennes</h1>
   <p class="intro">Un répertoire structuré pour découvrir les startups, consulter leurs informations, vérifier leur activité et suivre leur évolution.</p></div>
   </div>
  <div class="filters" role="search">
   <label class="field grow">${searchIco}<span class="sr">Rechercher par nom, activité ou fondateur</span><input id="q" type="search" placeholder="Rechercher" value="${esc(st.q)}" autocomplete="off"></label>
   <label class="field wide-flex"><span class="label">Secteur</span><select id="secteur" data-k="secteur">${opt(usedS, st.secteur, 'Tous les secteurs')}</select>${chev}</label>
   <div class="seg wide-flex" role="group" aria-label="Filtrer par statut">${STATUTS.map(x => `<button type="button" data-statut="${x[0]}" aria-pressed="false">${x[1]}</button>`).join('')}</div>
   ${FILTER_BTN}
  </div>
  <div class="toolbar">
   <div class="result"><span id="rc" aria-live="polite"></span><button type="button" id="reset" class="linkbtn">Réinitialiser les filtres</button></div></div>
  <ul class="entries" id="list"></ul><p class="empty" id="empty" hidden>Aucune startup ne correspond à ces filtres.</p>
  <dialog id="fsheet" class="sheet" aria-labelledby="fs-title">
   <div class="sheet-head"><h2 id="fs-title">Filtrer les startups</h2><button type="button" class="linkbtn" data-close-sheet>Fermer</button></div>
   <label class="sheet-field"><span>Situation</span><span class="field"><select id="mstatut" data-k="statut">${STATUTS.map(x => `<option value="${x[0]}"${st.statut === x[0] ? ' selected' : ''}>${x[1]}</option>`).join('')}</select>${chev}</span></label>
   <label class="sheet-field"><span>Secteur</span><span class="field"><select id="msecteur" data-k="secteur">${opt(usedS, st.secteur, 'Tous les secteurs')}</select>${chev}</span></label>
   <div class="sheet-foot"><button type="button" class="btn" id="mreset">Réinitialiser</button><button type="button" class="btn primary" id="mshow" data-close-sheet></button></div>
  </dialog></div>`;
  document.getElementById('q').addEventListener('input', e => { st.q = e.target.value; list(); });
  view.querySelectorAll('select[data-k]').forEach(sel => sel.addEventListener('change', e => { st[e.target.dataset.k] = e.target.value; syncControls(); list(); }));
  document.getElementById('mreset').addEventListener('click', () => { Object.assign(st, { secteur: '', statut: 'tous' }); syncControls(); list(); });
  bindSheet();
  list();
}
/* Les filtres existent en deux présentations (barre sur ordinateur, panneau sur téléphone) : on garde les deux en phase */
function syncControls() {
  view.querySelectorAll('select[data-k]').forEach(sel => { sel.value = st[sel.dataset.k]; });
  const q = document.getElementById('q'); if (q && q.value !== st.q) q.value = st.q;
}
function list() {
  const q = st.q.trim().toLowerCase();
  const f = D.startups.filter(s => (!st.secteur || s.secteur_id === st.secteur) && matchStatut(s, st.statut) &&
    (!q || [s.nom, s.description, ...s.fondateurs.map(x => x.nom)].join(' ').toLowerCase().includes(q)));
  document.querySelectorAll('[data-statut]').forEach(b => { const on = b.dataset.statut === st.statut; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  const mst = document.getElementById('mstatut'); if (mst) mst.value = st.statut;
  setFilterCount((st.statut !== 'tous') + !!st.secteur);
  document.getElementById('list').innerHTML = f.map(entryCard).join('');
  document.getElementById('empty').hidden = f.length > 0;
  document.getElementById('rc').textContent = f.length + ' fiche' + (f.length > 1 ? 's' : '') + ' sur ' + D.startups.length;
  const ms = document.getElementById('mshow'); if (ms) ms.textContent = f.length ? `Voir ${f.length} fiche${f.length > 1 ? 's' : ''}` : 'Aucune fiche';
  document.getElementById('reset').hidden = !(st.q.trim() || st.secteur || st.statut !== 'tous');
}

/* Fiche */
function fiche(id) {
  const s = D.startups.find(x => x.id === id);
  if (!s) { view.innerHTML = `<div class="stack"><h1 tabindex="-1">Fiche introuvable</h1><p>Cette fiche n’existe pas ou n’est pas encore publiée.</p><p><a class="btn" href="#explorer">Retour au répertoire</a></p></div>`; return; }
  const last = s.verifications[0];
  const meta = [s.secteur, s.ville === s.region ? s.ville : `${s.ville} (région de ${s.region})`, s.annee_creation && 'créée en ' + s.annee_creation].filter(Boolean).map(esc).join(', ');
  const facts = [['Raison sociale', s.raison_sociale], ['Forme juridique', s.forme_juridique], ['Pays d’immatriculation', PAYS[s.pays_immatriculation] || s.pays_immatriculation], ['RCCM', s.rccm],
    ['Date d’immatriculation', fdate(s.date_creation_juridique)], ['Effectif', s.effectif], ...(s.categorie !== 'startup' ? [['Catégorie', lab('categorie', s.categorie)]] : [])];
  const known = facts.filter(f => f[1]), missing = facts.filter(f => !f[1]).map(f => f[0] === 'RCCM' ? f[0] : f[0].toLowerCase());
  const links = [s.site_web && ext(s.site_web, 'Site officiel'), s.linkedin_url && ext(s.linkedin_url, 'LinkedIn'), s.x_url && ext(s.x_url, 'X'), s.facebook_url && ext(s.facebook_url, 'Facebook'), s.instagram_url && ext(s.instagram_url, 'Instagram')].filter(Boolean);
  if (!links.length) missing.unshift('site web et réseaux sociaux');
  // Un événement « vérification » le même jour qu'une ligne de vérification fait doublon : on garde la vérification
  const vDates = new Set(s.verifications.map(v => v.date));
  const hist = [...s.verifications.filter(v => v !== last).map(v => ({ date: v.date, html: `<p><b>${esc(VERIF_TITLE[v.methode] || 'Vérification')}</b></p><p>${esc(v.resume)}</p><p class="small mute">Statut constaté : ${esc(lab('statut_activite', v.statut_constate))}</p>${srcLine(v.sources)}` })),
    ...s.evenements.filter(e => !(e.champ === 'statut_verification' && vDates.has(e.date))).map(e => ({ date: e.date, html: `<p><b>${esc(lab('champ', e.champ))}</b></p><p>${esc(e.motif)}</p>${srcLine(e.sources)}` }))]
    .sort((a, b) => a.date < b.date ? 1 : -1);
  const body = `Fiche : ${s.nom} (${location.origin}${location.pathname}#fiche-${s.id})\n\nInformation à corriger :\n\nValeur correcte :\n\nSource (lien ou explication) :\n`;
  view.innerHTML = `<div class="stack">
  <nav class="crumbs" aria-label="Fil d’Ariane"><a href="#explorer">Explorer</a><span aria-hidden="true">/</span><span aria-current="page">${esc(s.nom)}</span></nav>
  <header class="fiche-head"><h1 tabindex="-1">${esc(s.nom)}</h1><p class="mute">${meta}</p><p class="lead">${esc(s.description)}</p>
   ${links.length ? `<p class="links">${links.join('')}</p>` : ''}${srcLine(s.sources)}</header>
  <div class="fiche">
   <aside class="side" aria-label="Statut et vérification">
    <div class="panel">${status(s.statut_activite)}${flags(s)}
     ${last ? `<p>${esc(last.resume)}</p><p class="small mute">Vérifiée ${esc(VERIF_HOW[last.methode] || '')} le ${fdate(last.date)}.</p>` : '<p class="mute">Cette fiche n’a pas encore été vérifiée.</p>'}
     ${s.a_actualiser ? '<p class="small">La dernière vérification date de plus de 6 mois : la fiche est à actualiser.</p>' : ''}
     <dl class="kv"><dt>Niveau de confiance</dt><dd>${esc(lab('niveau_confiance', s.niveau_confiance))}</dd></dl>
     <div><dl class="kv"><dt>Complétude</dt><dd>${pct(s.completude)}</dd></dl><div class="meter" aria-hidden="true"><i style="width:${Number(s.completude) || 0}%"></i></div></div>
     <p class="note">Dans le registre depuis le ${fdate(s.date_ajout)}.</p></div>
    ${ext(ISSUE('correction.yml', 'Correction : ' + s.nom, body), 'Signaler une information incorrecte', 'btn')}
    <p class="small">Vous dirigez cette startup ? ${ext(ISSUE('revendication.yml', 'Revendication de fiche : ' + s.nom), 'Revendiquer la fiche')}</p>
   </aside>
   <div class="fiche-main">
    <section class="section"><h2>Entreprise</h2>
     ${known.length ? `<dl class="facts">${known.map(f => `<div><dt>${f[0]}</dt><dd>${esc(f[1])}</dd></div>`).join('')}</dl>` : ''}
     ${missing.length ? `<p class="note">Non renseigné : ${esc(missing.join(', '))}.</p>` : ''}</section>
    <section class="section"><h2>Fondateurs</h2>${s.fondateurs.length ? `<ul class="rows">${s.fondateurs.map(f => `<li><div><p><b>${esc(f.nom)}</b>, ${esc(f.role)}</p>${srcLine(f.sources)}</div>${f.linkedin_url ? ext(f.linkedin_url, 'LinkedIn') : ''}</li>`).join('')}</ul>` : '<p class="mute">Fondateurs non renseignés.</p>'}</section>
    <section class="section"><div class="section-head"><h2>Financements</h2><span class="small mute">${esc(lab('statut_financement', s.statut_financement))}</span></div>
     ${s.financements.length ? `<ul class="rows">${s.financements.map(r => `<li><div><p><b>${kind(r)}</b>, ${fdate(r.date)}${r.statut === 'en_cours_declare' ? ' ' + flag('En cours', 'fl-info') : ''}</p><p class="small mute">${esc(r.investisseurs.join(', ') || 'Financeurs non communiqués')}</p>${r.notes ? `<p class="small">${esc(r.notes)}</p>` : ''}${srcLine(r.sources)}</div><span class="amount">${money(r.montant, r.devise)}</span></li>`).join('')}</ul>` : '<p class="mute">Aucune levée connue. Cela ne signifie pas que l’entreprise n’a jamais levé de fonds.</p>'}</section>
    ${s.accompagnements.length ? `<section class="section"><h2>Accompagnement</h2><ul class="rows">${s.accompagnements.map(a => `<li><div><p><b>${esc(a.organisation)}</b>${a.programme ? ', ' + esc(a.programme) : ''}${a.annee ? ' (' + a.annee + ')' : ''}</p>${srcLine(a.sources)}</div></li>`).join('')}</ul></section>` : ''}
    <section class="section"><h2>Historique</h2>${hist.length ? `<ol class="tl">${hist.map(h => `<li><p class="when">${fdate(h.date)}</p>${h.html}</li>`).join('')}</ol>` : '<p class="mute">Aucun autre événement enregistré.</p>'}</section>
   </div></div></div>`;
}

/* Financements */
function financements() {
  const R = D.financements;
  const done = R.filter(r => r.statut === 'documente');
  const tot = done.reduce((a, r) => a + (r.montant_usd || 0), 0);
  const known = done.filter(r => r.montant != null).length;
  const types = [...new Set(R.map(r => r.type_financement))];
  view.innerHTML = `<div class="stack">
  <div><h1 tabindex="-1">Financements documentés</h1><p class="intro">Investissements, subventions, prix et dette, chacun avec sa source. Montants dans leur devise d’origine, totaux en dollars US.</p></div>
  <p class="summary">Montant total documenté : <b>${usd(tot)}</b>${known < done.length ? ` (${done.length - known} opération${done.length - known > 1 ? 's' : ''} sans montant connu)` : ''}.</p>
  <div class="toolbar with-btn">
   <div class="filters wide-flex">
    <label class="field"><span class="label">Type</span><select id="ftype" data-k="ftype"><option value="">Tous les types</option>${types.map(t => `<option value="${esc(t)}">${esc(lab('type_financement', t))}</option>`).join('')}</select>${chev}</label>
    <div class="seg" role="group" aria-label="Filtrer par état">${ETATS.map(x => `<button type="button" data-fetat="${x[0]}" aria-pressed="false">${x[1]}</button>`).join('')}</div>
   </div>
   <div class="result"><span id="frc" aria-live="polite"></span><button type="button" id="freset" class="linkbtn">Réinitialiser</button></div>${FILTER_BTN}</div>
  <dialog id="fsheet" class="sheet" aria-labelledby="fs-title">
   <div class="sheet-head"><h2 id="fs-title">Filtrer les financements</h2><button type="button" class="linkbtn" data-close-sheet>Fermer</button></div>
   <label class="sheet-field"><span>État</span><span class="field"><select id="mfetat" data-k="fetat">${ETATS.map(x => `<option value="${x[0]}">${x[1]}</option>`).join('')}</select>${chev}</span></label>
   <label class="sheet-field"><span>Type</span><span class="field"><select id="mftype" data-k="ftype"><option value="">Tous les types</option>${types.map(t => `<option value="${esc(t)}">${esc(lab('type_financement', t))}</option>`).join('')}</select>${chev}</span></label>
   <div class="sheet-foot"><button type="button" class="btn" id="mreset">Réinitialiser</button><button type="button" class="btn primary" id="mshow" data-close-sheet></button></div>
  </dialog>
  <div class="scroll"><table class="rtable"><caption class="sr">Opérations de financement, de la plus récente à la plus ancienne</caption>
  <thead><tr><th scope="col">Date</th><th scope="col">Startup</th><th scope="col">Type</th><th scope="col" class="num">Montant</th><th scope="col">Financeurs</th><th scope="col">Source</th></tr></thead><tbody id="rounds"></tbody></table></div></div>`;
  view.querySelectorAll('select[data-k]').forEach(sel => sel.addEventListener('change', e => { st[e.target.dataset.k] = e.target.value; rounds(); }));
  document.getElementById('mreset').addEventListener('click', () => { st.ftype = ''; st.fetat = ''; rounds(); });
  bindSheet();
  rounds();
}
function rounds() {
  const R = D.financements, f = R.filter(r => (!st.ftype || r.type_financement === st.ftype) && (!st.fetat || r.statut === st.fetat));
  document.querySelectorAll('[data-fetat]').forEach(b => { const on = b.dataset.fetat === st.fetat; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  syncControls();
  const label = n => n + ' opération' + (n > 1 ? 's' : '');
  document.getElementById('frc').textContent = `${label(f.length)} sur ${R.length}`;
  document.getElementById('freset').hidden = !(st.ftype || st.fetat);
  document.getElementById('mshow').textContent = f.length ? `Voir ${label(f.length)}` : 'Aucune opération';
  setFilterCount(!!st.ftype + !!st.fetat);
  document.getElementById('rounds').innerHTML = f.map(r => `<tr>
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
  <div><h1 tabindex="-1">Indicateurs</h1><p class="intro">Chiffres recalculés à chaque mise à jour du registre.</p></div>
  <section class="stack"><h2>Qualité des données</h2>${table(quality, 'Indicateurs de qualité des données')}</section>
  <section class="stack"><h2>Périmètre</h2>${table(scope, 'Périmètre du registre')}</section>
  <div class="cols">
   <section class="stack"><h2>Statut d’activité</h2>${bars(Object.entries(I.par_statut_activite).map(([k, v]) => [lab('statut_activite', k), v]), I.fiches_publiees)}</section>
   <section class="stack"><h2>Fiches par secteur</h2>${bars(secRows, secRows.length ? secRows[0][1] : 0)}</section>
  </div>
  <section class="stack"><div><h2>Montants documentés par année</h2><p class="small mute">Contre-valeur en dollars US, opérations réalisées uniquement.</p></div>${bars(yRows, Math.max(0, ...yRows.map(r => r[1])))}</section>
  <section class="stack" id="evolutions" tabindex="-1"><div><h2>Évolutions</h2><p class="small mute">Chaque changement, du plus récent au plus ancien, avec sa preuve.</p></div>${evolutionsList()}</section>
  </div>`;
}

/* Évolutions */
function evolutionsList() {
  const E = D.evenements;
  return E.length ? `<ol class="tl">${E.map(e => `<li><p class="when">${fdate(e.date)}</p><p class="flags">${flag(lab('champ', e.champ), e.champ === 'statut_activite' ? (STATUS_FLAG[e.nouvelle_valeur] || 'fl-neu') : (EVENT_FLAG[e.champ] || 'fl-neu'))}<a href="#fiche-${esc(e.startup_id)}"><b>${esc(e.startup)}</b></a></p><p>${esc(e.motif)}</p>${srcLine(e.sources)}</li>`).join('')}</ol>` : '<p class="empty">Aucun événement enregistré.</p>';
}

/* Méthodologie */
function methodologie() {
  const d = D.definitions;
  const defs = k => `<dl class="defs">${Object.entries(d[k]).map(([v, t]) => `<dt>${esc(lab(k, v)).replace(/^./, c => c.toUpperCase())}</dt><dd>${esc(t)}</dd>`).join('')}</dl>`;
  const gh = p => `https://github.com/${REPO}/blob/main/${p}`;
  view.innerHTML = `<article class="prose">
  <h1 tabindex="-1">Méthodologie</h1>
  <p>Comment les startups sont choisies, comment chaque information est vérifiée et ce que signifie chaque statut.</p>
  <h2>Ce que nous recensons</h2>
  <p>Une startup est une entreprise qui a une activité innovante identifiable et une ambition de croissance reproductible. Les PME traditionnelles, associations, ONG et projets étudiants n’en font pas partie. Les projets sans activité identifiable sont classés à part, comme projets précoces.</p>
  <h2>Nos règles</h2>
  <ul><li><b>Traçabilité.</b> Chaque information importante a une source et une date de vérification.</li>
  <li><b>Neutralité.</b> Visibilité médiatique, activité réelle et réussite commerciale sont des choses distinctes.</li>
  <li><b>Actualisation.</b> Au-delà de 6 mois sans vérification, une fiche active est signalée « à actualiser ».</li></ul>
  <h2>Statut d’activité</h2>${defs('statut_activite')}
  <p class="small mute">Une absence d’information récente ne constitue jamais une preuve de fermeture.</p>
  <h2>Statut de vérification</h2>${defs('statut_verification')}
  <h2>Niveau de confiance</h2>${defs('niveau_confiance')}
  <h2>Types de financement</h2>${defs('type_financement')}
  <p class="small mute">« Aucune levée connue » ne veut pas dire que l’entreprise n’a jamais levé de fonds. Aucun montant n’est publié sans source.</p>
  <h2>Autres termes</h2>
  <dl class="defs"><dt>En levée</dt><dd>Levée de fonds annoncée par l’entreprise comme en cours, pas encore finalisée. Son montant n’entre dans les totaux qu’une fois l’opération réalisée et sourcée.</dd>
  <dt>Complétude</dt><dd>Part des informations essentielles renseignées sur la fiche : description, secteur, ville, année de création, site web, forme juridique, effectif, page LinkedIn et fondateurs.</dd>
  <dt>À actualiser</dt><dd>Fiche active dont la dernière vérification date de plus de 6 mois.</dd></dl>
  <h2>Données</h2>
  <p>L’ensemble du registre est téléchargeable librement sous licence CC BY 4.0 (voir les <a href="#cgu">conditions d’utilisation</a>) : <a href="data/registre.json" download>télécharger les données (JSON)</a>.</p>
  <h2>Contribuer</h2>
  <p>Pour corriger ou compléter le registre, passez par la page <a href="#contact">Contact</a>. Toute contribution est vérifiée avant publication.</p>
  <p class="small">Documents de référence : ${ext(gh('docs/protocole-verification.md'), 'protocole de vérification')}, ${ext(gh('docs/dictionnaire-donnees.md'), 'dictionnaire de données')}, ${ext(gh('docs/definition-startup.md'), 'définition d’une startup')}.</p>
  </article>`;
}

/* À propos */
function apropos() {
  view.innerHTML = `<article class="prose">
  <h1 tabindex="-1">À propos</h1>
  <p>StartupGuineeIQ est un registre indépendant des startups créées en Guinée ou qui développent leur activité sur le marché guinéen. Il rassemble, pour chaque entreprise, son activité, ses fondateurs, ses financements et son statut, avec les sources qui les justifient.</p>
  <h2>Pourquoi ce registre</h2>
  <p>Les informations sur les startups guinéennes sont dispersées : articles, réseaux sociaux, listes de concours, pages d’incubateurs. Elles sont rarement datées et presque jamais vérifiées. Une startup qui ne publie plus n’est pas forcément fermée, et une levée annoncée n’est pas toujours réalisée. Le registre distingue ces situations, preuve à l’appui.</p>
  <h2>Ce que nous faisons</h2>
  <ul><li>Recenser les startups guinéennes identifiables.</li>
  <li>Vérifier les informations essentielles et dater chaque vérification.</li>
  <li>Citer la source de chaque information importante.</li>
  <li>Publier des ${'<a href="#indicateurs">indicateurs</a>'} calculés à partir du registre.</li></ul>
  <h2>Ce que nous ne faisons pas</h2>
  <ul><li>Noter ou classer les startups.</li>
  <li>Donner des conseils d’investissement.</li>
  <li>Laisser une entreprise payer pour figurer au registre ou modifier sa fiche.</li></ul>
  <h2>Où en est le projet</h2>
  <p>Le référentiel est en cours de constitution. Les startups affichées aujourd’hui sont des données de démonstration fictives : elles seront remplacées par des fiches réelles et vérifiées avant le lancement public.</p>
  <h2>En savoir plus</h2>
  <p>La façon dont les informations sont collectées et vérifiées est décrite dans la <a href="#methodologie">méthodologie</a>. Pour toute question, consultez la page <a href="#contact">contact</a>.</p>
  </article>`;
}

/* Contact */
function contact() {
  const hasMail = typeof SG_CONTACT === 'string' && SG_CONTACT;
  const write = hasMail
    ? `<p><a href="mailto:${SG_CONTACT}">${SG_CONTACT}</a></p>
  <p>Pour une question sur le registre, une demande presse ou partenariat, l’exercice de vos droits sur vos données personnelles, ou un signalement confidentiel. Nous répondons en général sous 7 jours.</p>`
    : `<p>L’adresse de contact du projet est en cours de création. En attendant :</p>
  <ul><li>pour une question, une demande presse ou partenariat, ${ext(`https://github.com/${REPO}/issues/new/choose`, 'ouvrez une demande sur GitHub')} ;</li>
  <li>pour une demande confidentielle (données personnelles, contenu illicite), ouvrez une demande en écrivant seulement « Demande confidentielle », sans aucun détail : nous vous indiquerons comment nous la transmettre en privé.</li></ul>`;
  view.innerHTML = `<article class="prose">
  <h1 tabindex="-1">Contact</h1>
  <h2>Écrire à l’équipe</h2>
  ${write}
  <h2>Corriger ou compléter le registre</h2>
  <p>Ces demandes passent par des formulaires sur GitHub, pour garder une trace de chaque modification. Ils sont <b>publics</b> : n’y indiquez aucune information personnelle.</p>
  <ul><li>${ext(ISSUE('nouvelle-startup.yml', 'Nouvelle startup : '), 'Proposer une startup')}</li>
  <li>${ext(ISSUE('correction.yml', 'Correction : '), 'Signaler une information incorrecte')}</li>
  <li>${ext(ISSUE('revendication.yml', 'Revendication de fiche : '), 'Revendiquer la fiche de votre startup')}</li></ul>
  <h2 id="signalements" tabindex="-1">Gestion des signalements</h2>
  ${LEGAL_PARTS.signalements ? sub(LEGAL_PARTS.signalements.html).split('écrivez à ' + SG_MAIL).join(hasMail ? 'écrivez à l’adresse ci-dessus' : 'utilisez la demande confidentielle décrite plus haut') : ''}
  </article>`;
}

const VIEWS = { explorer: repertoire, financements, indicateurs, methodologie, 'a-propos': apropos, contact };
const TITLES = { explorer: 'Explorer les startups', financements: 'Financements', indicateurs: 'Indicateurs', methodologie: 'Méthodologie', 'a-propos': 'À propos', contact: 'Contact' };
/* Anciennes adresses : elles ouvrent la page qui contient désormais la section, à la bonne place */
const ALIASES = { accueil: ['explorer'], repertoire: ['explorer'], evolutions: ['indicateurs', 'evolutions'], signalements: ['contact', 'signalements'], cookies: ['confidentialite', 'cookies'], 'propriete-intellectuelle': ['cgu', 'licence'] };
/* Pages légales (assets/legal.js) : des pages de texte, qui ne dépendent pas des données du registre */
const LEGAL_PARTS = typeof sgLegal === 'function' ? sgLegal(ext) : {};
/* Une section intégrée dans une autre page : ses titres descendent d'un niveau */
function sub(html) { return html.replace(/<(\/?)h2>/g, '<$1h3>'); }
const LEGAL = {};
if (LEGAL_PARTS['mentions-legales']) {
  LEGAL['mentions-legales'] = LEGAL_PARTS['mentions-legales'];
  LEGAL.confidentialite = { title: LEGAL_PARTS.confidentialite.title, html: LEGAL_PARTS.confidentialite.html + `<h2 id="cookies" tabindex="-1">Cookies</h2>${sub(LEGAL_PARTS.cookies.html)}` };
  LEGAL.cgu = { title: LEGAL_PARTS.cgu.title, html: LEGAL_PARTS.cgu.html + `<h2 id="licence" tabindex="-1">Propriété intellectuelle et licence</h2>${sub(LEGAL_PARTS['propriete-intellectuelle'].html)}<p><a href="data/registre.json">Télécharger les données du registre (JSON)</a></p>` };
}
Object.entries(LEGAL).forEach(([k, p]) => {
  TITLES[k] = p.title;
  VIEWS[k] = () => { view.innerHTML = `<article class="prose legal"><h1 tabindex="-1">${p.title}</h1><p class="small mute">Dernière mise à jour : ${SG_LEGAL_UPDATED}</p>${p.html}</article>`; };
});
let first = true;
function route() {
  const raw = location.hash.slice(1) || 'explorer';
  const [h, anchor] = ALIASES[raw] || [raw];
  const v = h.startsWith('fiche-') ? 'fiche' : (VIEWS[h] ? h : 'explorer');
  document.querySelectorAll('#nav a, .drawer-nav a').forEach(a => {
    const on = a.dataset.v === v || (v === 'fiche' && a.dataset.v === 'explorer') || (a.dataset.v === h);
    a.classList.toggle('on', on);
    if (a.dataset.v === v) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  if (v === 'fiche') { const s = D.startups.find(x => x.id === h.slice(6)); fiche(h.slice(6)); document.title = (s ? s.nom : 'Fiche introuvable') + ' | StartupGuineeIQ'; }
  else { VIEWS[v](); document.title = v === 'explorer' ? 'StartupGuineeIQ, registre des startups guinéennes' : TITLES[v] + ' | StartupGuineeIQ'; }
  // Au changement de vue : retour en haut et focus sur le titre, pour le clavier et les lecteurs d'écran
  const target = anchor && document.getElementById(anchor);
  if (target) { target.scrollIntoView(); target.focus({ preventScroll: true }); }
  else if (!first) { window.scrollTo(0, 0); const h1 = view.querySelector('h1'); if (h1) h1.focus({ preventScroll: true }); }
  first = false;
}

document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.statut !== undefined) { st.statut = b.dataset.statut; list(); }
  else if (b.dataset.fetat !== undefined) { st.fetat = b.dataset.fetat; rounds(); }
  else if (b.id === 'freset') { st.ftype = ''; st.fetat = ''; rounds(); }
  else if (b.id === 'reset') {
    Object.assign(st, { q: '', secteur: '', statut: 'tous' });
    syncControls(); list(); document.getElementById('q').focus();
  }
});
window.addEventListener('hashchange', route);

/* Menu latéral (téléphone) : dialog modal, donc focus piégé et touche Échap gérés par le navigateur */
const drawer = document.getElementById('drawer'), menuBtn = document.getElementById('menu-btn');
menuBtn.addEventListener('click', () => { drawer.showModal(); menuBtn.setAttribute('aria-expanded', 'true'); });
drawer.addEventListener('click', e => { if (e.target === drawer || e.target.closest('[data-close-drawer]')) drawer.close(); });
drawer.addEventListener('close', () => menuBtn.setAttribute('aria-expanded', 'false'));
// Si l'écran s'élargit (rotation), le menu n'a plus lieu d'être
matchMedia('(min-width: 601px)').addEventListener('change', e => { if (e.matches && drawer.open) drawer.close(); });

fetch('data/registre.json', { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error('erreur ' + r.status); return r.json(); }).then(data => {
  D = data;
  document.getElementById('demo').hidden = !D.contient_demo;
  route();
}).catch(err => {
  view.innerHTML = `<div class="stack"><h1>Le registre n’a pas pu être chargé</h1><p>${esc(err.message)}. Réessayez dans quelques instants. En local, lancez <code>python -m http.server -d site</code> après <code>python scripts/build.py</code>.</p></div>`;
});
/* Fonctions partagées avec l'assistant (assets/assistant.js) */
window.SGA = { get D() { return D; }, esc, fdate, usd, lab };
}
