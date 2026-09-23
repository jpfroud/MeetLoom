# Exploiter MeetLoom

Ce guide complète [l’installation](deployment.md). Les exemples utilisent le namespace dev `meetloom-dev`. Pour la production, remplacer explicitement ce nom par `meetloom-prod`. Les commandes sont exécutées par l’opérateur, jamais par la CI. Les fichiers d’ingénierie s’inspirent de l’[audit RetroGemini](engineering-reference.md), avec une première version volontairement limitée à un pod applicatif.

## Contrôler l’installation

```bash
oc -n meetloom-dev get deployments,pods,svc,route,pvc
oc -n meetloom-dev rollout status deployment/meetloom
oc -n meetloom-dev logs deployment/meetloom --tail=100
oc -n meetloom-dev exec deployment/meetloom -- node -e "fetch('http://127.0.0.1:3000/api/ready').then(async r=>{console.log(r.status);process.exit(r.ok?0:1)})"
```

`/api/health` indique que le processus répond. `/api/ready` contrôle la disponibilité de la base. La readiness ne doit pas dépendre du LLM facultatif : une interruption Qwen ne doit pas retirer l’application du réseau. Les journaux ne doivent pas être utilisés comme stockage des prompts ou des contenus privés des réunions.

| Symptôme                    | Vérification                                                                             |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| `ImagePullBackOff`          | Référence d’image publiée, accès au registre et pull secret du ServiceAccount            |
| PVC `Pending`               | Classe de stockage par défaut, quota et capacité disponibles                             |
| Pod rejeté par une SCC      | Absence d’UID ajouté manuellement, politique non privilégiée et image PostgreSQL adaptée |
| Cookie/session refusé       | HTTPS, `APP_ORIGIN` exacte, Route, et nombre de proxys de confiance                      |
| Readiness en échec          | Logs de l’application/base, `DATABASE_URL`, DNS et réseau PostgreSQL                     |
| IA absente                  | `QWEN_BASE_URL` et `QWEN_MODEL` dans le ConfigMap, redémarrage après modification        |
| Erreur de certificat du LLM | CA interne montée et `NODE_EXTRA_CA_CERTS`, sans désactiver TLS                          |

## Sauvegarder et restaurer

Pour PostgreSQL géré, utiliser le mécanisme de sauvegarde de la plateforme avec un test régulier de restauration. Pour la base embarquée, une sauvegarde logique peut être extraite ainsi depuis Bash :

```bash
PG_POD=$(oc -n meetloom-dev get pod -l app.kubernetes.io/name=meetloom-postgresql -o jsonpath='{.items[0].metadata.name}')
oc -n meetloom-dev exec "$PG_POD" -- sh -c 'PGPASSWORD="$POSTGRESQL_PASSWORD" pg_dump -h 127.0.0.1 -U "$POSTGRESQL_USER" -d "$POSTGRESQL_DATABASE" -Fc -f /tmp/meetloom.dump'
oc -n meetloom-dev cp "$PG_POD:/tmp/meetloom.dump" ./meetloom.dump
oc -n meetloom-dev exec "$PG_POD" -- rm -f /tmp/meetloom.dump
```

Conserver la copie en dehors du cluster et appliquer les règles de rétention de l’organisation. Le dump contient les agendas, les comptes et des données privées ; le chiffrer et restreindre son accès. `oc cp` requiert l’outil `tar` dans l’image de la base ; s’il est absent, utiliser l’outillage de sauvegarde de la plateforme. Conserver également la version/digest de l’image et les paramètres nécessaires à la restauration, avec les secrets dans le gestionnaire de secrets.

Tester d’abord une restauration dans un projet distinct. Préparer une base vide compatible, copier le dump dans son pod puis utiliser `pg_restore --no-owner` avec son utilisateur et sa base. Vérifier la connexion, plusieurs agendas, les permissions et les liens partagés. Une restauration dans une base en service implique une procédure d’arrêt et de remplacement des données qui doit être planifiée, pas un simple redéploiement de manifests.

