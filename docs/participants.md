# Attribuer plusieurs animateurs et préparer les invitations

Le champ Intervenant accepte plusieurs collaborateurs de la séance, dont les invités qui n'ont pas encore créé leur compte. Les avatars et noms proviennent des participants disponibles ; le texte libre reste possible pour une équipe ou une personne sans compte. Chaque bloc accepte au plus 20 attributions. La même personne ne peut pas être sélectionnée deux fois.

Dans **Partager**, le propriétaire ajoute un compte existant ou crée une invitation de séance. Créer un nouveau compte requiert aussi le rôle d'administrateur global ou d'administrateur de l'espace concerné. Être propriétaire d'une séance personnelle ne donne pas ce droit global. Les rôles proposés concernent uniquement la séance : éditeur, animateur du minuteur, lecteur/commentateur.

L'invitation est valable 72 heures. Son lien est affiché uniquement lors de la création et se partage manuellement par le canal privé de votre choix. Aucun e-mail d'invitation n'est envoyé automatiquement. L'invité apparaît immédiatement dans le sélecteur d'animateurs ; son identifiant opaque reste identique après acceptation du lien et création du compte. L'acceptation SSO sous la politique `invited` utilise le même mécanisme. Si une autre invitation a déjà créé le compte, l'utilisateur se connecte puis accepte les invitations de séance restantes avec ce compte.

Réémettre une invitation conserve ses attributions tout en invalidant l'ancien lien. La révocation ou l'expiration retire l'invitation des options proposées. Les attributions déjà présentes restent dans l'historique de l'agenda ; elles ne donnent jamais de droit d'accès. Retirer un collaborateur révoque son accès même si son nom reste sur un ancien bloc.

Les identifiants d'attribution, e-mails et avatars ne sont jamais exposés sur le lien public. Seul le texte synthétique `facilitator` peut y apparaître, si cette colonne est publique. La sauvegarde normalise ce texte depuis les noms des personnes attribuées. L'import, la copie entre séances et la duplication conservent les noms comme texte mais retirent les identifiants, car chaque attribution appartient à sa séance d'origine.

Les tests API couvrent l'attribution avant inscription, la continuité de l'identifiant à l'acceptation, la révocation/réémission, les rôles, les identifiants forgés, la projection publique et la copie récursive. Les mêmes tests passent sur SQLite et PostgreSQL.
