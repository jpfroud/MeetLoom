# IA interne et import documentaire

L’IA est désactivée sans `QWEN_BASE_URL`. L’URL, le modèle et la clé restent côté serveur. L’API attend le protocole compatible Chat Completions. `QWEN_MODEL` sélectionne le modèle texte ; `QWEN_VISION_MODEL` active explicitement l’OCR PNG/JPEG. Aucun document ni message ne part vers un fournisseur configuré implicitement.

## Conversations et propositions

Le panneau Assistant conserve des conversations privées par compte et séance. Le contexte est explicite : aucun, séance courante, jusqu’à cinq séances choisies, espace courant ou tous les espaces autorisés. Les deux derniers modes sélectionnent les séances non archivées accessibles au compte, jusqu’à 200, au début de la conversation ; une nouvelle conversation inclura les séances ajoutées ensuite. Les colonnes internes, Pages privées et définitions de Forms exigent la case d’inclusion des informations internes. Les réponses Forms ne sont jamais intégrées automatiquement. Le serveur vérifie les permissions sur chaque contexte à chaque requête et après l’appel du modèle. Retirer l’accès à une source bloque son ancienne conversation ; créer un contexte révisé pour continuer.

Le contexte du modèle est borné à 60 000 caractères. S’il faut l’abréger, un catalogue conserve chaque identifiant et titre de séance avec une part du contenu, et l’interface le signale. Choisir une séance précise pour travailler sur des détails omis. Les propositions modifient uniquement la séance actuellement ouverte ; les autres séances constituent des références.

L’assistant propose des opérations typées : modifier/ajouter/supprimer des blocs, traduire ou réécrire leurs champs, modifier dates/heures, créer/réviser Pages et formulaires. L’aperçu précède l’application. Les mutations ne peuvent pas modifier droits, liens de publication, identité propriétaire, audience des colonnes ou minuteur. Les propositions sont attachées à une version de séance ; un conflit nécessite une nouvelle proposition. Acceptation et écriture sont atomiques avec l’historique. Un double clic ou une course acceptation/rejet ne peut appliquer deux décisions.

Les administrateurs d’organisation ou d’espace gèrent des jeux d’instructions nommés, sélectionnables à la création d’une conversation. Les préférences personnelles sont visibles, modifiables et supprimables par leur propriétaire. Une conversation conserve jusqu’à 60 messages ; le modèle reçoit les 12 derniers messages et un contexte borné. Aucune mémoire n’est inférée en secret.

Dans les réponses d’un Form, « Analyser les réponses » envoie uniquement les questions et réponses, avec les libellés de leur version publiée. Les noms et adresses des comptes, identifiants et dates de réponse sont retirés. Les textes libres peuvent eux-mêmes contenir des informations personnelles : le panneau l’indique avant l’action. Le résultat précise les réponses incluses et le total ; l’échantillon est limité aux 500 réponses récentes et 100 000 caractères. Les droits d’édition sont revérifiés après l’appel du modèle. Cette synthèse n’est pas publiée automatiquement.

## Import et aperçu

Formats : JSON MeetLoom, DOCX, PPTX, XLSX, PDF contenant du texte, CSV/TSV, UTF-8 TXT/Markdown, PNG/JPEG avec modèle de vision activé. L’utilisateur peut mapper les colonnes d’un tableau, transformer chaque ligne en bloc, ou demander au modèle interne une structuration. Titres, durées et descriptions sont corrigibles dans l’aperçu. Seule l’action « Ajouter à la séance » fusionne les nouveaux jours. Le fichier source n’est pas conservé comme pièce jointe.

Les formats bureautiques sont extraits sur le serveur dans un worker distinct : 5 Mo d’entrée, 25 Mo décompressés cumulés, 8 Mo par entrée ZIP, 1 500 entrées, 15 secondes, deux traitements simultanés. Les déclarations XML DTD/entités sont refusées. Aucun chemin d’archive n’est extrait sur disque. Les PDF sont limités à 100 pages, PowerPoint à 500 diapositives, Excel à 30 feuilles ; les tableaux à 1 000 lignes de données et 40 colonnes. Le texte est limité à 200 000 caractères. Les formules Excel ne sont pas exécutées ; leurs valeurs enregistrées sont utilisées.

L’extraction perd certaines informations de mise en page. Les PDF scannés exigent un export PNG/JPEG des pages utiles pour l’OCR facultatif. Les anciens formats binaires DOC/PPT/XLS doivent être convertis en DOCX/PPTX/XLSX. Un fichier chiffré ou protégé doit être déverrouillé localement. L’OCR et les estimations de durée sont à contrôler dans l’aperçu.

Les colonnes d’un document importé sont privées. La fusion JSON conserve les données privées de la source, remappe les identifiants de jours/blocs/salles/Pages/Forms/catégories et retire les identifiants d’intervenants propres à la séance source. Aucune modification existante, horloge ou permission de la destination n’est remplacée.

## Vérification

`tests/ai-api.test.ts`, `ai-proposals.test.ts`, `form-ai.test.ts`, `document-api.test.ts` et `document-import.test.ts` vérifient permissions, conflits, décisions atomiques, absence d’identité dans la synthèse, extraction de vrais fichiers, archives piégées, délai et fusion privée. Les fournisseurs de test sont des serveurs HTTP locaux ; aucun Qwen réel n’a été contacté. La validation du modèle interne réel reste nécessaire dans l’environnement de déploiement.

Sources techniques : [Mammoth](https://github.com/mwilliamson/mammoth.js), [PDF.js](https://mozilla.github.io/pdf.js/), [read-excel-file](https://github.com/catamphetamine/read-excel-file), [JSZip](https://stuk.github.io/jszip/documentation/), [saxes](https://github.com/lddubeau/saxes), [CSV Parse](https://csv.js.org/parse/).
