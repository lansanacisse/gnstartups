/* Startup Guinée : site statique alimenté par data/registre.json (généré par scripts/build.py). */
{
const REPO = 'lansanacisse/gnstartups';
const ISSUE = (template, title, body) => `https://github.com/${REPO}/issues/new?template=${template}&title=${encodeURIComponent(title)}${body ? '&body=' + encodeURIComponent(body) : ''}`;
const FRESH_DAYS = 183;

const L = {
  statut_activite: { active: 'Active', interrompue: 'Activité interrompue', fermee: 'Fermée', inconnue: 'Statut inconnu' },
  statut_verification: { verifiee: 'Vérifiée', a_verifier: 'À vérifier', contestee: 'Contestée' },
  statut_financement: { aucune_levee_connue: 'Aucune levée connue', levee_documentee: 'Levée documentée', en_cours_declare: 'Levée en cours déclarée' },
  niveau_confiance: { eleve: 'Élevé', moyen: 'Moyen', faible: 'Faible' },
  type_financement: { investissement: 'Investissement', subvention: 'Subvention', prix: 'Prix / concours', dette: 'Dette', autre: 'Autre' },
  tour: { pre_seed: 'Pré-seed', seed: 'Seed', serie_a: 'Série A', serie_b: 'Série B', serie_c_plus: 'Série C+', non_applicable: '', inconnu: 'Tour non communiqué' },
  methode_verification: { entretien: 'Entretien', verification_en_ligne: 'Vérification en ligne', registre: 'Registre officiel', tiers: 'Confirmation par un tiers', visite: 'Visite sur place' },
  type_source: { site_officiel: 'Site officiel', registre: 'Registre', communique: 'Communiqué', presse: 'Presse', entretien: 'Entretien', incubateur: 'Incubateur', reseau_professionnel: 'Réseau professionnel', contribution: 'Contribution', autre: 'Autre' },
  champ: { ajout: 'Ajout au registre', statut_activite: 'Statut d’activité', statut_verification: 'Vérification', financement: 'Financement' },
  categorie: { startup: 'Startup', projet_precoce: 'Projet précoce' }
};
const C = {
  active: ['#E3F1EA', '#0B5A3D'], interrompue: ['#FBEEDB', '#7A4806'], fermee: ['#F6E1DE', '#8E2A22'], inconnue: ['#ECEBE6', '#3a3938'],
  a_verifier: ['#ECEBE6', '#3a3938'], contestee: ['#F6E1DE', '#8E2A22'], verifiee: ['#E3F1EA', '#0B5A3D'],
  en_cours_declare: ['#E4ECF7', '#1E4E8C'], a_actualiser: ['#FBEEDB', '#7A4806'], ajout: ['#E6EAF0', '#33405A']
};
const MO = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const url = u => /^https?:\/\//.test(u || '') ? esc(u) : '#';
const lab = (k, v) => (L[k] && L[k][v] !== undefined) ? L[k][v] : v;
const fdate = d => { if (!d) return ''; const p = d.split('-'); return parseInt(p[2], 10) + ' ' + MO[parseInt(p[1], 10) - 1] + ' ' + p[0]; };
const usd = n => n == null ? 'Montant non divulgué' : n >= 1e6 ? (n / 1e6).toFixed(1).replace('.0', '').replace('.', ',') + ' M$' : Math.round(n / 1000) + ' k$';
const money = (m, dev) => m == null ? 'Montant non divulgué' : dev === 'USD' ? usd(m) : new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(m) + ' ' + esc(dev);
const badge = (text, key) => { const c = C[key] || ['#ECEBE6', '#3a3938']; return `<span class="badge" style="background:${c[0]};color:${c[1]}">${esc(text)}</span>`; };
const ini = n => esc(n.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase());
const pct = v => v == null ? '–' : String(v).replace('.', ',') + ' %';
const chev = '<svg class="chev" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
const srcLine = list => list && list.length ? `<div class="src">Source${list.length > 1 ? 's' : ''} : ${list.map(s => (s.url ? `<a href="${url(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.titre)}</a>` : esc(s.titre)) + ` (${esc(lab('type_source', s.type))}${s.date_publication ? ', ' + fdate(s.date_publication) : ''})`).join(' ; ')}</div>` : '';

let D = null;
const st = { q: '', secteur: '', ville: '', statut: 'tous', ftype: '' };
const view = document.getElementById('view');

function badges(s) {
  let h = badge(lab('statut_activite', s.statut_activite), s.statut_activite);
  if (s.statut_verification !== 'verifiee') h += badge(lab('statut_verification', s.statut_verification), s.statut_verification);
  if (s.statut_financement === 'en_cours_declare') h += badge('En levée', 'en_cours_declare');
  if (s.a_actualiser) h += badge('À actualiser', 'a_actualiser');
  return h;
}
const finLabel = s => {
  const done = s.financements.filter(r => r.statut === 'documente');
  if (!done.length) return 'aucune levée connue';
  const tot = done.reduce((a, r) => a + (r.montant_usd || 0), 0);
  return (tot ? usd(tot) + ' ' : '') + '(' + done.length + ' opération' + (done.length > 1 ? 's' : '') + ')';
};

/* Répertoire */
function repertoire() {
  const S = D.startups;
  const statuts = [['tous', 'Toutes'], ['active', 'Actives'], ['levee', 'En levée'], ['interrompue', 'Interrompues'], ['fermee', 'Fermées'], ['a_verifier', 'À vérifier']];
  const n = k => k === 'tous' ? S.length : k === 'levee' ? S.filter(s => s.statut_financement === 'en_cours_declare').length : k === 'a_verifier' ? S.filter(s => s.statut_verification !== 'verifiee').length : S.filter(s => s.statut_activite === k).length;
  const opt = (arr, v, all) => `<option value="">${all}</option>` + arr.map(x => `<option value="${esc(x.id)}"${x.id === v ? ' selected' : ''}>${esc(x.libelle || x.nom)}</option>`).join('');
  const usedS = D.secteurs.filter(x => S.some(s => s.secteur_id === x.id));
  const usedV = D.villes.filter(x => S.some(s => s.ville_id === x.id));
  view.innerHTML = `<div class="col">
  <div class="between" style="align-items:flex-end"><div><h1>Répertoire des startups guinéennes</h1>
  <p class="intro">Chaque fiche indique le statut d’activité, la preuve qui le justifie et la date de la dernière vérification.</p></div>
  <a class="btn ghost" href="${ISSUE('nouvelle-startup.yml', 'Nouvelle startup : ')}" target="_blank" rel="noopener noreferrer">Proposer une startup</a></div>
  <div class="filters">
   <label class="field grow"><span class="sr">Rechercher une startup</span><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="color:var(--mute)"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input id="q" type="search" placeholder="Nom, activité, fondateur…" value="${esc(st.q)}"></label>
   <label class="field"><span class="mute sm">Secteur</span><select id="secteur">${opt(usedS, st.secteur, 'Tous')}</select>${chev}</label>
   <label class="field"><span class="mute sm">Ville</span><select id="ville">${opt(usedV, st.ville, 'Toutes')}</select>${chev}</label>
  </div>
  <div class="between"><div class="seg" role="group" aria-label="Filtrer par statut">${statuts.map(x => `<button data-statut="${x[0]}" class="${st.statut === x[0] ? 'on' : ''}" aria-pressed="${st.statut === x[0]}">${x[1]} <small>${n(x[0])}</small></button>`).join('')}</div>
  <div class="flex mute" style="font-size:14px"><span id="rc" aria-live="polite"></span><button id="reset" class="btn ghost" style="min-height:40px;padding:6px 14px;font-size:14px">Réinitialiser</button></div></div>
  <div class="grid dir" id="list"></div><div class="empty" id="empty" hidden>Aucune startup ne correspond à ces filtres.</div></div>`;
  list();
  document.getElementById('q').addEventListener('input', e => { st.q = e.target.value; list(); });
  document.getElementById('secteur').addEventListener('change', e => { st.secteur = e.target.value; list(); });
  document.getElementById('ville').addEventListener('change', e => { st.ville = e.target.value; list(); });
}
function list() {
  const q = st.q.trim().toLowerCase();
  const f = D.startups.filter(s =>
    (!st.secteur || s.secteur_id === st.secteur) && (!st.ville || s.ville_id === st.ville) &&
    (st.statut === 'tous' || (st.statut === 'levee' ? s.statut_financement === 'en_cours_declare' : st.statut === 'a_verifier' ? s.statut_verification !== 'verifiee' : s.statut_activite === st.statut)) &&
    (!q || [s.nom, s.description, ...s.fondateurs.map(x => x.nom)].join(' ').toLowerCase().includes(q)));
  document.getElementById('list').innerHTML = f.map(s => `<a class="sc" href="#fiche-${esc(s.id)}">
   <div class="flex"><div class="av" aria-hidden="true">${ini(s.nom)}</div><div><div style="font-weight:600;font-size:17px;letter-spacing:-.03em">${esc(s.nom)}</div><div class="mute sm">${esc(s.secteur)}, ${esc(s.ville)}${s.annee_creation ? ', ' + s.annee_creation : ''}</div></div></div>
   <div class="wrapf">${badges(s)}</div>
   <div class="sm" style="color:var(--ink2)">${esc(s.description)}</div>
   <div class="sm">Financement : <strong>${finLabel(s)}</strong></div>
   <div class="mute xs">${s.date_derniere_verification ? 'Vérifiée le ' + fdate(s.date_derniere_verification) : 'Pas encore vérifiée'}</div></a>`).join('');
  document.getElementById('empty').hidden = f.length > 0;
  document.getElementById('rc').textContent = f.length + ' fiche' + (f.length > 1 ? 's' : '') + ' sur ' + D.startups.length;
  document.getElementById('reset').hidden = !(st.q.trim() || st.secteur || st.ville || st.statut !== 'tous');
}

/* Fiche */
function fiche(id) {
  const s = D.startups.find(x => x.id === id);
  if (!s) { view.innerHTML = `<div class="empty">Cette fiche n’existe pas ou n’est pas publiée. <a href="#repertoire">Retour au répertoire</a></div>`; return; }
  const last = s.verifications[0];
  const facts = [['Secteur', s.secteur], ['Siège', s.ville === s.region ? s.ville : s.ville + ' (région de ' + s.region + ')'], ['Année de création', s.annee_creation], ['Raison sociale', s.raison_sociale],
    ['Forme juridique', s.forme_juridique], ['Pays d’immatriculation', s.pays_immatriculation], ['RCCM', s.rccm], ['Date d’immatriculation', fdate(s.date_creation_juridique)],
    ['Effectif', s.effectif], ['Catégorie', lab('categorie', s.categorie)]];
  const links = [s.site_web && `<a href="${url(s.site_web)}" target="_blank" rel="noopener noreferrer">Site officiel</a>`, s.linkedin_url && `<a href="${url(s.linkedin_url)}" target="_blank" rel="noopener noreferrer">Page LinkedIn</a>`].filter(Boolean);
  const hist = [...s.verifications.map(v => ({ date: v.date, html: `<b>Vérification : ${esc(lab('methode_verification', v.methode))}</b><div>${esc(v.resume)}</div><div class="mute sm">Statut constaté : ${esc(lab('statut_activite', v.statut_constate))}</div>${srcLine(v.sources)}` })),
    ...s.evenements.map(e => ({ date: e.date, html: `<b>${esc(lab('champ', e.champ))}</b><div>${esc(e.motif)}</div>${srcLine(e.sources)}` }))].sort((a, b) => a.date < b.date ? 1 : -1);
  const body = `Fiche : ${s.nom} (${location.origin}${location.pathname}#fiche-${s.id})\n\nInformation à corriger :\n\nValeur correcte :\n\nSource (lien ou explication) :\n`;
  view.innerHTML = `<div class="col">
  <a href="#repertoire" class="sm mute">← Répertoire</a>
  <div class="flex" style="align-items:flex-start"><div class="av" aria-hidden="true" style="width:56px;height:56px;border-radius:14px;font-size:20px;background:var(--card)">${ini(s.nom)}</div>
  <div class="col" style="gap:8px"><h1>${esc(s.nom)}</h1><div class="wrapf">${badges(s)}${badge(lab('statut_financement', s.statut_financement), s.statut_financement === 'en_cours_declare' ? 'en_cours_declare' : 'x')}</div></div></div>
  <div class="fiche"><div class="col">
   <p style="font-size:17px;max-width:720px">${esc(s.description)}</p>
   ${links.length ? `<div class="wrapf" style="gap:16px">${links.join('')}</div>` : ''}
   ${srcLine(s.sources)}
   <section class="card"><h2 style="margin-bottom:14px">Entreprise</h2><div class="facts">${facts.map(f => `<div><span class="mute xs">${f[0]}</span><b>${f[1] ? esc(f[1]) : '<span class="mute">Non renseigné</span>'}</b></div>`).join('')}</div></section>
   <section class="card"><h2 style="margin-bottom:12px">Fondateurs</h2>${s.fondateurs.length ? `<div class="col" style="gap:8px">${s.fondateurs.map(f => `<div class="fd"><div class="av" aria-hidden="true">${ini(f.nom)}</div><div style="flex:1 1 auto"><b>${esc(f.nom)}</b><div class="mute sm">${esc(f.role)}</div>${srcLine(f.sources)}</div>${f.linkedin_url ? `<a class="btn" style="min-height:36px;padding:6px 14px;font-size:13px" href="${url(f.linkedin_url)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>` : ''}</div>`).join('')}</div>` : '<p class="mute">Fondateurs non renseignés.</p>'}</section>
   <section class="card"><h2 style="margin-bottom:4px">Financements</h2>${s.financements.length ? s.financements.map(r => `<div class="rr"><div><b>${esc(lab('type_financement', r.type_financement))}${lab('tour', r.tour) ? ', ' + esc(lab('tour', r.tour)) : ''} · ${fdate(r.date)}</b>${r.statut === 'en_cours_declare' ? ' ' + badge('En cours déclaré', 'en_cours_declare') : ''}<div class="mute sm">${esc(r.investisseurs.join(', ') || 'Financeurs non communiqués')}</div>${r.notes ? `<div class="sm">${esc(r.notes)}</div>` : ''}${srcLine(r.sources)}</div><b class="num">${money(r.montant, r.devise)}</b></div>`).join('') : '<p class="mute" style="margin-top:8px">Aucune levée connue. Cela ne signifie pas que l’entreprise n’a jamais levé de fonds.</p>'}</section>
   ${s.accompagnements.length ? `<section class="card"><h2 style="margin-bottom:8px">Écosystème</h2>${s.accompagnements.map(a => `<div class="rr"><div><b>${esc(a.organisation)}</b><div class="mute sm">${esc(a.programme || '')}${a.annee ? ', ' + a.annee : ''}</div>${srcLine(a.sources)}</div></div>`).join('')}</section>` : ''}
   <section class="card"><h2 style="margin-bottom:14px">Historique</h2>${hist.length ? `<div class="tl">${hist.map(h => `<div><div class="mute xs">${fdate(h.date)}</div>${h.html}</div>`).join('')}</div>` : '<p class="mute">Aucun événement enregistré.</p>'}</section>
  </div>
  <aside class="side">
   <div class="card"><h3>Preuve du statut</h3>${last ? `<p>${esc(last.resume)}</p><p class="mute sm" style="margin-top:6px">Dernière vérification : ${fdate(last.date)} (${esc(lab('methode_verification', last.methode))})</p>` : '<p class="mute">Pas encore vérifiée.</p>'}
    ${s.a_actualiser ? `<p class="sm" style="margin-top:8px;color:#7A4806">Vérification de plus de 6 mois : fiche à actualiser.</p>` : ''}</div>
   <div class="card"><div class="between"><span class="mute sm">Niveau de confiance</span><b>${esc(lab('niveau_confiance', s.niveau_confiance))}</b></div>
    <div class="between" style="margin-top:10px"><span class="mute sm">Complétude</span><b>${pct(s.completude)}</b></div><div class="meter"><i style="width:${s.completude || 0}%"></i></div>
    <p class="mute xs" style="margin-top:10px">Dans le registre depuis le ${fdate(s.date_ajout)}.</p></div>
   <a class="btn" href="${ISSUE('correction.yml', 'Correction : ' + s.nom, body)}" target="_blank" rel="noopener noreferrer">Signaler une information incorrecte</a>
   <a class="btn ghost" href="${ISSUE('revendication.yml', 'Revendication de fiche : ' + s.nom)}" target="_blank" rel="noopener noreferrer">Je suis fondateur de cette startup</a>
   <p class="mute xs">Les corrections sont vérifiées avant publication. Les entreprises ne modifient pas directement leur fiche.</p>
  </aside></div></div>`;
}

/* Financements */
function financements() {
  const R = D.financements;
  const done = R.filter(r => r.statut === 'documente');
  const tot = done.reduce((a, r) => a + (r.montant_usd || 0), 0);
  const types = [...new Set(R.map(r => r.type_financement))];
  const rows = R.filter(r => !st.ftype || r.type_financement === st.ftype);
  view.innerHTML = `<div class="col">
  <div><h1>Financements documentés</h1><p class="intro">Investissements, subventions, prix et dette, toujours avec leur source. Les montants sont affichés dans leur devise d’origine ; les totaux utilisent la contre-valeur en dollars.</p></div>
  <div class="grid kpis">${[['Total documenté', usd(tot)], ['Opérations documentées', done.length], ['Dont montant connu', done.filter(r => r.montant != null).length], ['Levées en cours déclarées', R.filter(r => r.statut === 'en_cours_declare').length]].map(k => `<div class="card"><div class="mute sm">${k[0]}</div><div class="kv">${k[1]}</div></div>`).join('')}</div>
  <div class="seg" role="group" aria-label="Type de financement" style="align-self:flex-start"><button data-ftype="" class="${!st.ftype ? 'on' : ''}">Tous</button>${types.map(t => `<button data-ftype="${esc(t)}" class="${st.ftype === t ? 'on' : ''}">${esc(lab('type_financement', t))}</button>`).join('')}</div>
  <div class="card scroll" style="padding:0"><table class="stack"><thead><tr><th>Date</th><th>Startup</th><th>Type</th><th class="num">Montant</th><th>Financeurs</th><th>Source</th></tr></thead><tbody>
  ${rows.map(r => `<tr><td data-l="Date" class="mute" style="white-space:nowrap">${fdate(r.date)}</td><td data-l="Startup"><a href="#fiche-${esc(r.startup_id)}"><b>${esc(r.startup)}</b></a></td><td data-l="Type">${esc(lab('type_financement', r.type_financement))}${lab('tour', r.tour) ? ', ' + esc(lab('tour', r.tour)) : ''}${r.statut === 'en_cours_declare' ? '<br>' + badge('En cours déclaré', 'en_cours_declare') : ''}</td><td data-l="Montant" class="num"><b>${money(r.montant, r.devise)}</b></td><td data-l="Financeurs">${esc(r.investisseurs.join(', ') || '–')}</td><td data-l="Source">${srcLine(r.sources).replace(/Sources? : /, '')}</td></tr>`).join('')}
  </tbody></table></div></div>`;
}

/* Indicateurs */
function indicateurs() {
  const I = D.indicateurs, S = D.startups;
  const q = [['Fiches vérifiées', pct(I.taux_verification), `${I.fiches_verifiees} sur ${I.fiches_publiees} fiches publiées`],
    ['Complétude moyenne', pct(I.taux_completude), 'Champs essentiels renseignés'],
    ['Sources primaires', pct(I.taux_sources_primaires), 'Fiches avec au moins une source primaire'],
    ['Fiches à actualiser', I.fiches_a_actualiser, 'Actives vérifiées il y a plus de 6 mois'],
    ['Délai moyen de validation', I.delai_moyen_validation_jours == null ? '–' : I.delai_moyen_validation_jours + ' j', 'De l’ajout à la première vérification']];
  const e = [['Startups identifiées', I.startups_identifiees, 'Publiées ou non'], ['Fiches publiées', I.fiches_publiees, 'Suffisamment documentées'],
    ['Projets précoces', I.projets_precoces, 'Comptés à part'], ['En levée', I.en_levee, 'Levée en cours déclarée']];
  const card = k => `<div class="card"><div class="mute sm">${k[0]}</div><div class="kv">${k[1]}</div><div class="mute xs">${k[2]}</div></div>`;
  const sec = {}; S.forEach(s => sec[s.secteur] = (sec[s.secteur] || 0) + 1);
  const sa = Object.entries(sec).sort((a, b) => b[1] - a[1]); const mx = sa.length ? sa[0][1] : 1;
  const by = {}; D.financements.filter(r => r.statut === 'documente').forEach(r => { const y = r.date.slice(0, 4); by[y] = (by[y] || 0) + (r.montant_usd || 0); });
  const ys = Object.keys(by).sort(); const my = Math.max(1, ...Object.values(by));
  const stat = Object.entries(I.par_statut_activite);
  view.innerHTML = `<div class="col">
  <div><h1>Indicateurs</h1><p class="intro">La qualité du référentiel passe avant son volume. Les indicateurs sont recalculés à chaque mise à jour des données.</p></div>
  <h2>Qualité des données</h2><div class="grid kpis">${q.map(card).join('')}</div>
  <h2>Périmètre</h2><div class="grid kpis">${e.map(card).join('')}</div>
  <div class="row2">
   <section class="card"><h2>Statut d’activité</h2><p class="mute sm" style="margin:4px 0 16px">Fiches publiées</p><div class="col" style="gap:10px">${stat.map(([k, v]) => `<div class="bar"><div>${esc(lab('statut_activite', k))}</div><div class="track"><div class="fill" style="width:${I.fiches_publiees ? Math.round(v / I.fiches_publiees * 100) : 0}%"></div></div><b class="num">${v}</b></div>`).join('')}</div></section>
   <section class="card"><h2>Startups par secteur</h2><p class="mute sm" style="margin:4px 0 16px">Fiches publiées</p><div class="col" style="gap:10px">${sa.map(([l, c]) => `<div class="bar"><div>${esc(l)}</div><div class="track"><div class="fill" style="width:${Math.round(c / mx * 100)}%"></div></div><b class="num">${c}</b></div>`).join('')}</div></section>
  </div>
  <section class="card"><h2>Montants documentés par année</h2><p class="mute sm" style="margin:4px 0 16px">Contre-valeur en dollars US, opérations réalisées uniquement</p><div class="col" style="gap:10px">${ys.map(y => `<div class="bar wide"><div>${y}</div><div class="track"><div class="fill" style="width:${Math.max(1, Math.round(by[y] / my * 100))}%"></div></div><b class="num">${usd(by[y])}</b></div>`).join('')}</div></section>
  </div>`;
}

/* Évolutions */
function evolutions() {
  view.innerHTML = `<div class="col">
  <div><h1>Évolutions</h1><p class="intro">Ajouts, confirmations, levées, interruptions et fermetures. Chaque changement cite sa preuve.</p></div>
  <div class="card"><div class="tl">${D.evenements.map(e => `<div><div class="mute xs">${fdate(e.date)}</div><div class="wrapf" style="margin:2px 0">${badge(lab('champ', e.champ), e.champ === 'ajout' ? 'ajout' : e.nouvelle_valeur)}<a href="#fiche-${esc(e.startup_id)}"><b>${esc(e.startup)}</b></a></div><div>${esc(e.motif)}</div>${srcLine(e.sources)}</div>`).join('') || '<p class="mute">Aucun événement.</p>'}</div></div></div>`;
}

/* Méthodologie */
function methodologie() {
  const d = D.definitions;
  const defs = k => `<dl class="defs">${Object.entries(d[k]).map(([v, t]) => `<dt>${esc(lab(k, v))}</dt><dd>${esc(t)}</dd>`).join('')}</dl>`;
  const gh = p => `https://github.com/${REPO}/blob/main/${p}`;
  view.innerHTML = `<div class="prose">
  <h1>Méthodologie</h1>
  <p>Startup Guinée est un registre indépendant des startups créées en Guinée ou développant leur activité sur le marché guinéen. Son objectif n’est pas de recenser le plus d’entreprises possible, mais de construire la base la plus fiable possible.</p>
  <h2>Ce que nous recensons</h2>
  <p>Une startup est une entreprise qui a une activité entrepreneuriale innovante identifiable et une ambition de croissance reproductible. Les PME traditionnelles, associations, ONG et projets étudiants n’en font pas partie. Les projets sans activité identifiable sont classés à part, comme projets précoces.</p>
  <h2>Quatre principes</h2>
  <ul><li><b>Exhaustivité progressive</b> : recenser les acteurs identifiables, sans prétendre couvrir tout l’écosystème.</li>
  <li><b>Traçabilité</b> : chaque information importante a une source et une date de vérification.</li>
  <li><b>Neutralité</b> : visibilité médiatique, activité réelle et réussite commerciale ne sont pas confondues.</li>
  <li><b>Actualisation</b> : une fiche n’est pas fiable indéfiniment. Au-delà de 6 mois sans vérification, une fiche active est signalée « à actualiser ».</li></ul>
  <h2>Statut d’activité</h2>${defs('statut_activite')}
  <p class="sm mute">Une absence d’information récente ne constitue jamais une preuve de fermeture.</p>
  <h2>Statut de vérification</h2>${defs('statut_verification')}
  <h2>Niveau de confiance</h2>${defs('niveau_confiance')}
  <h2>Financements</h2>${defs('type_financement')}
  <p class="sm mute">« Aucune levée connue » ne veut pas dire que l’entreprise n’a jamais levé de fonds. Aucun montant n’est publié sans source.</p>
  <h2>Contribuer</h2>
  <p>Vous pouvez <a href="${ISSUE('nouvelle-startup.yml', 'Nouvelle startup : ')}" target="_blank" rel="noopener noreferrer">proposer une startup</a> ou signaler une correction depuis chaque fiche. Toute contribution est vérifiée avant publication.</p>
  <p class="sm">Documents de référence : <a href="${gh('docs/protocole-verification.md')}" target="_blank" rel="noopener noreferrer">protocole de vérification</a>, <a href="${gh('docs/dictionnaire-donnees.md')}" target="_blank" rel="noopener noreferrer">dictionnaire de données</a>, <a href="${gh('docs/definition-startup.md')}" target="_blank" rel="noopener noreferrer">définition d’une startup</a>.</p>
  </div>`;
}

const VIEWS = { repertoire, financements, indicateurs, evolutions, methodologie };
function route() {
  const h = location.hash.slice(1) || 'repertoire';
  const v = h.startsWith('fiche-') ? 'fiche' : (VIEWS[h] ? h : 'repertoire');
  document.querySelectorAll('#nav a').forEach(a => { const on = a.dataset.v === v || (v === 'fiche' && a.dataset.v === 'repertoire'); a.classList.toggle('on', on); a.setAttribute('aria-current', on ? 'page' : 'false'); });
  if (v === 'fiche') { fiche(h.slice(6)); document.title = (D.startups.find(s => s.id === h.slice(6))?.nom || 'Fiche') + ' | Startup Guinée'; window.scrollTo(0, 0); }
  else { VIEWS[v](); document.title = 'Startup Guinée, le registre des startups guinéennes'; }
}

document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.statut !== undefined) { st.statut = b.dataset.statut; repertoire(); }
  else if (b.dataset.ftype !== undefined) { st.ftype = b.dataset.ftype; financements(); }
  else if (b.id === 'reset') { Object.assign(st, { q: '', secteur: '', ville: '', statut: 'tous' }); repertoire(); }
});
window.addEventListener('hashchange', route);

fetch('data/registre.json', { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(data => {
  D = data;
  document.getElementById('demo').hidden = !D.contient_demo;
  document.getElementById('meta').textContent = `Données mises à jour le ${fdate(D.genere_le.slice(0, 10))} · schéma ${D.version_schema}`;
  route();
}).catch(err => {
  view.innerHTML = `<div class="empty">Impossible de charger le registre (${esc(err.message)}). Si vous consultez le site en local, lancez <code>python -m http.server -d site</code>.</div>`;
});
}
