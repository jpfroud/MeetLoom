# Release GitHub → Docker Hub → OpenShift

Le déploiement est effectué par l’opérateur. Les workflows GitHub construisent et publient une image ; ils n’ont aucun identifiant OpenShift et ne modifient pas le cluster.

**Ordre de livraison de la première version :** terminer la couverture fonctionnelle et la recette manuelle, obtenir la validation utilisateur, ajouter la suite E2E nominale, puis seulement déclencher la release et les installations. Les commandes ci-dessous sont le guide pour cette étape ultérieure ; aucune publication ni installation n'est déclenchée par leur présence dans ce dépôt.

Les fichiers sont génériques et utilisables sur votre propre cluster. Les noms ci-dessous sont des exemples, sans lien avec une organisation particulière.

| Environnement | Namespace par défaut | Manifests                  |
| ------------- | -------------------- | -------------------------- |
| Dev           | `meetloom-dev`       | `k8s/overlays/development` |
| Prod          | `meetloom-prod`      | `k8s/overlays/production`  |

Les objets sont nommés `meetloom` ou `meetloom-*`. Chaque namespace conserve ses propres secrets, configuration et volume PostgreSQL, même lorsque l’image est identique. Aucun namespace n’est imposé par les manifests : `-Project` en PowerShell ou `MEETLOOM_NAMESPACE` dans l’environnement permet de choisir les vôtres.

## 1. Configurer GitHub et Docker Hub une seule fois

Créer ou choisir le dépôt Docker Hub qui recevra les images. Le workflow exige un nom explicite ; il ne suppose pas l’existence d’un dépôt ni les droits d’un compte particulier.

Dans **GitHub → Settings → Secrets and variables → Actions** :

| Type     | Nom                    | Valeur                                                  |
| -------- | ---------------------- | ------------------------------------------------------- |
| Variable | `DOCKERHUB_REPOSITORY` | `votre-compte/meetloom`, sans tag                       |
| Secret   | `DOCKERHUB_USERNAME`   | Compte autorisé à publier dans ce dépôt                 |
| Secret   | `DOCKERHUB_TOKEN`      | Jeton Docker Hub avec le droit de publier dans ce dépôt |

Par compatibilité avec RetroGemini, `DOCKERHUB_REPOSITORY` peut aussi être un Secret si la variable n’existe pas. Ne pas utiliser le mot de passe du compte Docker Hub et ne pas conserver le token dans Git. Aucun token, kubeconfig ou secret OpenShift n’est requis dans GitHub.

