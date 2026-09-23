# Contribuer à MeetLoom

Utiliser Node.js 24 et `npm ci`, puis suivre le [démarrage local](README.md). Créer une branche `codex/description` ou une branche de travail personnelle et soumettre une PR. Ne pas ajouter de fichiers `.env`, de base SQLite, de dumps, de secrets ou d’agendas privés au dépôt.

Avant une PR, exécuter `npm run check` et formater les fichiers modifiés avec Prettier. Les contrats API doivent continuer à passer sur SQLite et PostgreSQL ; la CI couvre les deux. Pour vérifier localement PostgreSQL, définir `TEST_DATABASE_URL` vers une base de test où l’utilisateur peut créer et supprimer des schémas isolés, puis lancer `npm test`.

L'[architecture](ARCHITECTURE.md) indique où placer les changements. Réutiliser `tests/support.ts` pour les tests HTTP : ils démarrent une application sur boucle locale, créent des comptes isolés et nettoient leurs ressources. Ne jamais diriger `TEST_DATABASE_URL` vers une base de production. Les changements de schéma sont additives et idempotents ; accompagner une modification de stockage d'une migration compatible et d'un test sur les deux moteurs.

Les changements d’autorisations, de projection visiteur, de persistance ou de format d’agenda nécessitent des tests métier/API pertinents. Les corrections visuelles se vérifient dans le navigateur. Les tests end-to-end seront introduits après validation de la première version et ne sont pas encore un contrôle disponible.

Une écriture d'agenda utilise le contrôle de version central ; une écriture annexe (commentaire, réponse, partage) vérifie aussi la clôture et la corbeille sous verrou transactionnel. Les déplacements entre séances ne doivent jamais réussir à moitié. Tester la révocation d'accès, les identifiants appartenant à une autre séance, les requêtes concurrentes et la confidentialité des données publiques.

Les interfaces comportent les libellés FR/EN, un état de chargement, une erreur récupérable et les droits réels du compte. Les modules d'éditeur, d'administration et de formulaires sont chargés selon le parcours ; comparer les tailles de bundles après un ajout important, sans masquer les avertissements du compilateur.

Les dépendances passent par Dependabot et les mêmes vérifications que le code. Les actions GitHub restent épinglées à leur SHA. La fusion automatique est désactivée jusqu’à la mise en place des E2E validés et des protections de branche. Pour une vulnérabilité, suivre [SECURITY.md](SECURITY.md).

Les manifests sont génériques : conserver les namespaces, domaines et registres d’une installation particulière dans son overlay d’exploitation, hors des valeurs distribuées. Une release se prépare en modifiant la version de `package.json` et du lockfile ensemble. La [procédure de publication](docs/deployment.md) décrit Docker Hub, les artefacts et le déploiement manuel par l’opérateur.

Dans cette phase, ne pas déclencher de release ou de déploiement : la couverture fonctionnelle et la recette manuelle précèdent la validation utilisateur, puis la suite E2E et la première publication. Le bouton Render est un descripteur d'installation disponible pour l'opérateur ; sa démo gratuite utilise un stockage éphémère.
