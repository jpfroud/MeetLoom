# Connexion organisationnelle et courriels internes

OIDC et SMTP sont optionnels. Sans leurs variables, l'application utilise uniquement les comptes locaux et ne contacte aucun fournisseur d'identité ni serveur de courrier. Les tests utilisent des adaptateurs simulés : aucun message réel n'est envoyé pendant le développement.

## OIDC

Déclarer un client confidentiel **Authorization Code** dans votre fournisseur interne (par exemple Keycloak). Enregistrer exactement l'URI `${APP_ORIGIN}/api/auth/oidc/callback`, activer PKCE S256 et fournir les claims `sub`, `email`, `email_verified`, `name` avec les scopes `openid email profile`.

```dotenv
APP_ORIGIN=https://meetloom.internal.example.org
COOKIE_SECURE=true
OIDC_ISSUER=https://identity.internal.example.org/realms/organisation
OIDC_CLIENT_ID=meetloom
OIDC_CLIENT_SECRET=valeur-secrete-du-client
OIDC_ACCOUNT_POLICY=existing
```

`existing` autorise la première liaison seulement lorsque l'e-mail **vérifié par ce fournisseur de confiance** correspond à un compte local existant. Ce choix signifie que l'organisation fait confiance à son fournisseur pour contrôler l'adresse professionnelle ; ne pas configurer un fournisseur public ou un realm autorisant des adresses auto-déclarées. `invited` autorise aussi la création d'un compte lorsqu'une invitation administrateur active correspond à cette adresse. Une invitation d'espace conserve son rôle lors de l'acceptation SSO. Aucun compte créé par SSO ne devient administrateur global. Le premier administrateur doit toujours utiliser l'installation locale.

Après la liaison, l'identité est le couple `(issuer, sub)` ; un nouveau `sub` ne peut pas reprendre un compte déjà lié via une adresse recyclée. Un compte désactivé reste refusé. La déconnexion ferme la session MeetLoom ; elle ne déconnecte pas toutes les applications du fournisseur. Le secret client reste côté serveur et aucun access/refresh token du fournisseur n'est conservé après connexion.

Le flux utilise state et nonce aléatoires, PKCE S256, une liaison au navigateur par cookie HttpOnly/SameSite=Lax, une expiration de dix minutes et une consommation atomique à usage unique. Le cookie de session habituel garde sa protection SameSite=Strict. La bibliothèque [openid-client](https://github.com/panva/openid-client) valide les réponses et les ID tokens ; les connexions au fournisseur exigent HTTPS et des certificats valides. Les certificats internes peuvent être ajoutés avec `NODE_EXTRA_CA_CERTS`, sans désactiver la vérification TLS.

## SMTP et récupération de mot de passe

```dotenv
SMTP_HOST=smtp.internal.example.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=compte-de-service
SMTP_PASSWORD=mot-de-passe-secret
SMTP_FROM=meetloom@example.org
SMTP_SCHEDULED=true
```

Avec `SMTP_SECURE=false`, STARTTLS est **obligatoire**, pas opportuniste. Le port 465 utilise normalement `SMTP_SECURE=true`. L'authentification est facultative pour un relais interne qui la gère autrement ; renseigner utilisateur et mot de passe ensemble. Les certificats sont vérifiés et les accès aux fichiers/URL de contenu Nodemailer sont désactivés. Voir le [transport SMTP officiel](https://nodemailer.com/smtp).

Le lien « Mot de passe oublié » apparaît lorsque SMTP est configuré. La réponse reste identique pour les adresses connues, inconnues, désactivées ou temporairement limitées. Un délai par adresse de quinze minutes et une limite par IP réduisent les envois abusifs. Le lien est valable une heure, à usage unique, et seul son hash est stocké en base. Un échec d'envoi invalide ce lien. Le corps contenant le lien reste en mémoire pendant l'envoi ; il n'est jamais journalisé ni enregistré dans une file persistante. En cas de redémarrage avant envoi, l'utilisateur devra redemander un lien. Une réinitialisation réussie ferme toutes les autres connexions locales du compte.

## Digests et rappels

Chaque compte choisit explicitement dans son profil les digests et/ou rappels ; les deux préférences sont désactivées par défaut. `SMTP_SCHEDULED=false` désactive uniquement l'ordonnanceur et conserve la récupération de mot de passe.

L'ordonnanceur intégré examine les tâches toutes les minutes, avec une instance applicative recommandée. Le digest regroupe les notifications non lues des heures terminées, sous forme de titres et liens vers les séances encore accessibles. Il ne copie pas le texte privé des commentaires. Le dernier intervalle traité est conservé en base ; après une interruption, le rattrapage est limité à sept jours.

Les rappels partent trois jours calendaires avant la première date de la séance, selon son fuseau horaire. Seuls propriétaire et éditeurs (y compris les rôles effectifs d'espace) les reçoivent. Ils résument les tâches ouvertes, le matériel et le nombre de discussions non résolues ; les listes sont limitées à 30 éléments. Ils ne contiennent aucun lien public secret. Séances archivées, accès révoqués et comptes désactivés sont exclus.

Une clé de livraison persistante et un verrou temporaire évitent les doubles envois usuels ; les erreurs sont retentées au plus trois fois, espacées d'au moins cinq minutes. Comme tout envoi SMTP, un arrêt entre l'acceptation du message par le relais et son acquittement en base peut exceptionnellement produire un doublon. Les journaux ne contiennent ni adresse, ni corps, ni jeton. Référence fonctionnelle des rappels : [documentation SessionLab](https://help.sessionlab.com/en/articles/11786738-stay-prepared-with-pre-session-reminder-emails).

## OpenShift / Kubernetes

Le Deployment charge facultativement le ConfigMap et le Secret tous deux nommés `meetloom-services`. L'installation de base fonctionne sans eux. Copier et adapter [l'exemple non secret](../k8s/optional/services-config.example.yaml), en retirant les lignes du service non utilisé. Stocker les secrets dans un fichier local exclu de Git, par exemple `.env.services-secrets` :

```dotenv
OIDC_CLIENT_SECRET=valeur-privee
SMTP_USER=compte-de-service
SMTP_PASSWORD=valeur-privee
```

Après sélection du projet cible, appliquer la configuration et le secret, puis relancer le Deployment :

```sh
oc apply -f chemin-vers-votre-services-config.yaml
oc create secret generic meetloom-services --from-env-file=.env.services-secrets --dry-run=client -o yaml | oc apply -f -
oc rollout restart deployment/meetloom
oc rollout status deployment/meetloom
```

Conserver ces valeurs dans votre gestionnaire de secrets habituel. Aucun accès au cluster ni identifiant SMTP/OIDC n'est requis dans GitHub. Si une politique réseau contrôle les sorties, autoriser les DNS internes, le fournisseur OIDC HTTPS et le relais SMTP. Docker Compose transmet les mêmes variables ; placer un proxy HTTPS devant l'application et adapter `APP_ORIGIN`/`COOKIE_SECURE` avant d'activer ces services en production.
