# Référence d’ingénierie : RetroGemini

Audit réalisé le 23 septembre 2026 sur les fichiers du dépôt public [RetroGemini](https://github.com/republique-et-canton-de-geneve/RetroGemini), branche `main`, commit **`eea60c4061703104fe5277e040f80c991c034b4e`**. La copie de travail consultée est dans `.tools/references/RetroGemini` ; elle sert uniquement de référence et ne doit pas être embarquée dans MeetLoom. Les constats ci-dessous décrivent les fichiers à ce commit, pas une certification du service déployé ni de ses réglages GitHub.

## Recommandation pour MeetLoom

Le circuit d’exploitation retenu pour MeetLoom est **Release GitHub → Docker Hub → mise à jour manuelle OpenShift**. Les manifests vivent dans `k8s`, avec overlays `development` et `production` sans namespace imposé. Les scripts prennent le namespace choisi par l’opérateur. Les objets, secrets et volumes sont propres à MeetLoom. GitHub ne reçoit aucun accès au cluster. Le [guide d’installation](deployment.md) fait référence pour les commandes et réglages effectivement livrés.

Conserver la famille technique de RetroGemini : **React + TypeScript + Vite pour l’interface, un serveur Node/Express et PostgreSQL pour la production**. Une seule image sert l’API et les ressources statiques sur le port 3000 configurable. Cela facilite l’exploitation dans OpenShift, évite un service frontal supplémentaire et conserve la même origine pour l’authentification et les mises à jour.

Partir d’un domaine neuf adapté aux agendas. Les bonnes pratiques de RetroGemini sont transférables ; ses structures de données de rétrospective, son authentification par équipe et ses mécanismes de fusion de documents complets ne sont pas des composants à recopier sans adaptation. Une édition d’agenda doit utiliser des opérations ciblées, une autorisation serveur et une révision pour détecter les conflits. Les notes privées doivent être absentes des réponses et événements visiteurs, pas simplement masquées dans le navigateur.

PostgreSQL constitue le mode de référence de production. Un mode SQLite local reste possible s’il simplifie réellement l’essai et fait l’objet des mêmes contrats de persistance ; il ne doit pas retarder les fondations PostgreSQL. L’API de stockage doit permettre de faire évoluer le schéma avec des migrations explicites. Démarrer avec un seul pod applicatif tant que les tests de concurrence et la diffusion entre pods ne sont pas prouvés. Documenter cette limite avant d’annoncer une architecture multi-pod.

## Ce que RetroGemini met effectivement en œuvre

| Domaine      | Observation dans le code                                                                                | Application à MeetLoom                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Interface    | React/TypeScript, Vite, Tailwind, composants fonctionnels, ressources locales                           | Même famille de stack, traductions FR/EN dès le départ, pas de CDN nécessaire à l’exécution                                     |
| Serveur      | Express, routes séparées des services, services injectés aux routes                                     | Modules `auth`, `agenda`, `sharing`, `timer`, `ai`, `health`, avec contrats typés                                               |
| Persistance  | PostgreSQL ou SQLite, stockage de documents JSON, contrôles de révision et écritures atomiques          | Transactions et révisions ; préférer des mutations ciblées aux remplacements de gros documents                                  |
| Temps réel   | Socket.IO, adaptateurs PostgreSQL/Redis, présence, reconnexion et acquittements                         | Authentifier chaque abonnement ; séparer canaux organisateurs et projections visiteurs ; ne pas partager des états privés bruts |
| Exploitation | Sondes `/health` et `/ready`, arrêt SIGTERM, journaux JSON corrélés, budgets de cache                   | Même séparation vivacité/disponibilité, arrêt propre, ressources bornées, logs sans contenu privé                               |
| IA           | Service serveur compatible `/chat/completions`, endpoint/modèle/clé configurables, fonction optionnelle | Fournisseur Qwen interne configurable, aucun appel LLM direct depuis le navigateur                                              |
| Distribution | Image Docker multi-stage, compose, Kustomize Kubernetes/OpenShift                                       | Une image autonome ; configuration, secrets et données hors image                                                               |

Sources : [package.json](https://github.com/republique-et-canton-de-geneve/RetroGemini/blob/eea60c4061703104fe5277e040f80c991c034b4e/package.json), [server.js](https://github.com/republique-et-canton-de-geneve/RetroGemini/blob/eea60c4061703104fe5277e040f80c991c034b4e/server.js), [dataStore.js](https://github.com/republique-et-canton-de-geneve/RetroGemini/blob/eea60c4061703104fe5277e040f80c991c034b4e/server/services/dataStore.js), [socketAdapter.js](https://github.com/republique-et-canton-de-geneve/RetroGemini/blob/eea60c4061703104fe5277e040f80c991c034b4e/server/services/socketAdapter.js), [shutdown.js](https://github.com/republique-et-canton-de-geneve/RetroGemini/blob/eea60c4061703104fe5277e040f80c991c034b4e/server/services/shutdown.js).

## CI et maintenance des dépendances

Le workflow `ci.yml` installe depuis le lockfile avec `npm ci`, lance ESLint, TypeScript, les tests et la couverture, puis construit la production. Il comprend une matrice Node, un audit npm et un contrôle séparé de la couverture de tout le code. Le job final **CI Success** dépend de tous les autres et utilise `if: always()` : un job annulé ou sauté ne devient pas un succès implicite. Le nom stable de ce contrôle permet de modifier la matrice sans devoir changer les protections de branche à chaque fois. Les workflows ordinaires déclarent `contents: read`, et les actions sont épinglées sur un SHA avec un commentaire de version.

Le contrôle npm global de niveau modéré est informatif (`continue-on-error: true`), tandis que les vulnérabilités de production de niveau élevé ou critique bloquent. CodeQL analyse JavaScript/TypeScript à chaque PR et périodiquement. Trivy construit l’image, produit un rapport SARIF et bloque sur les vulnérabilités élevées/critiques disposant d’un correctif. Il faut distinguer ces politiques : un scan vert ne signifie pas l’absence de toute vulnérabilité.

Dependabot vérifie npm quotidiennement, les actions chaque semaine et groupe les mises à jour liées. Le groupe Vitest inclut les versions majeures afin de garder cohérents le cœur et ses modules de couverture. Le groupe CodeQL évite de mélanger les versions d’actions appartenant à la même famille. Ce sont des motifs utiles à reprendre ; les comptes de reviewers, les versions et les exceptions propres à RetroGemini ne le sont pas.

L’auto-merge appelle `gh pr merge --auto --squash` pour les PR du bot qui ne sont pas des montées de version majeures. **Ce workflow ne vérifie pas lui-même la réussite des E2E : il s’appuie sur les contrôles obligatoires et les protections configurés sur GitHub.** Les réglages du dépôt doivent donc faire partie du guide d’installation de la CI. Le commentaire « security updates only » dans `dependabot.yml` ne suffit pas à rendre la configuration exclusive aux correctifs de sécurité : elle configure aussi des mises à jour de versions et applique le label `security` à toutes les PR npm.

Pour MeetLoom, appliquer deux étapes conformément à la demande utilisateur :

1. **Avant validation de la V1** : lint, typage, tests unitaires ciblés sur les règles et l’autorisation, intégration API/persistance, build, scans ; Dependabot ouvre ses PR. L’auto-merge reste désactivé. Les parcours UI sont vérifiés manuellement, sans suite E2E durable à maintenir prématurément.
2. **Après validation de la V1** : construire une petite suite Playwright sur les parcours stabilisés, la rendre obligatoire dans les protections, puis activer l’auto-merge des correctifs et mises à jour mineures. Les changements majeurs restent en revue. L’auto-merge ne doit jamais être présenté comme protégé par des E2E avant que ce contrôle existe réellement et soit requis.

Sources : [ci.yml](https://github.com/republique-et-canton-de-geneve/RetroGemini/blob/eea60c4061703104fe5277e040f80c991c034b4e/.github/workflows/ci.yml), [dependabot.yml](https://github.com/republique-et-canton-de-geneve/RetroGemini/blob/eea60c4061703104fe5277e040f80c991c034b4e/.github/dependabot.yml), [dependabot-auto-merge.yml](https://github.com/republique-et-canton-de-geneve/RetroGemini/blob/eea60c4061703104fe5277e040f80c991c034b4e/.github/workflows/dependabot-auto-merge.yml), [codeql.yml](https://github.com/republique-et-canton-de-geneve/RetroGemini/blob/eea60c4061703104fe5277e040f80c991c034b4e/.github/workflows/codeql.yml), [docker-security.yml](https://github.com/republique-et-canton-de-geneve/RetroGemini/blob/eea60c4061703104fe5277e040f80c991c034b4e/.github/workflows/docker-security.yml).

### Stratégie de tests à reprendre

RetroGemini dispose de tests métier, serveur, autorisation, concurrence, accessibilité et déploiement. Les tests de convergence entre deux clients et de révisions sont particulièrement pertinents : vérifier seulement un état final ne détecte pas une oscillation perpétuelle entre deux navigateurs. Pour MeetLoom, prioriser les invariants du planning, la confidentialité des projections publiques, la révocation des liens, les transitions du minuteur et l’absence de perte d’édition concurrente.

Les E2E RetroGemini conservent traces, captures et vidéos et comprennent un deuxième lancement contre les fichiers de production servis par Express. C’est nécessaire pour exercer les véritables en-têtes CSP ; un test uniquement contre Vite peut réussir alors que la production ne charge plus. Reprendre ce principe une fois l’interface MeetLoom validée, avec peu de scénarios de valeur : création et édition d’agenda, partage/public filtré, conduite chronométrée, FR/EN et déconnexion/reconnexion.

Sources : [e2e.yml](https://github.com/republique-et-canton-de-geneve/RetroGemini/blob/eea60c4061703104fe5277e040f80c991c034b4e/.github/workflows/e2e.yml), [playwright.prod.config.ts](https://github.com/republique-et-canton-de-geneve/RetroGemini/blob/eea60c4061703104fe5277e040f80c991c034b4e/playwright.prod.config.ts), [twoBrowserSessionConvergence.test.ts](https://github.com/republique-et-canton-de-geneve/RetroGemini/blob/eea60c4061703104fe5277e040f80c991c034b4e/__tests__/twoBrowserSessionConvergence.test.ts).

## OpenShift : pratiques et déploiement rapide

RetroGemini utilise une base Kustomize et un overlay OpenShift. L’overlay ajoute une Route TLS avec redirection HTTPS, remplace PostgreSQL par l’image Red Hat prévue pour OpenShift et retire les UID/GID fixes de la base. Ce dernier point évite le rejet du pod par les contraintes de sécurité qui attribuent un UID dans la plage du projet.

Les pods déclarent `runAsNonRoot`, `seccompProfile: RuntimeDefault`, `allowPrivilegeEscalation: false`, suppression de toutes les capabilities et `automountServiceAccountToken: false`. L’application n’a aucune raison de recevoir un jeton donnant accès à l’API Kubernetes. Le déploiement applicatif configure deux replicas, rolling update sans indisponibilité volontaire, ressources, sondes et PDB. Les secrets sont séparés de la Kustomization : réappliquer les manifests ne remplace pas accidentellement le mot de passe PostgreSQL ou le secret de session.

Le guide attire l’attention sur deux points très concrets : modifier un Secret PostgreSQL ne modifie pas à lui seul le mot de passe déjà stocké dans la base ; le `PGDATA` de l’image PostgreSQL standard doit être un sous-répertoire du volume pour éviter `lost+found` et des permissions incompatibles. L’image Red Hat possède son propre montage et ses propres noms de variables ; l’overlay supprime donc ce `PGDATA` hérité.

Le guide actuel nécessite plusieurs commandes. Pour satisfaire l’installation rapide de MeetLoom, fournir un **script d’installation idempotent** qui :

1. vérifie `oc`, la connexion et le projet cible, ainsi que les paramètres requis ;
2. crée uniquement les secrets absents, avec des valeurs aléatoires fortes, sans imprimer leurs valeurs ;
3. prépare l’overlay pour le registre interne et la version exacte de l’image ;
4. applique PostgreSQL/PVC, Service, application et Route ;
5. attend la base puis le déploiement, déduit l’URL canonique de la Route et applique la configuration associée ;
6. vérifie `/ready` et affiche l’URL ainsi que les commandes de diagnostic.

L’installateur doit accepter une base PostgreSQL existante. Un déploiement embarqué à un seul replica de base est une installation simple, pas une promesse de haute disponibilité ; sauvegarde et restauration doivent être expliquées séparément. Les secrets et les modifications propres à un environnement doivent survivre aux mises à jour. Une nouvelle exécution ne doit ni régénérer les identifiants ni réinitialiser les données.

Une image applicative neuve peut utiliser directement un utilisateur non privilégié, les permissions de groupe compatibles avec un UID arbitraire et les seuls chemins écrits explicitement montés. Cela évite de reproduire l’entrypoint Docker RetroGemini qui démarre en root pour corriger les permissions de `/data` avant d’abaisser ses droits. En OpenShift, ce même entrypoint sait toutefois déjà fonctionner quand la plateforme le lance directement avec un UID arbitraire.

Les NetworkPolicies de RetroGemini sont volontairement optionnelles : une règle permissive déjà présente dans le namespace peut rendre leur restriction inopérante. Le guide doit présenter un contrôle réel de connectivité et la relation avec les règles de la plateforme. Ne pas inclure un « default deny » du namespace sans connaître les autres applications et les besoins DNS/LLM/SMTP du projet.

Sources : [guide k8s](https://github.com/republique-et-canton-de-geneve/RetroGemini/blob/eea60c4061703104fe5277e040f80c991c034b4e/k8s/README.md), [deployment.yaml](https://github.com/republique-et-canton-de-geneve/RetroGemini/blob/eea60c4061703104fe5277e040f80c991c034b4e/k8s/base/deployment.yaml), [overlay OpenShift](https://github.com/republique-et-canton-de-geneve/RetroGemini/tree/eea60c4061703104fe5277e040f80c991c034b4e/k8s/overlays/openshift), [Dockerfile](https://github.com/republique-et-canton-de-geneve/RetroGemini/blob/eea60c4061703104fe5277e040f80c991c034b4e/Dockerfile), [networkpolicy.yaml](https://github.com/republique-et-canton-de-geneve/RetroGemini/blob/eea60c4061703104fe5277e040f80c991c034b4e/k8s/base/networkpolicy.yaml).

## Confidentialité et branchement de Qwen

RetroGemini sert ses ressources localement et applique une CSP, sans dépendance obligatoire à un service externe en fonctionnement. Son IA est désactivée tant qu’elle n’est pas configurée ; le serveur construit la requête vers un endpoint OpenAI-compatible. Les routes IA sont authentifiées et leurs erreurs publiques ne révèlent pas les adresses internes ni les réponses détaillées du fournisseur.

MeetLoom reprend ce fonctionnement avec `QWEN_BASE_URL`, `QWEN_MODEL`, un secret de clé éventuel, timeout et limite de taille. Le modèle réellement exposé et son identifiant sont configurés par l’opérateur. Prévoir un certificat d’autorité interne via la configuration TLS de Node ; ne pas reprendre par défaut l’option RetroGemini qui désactive la vérification de certificat.

La génération d’agenda doit produire une proposition structurée validée par schéma, visible avant insertion, et conserver la version existante en cas d’erreur. Les contenus d’agenda sont des données à transmettre au modèle, pas des instructions permettant à celui-ci de modifier des autorisations. Le fournisseur et la clé relèvent de l’administration serveur. La fonctionnalité doit rester utilisable sans IA pour toutes les opérations essentielles.

Pour les liens visiteurs, définir une seule fonction serveur de projection de l’agenda qui exclut les cellules privées, les prompts de présentation et les informations d’administration. L’utiliser pour HTTP, événements temps réel, export public et vue de présentation. Des jetons aléatoires révocables, une portée de lecture seule, un contrôle de validité à chaque accès et `Cache-Control: no-store` pour les réponses sensibles sont des fondations utiles. Un visiteur ne doit jamais recevoir un champ privé, même s’il inspecte la réponse réseau.

Sources : [aiService.js](https://github.com/republique-et-canton-de-geneve/RetroGemini/blob/eea60c4061703104fe5277e040f80c991c034b4e/server/services/aiService.js), [aiRoutes.js](https://github.com/republique-et-canton-de-geneve/RetroGemini/blob/eea60c4061703104fe5277e040f80c991c034b4e/server/routes/aiRoutes.js), [securityHeaders.js](https://github.com/republique-et-canton-de-geneve/RetroGemini/blob/eea60c4061703104fe5277e040f80c991c034b4e/server/services/securityHeaders.js).

## Publication et éléments à améliorer plutôt que copier

RetroGemini publie les images dans un workflow dédié et attache une nomenclature CycloneDX des dépendances de production à la release. Ce document est utile pour une organisation isolée qui doit savoir ce qui est installé sans interroger npm. L’image finale n’embarque pas les dépendances de développement. Prévoir également une archive des manifests, un guide d’upgrade/rollback et une politique de sauvegarde.

Quelques limites observables dans les fichiers méritent une adaptation :

- L’analyse CodeQL et l’envoi SARIF peuvent continuer en erreur. Sur MeetLoom, distinguer clairement un résultat de scan réussi d’un upload indisponible ; un contrôle manquant ne doit pas ressembler à un scan propre.
- La publication Docker est un workflow manuel pouvant être déclenché par celui de release ; aucun lien `needs` ne la relie aux tests de `ci.yml`. La chaîne MeetLoom doit publier l’image du commit validé et exposer sa révision/digest, sans publier un autre état de `main` qui aurait bougé entre-temps.
- Le commentaire du Deployment affirmant qu’un workflow réécrit automatiquement le tag est devenu obsolète : `docker-deploy.yml` documente au contraire la suppression de cette étape. Garder une seule source de version et tester la cohérence image/manifests/docs est préférable à recopier ces commentaires.
- Les images de base et PostgreSQL ont des tags mobiles. Pour une release interne reproductible, consigner les digests utilisés et faire proposer leurs mises à jour par une automatisation revue.
- Les snapshots applicatifs stockés dans la même base rendent une restauration fonctionnelle possible mais ne remplacent pas une sauvegarde externe face à une perte de volume.

Sources : [docker-deploy.yml](https://github.com/republique-et-canton-de-geneve/RetroGemini/blob/eea60c4061703104fe5277e040f80c991c034b4e/.github/workflows/docker-deploy.yml), [github-release.yml](https://github.com/republique-et-canton-de-geneve/RetroGemini/blob/eea60c4061703104fe5277e040f80c991c034b4e/.github/workflows/github-release.yml), [deploymentManifestParity.test.ts](https://github.com/republique-et-canton-de-geneve/RetroGemini/blob/eea60c4061703104fe5277e040f80c991c034b4e/__tests__/deploymentManifestParity.test.ts), [backupService.js](https://github.com/republique-et-canton-de-geneve/RetroGemini/blob/eea60c4061703104fe5277e040f80c991c034b4e/server/services/backupService.js).

## Correspondance des pratiques livrées

| Pratique observée dans RetroGemini            | Adaptation MeetLoom                                                                                      |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| CI, typage, tests, build, artefacts           | `ci.yml`, Node 24, contrats SQLite et PostgreSQL, build conservé et check agrégé `CI Success`            |
| CodeQL périodique et sur PR                   | `security.yml`, suite sécurité/qualité, échec visible plutôt que masqué                                  |
| Scan image et dépendances                     | Audit npm bloquant en production, Trivy bloquant, smoke avec UID arbitraire et racine en lecture seule   |
| Dependabot npm/actions/Docker                 | Groupes de dépendances liées React, Tiptap et CodeQL ; aucune affectation à un compte personnel          |
| Fusion automatique après E2E                  | Reportée jusqu’à validation V1 et protections de branche configurées                                     |
| GitHub Release et Docker Hub                  | Un workflow vérifie le même commit puis publie version, SHA, digest, SBOM et archive d’installation      |
| Répertoire `k8s`, overlays et secrets séparés | Environnements génériques, secrets créés une fois, garde contre perte de mot de passe d’un PVC existant  |
| Bouton Render et Blueprint                    | Construction depuis le dépôt et plan gratuit éphémère documenté, premier compte protégé par token généré |
| README, sécurité, exploitation                | Guides de contribution, déploiement, sauvegarde, mise à jour et retour arrière                           |

Le [Blueprint RetroGemini](https://github.com/republique-et-canton-de-geneve/RetroGemini/blob/eea60c4061703104fe5277e040f80c991c034b4e/render.yaml) utilise une image prépubliée. MeetLoom construit le Dockerfile du dépôt pour fonctionner aussi après un fork, sans dépendre d’un compte Docker Hub particulier. Les détails et limites du service gratuit sont dans le [guide Render](render.md). Les contrôles de compatibilité TypeScript 7 propres à RetroGemini et sa matrice de versions Node ne sont pas repris tant que MeetLoom cible explicitement Node 24.

## Périmètre de validation de cet audit

Les fichiers de configuration, de CI, de déploiement et les services cités ont été lus. Aucun déploiement OpenShift, lancement de CI distante ou examen des protections effectives du dépôt n’a été réalisé pour cet audit. Les pratiques proposées pour MeetLoom sont des choix d’architecture tirés de cette lecture, et seront validées sur son propre code et son propre environnement. L’usage de gstack demandé par l’utilisateur relève de l’installation et du workflow du projet MeetLoom ; les instructions du dépôt de référence décrivent son propre usage de gstack et ne remplacent pas celles de ce projet.
