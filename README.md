# StartupGuineeIQ

Intelligence de l'écosystème startup guinéen : un registre indépendant des startups, de leurs financements et de leurs fondateurs. Chaque fiche indique le statut d'activité, sa preuve et la date de la dernière vérification.

Site : https://lansanacisse.github.io/gnstartups/

> Les données actuelles sont fictives (démonstration). Elles seront remplacées par le référentiel réel avant le lancement.

## Lancer en local

Python 3.10 ou plus, sans dépendance.

```bash
python scripts/validate.py          # vérifie les données
python scripts/build.py             # prépare les données du site
python -m http.server -d site 8000  # http://localhost:8000
```

## Modifier les données

Les données sont des fichiers CSV dans `data/`. Leur format est décrit dans le [dictionnaire de données](docs/dictionnaire-donnees.md).

1. Modifier les CSV en suivant le [protocole de vérification](docs/protocole-verification.md).
2. Vérifier que `python scripts/validate.py` affiche 0 erreur.
3. Ouvrir une pull request. Une fois fusionnée, le site se met à jour tout seul.

Pour proposer une startup ou signaler une erreur sans toucher aux fichiers : [ouvrir une issue](https://github.com/lansanacisse/gnstartups/issues/new/choose).

## Documentation

- [Ce qu'est une startup guinéenne](docs/definition-startup.md)
- [Protocole de vérification](docs/protocole-verification.md)
- [Dictionnaire de données](docs/dictionnaire-donnees.md)
- [Roadmap](docs/roadmap.md)
