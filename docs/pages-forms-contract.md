# Pages et formulaires — contrat implémenté

Contrat implémenté le 23 septembre 2026 dans `shared/content.ts`, `server/content-api.ts` et les composants PageEditor/FormEditor/PublicForm. La recette utilisateur reste dans la checklist de parité ; ce document ne déclare pas la parité complète acquise.

La référence [Pages SessionLab](https://help.sessionlab.com/en/articles/11514746-pages-for-session-briefs-needs-assessment-reports-and-to-capture-notes-beyond-your-agenda) demande documents riches, liens vers sections, édition dans un panneau et impression. La référence [Forms SessionLab](https://help.sessionlab.com/en/articles/11721938-forms-gather-insights-from-your-workshop-participants) demande questions, publication, choix de l'identité, réponses, CSV et aide IA. Le contrat ci-dessous est une proposition MeetLoom pour implémenter ces parcours avec confidentialité explicite.

## Données d'agenda

Extensions facultatives de `Session`, afin de lire les agendas existants sans migration destructive :

```ts
interface SessionPage {
  id: string;
  title: string;
  visibility: "team" | "public"; // team par défaut
  sections: { id: string; content: string }[]; // format riche existant
}
interface QuestionBase {
  id: string;
  title: string;
  description: string; // riche sûr
  required: boolean;
}
type FormQuestion = QuestionBase &
  (
    | { type: "short" | "long" | "image" }
    | { type: "single" | "multiple"; options: { id: string; label: string }[] }
    | {
        type: "scale";
        min: number;
        max: number;
        minLabel: string;
        maxLabel: string;
      }
    | {
        type: "matrix";
        rows: { id: string; label: string }[];
        options: { id: string; label: string }[];
      }
  );
interface SessionForm {
  id: string;
  title: string;
  description: string;
  identityMode: "automatic" | "optional" | "anonymous";
  questions: FormQuestion[];
}
// Session.pages?: SessionPage[]
// Session.forms?: SessionForm[]
// Session.contentOrder?: {kind:"day"|"page"|"form"; id:string}[]
```

Les identifiants stables permettent liens de section/question, changement d'ordre et édition sans perdre la destination. Une liste d'ordre absente signifie jours, puis pages, puis formulaires. Si présente, elle ne peut référencer que des éléments existants sans doublon ; les nouveaux éléments manquants sont ajoutés à la fin par `orderedContent`. Une suppression retire sa référence. Les types et règles sont exportés depuis `shared/content.ts` pour limiter la taille du domaine temporel.

Bornes proposées : 30 pages, 30 formulaires, 100 sections par page, 100 questions par formulaire, 30 options/lignes par question, titres 200 caractères, descriptions et sections 30 000, limites globales sur la taille du JSON de session. L'unicité des identifiants doit inclure les nouvelles entités et sous-entités. Une réponse utilise les IDs de questions/options/lignes et jamais leurs indices. L'import régénère ces IDs et force les pages importées à `team`. La duplication n'emporte pas les réponses ni les publications.

## Publications et réponses

Les réponses ne sont pas stockées dans `Session`. Elles n'entrent ni dans les snapshots de versions ni dans la sauvegarde d'agenda, et aucune projection publique ne les inclut.

- `form_publications` : id, session_id, form_id, token_hash unique, enabled, definition_json, revision, created_at, updated_at. Le jeton aléatoire n'est retourné qu'à la création ; une rotation explicite peut le remplacer. Conserver séparément le brouillon et la définition publiée évite de modifier silencieusement le sens des questions déjà répondues.
- `form_responses` : id, publication_id, session_id, form_id, definition_json/revision, answers_json, respondent_user_id nullable, respondent_name/email nullable, created_at. Le snapshot garantit un export interprétable après renommage ou suppression d'une question. Aucune adresse IP ni user-agent dans la réponse anonyme.
- Un identifiant aléatoire de soumission client sert à l'idempotence des retries ; unicité publication + identifiant, pas d'empreinte du navigateur. Ne pas prétendre interdire les réponses multiples anonymes sans mécanisme d'invitation individuel.

API proposée :

| Route                                                          | Permission et résultat                                                                                                                 |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/sessions/:id/forms/:formId/publication`              | can(share), métadonnées de publication sans secret                                                                                     |
| `POST /api/sessions/:id/forms/:formId/publish`                 | can(share), snapshot validé du brouillon, retourne le lien à la création                                                               |
| `POST /api/sessions/:id/forms/:formId/unpublish`               | can(share), fermeture immédiate, réponses conservées                                                                                   |
| `POST /api/sessions/:id/forms/:formId/rotate`                  | can(share), révoque l'ancien lien et retourne le nouveau                                                                               |
| `GET /api/forms/:token`                                        | public, publication active seulement, définition whitelist et indication d'identité effective pour le requérant                        |
| `POST /api/forms/:token/responses`                             | public, rate limit, longueur bornée, révision attendue, validation des valeurs et questions obligatoires ; 409 si publication modifiée |
| `GET /api/sessions/:id/forms/:formId/responses`                | can(edit), pagination bornée, données et schémas nécessaires à l'export                                                                |
| `DELETE /api/sessions/:id/forms/:formId/responses/:responseId` | propriétaire ou administrateur autorisé à cette séance, suppression ciblée                                                             |

La vérification active/révision et l'insertion doivent être dans une transaction cohérente : une dépublication concurrente ne peut accepter une réponse après sa fermeture. PostgreSQL verrouille la publication ; SQLite utilise la transaction sérialisée existante. L'identité provient uniquement de l'authentification serveur : `anonymous` force tous les champs d'identité à null, `automatic` associe uniquement un compte connecté, `optional` exige son choix explicite ; une personne non connectée reste anonyme. L'interface affiche cette décision avant envoi.

## Projection et interface

Pages : projection whitelist des pages `public`, après restriction du lien Visitor à ses IDs autorisés ; aucune Page dans Online Agenda. Formulaires : seuls ceux explicitement sélectionnés pour un Visitor Link et actuellement publiés peuvent être listés, sous forme de liens dédiés. Le formulaire public ne reçoit jamais le brouillon ni les réponses. Les règles exactes de portée devront se raccorder au lot des liens Visitor/Online sans ouvrir tous les éléments par défaut.

Composants proposés : `PageEditor` réutilise `RichTextEditor` par section, liens profonds `#page=<id>&section=<id>`, actions ajout/ordre/duplication/suppression et panneau latéral ; `FormEditor` utilise une liste de questions réordonnable et une prévisualisation ; `FormResponseView` agrège les choix/échelles/matrices et permet lecture détaillée et export CSV neutralisé ; `PublicForm` présente validation par question, état d'envoi, identité explicite et confirmation idempotente. FR/EN sur toutes ces vues.

Recette de sécurité : Page interne absente de HTTP/HTML/JSON public ; commentaire ou métadonnée de brouillon absent ; permission lecteur refusée pour réponses ; aucun compte enregistré en mode anonyme ; source des questions figée à la soumission ; token révoqué refusé ; submit dupliqué idempotent ; questions et options inconnues rejetées ; champs obligatoires et matrice validés ; ajout d'un nouveau formulaire ne le publie pas ; sauvegarde/restauration de session ne réactive pas un ancien lien.

## Réponses par image

Le septième type de question, `image`, accepte PNG, JPEG et WebP. Le navigateur réduit une image source de moins de 5 Mo à 1 280 pixels de côté au maximum et la réencode sur un canevas : les métadonnées du fichier source ne sont pas conservées. La soumission accepte au plus 256 Kio par image et 512 Kio d'images cumulées. L'API vérifie séparément format, signature, encodage et limites ; un client API direct reste responsable des métadonnées présentes dans ses pixels ou son fichier.

Les fichiers sont stockés dans `form_response_images`, séparément du JSON d'agenda et des réponses paginées. Celles-ci ne contiennent qu'une référence opaque de contenu. La route `GET /api/sessions/:id/forms/:formId/responses/:responseId/images/:questionId` vérifie le rôle propriétaire/éditeur de la séance et les quatre identifiants. Elle utilise le cookie authentifié, refuse le cache et sert seulement le type raster validé ; aucun lien public ne donne accès aux images reçues. La suppression d'une réponse supprime ses images par cascade. Les réponses anonymes ne reçoivent toujours aucun identifiant de compte ; une photo peut néanmoins identifier visuellement une personne, ce que le formulaire signale.

La synthèse IA reçoit uniquement un marqueur d'image, sans contenu binaire ni référence. Le CSV utilise `[Image]`, et le détail des réponses autorisé affiche l'image. Cette fonctionnalité n'ajoute aucune pièce jointe aux blocs. `tests/form-images.test.ts` couvre bornes, formats interdits, idempotence, droits, absence d'identité, exclusion IA/CSV et suppression en cascade sur SQLite et PostgreSQL. La sélection réelle d'un fichier et sa transformation dans Chrome restent à recetter.

## Vérification comparative restante

Les rapports IA sur réponses omettent les identités et les images ; les défauts Pages/Forms des espaces sont implémentés. Les PDF de Pages et QR de formulaires passent par le module export. Les parcours de toutes les variantes de questions et l'ouverture des fichiers exportés restent suivis dans [product-parity.md](product-parity.md), sans déduire une parité complète des seuls tests API.
