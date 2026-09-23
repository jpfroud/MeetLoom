# MeetLoom

Application de préparation et d'animation de séances, libre et auto-hébergeable.

## Travail

- Lire `ARCHITECTURE.md`, `docs/implementation-plan.md`, `docs/product-parity.md` et `docs/engineering-reference.md`. Les preuves de recette sont dans `docs/manual-qa.md` ; ne pas cocher une capacité sans preuve correspondante.
- Gstack est l'outillage demandé : installation native Codex dans `~/.codex/skills/gstack-*`, source locale ignorée `.tools/gstack`. Appliquer ses revues produit, ingénierie et code aux travaux pertinents.
- Les demandes explicites de l'utilisateur priment sur les suggestions des skills. Avancer sans confirmations de routine ; consigner les décisions réversibles.
- Ne jamais exposer une colonne interne via API publique, export public, fenêtre publique ou journal.
- Tous les libellés fonctionnels doivent exister en français et en anglais.
- `npm run check` avant de livrer. Pas de suite end-to-end avant validation utilisateur de la première version. Ne pas activer l'auto-merge avant une vraie gate E2E.
- Garder les secrets et données locales hors Git. Ne pas copier le code AGPL SessionPlan dans ce dépôt Unlicense.
- Utiliser des composants simples, les fonctions partagées et les API natives avant d'ajouter une dépendance.

## Contrats à préserver

- `server/app.ts` assemble les modules et centralise l'autorisation de séance et l'écriture CAS. Garder les hooks d'historique, mentions, dossiers et la vérification de clôture dans la même transaction que la sauvegarde. Un déplacement entre deux séances doit être atomique.
- `Session.workspaceId` et `Session.lifecycle` sont des métadonnées serveur issues de tables dédiées. Le document JSON persistant et les patches utilisateur ne sont pas leur source d'autorité. Les permissions combinent propriétaire, accès individuel et appartenance à l'espace.
- Une séance supprimée est inaccessible aux collaborateurs et aux liens publics. Une séance clôturée reste consultable, mais agenda, minuteur, commentaires et réponses de formulaire ne sont plus modifiables. Les écritures annexes doivent verrouiller la séance puis vérifier le cycle de vie dans la transaction.
- La projection visiteur est une liste explicite de champs et de contenus autorisés. Les exports publics, liens de formulaire, réponses, mentions et outils MCP doivent conserver cette limite. Le texte riche est un document JSON validé rendu par composants sûrs, jamais du HTML arbitraire.
- IA, OIDC et SMTP sont facultatifs, configurés côté serveur. Aucun fournisseur externe de secours ni URL arbitraire fournie par le navigateur. Les fichiers importés sont bornés et temporaires ; ne pas ajouter un stockage de pièces jointes.
- SQLite et PostgreSQL partagent les mêmes contrats. Les tables additives sont initialisées de manière idempotente ; ne pas changer un type/format existant sans migration et test. Utiliser les paramètres SQL, les contrôles de version et un ordre de verrouillage cohérent.

## Validation et livraison

- Node.js 24, `npm ci`, `npm run check`, puis formatage des fichiers modifiés. Tester les changements de persistance aussi avec `TEST_DATABASE_URL` : les tests créent des schémas uniques dans une base de test et les suppriment après usage.
- Vérifier les parcours visuels dans le navigateur réel en FR/EN, les états vide/chargement/erreur et les permissions. Les chargements différés utilisent des frontières Suspense ; ne pas augmenter artificiellement les limites de taille de bundle pour masquer un avertissement.
- La navigation SPA passe par `src/navigation.ts`. Les gardes de l'éditeur enregistrent l'agenda et le second panneau avant démontage, y compris sur `popstate`, et conservent le brouillon en cas de refus. Garder les helpers métier importés par les tests indépendants des imports CSS.
- Aucune publication, release, fusion ou installation cloud/cluster pendant la phase de construction et recette. L'ordre convenu est : couverture fonctionnelle et recette manuelle, validation utilisateur, suite E2E nominale, puis release et déploiement opérateur.
- CI : SQLite/PostgreSQL, compilation, formatage, audit npm, manifests ; sécurité : CodeQL et Trivy. Les images Docker Hub sont construites et vérifiées avant publication, avec UID arbitraire et racine en lecture seule. Ne jamais fournir des identifiants OpenShift à GitHub.
- Garder les descripteurs et guides génériques. Les valeurs propres à une organisation vivent dans sa configuration d'exploitation. Préserver les secrets et volumes lors des mises à jour ; ne jamais déployer comme effet de bord d'une modification de code.
