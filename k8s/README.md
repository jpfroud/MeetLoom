# Installation OpenShift

Le circuit est **Release GitHub → image Docker Hub → mise à jour OpenShift par l’opérateur**. Aucun workflow GitHub ne possède d’accès au cluster et aucun déploiement distant n’est déclenché automatiquement.

Les manifests sont indépendants de toute organisation. Les namespaces ci-dessous sont des exemples configurables, pas des valeurs imposées dans les overlays.

| Environnement | Namespace       | Overlay                    |
| ------------- | --------------- | -------------------------- |
| Développement | `meetloom-dev`  | `k8s/overlays/development` |
| Production    | `meetloom-prod` | `k8s/overlays/production`  |

Toutes les ressources applicatives sont nommées `meetloom` ou préfixées `meetloom-`, avec leurs propres selectors, secrets et PVC. Elles peuvent cohabiter avec RetroGemini. Les namespaces ne sont ni créés ni supprimés par l’installateur.

Après configuration Docker Hub et publication d’une première release, l’opérateur connecté avec `oc login` peut installer :

```powershell
pwsh ./scripts/deploy-openshift.ps1 -Environment development -Project meetloom-dev -Image docker.io/votre-compte/meetloom:0.1.0
pwsh ./scripts/deploy-openshift.ps1 -Environment production -Project meetloom-prod -Image docker.io/votre-compte/meetloom:0.1.0
```

Ou avec Bash :

```bash
bash scripts/deploy-openshift.sh development docker.io/votre-compte/meetloom:0.1.0
MEETLOOM_NAMESPACE=mon-projet bash scripts/deploy-openshift.sh production docker.io/votre-compte/meetloom:0.1.0
```

Créer d’abord le projet avec `oc new-project` si nécessaire. Les commandes sont à exécuter par l’opérateur, seulement dans l’environnement souhaité. Remplacer `votre-compte/meetloom` par la variable GitHub `DOCKERHUB_REPOSITORY` configurée pour le projet. L’image `your-account/meetloom` de la base est un repère de remplacement, pas la preuve qu’une image publiée existe.

Les Secrets et le ConfigMap de l’environnement sont créés uniquement s’ils sont absents, hors Kustomization, puis conservés lors des mises à jour. Un PVC existant sans le Secret de sa base fait échouer l’installation : aucun nouveau mot de passe n’est généré pour des données existantes.

Pour une mise à jour ordinaire, changer uniquement l’image du conteneur `app` du Deployment `meetloom` dans la console, ou :

```bash
oc -n meetloom-dev set image deployment/meetloom app=docker.io/votre-compte/meetloom:0.1.1
oc -n meetloom-dev rollout status deployment/meetloom
```

Après validation en dev, répéter avec `-n meetloom-prod`. Cette opération ne modifie ni les secrets ni les données. Le retour arrière utilise la même commande avec la version précédente, sous réserve de compatibilité du schéma.

Le [guide complet](../docs/deployment.md) détaille les secrets GitHub, le premier compte, la publication, les mises à jour, les variantes PostgreSQL/Qwen et le registre interne. Le [guide d’exploitation](../docs/operations.md) couvre les sauvegardes et diagnostics.
