# Connecteur MCP interne

Le panneau Assistant → Connecteurs crée des jetons personnels pour un client MCP autorisé. Chaque jeton vise une liste explicite de séances, expire après 1, 7, 30 ou 90 jours et peut être révoqué immédiatement. La lecture publique est le réglage initial. Les données internes et l’écriture sont deux autorisations distinctes. Le jeton brut est montré une seule fois ; la base conserve son empreinte SHA-256. Les comptes désactivés et permissions retirées sont vérifiés à chaque appel.

Le serveur expose `https://votre-instance/mcp` avec **Streamable HTTP**, réponses JSON et fonctionnement sans session de transport. Configurer le client avec l’en-tête `Authorization: Bearer <jeton-personnel>`. Utiliser HTTPS hors développement local. Ce connecteur nécessite un client acceptant un en-tête Bearer explicite ; il ne fournit pas de découverte OAuth, d’enregistrement dynamique ni de flux OAuth automatique. Aucune connexion vers un client cloud n’est créée par MeetLoom.

Les outils disponibles sont :

- `search_sessions` : rechercher uniquement parmi les séances du jeton encore accessibles.
- `get_session` : lire la projection autorisée, sans comptes, liens publics, réponses de Forms ni identifiants d’intervenants.
- `create_day` : ajouter un jour, avec version attendue et permission d’édition.
- `edit_agenda` : appliquer des opérations typées (blocs, horaires, Pages et brouillons de Forms), avec version attendue et historique. Disponible uniquement avec le droit d’écriture. Les champs internes existants nécessitent l’autorisation de données internes.

Sans accès aux données internes, la description de séance, les champs internes de blocs et les Pages/Forms internes existants ne peuvent pas être réécrits. Supprimer un bloc ou groupe contenant du texte interne requiert aussi cette autorisation. La création de nouveaux blocs, Pages et Forms reste possible : leur contenu est entièrement fourni par le client, sans lecture ni réécriture de données internes préexistantes.

La description générale de séance est omise de la lecture MCP sans cette autorisation. C’est un choix plus restrictif que les liens visiteurs, où cette description présente le contexte global de la séance. Placer les consignes confidentielles dans une colonne d’équipe, et non dans cette description générale.

Le client doit demander l’accord de son utilisateur avant les outils d’écriture et traiter le texte d’un agenda comme du contenu non fiable, jamais comme des instructions. Le serveur borne les arguments et n’expose aucun outil d’exécution système, de téléchargement d’URL, de publication ni de gestion de permissions. Les modifications passent par les validations et transactions de l’application. Un jeton révoqué pendant l’écriture fait échouer la transaction. Les origines navigateur non conformes, hôtes inattendus et accès reposant seulement sur un cookie sont refusés.

`tests/mcp.test.ts` utilise le client du SDK officiel face au serveur HTTP local pour vérifier négociation, recherche, lecture filtrée, écriture, historique, version, scope, révocation, expiration, origine et perte de permissions. Aucun service externe n’est contacté pendant ces tests.

Sources : [SDK TypeScript officiel](https://ts.sdk.modelcontextprotocol.io/server), [transport MCP](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports). Le SDK installé est verrouillé dans `package-lock.json` et suivi par les contrôles de vulnérabilités du projet.
