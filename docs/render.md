# Démonstration sur Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/jpfroud/MeetLoom)

Le bouton ouvre le Blueprint [render.yaml](../render.yaml) dans votre compte Render. Vérifier les ressources et confirmer leur création dans Render : le bouton ne déploie rien sans cette action. Après un fork, remplacer le dépôt dans l’URL du bouton par le vôtre.

Le Blueprint construit le Dockerfile du dépôt, lance un service web **Free**, et n’ajoute aucune base payante. Les déploiements automatiques sont désactivés ; vous décidez des mises à jour dans le tableau de bord. Ce choix évite qu’une mise à jour du dépôt d’origine modifie une démonstration installée depuis son bouton. [Documentation du bouton Render](https://render.com/docs/deploy-to-render).

## Premier lancement

1. Choisir le nom du service et confirmer la création du Blueprint.
2. Attendre le build et l’état disponible, puis ouvrir l’URL HTTPS du service.
3. Dans **Render → service → Environment**, copier la valeur générée de `BOOTSTRAP_TOKEN` dans un endroit privé.
4. Saisir ce token sur la page initiale de MeetLoom et créer votre compte. Aucun mot de passe administrateur par défaut n’est fourni.

Le serveur déduit `APP_ORIGIN` de `RENDER_EXTERNAL_URL` au démarrage. Pour un domaine personnalisé, définir explicitement `APP_ORIGIN=https://votre-domaine.example` dans Render. Le token est généré aléatoirement par Render lors de sa création ; une mise à jour du Blueprint ne le remplace pas. [Variables Render](https://render.com/docs/environment-variables), [spécification Blueprint](https://render.com/docs/blueprint-spec).

## Limites du plan gratuit

Cette configuration sert à **tester avec des données jetables**. SQLite réside dans `/tmp` : comptes, agendas et réglages peuvent disparaître après une mise en veille, un redémarrage ou un déploiement. Render met les services gratuits en veille après 15 minutes sans trafic et le réveil peut prendre environ une minute. Les disques persistants ne sont pas disponibles sur ce plan. PostgreSQL gratuit chez Render expire après 30 jours ; il ne remplace donc pas une base durable gratuite. Les quotas et conditions de facturation restent ceux du compte Render. [Limites officielles du plan gratuit](https://render.com/docs/free).

Pour conserver les données, utiliser un PostgreSQL persistant via `DATABASE_URL` (chez le fournisseur de votre choix), ou adapter le service à une offre avec disque persistant et `SQLITE_PATH` sur ce disque. Ces options peuvent être payantes. Pour des données privées internes, utiliser le [déploiement OpenShift/Kubernetes](deployment.md) ou Docker Compose sur votre propre infrastructure.

Qwen reste désactivé tant que son endpoint n’est pas configuré. Une instance Render ne peut pas joindre automatiquement un serveur LLM limité au réseau interne de votre organisation.
