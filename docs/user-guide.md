# Utiliser MeetLoom

## Préparer

1. Créer une séance, ou ouvrir l'exemple depuis le tableau de bord. L'exemple est un agenda original modifiable.
2. Donner un nom et un objectif à la séance. Régler la date, l'heure de début et le fuseau horaire.
3. Ajouter les blocs. Modifier directement leur titre, durée et description. Les horaires suivants sont recalculés immédiatement.
4. Ouvrir les détails d'un bloc pour sa section, son intervenant, ses champs et son horaire verrouillé. Une section rassemble les blocs portant le même libellé et peut être repliée.
5. Déplacer un bloc par sa poignée, ou utiliser les flèches dans les détails. Annuler/rétablir permet de revenir sur les dernières modifications locales.

Les modifications sont enregistrées automatiquement. Les changements indépendants sont fusionnés ; une modification concurrente du même champ demande une résolution explicite. MeetLoom conserve la copie locale et permet de l'exporter avant de charger la dernière version serveur. Les liens internes, notifications et boutons Précédent/Suivant du navigateur attendent l'enregistrement avant de quitter l'éditeur. En cas de champ invalide, d'erreur réseau ou de conflit, la séance reste ouverte avec un message. Ne pas fermer l'onglet tant qu'une erreur d'enregistrement n'est pas résolue.

### Travailler avec deux agendas

Ouvrir **Multi Plan**, puis choisir une autre séance accessible et les jours à afficher. Glisser la poignée d'un bloc vers l'autre panneau le déplace ; maintenir **Ctrl** ou **⌘** le copie. Déposer sur un bloc insère avant lui ; déposer en bas ajoute à la fin. Une sélection multiple transfère les blocs sélectionnés ensemble, et un groupe conserve ses enfants.

Les cases à cocher et boutons **Copier les blocs** / **Déplacer les blocs** réalisent les mêmes actions au clavier, dans les deux sens. Une source en lecture seule peut être copiée, mais pas déplacée. Une destination nécessite le droit d'édition. Les modifications des deux agendas sont enregistrées avant le transfert. Si une version a changé, le transfert est refusé sans effectuer un déplacement partiel ; les brouillons non enregistrés restent visibles. L'extraction d'un jour crée une séance distincte, et les champs internes importés restent privés.

## Choisir les informations partagées

Le panneau **Colonnes** contient deux réglages indépendants :

- **Affichée/masquée** : présence dans l'éditeur de l'équipe.
- **Équipe/équipe & visiteurs** : audience autorisée par le serveur.

Une colonne masquée dans l'éditeur peut rester publique. Pour protéger son contenu, choisir **Équipe uniquement**. Les notes de présentation utilisent ce réglage par défaut. Le titre, la section, les horaires et la description générale de la séance sont toujours dans l'agenda visiteur ; ne pas y placer de notes confidentielles.

Les nouvelles séances préparent aussi Informations supplémentaires, Objectifs, Matériel, Instructions et Contexte. Ces colonnes sont internes et masquées par défaut ; les afficher dans **Colonnes** selon les besoins. La colonne Matériel alimente la vue de préparation correspondante.

Le connecteur MCP applique une précaution supplémentaire : même cette description générale n’est envoyée au client MCP qu’avec l’autorisation explicite de données internes. Un lien visiteur et un jeton MCP n’ont donc pas exactement la même projection. Les noms d’intervenants peuvent être publics si leur colonne l’est ; leurs identifiants de compte, e-mails et avatars restent internes.

Les membres autorisés à cette séance voient les colonnes équipe. Les rôles :

| Rôle                 | Lire les notes équipe | Modifier l'agenda | Piloter le minuteur | Gérer les accès |
| -------------------- | --------------------- | ----------------- | ------------------- | --------------- |
| Propriétaire         | Oui                   | Oui               | Oui                 | Oui             |
| Éditeur              | Oui                   | Oui               | Oui                 | Non             |
| Animateur            | Oui                   | Non               | Oui                 | Non             |
| Lecteur              | Oui                   | Non               | Non                 | Non             |
| Visiteur sans compte | Non                   | Non               | Non                 | Non             |

Depuis **Partager**, le propriétaire peut générer un lien, fixer sa date d'expiration et le révoquer. Copier le lien lors de sa création : le serveur ne conserve que son empreinte. Son aperçu utilise exactement la page visiteur. Après révocation, un navigateur qui le consultait efface l'agenda lors du prochain rafraîchissement.

L'administrateur crée les invitations de compte dans **Mon compte & équipe**. Transmettre le lien à son destinataire par votre canal interne habituel. Il est à usage unique et expire après 72 heures. Une fois le compte créé, le propriétaire peut l'ajouter à une séance avec le rôle souhaité.

## Animer

Choisir le jour, puis **Animer la séance**. Le minuteur conserve ses horodatages sur le serveur : recharger l'onglet ne le remet pas à zéro. Pause, reprise, bloc suivant/précédent et prolongation sont partagés avec les autres vues. Les mises à jour réseau ont une latence pouvant atteindre environ trois secondes.

Les durées prévues au lancement sont conservées pour calculer l'avance/retard. Le point de référence est le démarrage effectif ; démarrer à 10 h un agenda préparé pour 9 h ne crée pas automatiquement une heure de retard. Une pause compte dans le décalage de la séance. Une prolongation ajuste le temps restant sans effacer le dépassement par rapport à la durée initiale.