Pour SQLite local, arrêter l’application avant de copier `meetloom.sqlite` et ses éventuels fichiers WAL/SHM, ou utiliser l’API de sauvegarde SQLite. Copier uniquement le fichier principal pendant une écriture n’est pas une procédure de sauvegarde fiable. Le volume Docker persistant ne remplace pas une sauvegarde externe.

## Mettre à jour et revenir en arrière

1. Relever l’image actuellement déployée avec `oc -n meetloom-dev get deployment meetloom -o jsonpath='{.spec.template.spec.containers[0].image}'`.
2. Faire une sauvegarde et lire les éventuelles instructions de migration.
3. Changer uniquement l’image du conteneur `app` dans le Deployment `meetloom`, dans la console ou avec `oc set image`. Secrets, configuration et PVC sont préservés. Si les manifests changent dans cette release, relancer son installateur en indiquant la nouvelle image.
4. Vérifier la readiness, puis connexion, ouverture d’agenda, lien visiteur et minuteur dans le navigateur.

Si la version est incompatible, remettre l’image précédente avec `oc set image` ou dans la console. Une image plus ancienne ne peut pas forcément lire un schéma migré : le retour arrière de données exige alors la sauvegarde et la procédure de migration correspondante. La V1 utilise `Recreate` ; annoncer une courte interruption aux organisateurs avant mise à jour.

Modifier le Secret de mot de passe PostgreSQL ne constitue pas une rotation complète. Le mot de passe doit aussi être modifié dans PostgreSQL, puis dans la chaîne `DATABASE_URL`, de façon coordonnée. Les Secrets/ConfigMaps étant injectés comme variables d’environnement, appliquer leur changement ne suffit pas : redémarrer les pods concernés. L’installateur ne réalise pas de rotation implicite.

## Réseau et données privées

La Route termine TLS et redirige HTTP vers HTTPS. Le réseau Route-vers-pod dépend de la politique de la plateforme ; si un chiffrement de bout en bout est exigé, préparer un overlay avec terminaison réencryptée et certificats serveur.

Le fichier `k8s/optional/database-networkpolicy.yaml` n’est pas appliqué automatiquement. Il limite l’ingress PostgreSQL aux pods de l’application dans le namespace, à condition qu’aucune autre NetworkPolicy n’accorde déjà un accès plus large. Avant utilisation :

```bash
oc -n meetloom-dev get networkpolicy -o yaml
oc -n meetloom-dev apply -f k8s/optional/database-networkpolicy.yaml
```

Puis vérifier qu’un pod applicatif accède à la base et qu’un pod sans le label de l’application n’y accède pas, avec une image de diagnostic autorisée par l’organisation. Une simple présence de NetworkPolicy ne prouve pas l’isolement. Les accès sortants au LLM, à PostgreSQL externe et au DNS doivent être préservés par les règles réseau de la plateforme.

Le partage visiteur doit être considéré comme un accès de lecture à toute personne possédant le lien. Révoquer les liens devenus inutiles. La confidentialité des colonnes est appliquée sur les projections serveur ; un export ou une vue de présentation publique ne doit jamais récupérer les champs organisateurs cachés.

## Conservation, clôture et services facultatifs

L’archivage organise le tableau de bord sans retirer les accès existants. La clôture rend l’agenda non modifiable et ferme les contributions publiques ; la suppression retire immédiatement l’accès aux visiteurs et collaborateurs, puis conserve une séance restaurable pendant 30 jours. Les éléments supprimés d’un agenda sont restaurables pendant 72 heures. La purge des séances expirées est effectuée par lots bornés lorsque la corbeille est consultée ou utilisée ; ce n’est pas un traitement planifié à la seconde près. Les copies présentes dans les sauvegardes suivent leur propre rétention. Voir le [guide espaces, historique et cycle de vie](workspaces-and-lifecycle.md).

Les migrations additives s’exécutent au démarrage avant la disponibilité du serveur. Une sauvegarde et sa restauration vérifiée restent nécessaires avant toute mise à jour du schéma. Le journal et les versions font partie de la base : préserver PostgreSQL préserve aussi les droits, les invitations, les liens de partage, les formulaires et les conversations IA. Ne pas réinitialiser la base pour mettre à jour l’application.

