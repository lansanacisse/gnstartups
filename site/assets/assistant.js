/* Assistant du registre : répond dans le navigateur, à partir de data/registre.json.
   Aucune question n'est envoyée ni conservée. Pas d'IA : reconnaissance de mots-clés. */
(() => {
  if (!window.SGA) return;
  const { esc, fdate, usd, lab } = window.SGA;
  const btn = document.getElementById('asst-btn');
  const panel = document.getElementById('asst');
  const log = document.getElementById('asst-log');
  const form = document.getElementById('asst-form');
  const input = document.getElementById('asst-q');
  if (!btn || !panel) return;

  const SUGGESTIONS = ['Qui est en levée ?', 'Fintech à Conakry', 'Combien de startups actives ?', 'Que veut dire « En levée » ?'];
  const MAX = 8;

  /* Texte sans accents ni ponctuation, pour comparer */
  const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' ').replace(/[^a-z0-9$ ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const has = (q, ...words) => words.some(w => new RegExp('(^| )' + w + '( |$)').test(q));
  const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;

  const STATUS_WORDS = [
    ['active', ['active', 'actives', 'actif', 'actifs', 'en activite']],
    ['interrompue', ['interrompue', 'interrompues', 'interrompu', 'en pause', 'arretee', 'arretees']],
    ['fermee', ['fermee', 'fermees', 'ferme', 'fermes', 'fermeture', 'faillite']],
    ['inconnue', ['inconnu', 'inconnue', 'inconnus', 'inconnues']],
  ];
  const STATUS_PLURAL = { active: ['active', 'actives'], interrompue: ['interrompue', 'interrompues'], fermee: ['fermée', 'fermées'], inconnue: ['au statut inconnu', 'au statut inconnu'] };
  const LEVEE_WORDS = ['en levee', 'leve des fonds', 'levent', 'levee en cours', 'cherche des fonds', 'cherchent des fonds', 'recherche de fonds'];

  /* Glossaire : définitions du registre et termes du site */
  function glossary() {
    const d = SGA.D.definitions, out = [];
    const add = (names, title, text) => out.push({ names: names.map(norm), title, text });
    for (const [k, t] of Object.entries(d.statut_activite || {})) add([lab('statut_activite', k), k], lab('statut_activite', k), t);
    for (const [k, t] of Object.entries(d.statut_verification || {})) add([lab('statut_verification', k), k.replace('_', ' ')], lab('statut_verification', k), t);
    for (const [k, t] of Object.entries(d.type_financement || {})) add([lab('type_financement', k), k], lab('type_financement', k), t);
    for (const [k, t] of Object.entries(d.niveau_confiance || {})) add(['confiance ' + k, 'niveau ' + k], 'Niveau de confiance ' + lab('niveau_confiance', k).toLowerCase(), t);
    add(['en levee', 'levee'], 'En levée', 'Levée de fonds annoncée par l’entreprise comme en cours, pas encore finalisée. Son montant n’entre dans les totaux qu’une fois l’opération réalisée et sourcée.');
    add(['completude'], 'Complétude', 'Part des informations essentielles renseignées sur la fiche : description, secteur, ville, année de création, site web, forme juridique, effectif, page LinkedIn et fondateurs.');
    add(['a actualiser', 'actualiser'], 'À actualiser', 'Fiche active dont la dernière vérification date de plus de 6 mois.');
    add(['niveau de confiance', 'confiance'], 'Niveau de confiance', 'Élevé : source primaire ou deux sources indépendantes. Moyen : une source secondaire crédible. Faible : signal indirect ou source non vérifiable.');
    add(['startup'], 'Startup', 'Entreprise qui a une activité innovante identifiable et une ambition de croissance reproductible. Les PME traditionnelles, associations, ONG et projets étudiants n’en font pas partie.');
    add(['projet precoce', 'projets precoces'], 'Projet précoce', (d.categorie || {}).projet_precoce || 'Projet sans activité identifiable, compté à part.');
    return out;
  }

  const link = s => `<a href="#fiche-${esc(s.id)}">${esc(s.nom)}</a>`;
  const listHtml = (arr, line) => `<ul>${arr.slice(0, MAX).map(x => `<li>${line(x)}</li>`).join('')}</ul>${arr.length > MAX ? `<p class="small mute">Et ${arr.length - MAX} autre${arr.length - MAX > 1 ? 's' : ''} : voir <a href="#explorer">Explorer</a>.</p>` : ''}`;
  const brief = s => `${link(s)} : ${esc(s.secteur)}, ${esc(s.ville)}, ${esc(lab('statut_activite', s.statut_activite).toLowerCase())}`;

  function startupCard(s) {
    const f = s.financements.filter(r => r.statut === 'documente');
    const tot = f.reduce((a, r) => a + (r.montant_usd || 0), 0);
    const levee = s.statut_financement === 'en_cours_declare';
    const parts = [
      `<p><b>${link(s)}</b> : ${esc(s.description)}</p>`,
      `<p>${esc(s.secteur)}, ${esc(s.ville)}${s.annee_creation ? ', créée en ' + s.annee_creation : ''}. Statut : <b>${esc(lab('statut_activite', s.statut_activite).toLowerCase())}</b>${s.date_derniere_verification ? ', vérifié le ' + fdate(s.date_derniere_verification) : ', pas encore vérifié'}.</p>`,
      `<p>Financement : ${f.length ? `${tot ? usd(tot) + ' documentés' : 'montants non divulgués'} sur ${plural(f.length, 'opération', 'opérations')}` : 'aucune levée connue'}${levee ? ', levée en cours déclarée' : ''}.</p>`,
    ];
    if (s.fondateurs.length) parts.push(`<p>Fondateurs : ${s.fondateurs.map(x => esc(x.nom)).join(', ')}.</p>`);
    return parts.join('');
  }

  function answer(raw) {
    const q = norm(raw);
    const S = SGA.D.startups;
    if (!q) return null;

    // Salutations et aide
    if (/^(bonjour|salut|bonsoir|hello|coucou|merci)\b/.test(q) && q.split(' ').length <= 3)
      return has(q, 'merci') ? '<p>Avec plaisir.</p>' : '<p>Bonjour. Posez une question sur les startups du registre : un nom, un secteur, une ville, un statut ou un terme du site.</p>';
    if (has(q, 'aide', 'help') || /que (peux|sais) tu/.test(q))
      return `<p>Je réponds à partir des données du registre, par exemple :</p><ul>${SUGGESTIONS.map(s => `<li>${esc(s)}</li>`).join('')}<li>Le nom d’une startup, d’un fondateur ou d’un investisseur</li></ul>`;

    // Contribution, contact, méthode
    if (has(q, 'contact', 'contacter', 'ecrire', 'email', 'mail'))
      return '<p>Tout est sur la page <a href="#contact">Contact</a>.</p>';
    if (has(q, 'proposer', 'ajouter', 'signaler', 'corriger', 'correction', 'revendiquer', 'erreur', 'manque', 'absente'))
      return '<p>Pour proposer une startup, signaler une erreur ou revendiquer une fiche, passez par la page <a href="#contact">Contact</a>. Chaque contribution est vérifiée avant publication.</p>';
    if (has(q, 'methodologie', 'methode') || /comment (verifi|vous verifi|sont verifi|choisi)/.test(q))
      return '<p>Chaque statut s’appuie sur une preuve datée et sourcée. Le détail est sur la page <a href="#methodologie">Méthodologie</a>.</p>';
    if (has(q, 'licence', 'telecharger', 'donnees', 'reutiliser', 'api'))
      return '<p>Les données du registre sont publiées sous licence CC BY 4.0 : vous pouvez les réutiliser en citant la source. Voir les <a href="#cgu">conditions d’utilisation</a>.</p>';

    // Définitions
    const G = glossary();
    const asksDef = /(c est quoi|qu est ce|que veut dire|que signifie|signifie|definition|definir|veut dire)/.test(q);
    if (asksDef) {
      const g = G.filter(x => x.names.some(n => q.includes(n))).sort((a, b) => Math.max(...b.names.map(n => q.includes(n) ? n.length : 0)) - Math.max(...a.names.map(n => q.includes(n) ? n.length : 0)))[0];
      if (g) return `<p><b>${esc(g.title)}</b> : ${esc(g.text)}</p>`;
    }

    // Une startup précise
    const byName = S.filter(s => q.includes(norm(s.nom)) || (norm(s.nom).split(' ')[0].length > 3 && has(q, norm(s.nom).split(' ')[0])));
    if (byName.length === 1) return startupCard(byName[0]);
    if (byName.length > 1) return `<p>Plusieurs startups correspondent :</p>${listHtml(byName, brief)}`;

    // Un fondateur
    const founders = S.flatMap(s => s.fondateurs.map(f => ({ s, f }))).filter(({ f }) => norm(f.nom).split(' ').some(w => w.length > 3 && has(q, w)));
    if (founders.length) return listHtml(founders, ({ s, f }) => `${esc(f.nom)} : ${esc(f.role)}, ${link(s)}`);

    // Un investisseur
    const investors = [...new Set(SGA.D.financements.flatMap(r => r.investisseurs))].filter(n => q.includes(norm(n)));
    if (investors.length) {
      const rows = SGA.D.financements.filter(r => r.investisseurs.some(n => investors.includes(n)));
      return `<p>${esc(investors.join(', '))} : ${plural(rows.length, 'opération documentée', 'opérations documentées')}.</p>${listHtml(rows, r => `<a href="#fiche-${esc(r.startup_id)}">${esc(r.startup)}</a>, ${esc(lab('type_financement', r.type_financement).toLowerCase())}${r.tour && r.tour !== 'non_applicable' ? ' ' + esc(lab('tour', r.tour)) : ''}, ${fdate(r.date)}${r.montant_usd ? ', ' + usd(r.montant_usd) : ''}`)}`;
    }

    // Filtres : secteur, ville, statut, levée
    const sect = SGA.D.secteurs.filter(x => S.some(s => s.secteur_id === x.id) && (has(q, norm(x.libelle)) || has(q, norm(x.libelle) + 's') || has(q, x.id)));
    const city = SGA.D.villes.filter(x => S.some(s => s.ville_id === x.id) && has(q, norm(x.nom)));
    const stat = STATUS_WORDS.filter(([, w]) => w.some(x => q.includes(x))).map(([k]) => k);
    const levee = LEVEE_WORDS.some(w => q.includes(w)) || /qui (leve|cherche)/.test(q);
    const money = has(q, 'montant', 'montants', 'leve', 'leves', 'levee', 'levees', 'financement', 'financements', 'investi', 'investissement', 'investissements', 'argent', 'fonds') && !levee;
    const count = has(q, 'combien', 'nombre');

    if (money && !sect.length && !city.length) {
      const done = SGA.D.financements.filter(r => r.statut === 'documente');
      const tot = done.reduce((a, r) => a + (r.montant_usd || 0), 0);
      const top = [...done].filter(r => r.montant_usd).sort((a, b) => b.montant_usd - a.montant_usd).slice(0, 3);
      return `<p>Montant total documenté : <b>${usd(tot)}</b> sur ${plural(done.length, 'opération réalisée', 'opérations réalisées')}.</p><p>Les plus importantes :</p><ul>${top.map(r => `<li><a href="#fiche-${esc(r.startup_id)}">${esc(r.startup)}</a> : ${usd(r.montant_usd)}, ${fdate(r.date)}</li>`).join('')}</ul><p class="small mute">Toutes les opérations : <a href="#financements">Financements</a>.</p>`;
    }

    if (sect.length || city.length || stat.length || levee || count) {
      let f = S;
      if (sect.length) f = f.filter(s => sect.some(x => x.id === s.secteur_id));
      if (city.length) f = f.filter(s => city.some(x => x.id === s.ville_id));
      if (stat.length) f = f.filter(s => stat.includes(s.statut_activite));
      if (levee) f = f.filter(s => s.statut_financement === 'en_cours_declare');
      const many = f.length > 1;
      const what = [stat.map(k => STATUS_PLURAL[k][many ? 1 : 0]).join(' ou '), levee ? 'en levée' : '', sect.length ? 'en ' + sect.map(x => x.libelle).join(' ou ') : '', city.length ? 'à ' + city.map(x => x.nom).join(' ou ') : ''].filter(Boolean).join(' ');
      if (!f.length) return `<p>Aucune startup${what ? ' ' + esc(what) : ''} dans le registre pour l’instant.</p>`;
      const head = `<p><b>${plural(f.length, 'startup', 'startups')}</b>${what ? ' ' + esc(what) : ' dans le registre'}${count ? '.' : ' :'}</p>`;
      return head + listHtml(f, brief);
    }

    // Recherche libre dans les fiches
    const words = q.split(' ').filter(w => w.length > 3 && !['startup', 'startups', 'entreprise', 'entreprises', 'guinee', 'quelle', 'quelles', 'quels', 'avec', 'dans', 'pour'].includes(w));
    if (words.length) {
      const hits = S.map(s => ({ s, n: words.filter(w => norm([s.nom, s.description, s.secteur, s.ville].join(' ')).includes(w)).length })).filter(x => x.n).sort((a, b) => b.n - a.n).map(x => x.s);
      if (hits.length) return `<p>Fiches qui correspondent :</p>${listHtml(hits, s => `${link(s)} : ${esc(s.description)}`)}`;
    }

    // Une définition sans formule de question (« en levée », « contestée »)
    const g = G.find(x => x.names.some(n => n.length > 4 && q === n));
    if (g) return `<p><b>${esc(g.title)}</b> : ${esc(g.text)}</p>`;

    return '<p>Je n’ai pas trouvé de réponse dans le registre. Essayez un nom de startup, un secteur, une ville ou un statut, ou parcourez <a href="#explorer">Explorer</a>.</p>';
  }

  function say(html, who) {
    const li = document.createElement('li');
    li.className = 'asst-msg ' + who;
    li.innerHTML = html;
    log.appendChild(li);
    log.scrollTop = log.scrollHeight;
  }

  function ask(text) {
    const t = text.trim();
    if (!t) return;
    say(`<p>${esc(t)}</p>`, 'me');
    say(SGA.D ? answer(t) : '<p>Le registre est en cours de chargement, réessayez dans un instant.</p>', 'bot');
  }

  function open() {
    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('asst-open');
    if (!log.children.length) {
      say(`<p>Posez une question sur les startups du registre.</p><p class="asst-sugg">${SUGGESTIONS.map(s => `<button type="button" data-ask="${esc(s)}">${esc(s)}</button>`).join('')}</p>`, 'bot');
    }
    input.focus();
  }
  function close() {
    panel.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('asst-open');
    btn.focus();
  }

  btn.addEventListener('click', () => (panel.hidden ? open() : close()));
  document.getElementById('asst-close').addEventListener('click', close);
  panel.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  form.addEventListener('submit', e => { e.preventDefault(); ask(input.value); input.value = ''; });
  log.addEventListener('click', e => {
    const b = e.target.closest('[data-ask]');
    if (b) { ask(b.dataset.ask); input.focus(); return; }
    // Sur téléphone, un lien vers une fiche ferme le panneau pour laisser voir la page
    if (e.target.closest('a[href^="#"]') && matchMedia('(max-width: 600px)').matches) close();
  });
})();