Si le dépôt Docker Hub est privé, préparer un pull secret dans chaque namespace et l’associer au ServiceAccount `default`, selon la procédure de votre cluster. PostgreSQL utilise l’image publique `quay.io/sclorg/postgresql-16-c9s`, prévue pour OpenShift. Un overlay peut lui substituer `registry.redhat.io/rhel9/postgresql-16` avec les droits Red Hat nécessaires, ou un miroir interne. [Images PostgreSQL SCLorg](https://github.com/sclorg/postgresql-container).

## 2. Publier une version

La source de version est `package.json`, actuellement `0.1.0`. Pour la version suivante, mettre à jour `package.json` et son lockfile dans une PR (par exemple avec `npm version 0.1.1 --no-git-tag-version`), puis fusionner les changements validés.

Choisir l’un des deux déclencheurs :

- **GitHub → Releases → Draft a new release** : publier le tag `v0.1.0` sur le commit voulu, dont `package.json` contient `0.1.0`.
- **GitHub → Actions → Release GitHub and Docker Hub → Run workflow**, branche `main` : la version de `package.json` est publiée et la Release GitHub est créée après réussite.

Le workflow vérifie le tag, teste exactement le commit sélectionné sur SQLite et PostgreSQL, contrôle les dépendances, construit et scanne l’image. Il publie ensuite :

```text
docker.io/votre-compte/meetloom:0.1.0
docker.io/votre-compte/meetloom:sha-COMMIT_COMPLET
```

Il attache à la Release le SBOM, une archive des manifests/guides et `meetloom-image.json` contenant la référence de l’image, son digest et le commit. Attendre le workflow vert avant d’utiliser l’image : la présence d’une Release créée depuis l’interface GitHub ne signifie pas que la construction est terminée. Le tag `latest` n’est publié que sur demande manuelle ; utiliser les tags de version ou le digest pour OpenShift.

Ne pas réutiliser une version pour un autre commit. Pour reproduire exactement une installation, conserver le digest fourni dans `meetloom-image.json`. Le workflow ne déploie rien sur OpenShift.

## 3. Installer la première fois

Prérequis : `oc`, PowerShell 7 (ou Bash + Python 3), accès au namespace choisi, classe de stockage disponible pour le PVC de 5 GiB, et accès aux images. Utiliser la commande de connexion de votre console OpenShift pour faire `oc login`. Vérifier le serveur et votre identité avant toute installation :

```bash
oc whoami
oc whoami --show-server
```

Depuis le dépôt ou l’archive de release extraite, installer seulement l’environnement voulu :

```powershell
pwsh ./scripts/deploy-openshift.ps1 -Environment development -Project meetloom-dev -Image docker.io/votre-compte/meetloom:0.1.0
# Lorsque vous souhaitez installer la production :
pwsh ./scripts/deploy-openshift.ps1 -Environment production -Project meetloom-prod -Image docker.io/votre-compte/meetloom:0.1.0
```

Ou avec Bash :

```bash
bash scripts/deploy-openshift.sh development docker.io/votre-compte/meetloom:0.1.0
MEETLOOM_NAMESPACE=mon-projet bash scripts/deploy-openshift.sh production docker.io/votre-compte/meetloom:0.1.0
```

Créer au préalable le projet s’il n’existe pas, avec `oc new-project meetloom-dev`, ou demander sa création à l’administrateur du cluster. L’installateur n’ajoute ni ne supprime de namespace. Il génère les secrets absents, crée la Route pour connaître l’URL HTTPS, applique les manifests, attend les déploiements et contrôle la readiness. Il ne change pas votre projet courant. Les secrets et la configuration de chaque namespace restent hors Kustomization ; ils sont conservés lors d’une nouvelle exécution.

Le mot de passe PostgreSQL et le token de première installation comportent chacun **32 octets aléatoires indépendants**, encodés en hexadécimal. Ils ne sont jamais affichés dans les logs. Si un PVC existe mais que son secret a disparu, le script s’arrête : restaurer les identifiants existants au lieu d’en générer d’autres.

### Premier compte

Le token `BOOTSTRAP_TOKEN` protège la création du premier administrateur. Le lire dans un terminal privé pour le saisir dans l’écran initial :

```powershell
$encoded = oc -n meetloom-dev get secret meetloom-auth -o 'jsonpath={.data.BOOTSTRAP_TOKEN}'
[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($encoded))
```

Pour la prod, remplacer le namespace par `meetloom-prod`. Conserver ce token dans votre gestionnaire de secrets ; il ne réinitialise pas un compte existant. L’application demande de choisir le nom, l’adresse et le mot de passe du premier compte, sans compte de démonstration préinstallé.

## 4. Mettre à jour après une nouvelle release

Après publication réussie de `0.1.1`, modifier **uniquement l’image du conteneur `app` dans le Deployment `meetloom`** dans la console OpenShift. Variante CLI, d’abord en dev :

```bash
oc -n meetloom-dev set image deployment/meetloom app=docker.io/votre-compte/meetloom:0.1.1
oc -n meetloom-dev rollout status deployment/meetloom
```

Après validation, promouvoir exactement cette image en prod :

```bash
oc -n meetloom-prod set image deployment/meetloom app=docker.io/votre-compte/meetloom:0.1.1
oc -n meetloom-prod rollout status deployment/meetloom
```

Une mise à jour d’image ne modifie ni les secrets, ni le PVC, ni le ConfigMap. Aucun redémarrage de PostgreSQL n’est nécessaire pour une simple mise à jour applicative. La V1 utilise un seul pod et la stratégie `Recreate` : prévoir une courte interruption. Si une release modifie les manifests, relancer son installateur en donnant la nouvelle image, après lecture de ses notes.

Un futur `oc apply -k` brut remettrait l’image définie dans les manifests. Utiliser l’installateur avec `-Image` ou conserver la version choisie dans votre overlay d’exploitation. La valeur `docker.io/your-account/meetloom:0.1.0` de la base est un repère de remplacement, pas une image publiée.

## 5. Retour arrière

Conserver la référence précédente et une sauvegarde avant mise à jour. Si la nouvelle version pose problème, remettre l’image précédente avec la même commande `oc set image`, puis attendre le rollout. Une migration de schéma peut nécessiter une restauration compatible ; revenir à une ancienne image ne restaure pas les données. Voir [sauvegarde et exploitation](operations.md).

## Secrets et configuration

| Ressource, créée dans chaque namespace   | Contenu                                                                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Secret `meetloom-database`               | `POSTGRESQL_USER`, `POSTGRESQL_PASSWORD`, `POSTGRESQL_DATABASE`, `DATABASE_URL` ; mode externe : `DATABASE_URL` seulement |
| Secret `meetloom-auth`                   | `BOOTSTRAP_TOKEN`                                                                                                         |
| ConfigMap `meetloom-settings`            | `APP_ORIGIN` déduite de la Route, `QWEN_BASE_URL`, `QWEN_MODEL` et `QWEN_VISION_MODEL` optionnels                         |
| Secret `meetloom-ai`, optionnel          | `QWEN_API_KEY`                                                                                                            |
| ConfigMap `meetloom-services`, optionnel | Paramètres OIDC et SMTP non secrets ; exemple dans `k8s/optional/services-config.example.yaml`                            |
| Secret `meetloom-services`, optionnel    | `OIDC_CLIENT_SECRET`, `SMTP_USER` et `SMTP_PASSWORD` selon les services activés                                           |

Les ressources d’environnement ne sont pas réécrites par `oc apply -k`. Un mot de passe PostgreSQL déjà initialisé ne peut pas être changé en modifiant seulement le Secret : la base et `DATABASE_URL` doivent être mis à jour de façon coordonnée. Une modification de Secret/ConfigMap injecté dans l’application demande un redémarrage de son Deployment.

Pour Qwen, définir `QWEN_BASE_URL`, `QWEN_MODEL` et éventuellement `QWEN_API_KEY` dans l’environnement de l’installation initiale, ou modifier ensuite les ressources ci-dessus. Exemple d’endpoint : `https://llm.interne/v1`. Pour l’import de documents par un modèle visuel compatible, ajouter `QWEN_VISION_MODEL` au ConfigMap ; le modèle texte suffit pour la construction d’agendas. Monter l’autorité de certification interne et utiliser `NODE_EXTRA_CA_CERTS` si nécessaire ; conserver la vérification TLS.

La connexion OIDC, la récupération de mot de passe par email et les emails récapitulatifs sont facultatifs. Ils ne nécessitent aucun service public imposé. Suivre le [guide OIDC et SMTP](services-auth-mail.md) pour créer les deux ressources `meetloom-services`, déclarer l’URL de retour auprès de votre fournisseur d’identité et tester l’envoi SMTP. Leurs secrets ne sont ni générés ni remplacés par les scripts d’installation. Sans configuration, la connexion locale et les notifications dans l’application restent disponibles.

Pour PostgreSQL géré à l’extérieur, préparer `MEETLOOM_DATABASE_URL` et ajouter `-ExternalDatabase` au script PowerShell, ou `external` comme troisième argument Bash. Aucun PostgreSQL/PVC n’est installé dans ce mode. Une bascule de mode avec une installation existante est volontairement refusée tant que la migration n’a pas été préparée.

## Personnalisation et essais locaux

Pour Kubernetes sans OpenShift, partir de `k8s/base` et `k8s/postgresql` dans votre propre Kustomization. Fournir les mêmes Secrets/ConfigMap décrits ci-dessus, remplacer l’image et ajouter un Ingress HTTPS adapté à votre contrôleur. Définir `APP_ORIGIN` avec son URL publique et `TRUST_PROXY` selon la topologie. Une Route OpenShift ne fonctionne pas sur un cluster Kubernetes standard ; les scripts fournis automatisent la variante OpenShift. Sur Kubernetes, configurer aussi le groupe d’accès au volume PostgreSQL (par exemple `fsGroup: 26` pour l’image SCLorg) selon votre StorageClass ; OpenShift attribue le groupe via sa SCC.

Les images s’exécutent sans privilège et acceptent un UID arbitraire. L’application utilise une racine en lecture seule, les sondes `/api/health` et `/api/ready`, et aucun token d’accès à Kubernetes. Pour un registre interne, une classe de stockage particulière ou des limites de ressources différentes, conserver les ajustements dans un overlay d’exploitation.

Les NetworkPolicies sont optionnelles : `k8s/optional/database-networkpolicy.yaml` ne cible que PostgreSQL MeetLoom, jamais le namespace entier. Vérifier les règles déjà appliquées par la plateforme avant de l’utiliser ; une règle existante plus permissive peut rendre cette restriction inefficace.

Pour un essai local rapide, copier `.env.example` en `.env`, définir deux valeurs hexadécimales aléatoires distinctes `POSTGRES_PASSWORD` et `BOOTSTRAP_TOKEN`, puis :

```bash
docker compose up --build -d
```

Ouvrir `http://localhost:3000`. PostgreSQL n’est pas exposé sur l’hôte et l’application écoute uniquement sur `127.0.0.1`. `docker compose down` conserve les données ; ne pas ajouter `--volumes` pour une mise à jour. Le profil local utilise HTTP ; les manifests OpenShift utilisent HTTPS. Pour un essai sans Docker, voir le [README](../README.md).

Les manifests et scripts sont vérifiés localement. Leur admission, les pull secrets, le stockage, les Routes et votre Qwen restent à vérifier par l’opérateur dans les environnements cibles. Aucun accès à ces environnements n’est nécessaire à la préparation de ces fichiers.

Pour une démonstration hébergée depuis un bouton, voir [Render](render.md). Le plan gratuit utilise un stockage éphémère ; privilégier votre propre infrastructure pour conserver des agendas privés.