Si OIDC ou SMTP est activé, ajouter leurs destinations aux règles réseau sortantes de la plateforme et conserver leurs secrets hors Git. Tester une connexion OIDC, une récupération de compte et un envoi de test après rotation des identifiants. Les rappels et résumés email sont facultatifs et soumis aux préférences des utilisateurs ; le processus applicatif les traite, ce qui renforce la limite actuelle d’un seul pod. Le [guide des services](services-auth-mail.md) décrit leurs variables, politiques d’accès et comportements en cas d’absence.

## CI et publication sur GitHub

Les workflows définissent :

- **CI Success** : agrégation du typage, des tests SQLite et PostgreSQL, du build, de l’audit des dépendances et du rendu des manifests ;
- **CodeQL** : analyse de sécurité du code, sur PR et périodiquement ;
- **Container scan** : démarrage de l’image avec UID arbitraire et racine en lecture seule, puis scan Trivy bloquant sur les vulnérabilités élevées/critiques corrigibles ;
- **Release GitHub and Docker Hub** : une Release GitHub publiée ou un lancement manuel depuis `main` déclenche typage, tests SQLite/PostgreSQL, build, audit et scan ; l’image versionnée est publiée sur Docker Hub, avec SBOM, digest et archive OpenShift attachés à la Release.

Configurer les protections/rulesets GitHub pour exiger `CI Success`, `CodeQL` et `Container scan`, interdire les pushes directs non prévus et exiger la résolution des discussions. Les noms exacts affichés peuvent inclure le workflow ; sélectionner les checks réellement produits par le premier run. Un fichier YAML ne configure pas lui-même ces protections. CodeQL doit être disponible sur le dépôt ; s’il devient privé dans une organisation, vérifier ses droits/licences avant migration. Les coûts éventuels de runner, registre et infrastructure dépendent de l’hébergement choisi ; l’application n’ajoute pas de service SaaS obligatoire.

Pour bloquer aussi une PR sur les alertes CodeQL, configurer la règle GitHub **Require code scanning results** avec l’outil CodeQL et le seuil de sévérité retenu. La réussite du job d’analyse ne signifie pas qu’aucune alerte n’a été trouvée. Les résultats Trivy sont également envoyés au tableau Security en SARIF. Activer les alertes Dependabot, les mises à jour de sécurité et, si disponible, la protection contre les secrets poussés. [Protection de fusion par code scanning](https://docs.github.com/en/code-security/how-tos/find-and-fix-code-vulnerabilities/manage-your-configuration/set-merge-protection).

Dependabot ouvre les mises à jour npm, GitHub Actions et Docker. Les actions sont épinglées par SHA ; leurs mises à jour passent donc par une PR. **L’auto-merge est absent en V1**, conformément à l’ordre demandé : stabiliser et valider le produit, puis ajouter les tests E2E.

Après validation de la V1 : ajouter une petite suite Playwright incluant l’application de production, rendre son contrôle obligatoire, puis seulement introduire l’auto-merge des PR Dependabot mineures/correctives. L’auto-merge doit s’appuyer sur les protections effectives de branche, et les mises à jour majeures restent revues. Prévoir le passage en échec en cas de test sauté ou annulé ; ne pas traiter un contrôle absent comme un succès.

Le workflow de release publie une version `X.Y.Z` et un tag `sha-COMMIT` du commit vérifié. Il ne modifie pas les manifests et ne déploie pas le cluster. La variable GitHub `DOCKERHUB_REPOSITORY` et les secrets `DOCKERHUB_USERNAME`/`DOCKERHUB_TOKEN` configurent la publication ; aucun accès OpenShift ne doit être ajouté à GitHub. Conserver le digest et le SBOM joints à la Release dans votre dépôt d’artefacts interne. Valider en dev, puis promouvoir la même image en prod.

## Vérifications restant à effectuer sur la plateforme cible

Les vérifications locales de syntaxe et de rendu ne prouvent ni l’admission par les SCC réelles, ni le téléchargement des images, ni la disponibilité du stockage. Avant de déclarer un environnement prêt : valider le démarrage rootless, les sondes, la Route/certificat, le premier compte, le redémarrage avec persistance, un export/restauration de base et la connexion au Qwen interne. La suite E2E durable sera ajoutée après validation fonctionnelle de la première version.
