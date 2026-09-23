# MeetLoom — plan de réalisation et parité fonctionnelle

## Décision

Application libre, autonome et auto-hébergeable. Base neuve TypeScript / React / Express, inspirée des parcours SessionLab et des pratiques de RetroGemini. Aucun code ni contenu de bibliothèque SessionLab recopié. SessionPlan est une référence ergonomique, pas une dépendance.

La cible est une couverture fonctionnelle identique à SessionLab, avec les trois exclusions explicites ci-dessous, une identité visuelle originale et une ergonomie inspirée des meilleurs parcours SessionLab et SessionPlan. Ne pas reproduire le design ou les couleurs de SessionLab. La checklist [product-parity.md](product-parity.md) recense les fonctionnalités documentées, leurs écarts actuels et les critères de recette ; une base utilisable n'est pas une déclaration de parité acquise. Les scénarios end-to-end maintenus et la fusion automatique des mises à jour dépendront de la validation utilisateur. Les tests unitaires et d'intégration serveur couvrent dès maintenant identité, permissions, confidentialité et calculs de temps.

## Base déjà construite — à compléter pour la parité

- Comptes locaux, premier administrateur à l'installation, sessions persistantes, collaborateurs avec rôles.
- Tableau de bord, création / duplication / archivage, agendas multi-jours.
- Édition des blocs, catégories, sections, responsables, durées et horaires recalculés, déplacement, duplication, suppression avec possibilité de restauration.
- Groupes imbriqués séquentiels, notes sans durée et salles parallèles. Durée d'un groupe = somme des enfants ; durée du parallèle = salle la plus longue. La conduite linéaire suit les activités des groupes et ignore les notes ; elle refuse explicitement un jour contenant des salles parallèles.
- Métadonnées internes client, étiquettes et dossier ; catégories personnalisées avec couleur. Seules les catégories utilisées par l'agenda public sont partagées aux visiteurs.
- Colonnes personnalisables, notes de présentation réservées à l'équipe par défaut. La projection anonyme supprime les données internes côté serveur.
- Liens visiteurs aléatoires, révocables, avec expiration. Agenda et déroulement consultables sans compte.
- Minuteur partagé : démarrage, pause, passage au bloc suivant, avance/retard, alertes anticipées minutes ou pourcentage, choix de son et volume.
- Fenêtre de progression Document Picture-in-Picture lorsque disponible, fenêtre séparée en solution de repli.
- IA serveur optionnelle compatible API OpenAI pour Qwen interne : génération d'agenda et conseils, aperçu avant insertion.
- Français / anglais, export JSON et CSV, impression PDF via navigateur, commentaires et historique de versions.
- Docker, SQLite pour lancement local, PostgreSQL et guide/installateur OpenShift, CI et surveillance des dépendances.

## Contrats et sécurité

Les types se trouvent dans `shared/model.ts`. Toutes les routes `/api/sessions/:id/*` exigent authentification et accès à cette séance, même si l'identifiant est connu. Les visiteurs n'utilisent que `/api/public/:token`. Aucun champ interne, membre, commentaire ou secret ne passe dans cette réponse. Les écritures d'agenda utilisent une version attendue et renvoient un conflit 409 plutôt qu'écraser le travail d'un collaborateur. Les paramètres du fournisseur IA viennent seulement de l'environnement serveur.

SQLite est pour une instance locale. PostgreSQL est requis pour OpenShift. Polling léger de l'agenda/minuteur, horodatages serveur et contrôle de concurrence : cette première version n'est pas un éditeur CRDT caractère par caractère.

Les blocs de zéro minute représentent des jalons. Le premier horaire verrouillé détermine le début des blocs précédents par calcul inverse ; les verrouillages suivants signalent les trous et chevauchements sans déplacer les heures choisies.

Les groupes et les salles conservent tous les champs de leurs descendants, avec les mêmes permissions de colonnes que les blocs principaux. La projection publique reconstruit chaque niveau sur une liste autorisée. Les importations et duplications recréent les identifiants des blocs et des salles. Un agenda contient au maximum 1000 blocs, cinq niveaux d'imbrication et douze salles par parallèle. Les durées calculées sont normalisées côté serveur. Les salles commencent ensemble ; les horaires internes verrouillés affichent leurs trous et chevauchements. L'étendue horaire d'un groupe peut donc dépasser la somme de ses durées d'activité.

Le minuteur capture les durées des blocs du jour au démarrage. L'avance/retard compare le temps écoulé à ces durées initiales ; une prolongation change le temps restant sans effacer le retard déjà accumulé. Les pauses comptent dans le retard. Le démarrage prend par défaut l'heure actuelle ; l'option « Depuis l'heure prévue » utilise la date, le premier horaire calculé et le fuseau de l'agenda. Elle exige une heure passée valide (première occurrence en cas d'heure d'automne répétée, rejet d'une heure inexistante au printemps). Si le passage automatique est activé, les blocs déjà écoulés sont rattrapés immédiatement, y compris les jalons de zéro minute. Les trous entre horaires verrouillés ne créent pas d'attente automatique pendant la conduite ; ajouter un bloc de pause si cette durée doit être jouée.

Les durées réelles cumulent le temps actif de chaque passage dans un bloc et excluent les pauses. Terminer conserve l'agenda courant. Deux commandes explicites permettent ensuite de restaurer les durées initiales ou d'appliquer les durées réelles aux blocs parcourus ; les blocs non parcourus gardent leur durée. Un nouveau démarrage capture une nouvelle référence et une réinitialisation efface les relevés du minuteur. Pour un bloc ajouté pendant la conduite, sa durée courante sert de référence jusqu'au prochain démarrage.

## Limites à valider

La superposition dépend du navigateur, du système et du mode PowerPoint ; une vraie garantie sur tous les modes plein écran demanderait un compagnon natif. Le modèle Qwen et son URL exacte restent configurables. L'accès au cluster interne et au fournisseur d'identité n'est pas disponible ici : ni un déploiement réel OpenShift ni une intégration SSO ne pourront être déclarés validés sans ces accès.

## Couverture restante

Les écarts de la checklist restent des travaux requis, sans exclusion ou report après validation décidé unilatéralement : édition riche, tâches/matériels, groupes/notes et salles parallèles, Overview/multiplan, ancrages et conduite fidèles, collaboration fine, commentaires en fils, récupération et versions, partage Visitor/Online, exports configurables Word/PDF/PPT, import documentaire, Pages/Forms, espaces/administration et assistant IA complet. Ordonnancer les travaux selon leurs dépendances, puis démontrer chaque parcours. Entrée dans le titre doit créer le bloc suivant et y déplacer le focus ; heure et durée doivent se modifier rapidement en place.

## Exclusions demandées

Parking lot, bibliothèque de blocs/sessions, pièces jointes dans les blocs. Aucun autre retrait fonctionnel n'a été approuvé. Une dépendance réelle à une de ces exclusions doit être identifiée dans la checklist, sans supprimer les autres usages : exporter un PPTX neuf ou importer un document n'est pas joindre un fichier à un bloc.
