# MeetLoom

Préparer et animer des séances, avec un agenda partagé et des notes qui restent privées. Application libre, auto-hébergeable, en français et en anglais.

**Version 0.1 en recette fonctionnelle.** Les fonctionnalités implémentées sont décrites ci-dessous ; la [matrice de parité](docs/product-parity.md) et les [preuves de recette](docs/manual-qa.md) suivent leur vérification. La validation utilisateur précède les tests E2E maintenus, la première release et le déploiement.

[![CI](https://github.com/jpfroud/MeetLoom/actions/workflows/ci.yml/badge.svg)](https://github.com/jpfroud/MeetLoom/actions/workflows/ci.yml)
[![Security](https://github.com/jpfroud/MeetLoom/actions/workflows/security.yml/badge.svg)](https://github.com/jpfroud/MeetLoom/actions/workflows/security.yml)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/jpfroud/MeetLoom)

Le bouton Render prépare une démonstration sur le plan gratuit, **avec des données éphémères** : elles peuvent disparaître au redémarrage ou à la mise en veille. Voir le [guide Render](docs/render.md) pour créer le premier compte et choisir un stockage durable. Pour des agendas internes, utiliser votre propre hébergement.

## Démarrer en local

Prérequis : **Node.js 24 LTS** et npm. SQLite est intégré à Node : aucun serveur de base de données n'est nécessaire pour un essai local.

```bash
npm ci
npm run build
npm start
```

Ouvrir [MeetLoom local](http://127.0.0.1:3000), créer le premier compte, puis choisir **Explorer un exemple**. Aucun compte ni mot de passe de démonstration n'est préinstallé. Les données sont conservées dans `data/meetloom.sqlite`, ignoré par Git.

Copier `.env.example` vers `.env` pour adapter la configuration. Le serveur charge ce fichier ; les variables fournies par l'environnement restent prioritaires. En production, `APP_ORIGIN` et une clé `BOOTSTRAP_TOKEN` pour le premier compte sont obligatoires. L'interface demande cette clé à l'installation. Ne jamais exposer un serveur de développement sans authentification initiale sur Internet.

Pour travailler avec rechargement du code, lancer ces commandes dans deux terminaux :

```bash
npm run dev
npm run dev:client
```

Ouvrir [le serveur Vite](http://127.0.0.1:5173). Si `APP_ORIGIN` est défini en développement, utiliser exactement cette origine.

## Ce qui est disponible

- Tableau de bord cartes/liste, recherche et tri, activité non lue et séances ouvertes récemment, dossiers/sous-dossiers persistants, duplication et archivage.
- Espaces avec administrateurs, éditeurs, lecteurs et invités limités à certaines séances ; logo et valeurs par défaut des nouvelles séances, colonnes, catégories, pages, formulaires, sons et exports.
- Agendas multi-jours ; texte riche, tâches et matériel, catégories, responsables, groupes imbriqués, notes et salles parallèles. Déplacement, duplication, annulation/rétablissement, copie/transfert entre séances et horaires verrouillés avec signalement des chevauchements.
- Colonnes ordonnables et redimensionnables, disposition de l'heure/durée et de la description, visibilité dans l'éditeur et audience **équipe** ou **équipe & visiteurs**. Les notes de présentation sont privées par défaut.
- Comptes locaux, profils et préférences, administration, invitations et rôles par séance. Connexion OIDC et récupération par SMTP facultatives ; services désactivés tant qu'ils ne sont pas configurés.
- Présence, fusion des modifications indépendantes et résolution explicite des conflits, commentaires en fils et mentions. Versions nommées, journal lisible, restauration/copie de jours et récupération des éléments supprimés pendant 72 heures.
- Pages et formulaires, réponses, exports et synthèse IA facultative. Les liens de publication sont révocables et la confidentialité des réponses est contrôlée côté serveur.
- Liens visiteurs et agendas simplifiés sans compte, limitables à certains contenus, expirables et révocables. Le serveur supprime les champs privés avant d'envoyer les données. La page publique s'actualise automatiquement.
- Minuteur partagé : pause, reprise, navigation, prolongation +1/+5, reprise du bloc précédent après passage automatique, progression et avance/retard par rapport aux durées capturées au lancement.
- Alerte anticipée en minutes ou pourcentage de durée restante, son de fin, choix de son/volume. Réglages par séance et valeurs par défaut pour les nouvelles séances.
- Fenêtre **Document Picture-in-Picture** dans les navigateurs compatibles ; fenêtre séparée de secours ailleurs. L'affichage contient le titre et le temps, sans notes internes.
- Clôture des séances, choix des animateurs et rapport filtrable ; corbeille de séances restaurables pendant 30 jours, distincte des archives.
- IA interne facultative : conversations, instructions d'organisation/espace et propositions sur un contexte choisi, avec validation avant application. Adaptateur compatible OpenAI pour votre serveur Qwen.
- Exports JSON/CSV/Word/PowerPoint et impression/PDF ; import JSON et extraction documentaire DOCX/PPTX/XLSX/PDF/CSV. L'OCR d'image demande un modèle de vision interne configuré. Les fichiers d'import sont traités temporairement ; ils ne deviennent pas des pièces jointes.
- [Serveur MCP](docs/mcp.md) avec jetons personnels et permissions de compte pour les clients autorisés.

Le guide [utilisation](docs/user-guide.md) décrit les parcours. Voir aussi [espaces, dossiers, historique et clôture](docs/workspaces-and-lifecycle.md), [IA et imports](docs/ai-and-import.md), [collaboration](docs/collaboration.md) et [OIDC/SMTP](docs/services-auth-mail.md). Le [périmètre et les limites](docs/status.md) distingue le code présent, la recette et la validation utilisateur.

## OpenShift, Kubernetes et PostgreSQL

Une image réunit l'interface et l'API. Les manifests génériques dans [k8s](k8s/README.md) prévoient une Route HTTPS, les sondes de santé, les limites de ressources, des secrets stables, PostgreSQL/PVC et un utilisateur arbitraire sans privilège. Les overlays `development` et `production` acceptent le namespace de votre choix.

Le circuit prévu, après validation, est **Release GitHub → image Docker Hub → mise à jour OpenShift par l'opérateur**. Le workflow et les manifests sont préparés ; ils n'ont pas été exécutés sur votre cluster. La [procédure](docs/deployment.md) décrit les secrets, la publication, puis l'installation dans un projet déjà créé :

```powershell
pwsh ./scripts/deploy-openshift.ps1 -Environment development -Project meetloom-dev -Image docker.io/votre-compte/meetloom:0.1.0
```

```bash
MEETLOOM_NAMESPACE=meetloom-dev bash scripts/deploy-openshift.sh development docker.io/votre-compte/meetloom:0.1.0
```

Les scripts sont idempotents, ne suppriment pas le PVC, conservent les secrets et contrôlent la disponibilité. Pour une nouvelle version, changer uniquement l'image du conteneur `app` du Deployment `meetloom`. GitHub ne reçoit aucun accès au cluster. Le [guide de déploiement](docs/deployment.md) détaille installation, publication, mise à jour, retour arrière, Kubernetes sans OpenShift, PostgreSQL externe, registres internes, Qwen et Docker Compose. Voir aussi [exploitation et sauvegardes](docs/operations.md).

## Brancher Qwen

Configurer uniquement côté serveur :

```dotenv
QWEN_BASE_URL=https://votre-serveur-llm.interne/v1
QWEN_MODEL=identifiant-exact-du-modele
QWEN_API_KEY=si-necessaire
```

Le modèle n'est pas figé à un numéro de version. Le serveur appelle `/chat/completions`, valide la réponse, limite sa taille et son délai, puis renvoie un aperçu. Aucun endpoint externe par défaut, aucune clé envoyée au navigateur, aucun agenda appliqué sans action utilisateur. Les colonnes internes ne rejoignent le contexte IA que sur choix explicite. Pour l'OCR, ajouter `QWEN_VISION_MODEL` sur ce même fournisseur interne. Monter le certificat interne via `NODE_EXTRA_CA_CERTS` si nécessaire ; ne pas désactiver TLS.

## Ingénierie et vérification

```bash
npm run check       # TypeScript, tests métier/API et compilation
npm test
npm audit
npm run format:check
```

`TEST_DATABASE_URL` active les mêmes contrats API sur PostgreSQL, avec un schéma isolé par test. La CI exécute SQLite et PostgreSQL, rend les manifests et contrôle les dépendances. CodeQL et Trivy complètent la surveillance. Les actions GitHub sont épinglées à leurs commits. La publication Docker Hub se déclenche par Release GitHub ou manuellement et refait les contrôles, y compris PostgreSQL, avant publication. La Release conserve le digest, le commit, un SBOM et les manifests d'installation.

**Les tests end-to-end et la fusion automatique des mises à jour attendent la validation de la V1.** Dependabot propose déjà des PR ; aucune fusion automatique ne contourne les vérifications. Le workflow E2E sera défini sur les parcours stabilisés, puis ajouté aux contrôles obligatoires de branche.

L'[audit de RetroGemini](docs/engineering-reference.md) explique les pratiques reprises et les différences. L'[étude produit](docs/product-research.md) cite les sources SessionLab/SessionPlan et motive la base neuve. Gstack a été installé en premier, puis utilisé pour les revues ; [outillage Gstack](docs/gstack.md).

L'[architecture](ARCHITECTURE.md) décrit les modules et leurs limites de confiance. Les [consignes de contribution](CONTRIBUTING.md) expliquent les vérifications SQLite/PostgreSQL et les changements de schéma.

## Confidentialité et limites

Les visiteurs n'ont jamais accès aux colonnes équipe, commentaires internes, comptes ou versions. Une discussion publique peut être activée séparément sur un lien, sans exposer les échanges internes. Tous les membres autorisés à une séance, y compris les lecteurs, peuvent consulter ses colonnes équipe. Un lien visiteur donne accès à toute personne qui le possède jusqu'à expiration/révocation. Une révocation coupe les prochaines lectures, elle ne peut retirer des données déjà lues ou exportées.

La sauvegarde utilise un contrôle de version et une fusion par identifiant et champ ; les conflits sur un même champ demandent une résolution explicite. Le rafraîchissement périodique ne constitue pas une édition CRDT caractère par caractère. Une instance applicative est prévue. Le minuteur linéaire refuse un jour contenant des salles parallèles : utiliser des séances distinctes pour conduire les salles. Le déploiement réel, votre fournisseur OIDC/SMTP, l'endpoint Qwen et la superposition au-dessus de PowerPoint restent à valider dans votre environnement.

Les fonctionnalités explicitement écartées restent absentes : parking lot, bibliothèque de blocs/sessions et pièces jointes.

## Licence

[Unlicense](LICENSE). Le code de MeetLoom est original. Aucune reprise de code AGPL SessionPlan ni de contenu de bibliothèque SessionLab. Les dépendances conservent leurs licences respectives.