Le bloc vient de passer automatiquement alors que la discussion continue ? Augmenter sa durée dans l'agenda, ou utiliser **+1 min au précédent** / **+5 min au précédent**. Si cette nouvelle durée couvre encore le moment actuel, le minuteur reprend ce bloc avec le temps déjà écoulé. Sinon, le temps du bloc courant est ajusté. Une pause reste une pause ; le retard par rapport au plan initial est conservé. Cette reprise concerne le dernier passage automatique et disparaît après une navigation manuelle ou un arrêt explicite. Le principe reprend le [comportement documenté du Time Tracker](https://help.sessionlab.com/en/articles/6103716-time-tracker-track-your-session-timing).

Les horaires verrouillés servent à préparer l'agenda et signaler ses conflits. Le passage automatique enchaîne les activités sans attendre un trou entre deux horaires verrouillés. Pour réserver ce temps en animation, ajouter un bloc de pause explicite ou mettre le minuteur en pause.

## Sons

**Alertes sonores & paramètres** permet de choisir le seuil anticipé en minutes ou en pourcentage de la durée du bloc, le son de fin, le timbre et le volume. Un seuil de 20 % pour un bloc de 10 minutes déclenche le rappel lorsqu'il reste 2 minutes. Un seuil de 2 minutes n'est pas joué au démarrage d'un bloc d'une minute.

Les réglages de la séance s'appliquent à tous ses blocs. L'administrateur peut aussi les définir comme valeurs par défaut des nouvelles séances. Chaque appareil décide d'activer son audio : le clic de démarrage le permet pour le navigateur conducteur, les autres comptes doivent cliquer sur l'icône de son. Les visiteurs ne jouent pas de son. Les restrictions de lecture automatique et la mise en veille de l'ordinateur peuvent empêcher une alerte sonore : utiliser le bouton d'écoute avant la séance.

## Afficher le temps pendant un PowerPoint

Le bouton **Fenêtre au premier plan** ouvre une fenêtre Document Picture-in-Picture quand Chrome/Edge de bureau le propose. Elle contient le bloc actuel, le compte à rebours et la progression. La déplacer sur l'écran de présentation ; laisser l'onglet MeetLoom ouvert.

Si le navigateur ne dispose pas de cette API, MeetLoom ouvre une fenêtre séparée et indique qu'il ne peut garantir sa priorité. Sur Windows, PowerToys Always On Top peut l'épingler (`Win+Ctrl+T`). Vérifier le comportement avec votre mode PowerPoint plein écran et vos écrans avant une séance réelle. En visioconférence, partager une seule fenêtre PowerPoint peut exclure la barre ; partager l'écran approprié si vous voulez montrer les deux.

## IA, exports et historique

Les formulaires proposent aussi une question **Image**. Une personne peut y déposer PNG, JPEG ou WebP : le navigateur réduit le fichier et retire ses métadonnées avant envoi. Les images reçues sont visibles uniquement dans le détail des réponses pour les propriétaires et éditeurs. Elles ne sont envoyées ni à la synthèse IA ni dans le CSV. En mode anonyme, éviter les photos qui identifient leur auteur. La limite après réduction est de 256 Kio par image et de 512 Kio par réponse.

Le panneau **Assistant** conserve des conversations privées. Choisir le contexte : aucun, séance ouverte, séances précises, espace courant ou tous les espaces accessibles. L’inclusion des notes et Pages internes est un choix explicite. L’IA propose des modifications de blocs, dates, Pages et formulaires ; relire l’aperçu puis appliquer ou rejeter. Les autres séances servent de référence, seule la séance ouverte peut être modifiée. Une proposition devenue obsolète ne peut pas écraser une version plus récente. Les réglages personnels et jeux de consignes de l’organisation ou de l’espace orientent les réponses. Sans modèle Qwen configuré, ces commandes restent indisponibles. Voir [IA interne et import documentaire](ai-and-import.md).

Dans **Exporter**, sélectionner l’audience Public ou Équipe, les jours, colonnes, Pages, blocs et catégories. Vérifier l’aperçu puis produire un PDF avec le dialogue d’impression, un Word modifiable, un PowerPoint ou un CSV. Les horaires d’origine sont conservés même lorsque des blocs sont filtrés. Les documents publics excluent les champs internes. Les sauvegardes JSON de la séance complète contiennent, elles, les données d’équipe.

Régler papier, orientation, police, disposition, légende, matériel et sauts de page ; enregistrer, mettre à jour ou renommer un préréglage personnel. Pour PowerPoint, choisir et réordonner les diapositives, modifier leurs titres et choisir les champs placés dans les notes du présentateur. Un formulaire déjà publié peut être ajouté avec son QR et un lien révocable limité à ce formulaire. **Copier le tableau** fournit un contenu structuré à coller dans un tableur. L’IA interne peut proposer des réglages ou un plan de diapositives, toujours à relire avant application. Voir [Exporter une séance](exports.md), notamment les limites de pagination entre navigateurs et Word.

**Importer** accepte JSON MeetLoom, DOCX, PPTX, XLSX, PDF textuel, CSV/TSV et TXT/Markdown UTF-8. Un modèle de vision interne configuré permet aussi PNG/JPEG. Choisir la correspondance des colonnes du tableau ou proposer une structuration par l’IA, puis corriger les titres, durées et descriptions dans l’aperçu. Seule l’action d’ajout fusionne les nouveaux jours, avec de nouveaux identifiants. Les champs privés du fichier restent privés même si les colonnes de destination étaient publiques. Aucun document source n’est conservé comme pièce jointe. Les limites de taille et de traitement sont indiquées dans le [guide d’import](ai-and-import.md).

L'historique permet de restaurer une version, restaurer un jour ou le copier comme nouveau jour. Une restauration complète ou du jour actif exige d'abord d'arrêter le minuteur ; copier un jour historique conserve la conduite en cours. Voir [la récupération et les versions](workspaces-and-lifecycle.md).
