# Secrets propres à chaque environnement

Les secrets sont volontairement exclus des Kustomizations. L’installateur les crée une seule fois avec des valeurs aléatoires et refuse de remplacer des identifiants existants. Aucun mot de passe de production ni valeur par défaut utilisable n’est versionné ici.

Pour un provisionnement par le gestionnaire de secrets de l’organisation, créer dans chaque namespace :

- `meetloom-database` : clés `POSTGRESQL_USER=meetloom`, `POSTGRESQL_DATABASE=meetloom`, `POSTGRESQL_PASSWORD` aléatoire et `DATABASE_URL` construite avec ces mêmes identifiants. Ajouter l’annotation `meetloom.io/database-mode: bundled`. Pour une base externe : uniquement `DATABASE_URL` et annotation `meetloom.io/database-mode: external`.
- `meetloom-auth` : clé `BOOTSTRAP_TOKEN` aléatoire, indépendante du mot de passe PostgreSQL.
- `meetloom-ai` si nécessaire : clé `QWEN_API_KEY`.

Les valeurs sensibles sont des clés `data`/`stringData` de Secrets Kubernetes `Opaque`, jamais des ConfigMaps. L’application utilise un ConfigMap distinct `meetloom-settings` pour `APP_ORIGIN`, `QWEN_BASE_URL` et `QWEN_MODEL`.

Ne pas réutiliser les secrets RetroGemini. Ne pas copier les valeurs dev vers la prod. Conserver les valeurs dans votre gestionnaire de secrets pour pouvoir restaurer les identifiants si une ressource Kubernetes disparaît. Les mots de passe déjà initialisés dans PostgreSQL ne changent pas lors d’une simple mise à jour du Secret.

Voir le [guide d’installation](../../docs/deployment.md) pour le circuit complet.
