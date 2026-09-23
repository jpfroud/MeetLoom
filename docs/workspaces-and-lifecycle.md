# Organiser, terminer et retrouver ses séances

## Espaces et accès

Le sélecteur du tableau de bord permet de voir toutes les séances accessibles, uniquement les séances personnelles, ou un espace de travail. **Créer un espace** vous en rend administrateur. **Gérer** permet de changer son nom, son organisation, son logo et ses membres.

Un administrateur d’espace règle les paramètres et les accès. Un éditeur peut créer et modifier les séances de l’espace ; un lecteur peut les consulter. Un membre accède à toutes ses séances. Un invité a uniquement les accès accordés individuellement sur certaines séances. L’onglet **Membres et invités** affiche les séances accessibles à chaque personne et permet de retirer tous ses accès dans cet espace.

Le propriétaire conserve ses droits sur sa séance, même si son rôle dans l’espace change. Pour retirer les accès d’un propriétaire, déplacer ou transférer d’abord les séances qu’il possède. Un espace conserve au moins un administrateur actif. Un compte existant est ajouté directement par son adresse e-mail ; pour un nouveau compte, un lien d’invitation valable 72 heures est généré et doit être transmis à la personne. Aucun message n’est envoyé automatiquement par cette action.

L’action **Changer d’espace** d’une séance est réservée à son propriétaire. Elle expose la séance aux membres de sa destination. Les accès individuels et les liens publics existants sont conservés. Un espace doit être vide avant suppression.

Les dossiers et sous-dossiers sont persistants, même vides. Choisir l’espace personnel ou un espace d’équipe, puis utiliser les actions dossier dans la barre du tableau. Le renommage déplace aussi les sous-dossiers et le classement de leurs séances ; il conserve l’agenda et les droits, y compris pour une séance clôturée. La suppression est réservée à une arborescence sans séance, archives comprises. Les dossiers personnels appartiennent au compte ; les membres éditeurs et administrateurs gèrent les dossiers d’équipe, les lecteurs les consultent. Les invités ne voient que les chemins des séances qui leur sont accessibles.

Le filtre **Activité** permet de retrouver les séances ouvertes récemment ou les modifications non lues. Le point vert signale une version plus récente que celle consultée par ce compte. Les marqueurs de lecture sont propres à chaque utilisateur ; ouvrir une séance dans un autre compte ne la marque pas lue pour ses collaborateurs.

## Réglages des nouvelles séances

Dans **Gérer → Organisation et valeurs par défaut**, choisir les colonnes et leurs visibilités, les catégories, le fuseau et l’heure de début, ainsi que les choix d’export. On peut copier les réglages d’une séance accessible : colonnes et leur disposition, catégories, pages, formulaires, sons et horaires. Préparer les pages ou formulaires dans une séance, puis utiliser cette copie pour les nouvelles séances de l’espace.

Ces réglages s’appliquent uniquement lors de la création. Ils ne modifient pas les séances existantes. Chaque page, formulaire, section et question reçoit de nouveaux identifiants. Les réponses et liens de publication ne sont jamais copiés. Avant d’enregistrer des contenus issus d’une autre séance, vérifier qu’ils conviennent aux membres de l’espace destinataire.

Le logo est une image PNG, JPEG ou WebP stockée dans l’application ; aucune image distante n’est téléchargée. Les paramètres d’export sont lus à l’ouverture de la fenêtre d’export et restent modifiables pour le document. Un export destiné à l’équipe peut contenir des colonnes internes.

## Clôturer une séance livrée

Après avoir arrêté le minuteur, ouvrir **Clôturer / supprimer** depuis les actions du tableau ou **État de la séance** dans l’éditeur. Choisir les animateurs parmi les collaborateurs, puis clôturer.

L’agenda, son minuteur et ses commentaires deviennent non modifiables. Les formulaires n’acceptent plus de réponses. Les liens publics d’agenda restent consultables avec leur périmètre habituel. Le propriétaire, un administrateur de l’espace ou un administrateur de l’application disposant de l’accès à cette séance peut la rouvrir. La duplication d’une séance clôturée crée une nouvelle séance personnelle éditable, sans copier ses liens de partage ni son état de clôture.

**Rapport des séances** réunit les séances clôturées accessibles au compte connecté. Les filtres portent sur la date de clôture, les animateurs et les étiquettes. Le rapport distingue durée planifiée et durée mesurée par le minuteur ; une séance sans mesure ne contribue pas au total mesuré.

## Archives, corbeille et récupération

L’archivage est un classement. Il ne ferme pas une séance et ne désactive pas ses liens. La **corbeille de séances** masque au contraire la séance pour tous les collaborateurs et rend ses liens d’agenda et de formulaires inaccessibles. Sa restauration est possible pendant **30 jours** par son propriétaire ou un administrateur autorisé. Les membres, les périmètres de partage et la clôture éventuelle sont conservés : restaurer une séance clôturée ne la rouvre pas.

Après l’échéance, l’API refuse la restauration. Le nettoyage physique est opportuniste, par lots de 25 séances au plus lors de la consultation de la corbeille ou d’une suppression. Les données liées — commentaires, versions, réponses et liens — suivent la suppression définitive. Une sauvegarde externe peut conserver une copie selon sa propre politique de rétention.

L’onglet **Historique → Éléments supprimés** concerne les éléments d’une séance, avec une rétention de **72 heures**. Un jour, bloc, groupe, page ou formulaire peut être restauré individuellement. Le contenu d’un groupe est conservé ensemble ; un enfant déjà déplacé ailleurs n’est pas dupliqué lors de la restauration. Les contenus réintroduits restent privés lorsque cela est nécessaire, et une publication de formulaire n’est pas réactivée automatiquement.

L’historique propose jusqu’à 100 versions automatiques et 100 versions nommées protégées de la rotation automatique. Le journal garde les 1 000 derniers événements. Enregistrer ses modifications avant de créer une version nommée. La restauration d’un jour actif exige d’abord d’arrêter le minuteur ; copier un jour historique en nouveau jour conserve la conduite en cours.
