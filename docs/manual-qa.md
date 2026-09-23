# Recette manuelle en cours

Exécutée dans Chrome sur la base locale de recette (port 3001), avec données fictives. La base de première installation (port 3000) reste distincte. Ces essais ne constituent pas la suite end-to-end maintenue, prévue après validation utilisateur.

## Parcours réellement exécutés — 23 septembre 2026

- Connexion, ouverture d’un agenda, modification de titre/durée, sauvegarde et rechargement.
- Depuis un titre, Entrée crée un bloc et sélectionne son titre ; saisie « Synthèse au clavier », durée `1h15` convertie en 75 minutes et horaires suivants recalculés.
- Texte riche en gras enregistré et retrouvé après rechargement. Défaut du premier clic signalé : montage de l’éditeur parfois sans focus, correction à revérifier.
- Groupe créé, deux activités ajoutées ; première durée portée à 25 minutes, seconde 10 minutes ; total du groupe 35 minutes dans l’agenda et l’Overview.
- Création d’une Page « Brief de l’atelier », saisie du contenu, choix de l’audience publique ; Page retrouvée dans le lien visiteur, notes internes absentes de son affichage.
- Formulaire « Retour sur l’atelier », échelle 1–5 obligatoire, publication « Toujours anonyme ». Envoi vide refusé ; réponse 4 acceptée. Organisateur : une réponse anonyme, bonne question, valeur 4 et version publiée v1.
- Lien visiteur avec commentaires : nom de visiteur et question enregistrés, discussion visible dans sa portée. Désactivation du lien : contenu déjà affiché effacé au rafraîchissement automatique.
- Défaut trouvé pendant cette désactivation : les valeurs par défaut du validateur remplaçaient des options absentes du PATCH. Correction et test API de conservation des options ajoutés ; réactivation à revérifier en UI après reconstruction.
- Minuteur démarré/pause, vue publique synchronisée ; commande Document Picture-in-Picture activée sans erreur. **Le maintien au premier plan par-dessus un vrai diaporama PowerPoint reste à vérifier.**
- Ancienne vue visiteur examinée à 390 px de largeur ; espacement mobile corrigé. Recette responsive complète à reprendre après les derniers composants.

## À terminer avant remise

Recette de toutes les familles applicables de `product-parity.md`, permissions avec plusieurs comptes, concurrence réelle, exports téléchargés et ouverts, imports, versions/récupération, espaces/comptes, FR/EN, erreurs réseau et responsive. Vérification de l’IA avec fournisseur local simulé ; aucune connexion au Qwen de l’organisation sans configuration disponible. Aucun déploiement ni release effectué.

### Recette Chrome après intégration (23 septembre, suite)

- Le premier clic dans une section de Page permet maintenant de saisir du texte sans deuxième clic ; passage en titre H2 puis partage : le visiteur reçoit et affiche bien le titre enrichi.
- Lien suspendu réédité : formulaire publié sélectionné, commentaires réactivés, Page choisie comme accueil. Après réactivation le visiteur arrive sur cette Page, conserve la conversation précédente et peut répondre au formulaire intégré. Réponse anonyme « 5 » envoyée, confirmation visible.
- Description en colonne séparée, durée séparée de l’heure et déplacement Notes avant Intervenant : l’ordre des en-têtes et les champs suivent immédiatement.
- Détail d’un bloc : redimensionnement au clavier du panneau et affectation du compte Camille Martin. Correction d’un libellé de case ambigu détecté pendant cette manipulation.
- Entrée dans le titre d’un enfant de groupe crée et sélectionne immédiatement le titre suivant. « Restitution finale » créée, groupe recalculé de 35 à 45 min.
- Multi Plan : extraction du jour dans « Atelier extrait – recette ». Modification du titre du premier bloc à droite, clic sur une Page de la séance source, retour à Multi Plan et relecture : le titre modifié de la séance secondaire est conservé.
- Cycle de vie : clôture de la séance extraite, champ de titre `readonly`, commandes de conduite absentes ; rapport une séance / 3 h 32 prévues. Mise en corbeille, restauration avant échéance 30 jours, état clôturé conservé, réouverture et retour de l’édition/conduite.
- Import texte : deux lignes converties, aperçu modifié (5 et 15 min), ajout d’un jour sans écraser le premier. Téléversement CSV via extension Chrome bloqué par le sélecteur ; permission « Allow access to file URLs » demandée, tests d’extraction des formats réels déjà verts.
- Ancrage du second bloc importé à 09:15 avec premier bloc de 5 min : horaire du premier recalculé à 09:10, confirmé dans la vue d’ensemble. Affichage America/New_York en 12 h : 03:10 AM et 03:15 AM, sans changer les horaires de référence.

### Recette Chrome — imports, organisation et collaboration

- Après activation de l’accès aux URL de fichiers dans l’extension, téléversement réel de `qa-agenda.csv`, lecture des quatre colonnes, aperçu des deux activités et durées 5/75 minutes, ajout à l’agenda. Les imports texte/CSV ne créent plus les colonnes natives vides de chaque nouvelle séance.
- Word et PowerPoint téléchargés depuis l’interface. Archives OOXML relues : contenu attendu présent et notes privées sentinelles absentes des exports participants. Aperçu intégré vérifié et préréglage « Comité A4 » enregistré. L’ouverture visuelle dans Microsoft Office n’a pas été exécutée.
- Version « Recette avant modification » créée, aperçu par jour consulté, restauration par copie dans un nouveau jour confirmée. Journal : auteur, version, jour et blocs ajoutés correspondent à cette opération.
- Page « Brief latéral » affichée et éditable à côté des huit blocs de l’agenda, puis panneau refermé.
- Espace « Équipe recette » créé. Dossiers vides `Ateliers/Septembre` retrouvés après rechargement et resélection de l’espace. Séance créée dans cet espace ; préremplissage du dossier courant à revérifier sur le dernier bundle.
- Deux onglets sur « Revue équipe » : champ de durée 10 minutes laissé focalisé dans le premier ; passage à 15 dans le second ; sortie du champ puis rechargement du premier : 15 conservé. Présence de la seconde fenêtre affichée.
- Éditeur anglais à 390 × 844 : la page reste dans la largeur du viewport, la grille utilise son propre défilement horizontal. Bascule FR et panneau Colonnes lisible sur la même largeur ; override retiré après essai.
- Rappel sonore réglé à 20 % restants, son Doux sélectionné, commande d’écoute déclenchée sans erreur et préférences enregistrées. L’écoute physique des haut-parleurs n’est pas une preuve fournie par les outils.
- Minuteur : démarrage, prolongation 15 → 16 minutes, pause, bloc suivant, fin. Durées réelles appliquées puis plan initial restauré à 15/10 minutes. Affichage des durées fractionnaires ramené à deux décimales sans modifier les valeurs persistées tant que le champ n’est pas édité.
- Commentaire privé créé, réponse ajoutée, discussion résolue puis retrouvée via le filtre Résolus avec les deux messages.
