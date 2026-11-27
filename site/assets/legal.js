/* Pages légales de StartupGuineeIQ. L'adresse de contact est définie ici, une seule fois. */
const SG_CONTACT = 'CONTACT_A_RENSEIGNER';
const SG_LEGAL_UPDATED = '27 novembre 2026';

function sgLegal(ext) {
  const mail = `<a href="mailto:${SG_CONTACT}">${SG_CONTACT}</a>`;
  const link = (hash, text) => `<a href="#${hash}">${text}</a>`;
  return {
    'mentions-legales': {
      title: 'Mentions légales',
      html: `
  <h2>Éditeur</h2>
  <p>Le site StartupGuineeIQ (lansanacisse.github.io/gnstartups) est édité à titre non professionnel par une personne physique. Conformément à l’article 1-1, II de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique (LCEN), l’éditeur a choisi de préserver son anonymat à l’égard du public. Ses éléments d’identification ont été communiqués à l’hébergeur.</p>
  <p>Le site ne vend aucun produit ni service et ne contient pas de publicité.</p>
  <h2>Contact</h2>
  <p>Pour toute question, demande ou réclamation : ${mail}.</p>
  <h2>Droit de réponse</h2>
  <p>Toute personne nommée ou désignée sur le site peut exercer son droit de réponse. Comme l’éditeur a conservé l’anonymat, la demande peut être adressée à l’hébergeur, qui la transmet à l’éditeur. Elle peut aussi être envoyée directement à ${mail}.</p>
  <h2>Hébergeur</h2>
  <p>GitHub, Inc.<br>88 Colin P. Kelly Jr. Street<br>San Francisco, CA 94107<br>États-Unis<br>Téléphone : +1 877 448 4820<br>${ext('https://github.com', 'github.com')}</p>
  <h2>Autres informations</h2>
  <p>Voir aussi la ${link('confidentialite', 'politique de confidentialité')}, la ${link('cookies', 'gestion des cookies')}, les ${link('cgu', 'conditions générales d’utilisation')}, la ${link('propriete-intellectuelle', 'politique de propriété intellectuelle')} et la ${link('signalements', 'politique de gestion des signalements')}.</p>`
    },

    confidentialite: {
      title: 'Politique de confidentialité',
      html: `
  <p>Cette page explique quelles données personnelles le site traite, pourquoi, et comment exercer vos droits, conformément au règlement général sur la protection des données (RGPD) et à la loi Informatique et libertés.</p>
  <h2>Responsable du traitement</h2>
  <p>L’éditeur du site (voir les ${link('mentions-legales', 'mentions légales')}), joignable à ${mail}.</p>
  <h2>Données publiées sur les fondateurs et dirigeants</h2>
  <p>Les fiches du registre peuvent mentionner le nom, le rôle et le profil professionnel public (par exemple une page LinkedIn) des fondateurs et dirigeants des startups. Seules des informations professionnelles et publiques sont collectées : jamais d’adresse personnelle, de numéro de téléphone personnel ni de donnée sensible.</p>
  <ul>
   <li><b>Finalité.</b> Informer le public sur l’écosystème des startups guinéennes, de façon vérifiable.</li>
   <li><b>Base légale.</b> L’intérêt légitime (article 6, 1, f du RGPD) : faire connaître qui porte les entreprises recensées.</li>
   <li><b>Origine.</b> Sources publiques citées sur chaque fiche (site de l’entreprise, presse, communiqués, registres) ou informations communiquées par l’entreprise.</li>
   <li><b>Durée.</b> Tant que la startup figure au registre. Une personne peut demander à tout moment le retrait des informations qui la concernent (voir « Vos droits »).</li>
  </ul>
  <h2>Contributions et signalements</h2>
  <p>Les formulaires « Proposer une startup », « Signaler une information incorrecte » et « Revendiquer une fiche » créent un ticket public sur GitHub. Ces tickets sont visibles par tous et traités par GitHub selon sa propre ${ext('https://docs.github.com/fr/site-policy/privacy-policies/github-general-privacy-statement', 'déclaration de confidentialité')}. N’y indiquez aucune information personnelle qui ne soit pas déjà publique. Pour un signalement confidentiel, écrivez à ${mail}.</p>
  <h2>Messages envoyés par e-mail</h2>
  <p>Les messages reçus à ${mail} servent uniquement à répondre à votre demande. Ils sont conservés le temps de la traiter, puis supprimés au plus tard un an après la dernière réponse.</p>
  <h2>Données techniques de connexion</h2>
  <p>Le site est hébergé par GitHub, Inc. Pour afficher les pages et protéger son service, GitHub reçoit l’adresse IP des visiteurs et des informations techniques de navigation, qu’il traite selon sa déclaration de confidentialité, notamment aux États-Unis. L’éditeur n’a pas accès à ces données.</p>
  <h2>Ce que le site ne fait pas</h2>
  <ul>
   <li>Aucun cookie, aucun traceur, aucune mesure d’audience, aucune publicité (voir la ${link('cookies', 'gestion des cookies')}).</li>
   <li>Aucune revente ni cession de données.</li>
   <li>Aucun appel à un service tiers pour afficher le site : la police de caractères est hébergée sur le site lui-même.</li>
  </ul>
  <h2>Vos droits</h2>
  <p>Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation et d’opposition sur les données qui vous concernent. Pour les exercer, écrivez à ${mail} en précisant la fiche concernée. Une réponse vous sera apportée dans un délai d’un mois.</p>
  <p>Les fiches sont conservées dans un dépôt public dont l’historique garde les versions précédentes. En cas de demande d’effacement, les informations sont retirées du site et des fichiers actuels et, si vous le demandez, de l’historique du dépôt.</p>
  <p>Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL : ${ext('https://www.cnil.fr/fr/plaintes', 'cnil.fr/fr/plaintes')}.</p>`
    },

    cookies: {
      title: 'Gestion des cookies',
      html: `
  <p>Le site StartupGuineeIQ ne dépose <b>aucun cookie</b> et n’utilise <b>aucun traceur</b> sur votre appareil : ni mesure d’audience, ni publicité, ni bouton de réseau social, ni stockage local dans le navigateur.</p>
  <p>C’est pourquoi aucun bandeau ne vous demande votre consentement : il n’y a rien à accepter ni à refuser.</p>
  <h2>Liens vers d’autres sites</h2>
  <p>Les liens vers GitHub, vers les sources citées ou vers des pages d’entreprises vous font quitter le site. Ces sites appliquent leurs propres règles en matière de cookies.</p>
  <h2>Évolution</h2>
  <p>Si le site devait un jour utiliser un traceur soumis au consentement, cette page serait mise à jour et votre accord serait demandé avant tout dépôt.</p>`
    },

    cgu: {
      title: 'Conditions générales d’utilisation',
      html: `
  <h2>Objet</h2>
  <p>Ces conditions encadrent l’utilisation du site StartupGuineeIQ, registre indépendant des startups guinéennes. En utilisant le site, vous les acceptez.</p>
  <h2>Accès</h2>
  <p>Le site est accessible gratuitement, sans inscription. L’éditeur peut le modifier, le suspendre ou l’interrompre à tout moment, notamment pour maintenance.</p>
  <h2>Nature des informations</h2>
  <p>Les informations sont collectées et vérifiées selon une ${link('methodologie', 'méthodologie publique')}. Chaque statut est daté et sourcé, mais une information peut être incomplète, dépassée ou erronée. Elles sont fournies à titre informatif : elles ne constituent ni un conseil en investissement, ni une évaluation des entreprises, ni une recommandation.</p>
  <p>Le site ne vend aucun produit ni service : il n’y a donc pas de conditions générales de vente.</p>
  <h2>Contributions</h2>
  <p>Chacun peut proposer une startup, signaler une erreur ou revendiquer une fiche. En contribuant, vous garantissez que les informations transmises sont exactes et que vous avez le droit de les communiquer, et vous acceptez qu’elles soient publiées, après vérification, sous la licence du registre (voir la ${link('propriete-intellectuelle', 'politique de propriété intellectuelle')}). Une contribution n’est jamais publiée sans vérification, et les entreprises ne modifient pas directement leur fiche.</p>
  <h2>Utilisations interdites</h2>
  <ul>
   <li>Utiliser les informations du site pour harceler, démarcher abusivement ou porter atteinte aux personnes citées.</li>
   <li>Présenter des informations modifiées comme provenant du registre.</li>
   <li>Perturber le fonctionnement du site ou de ses formulaires.</li>
   <li>Transmettre de fausses informations ou des signalements délibérément infondés.</li>
  </ul>
  <h2>Responsabilité</h2>
  <p>L’éditeur s’efforce d’assurer l’exactitude des informations publiées et corrige les erreurs signalées selon la ${link('signalements', 'politique de gestion des signalements')}. Il ne peut être tenu responsable des décisions prises sur la base de ces informations, ni du contenu des sites vers lesquels le registre renvoie.</p>
  <h2>Modification des conditions</h2>
  <p>Ces conditions peuvent évoluer. La date de dernière mise à jour figure en haut de la page.</p>
  <h2>Droit applicable</h2>
  <p>Ces conditions sont soumises au droit français.</p>`
    },

    'propriete-intellectuelle': {
      title: 'Propriété intellectuelle',
      html: `
  <h2>Données et textes du registre : licence CC BY 4.0</h2>
  <p>Les données du registre (fiches, statuts, financements, vérifications, indicateurs) et les textes rédigés pour le site (méthodologie, définitions) sont publiés sous la licence ${ext('https://creativecommons.org/licenses/by/4.0/deed.fr', 'Creative Commons Attribution 4.0 International (CC BY 4.0)')}.</p>
  <p>Vous pouvez les copier, les diffuser, les adapter et les réutiliser, y compris à des fins commerciales, à condition de citer la source, d’indiquer si vous les avez modifiés et de ne pas laisser croire que StartupGuineeIQ approuve votre usage.</p>
  <p>Mention à utiliser : <b>« Source : StartupGuineeIQ, lansanacisse.github.io/gnstartups, données consultées le [date] »</b>.</p>
  <h2>Ce qui n’est pas couvert par cette licence</h2>
  <ul>
   <li><b>Noms, marques et logos des startups</b> : ils appartiennent à leurs titulaires et ne sont cités que pour identifier les entreprises.</li>
   <li><b>Sources citées</b> (articles, communiqués, pages web) : elles restent la propriété de leurs auteurs. Le registre n’en reproduit que le titre et le lien.</li>
   <li><b>Police de caractères</b> : Inter, sous licence SIL Open Font License 1.1.</li>
   <li><b>Code du site</b> : il n’est pas publié sous licence ouverte.</li>
  </ul>
  <h2>Signaler une atteinte</h2>
  <p>Si vous estimez qu’un contenu du site porte atteinte à vos droits, écrivez à ${mail} en précisant le contenu concerné et vos droits. Il sera examiné selon la ${link('signalements', 'politique de gestion des signalements')}.</p>`
    },

    signalements: {
      title: 'Politique de gestion des signalements',
      html: `
  <p>Un registre de référence doit pouvoir être corrigé. Cette page explique comment signaler un problème et comment il est traité.</p>
  <h2>Ce que vous pouvez signaler</h2>
  <ul>
   <li>Une information inexacte ou dépassée sur une fiche.</li>
   <li>Une startup absente du registre.</li>
   <li>Une fiche que vous souhaitez revendiquer en tant que fondateur ou dirigeant.</li>
   <li>Une demande de retrait de vos informations personnelles.</li>
   <li>Un contenu que vous estimez illicite ou portant atteinte à vos droits.</li>
  </ul>
  <h2>Comment signaler</h2>
  <ul>
   <li><b>Corrections, nouvelles startups, revendications</b> : utilisez les boutons du site, qui ouvrent un formulaire sur GitHub. Ces formulaires sont <b>publics</b>.</li>
   <li><b>Données personnelles, contenu illicite ou information confidentielle</b> : écrivez à ${mail}. Ces signalements ne sont pas publiés.</li>
  </ul>
  <p>Indiquez la fiche concernée, l’information en cause, la correction proposée et une source qui la justifie. Pour un contenu illicite, précisez aussi l’emplacement exact (lien), les raisons pour lesquelles il vous paraît illicite et vos coordonnées.</p>
  <h2>Traitement</h2>
  <ol>
   <li><b>Accusé de réception</b> sous 7 jours.</li>
   <li><b>Vérification</b> selon le protocole du registre. Si le signalement remet en cause une information publiée, la fiche passe en statut « contestée » pendant la vérification.</li>
   <li><b>Décision</b> sous 15 jours : correction, ajout, retrait ou maintien de l’information. Aucune modification n’est faite sans source.</li>
   <li><b>Réponse motivée</b> à l’auteur du signalement. Tout changement de statut ou de financement est inscrit dans l’historique public de la fiche.</li>
  </ol>
  <h2>Cas particuliers</h2>
  <ul>
   <li><b>Données personnelles</b> : retrait sous un mois, conformément au RGPD (voir la ${link('confidentialite', 'politique de confidentialité')}).</li>
   <li><b>Contenu manifestement illicite</b> : retrait sans délai dès qu’il est porté à la connaissance de l’éditeur.</li>
   <li><b>Revendication</b> : le rôle du demandeur est vérifié par un canal officiel de l’entreprise. Elle donne un contact privilégié, pas un droit de modifier directement la fiche.</li>
  </ul>
  <p>Les signalements répétés et manifestement infondés peuvent ne pas être traités.</p>`
    }
  };
}
