# Gstack

Gstack a été installé avant l'implémentation, conformément à la demande, depuis le [dépôt officiel](https://github.com/garrytan/gstack).

- Version installée : `1.87.6.0`.
- Commit source : `636175d3496e1f5087d65522e69d314584c7b236`.
- Installation native Codex : `setup --host codex --prefix --no-plan-tune-hooks --no-timeline-stop-hook`.
- 54 dossiers de skills dans `~/.codex/skills/gstack*` sur le poste de développement.
- Bun officiel 1.4.2 téléchargé avec vérification SHA256.
- Navigateur compilé et vérifié sain ; télémétrie désactivée.
- Composant facultatif `/gstack-cso` indisponible sur ce poste sans Visual Studio C++ Build Tools. Ce composant n'a pas été présenté comme exécuté.

Le clone et les exécutables sont dans `.tools/`, ignoré par Git. Ils ne sont pas inclus dans l'image MeetLoom. Les instructions Gstack sont indépendantes du runtime applicatif.

La préparation a appliqué la recherche avant construction, le choix d'une base neuve motivé, les contrats de données explicites et la revue des frontières de confiance. Le préambule `/review` a été exécuté. Le workflow strict de PR s'est arrêté lorsque le dépôt était encore sur `main` ; la revue ciblée du code a alors suivi la checklist de sécurité et d'intégrité Gstack. Ne pas confondre cette revue ciblée avec une validation complète `/ship` ou une revue externe Claude.

Les défauts trouvés ont été corrigés : projection publique, concurrence des comptes et agendas, configuration cookie/origine, import de champs privés, génération et validation IA, publication et scripts idempotents. Une revue indépendante des manifests et une validation PostgreSQL/Linux ont complété la lecture du code.

La revue ciblée suivante, sur `codex/meetloom-v1`, a examiné comptes/OIDC/SMTP/invitations, transferts, partage et MCP. À ce moment, les nouveaux fichiers étaient encore non suivis et la CLI de revue externe Claude était absente : aucun certificat de revue complète de PR n’est revendiqué. Voir [security-review.md](security-review.md) pour les défauts reproduits, corrections et limites de couverture. Les réglages de télémétrie et de commits automatiques sont restés désactivés/non activés.

La décision utilisateur de reporter les tests end-to-end à l'acceptation de la V1 prime sur les recommandations génériques de QA de Gstack. Les vérifications ponctuelles dans Chrome et les tests unitaires/API ne créent pas de suite end-to-end à maintenir.

Pour installer Gstack sur un autre poste, suivre sa documentation courante et vérifier sa source avant `setup --host codex`. Ne pas recopier les binaires générés par ce poste Windows sur un hôte Linux.
