# État de réalisation

Développement et recette en cours. **Cette version n’est pas encore remise pour validation.** La checklist cible est `product-parity.md`, dont les constats initiaux doivent être actualisés avec les preuves de recette. Les parcours déjà exécutés sont consignés dans `manual-qa.md`.

Les trois exclusions acceptées restent : Parking lot, bibliothèque de blocs/sessions, pièces jointes dans les blocs. Interface originale MeetLoom ; identité visuelle SessionLab non reproduite.

La livraison inclura le projet, ses guides, l’outillage Gstack, les workflows CI/sécurité/release, Docker, les descripteurs génériques Kubernetes/OpenShift et le bouton Render. L’ajout d’une suite E2E nominale et l’activation d’une éventuelle fusion automatique des mises à jour interviendront **après validation de l’application par l’utilisateur**. Release Docker Hub puis déploiements OpenShift appartiennent à l’étape suivante.

## Limites d’environnement à distinguer de la réalisation

- Pas de déploiement OpenShift autorisé dans cette phase ; aucun effectué.
- Endpoint Qwen interne non fourni : adaptateur optionnel et tests locaux, pas de validation de sa configuration réelle.
- Un build Docker exact a rencontré un problème DNS dans le réseau du moteur Docker ; aucun paramètre DNS de la machine n’a été modifié. Validation Linux et vérification du build final à consigner séparément.
- Le navigateur est contrôlable ; l’application PowerPoint native n’est pas accessible par les outils présents. La fenêtre flottante peut être vérifiée dans Chrome, mais pas certifiée sur un vrai diaporama natif.
