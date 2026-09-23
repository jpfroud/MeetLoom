# Recherche produit — MeetLoom

Audit du 23 septembre 2026. Les sources sont la documentation officielle SessionLab et le dépôt public SessionPlan. L'inspection de l'interface SessionLab avec le compte connecté complète cet audit. Les fonctionnalités décrites ci-dessous ne sont pas une déclaration de fonctionnalités déjà livrées. La cible précisée par l'utilisateur est la parité fonctionnelle complète, avec identité visuelle originale et ergonomie utile de SessionLab et SessionPlan. La checklist [product-parity.md](product-parity.md) précise désormais chaque écart et scénario de validation ; aucune fonctionnalité non exclue n'est reportée unilatéralement après validation.

## Décision proposée

Construire une application indépendante, avec les interactions d'un planificateur d'ateliers : édition directe d'un agenda, recalcul des horaires, catégories colorées, vue d'ensemble et conduite de séance. Garder une identité visuelle propre à MeetLoom et écrire son propre code.

SessionPlan offre déjà une bonne base visuelle mais sa persistance locale et son partage par instantané ne répondent pas à la séparation organisateur/visiteur demandée. Son backend de liens dynamiques est explicitement propriétaire et absent du dépôt public. Reprendre le frontend ne dispenserait donc pas de concevoir le serveur, les identités, les permissions, la synchronisation et le déploiement interne. [Architecture SessionPlan](https://github.com/tim-peters/sessionplan/blob/main/ARCHITECTURE.md)

Son `package.json` indique AGPL-3.0-only, React 18.3, Vite 5.4, TypeScript, dnd-kit, i18next et Vitest. Un fork est une option techniquement possible sous cette licence, mais la décision retenue évite de dépendre de cette base et de son backend manquant. Aucun code de SessionPlan n'est à copier dans MeetLoom. [Dépendances et licence](https://github.com/tim-peters/sessionplan/blob/main/package.json), [texte de licence](https://github.com/tim-peters/sessionplan/blob/main/LICENSE)

## Ce que SessionLab fait effectivement

Un bloc comporte un titre, une durée, une catégorie, une description et des champs supplémentaires comme objectifs, matériel, consignes et responsable. Les heures se recalculent lorsque les durées ou l'ordre changent. Le déplacement se fait par glisser-déposer. [Blocs](https://help.sessionlab.com/en/articles/4472968-create-a-block-in-sessionlab)

Les groupes rassemblent plusieurs blocs, se replient et se déplacent ensemble. Leur durée est calculée à partir de leurs enfants. [Groupes](https://help.sessionlab.com/en/articles/4472976-how-to-use-groups-in-your-sessions)

Les salles parallèles contiennent leurs propres blocs et groupes. Leur durée globale correspond à la salle la plus longue. [Breakouts](https://help.sessionlab.com/en/articles/4477130-breakout-rooms)

Un horaire verrouillé sert de point d'ancrage ; les espaces inutilisés et les chevauchements sont signalés. Le premier ancrage peut entraîner un calcul des horaires précédents à rebours. [Calcul du temps](https://help.sessionlab.com/en/articles/4473024-time-calculation-locking-blocks-and-resolving-timing-issues-in-your-session)

Une session peut comporter plusieurs jours avec une vue par jour et une vue générale. [Sessions sur plusieurs jours](https://help.sessionlab.com/en/articles/4456599-multi-day-session-overview)

Le suivi en direct permet un passage automatique ou manuel au bloc suivant, affiche le temps restant et l'avance ou le retard, et autorise des prolongations. Les seuils visuels documentés sont 20 % puis 5 % du temps restant. La fin de séance peut conserver une version avec les durées réelles ou revenir au plan initial. La documentation indique que ce suivi n'est pas disponible avec des salles parallèles. [Time Tracker](https://help.sessionlab.com/en/articles/6103716-time-tracker-track-your-session-timing)

L'IA génère des agendas et des activités, propose des modifications, reformule et traduit. L'utilisation d'informations d'autres sessions est un choix de contexte. Pour MeetLoom, la priorité est la génération et la révision à partir du brief et de l'agenda courant ; les bibliothèques et l'import de pièces jointes restent hors périmètre. [Assistant IA](https://help.sessionlab.com/en/articles/8930897-design-and-adjust-your-agenda-with-the-ai-assistant)

SessionLab propose déjà le français et l'anglais. Le besoin de traduction concerne donc MeetLoom et son éventuelle base SessionPlan, dont les langues déclarées dans le code sont allemand et anglais. [Langues SessionLab](https://help.sessionlab.com/en/articles/4438369-how-can-i-change-the-language-in-sessionlab), [configuration SessionPlan](https://github.com/tim-peters/sessionplan/blob/main/src/lib/i18n.ts)

## Différence essentielle : visibilité et confidentialité

Dans SessionLab, masquer une colonne règle la présentation du planificateur ; un collaborateur peut encore accéder à son contenu dans le détail du bloc. Les champs existants peuvent être renommés, redimensionnés ou masqués, mais cette action ne constitue pas une permission. [Disposition des colonnes](https://help.sessionlab.com/en/articles/8717272-customize-your-session-planner-layout)

Le lien visiteur de SessionLab permet la lecture et les commentaires sans compte. Il peut sélectionner des jours, pages ou formulaires, mais la documentation précise que l'on ne peut pas masquer un bloc ou une colonne à l'intérieur d'un jour partagé. Le lien peut être désactivé. [Liens visiteurs](https://help.sessionlab.com/en/articles/4423478-visitor-links)

L'« Online Agenda » est un autre mode, simplifié : horaires, titres et catégories, sans commentaires ni modification. Ce n'est pas une politique de confidentialité configurable champ par champ. [Agenda public simplifié](https://help.sessionlab.com/en/articles/8027717-share-a-simple-online-overview-of-your-agenda)

Dans SessionPlan, le code du partage d'instantané compresse l'objet atelier dans le fragment de l'URL. La compression n'est pas un contrôle d'accès : les valeurs présentes sont récupérables par le destinataire. Son client de synchronisation échange un objet atelier via une clé de lien et des versions ; le serveur correspondant ne fait pas partie du dépôt. [Partage d'instantané](https://github.com/tim-peters/sessionplan/blob/main/src/lib/workshopUrl.ts), [client serveur](https://github.com/tim-peters/sessionplan/blob/main/src/lib/workshopServer.ts)

### Exigences de conception MeetLoom

- Séparer le réglage d'affichage de chaque colonne de son audience autorisée.
- Prévoir au minimum deux audiences : membres authentifiés autorisés sur la séance, et visiteurs porteurs d'un lien actif. Être simplement connecté ne donne pas accès à toutes les séances.
- Mettre les notes de présentation/consignes privées dans une colonne réservée aux organisateurs et intervenants autorisés.
- Produire un objet visiteur filtré côté serveur, avec une liste explicite de champs autorisés. Ne jamais envoyer les autres valeurs pour ensuite les masquer en CSS.
- Appliquer la même projection aux détails, au direct, aux exports et à toute requête anonyme ; ne pas inclure de notes privées dans le code HTML initial ou les erreurs.
- Créer des jetons aléatoires non devinables, révocables, avec expiration configurable. Un lien reste une capacité transmissible : sa révocation doit couper les lectures ultérieures.
- Tester la réponse HTTP réelle avec une valeur privée sentinelle, la révocation, l'expiration et l'accès à une autre session. Ces tests métier et de sécurité précèdent la suite end-to-end.

## Matrice de périmètre

Les colonnes « Réalisé » et « À planifier » de cette recherche initiale ne constituent pas un suivi d'implémentation. La cible de toutes les lignes non exclues est la parité demandée, sans distinction arbitraire V1/plus tard ; consulter la checklist de parité pour l'état réel.

| Fonction                                                | Référence observée                                              | Cible MeetLoom                                                 | Réalisé | À planifier |
| ------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------- | ------- | ----------- |
| Tableau de sessions, création, duplication, suppression | SessionLab ; SessionPlan centré sur le navigateur               | Parité                                                         |         |             |
| Blocs, durées, couleurs, responsables, édition directe  | Les deux                                                        | Parité                                                         |         |             |
| Réordonnancement et recalcul immédiat                   | Les deux                                                        | Parité                                                         |         |             |
| Groupes/sections repliables                             | Les deux                                                        | Parité                                                         |         |             |
| Plusieurs jours                                         | SessionLab ; modèle SessionPlan à une date                      | Parité, modèle et UI validés ensemble                          |         |             |
| Horaires verrouillés, avertissements de conflit         | Les deux possèdent des ancrages                                 | Parité : règle explicite et testée                             |         |             |
| Colonnes personnalisées et audiences                    | SessionLab renomme des champs existants                         | Parité : audience serveur                                      |         |             |
| Comptes et autorisations par séance                     | SessionLab                                                      | Parité                                                         |         |             |
| Lien visiteur révocable et lecture seule                | SessionLab dispose de deux modes de partage                     | Parité avec aperçu du rendu visiteur                           |         |             |
| Conduite, pause, suivant, prolongation, écart au plan   | Les deux ont un mode live                                       | Parité                                                         |         |             |
| Avertissement sonore avant la fin                       | Pas de configuration de seuil trouvée dans l'audit              | Parité : minutes et pourcentage                                |         |             |
| Barre flottante au-dessus d'une présentation            | Non documenté dans les sources inspectées                       | Parité avec détection de capacité                              |         |             |
| Français et anglais dans toutes les vues                | SessionLab oui ; SessionPlan DE/EN                              | Parité                                                         |         |             |
| IA interne, génération et suggestions modifiables       | SessionLab propose une IA hébergée                              | Parité : adaptateur serveur configurable                       |         |             |
| Export de sauvegarde et impression de l'agenda          | Les deux                                                        | Parité, y compris mise en page avancée                         |         |             |
| Édition simultanée avec résolution de conflits          | SessionLab ; synchronisation versionnée côté client SessionPlan | Parité, avec modèle d'accès                                    |         |             |
| Commentaires, mentions, historique détaillé             | SessionLab                                                      | Parité                                                         |         |             |
| Salles parallèles complètes                             | Les deux                                                        | Parité ; limite du timer SessionLab à reproduire explicitement |         |             |
| Imports Word/PPT/PDF et exports avancés                 | SessionLab                                                      | Parité                                                         |         |             |
| Pages, formulaires, tâches, rappels                     | SessionLab                                                      | Parité                                                         |         |             |
| Parking lot                                             | SessionLab                                                      | Exclu pour l'instant                                           |         |             |
| Bibliothèque de blocs/sessions                          | Les deux                                                        | Exclue pour l'instant                                          |         |             |
| Pièces jointes dans les blocs                           | SessionLab                                                      | Exclues pour l'instant                                         |         |             |

Le modèle public de SessionPlan contient blocs, groupes, breakouts, responsables, ancrages horaires et une seule date d'atelier. L'absence de fonctionnalités dans ce modèle ne prouve pas leur absence dans une éventuelle offre privée. [Modèle d'atelier](https://github.com/tim-peters/sessionplan/blob/main/src/types/workshop.ts)

## Alertes sonores : règles proposées

Le code public de SessionPlan joue un son au démarrage, au changement de bloc et à la fin. Il ne définit pas de seuil anticipé configurable. [Mode direct](https://github.com/tim-peters/sessionplan/blob/main/src/hooks/usePlayMode.ts)

MeetLoom doit permettre plusieurs avertissements globaux : 120 secondes restantes, 60 secondes restantes, 20 % restants ou 10 % restants, avec activation du son et volume. Un pourcentage signifie un pourcentage de la durée du bloc, pas du temps total de la séance.

Règles proposées : déclencher au franchissement du seuil une seule fois par exécution de bloc ; ne pas sonner immédiatement si un bloc est plus court que le seuil fixe ; suspendre les alertes en pause ; dédupliquer les seuils équivalents ; conserver les avertissements déjà joués après une prolongation. Le navigateur conducteur joue les sons par défaut, les visiteurs restent silencieux sauf activation volontaire. Une action utilisateur « Tester le son » initialise l'audio avant la présentation. Calculer le temps depuis les horodatages plutôt que décrémenter un compteur supposé exécuté chaque seconde.

## Barre flottante et PowerPoint

L'API **Document Picture-in-Picture** est la première option à essayer dans Chrome/Edge de bureau : elle ouvre une fenêtre HTML qui reste au-dessus des autres fenêtres. Son ouverture nécessite un geste utilisateur. La position est choisie/déplacée par l'utilisateur et la fenêtre se ferme avec la page d'origine. Prévoir un bouton « Barre flottante », un rendu compact du bloc actuel, du temps restant, de la progression et de l'écart au programme. La présence de l'API doit être détectée à l'exécution. [Documentation Chrome](https://developer.chrome.com/docs/web-platform/document-picture-in-picture)

Cette API exige un contexte sécurisé et n'est pas disponible depuis un simple iframe. La spécification avertit aussi que les scripts de fenêtres masquées peuvent être ralentis : la logique de rafraîchissement de l'affichage flottant doit en tenir compte. [Spécification Document PiP](https://wicg.github.io/document-picture-in-picture/)

Repli : une fenêtre « Affichage public » indépendante, avec instructions pour l'épingler sous Windows au moyen de PowerToys (`Win+Ctrl+T`). Ce raccourci garde une fenêtre au-dessus même lorsqu'une autre est sélectionnée, mais Microsoft ne garantit pas sa priorité face à d'autres fenêtres elles-mêmes toujours au-dessus. [PowerToys Always On Top](https://learn.microsoft.com/fr-fr/windows/powertoys/always-on-top)

Le passage au-dessus d'un PowerPoint donné, en diaporama plein écran, avec plusieurs moniteurs ou en session distante, reste une vérification manuelle indispensable. L'API documentée rend l'approche plausible ; elle ne constitue pas un test effectué sur le poste. Pour une diffusion à distance, vérifier aussi le partage de l'écran entier : partager seulement la fenêtre PowerPoint peut exclure la fenêtre flottante. Le mode public ne doit afficher aucune note privée.

## IA interne et critères de validation

Ne pas figer le nom du modèle supposé « Qwen 3.8 ». Exposer des paramètres serveur pour l'URL interne, le protocole compatible, le nom réel du modèle, le secret d'accès et les limites de requête. L'endpoint reste une configuration administrateur ; le navigateur ne reçoit jamais sa clé. Une suggestion d'agenda doit passer une validation de schéma et une prévisualisation avant application, avec une action annuler. Aucun appel externe implicite si l'IA interne n'est pas configurée.

La V1 doit d'abord être validée manuellement sur les scénarios de préparation et de conduite. Les tests unitaires/d'intégration doivent déjà couvrir le calcul du temps, les transitions du direct, les alertes et surtout la projection visiteur. La suite end-to-end complète sera ajoutée après la validation de cette première version, conformément à la demande. L'auto-fusion des mises à jour de dépendances devra attendre que ses contrôles de sécurité et les tests end-to-end exigés soient effectifs.

Les manifests OpenShift, la CI et la surveillance des dépendances font l'objet d'un audit séparé de RetroGemini. Ne pas présenter le déploiement comme validé tant qu'il n'a pas été exécuté sur un cluster cible.
