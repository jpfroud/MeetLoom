# Exporter une séance

Ouvrir **Exporter**, choisir l’audience Public ou Équipe, puis les jours, colonnes et pages. Le filtre Blocs et catégories conserve les groupes nécessaires à la structure et les horaires d’origine des activités conservées ; retirer une activité de l’export ne décale pas les suivantes. Les colonnes et pages internes ne sont jamais disponibles dans un export public.

Les mises en page détaillée, tableau, compacte, aperçu par jour, aperçu multijour et détails seuls peuvent être combinées avec A4, Letter ou Legal, portrait/paysage, trois polices et cinq tailles. La légende des catégories et la liste du matériel sont facultatives. Les sauts par jour et tous les N blocs sont explicites et repérés dans l’aperçu. La longueur des contenus, les polices installées et les paramètres du navigateur ou de Word peuvent ajouter des pages : vérifier la pagination définitive dans le dialogue d’impression. L’application ne promet pas une pagination identique entre tous les moteurs de rendu.

**Imprimer / PDF** utilise le dialogue d’impression du navigateur. **Word** produit un DOCX modifiable, avec texte riche, listes, liens et tableaux. **PowerPoint** présente un plan éditable : changer les titres, l’ordre et les diapositives incluses avant de générer le PPTX. Choisir les colonnes placées dans les notes du présentateur ; ces colonnes ne sont alors pas imprimées sur les diapositives. Les textes longs sont répartis entre plusieurs diapositives. Le bouton formulaire crée explicitement un lien révocable limité à un formulaire déjà publié et intègre son QR, généré localement.

**Copier le tableau** fournit du HTML et du texte tabulé pour Word ou un tableur ; si le navigateur refuse l’accès au presse-papiers, utiliser CSV ou Word. Le HTML est échappé et les cellules susceptibles d’être interprétées comme des formules sont neutralisées. CSV applique les mêmes protections et utilise UTF-8 avec BOM.

Les préréglages personnels mémorisent seulement l’audience et les paramètres de présentation. Ils peuvent être créés, renommés, mis à jour ou supprimés ; les choix de séances, blocs et champs ne sont pas stockés dans ces préréglages. Vingt préréglages maximum par compte.

Si Qwen est configuré, **Proposer des réglages ou un plan avec l’IA interne** envoie seulement le contenu sélectionné, avec les champs internes uniquement pour l’audience Équipe. L’IA peut proposer des réglages bornés ou réordonner/renommer les diapositives existantes. Elle ne crée ni URL, ni code, ni fichier, ni préréglage. Relire puis appliquer ou rejeter la proposition ; créer ensuite le fichier ou enregistrer le préréglage. Les documents sont générés dans le navigateur, sans service de conversion externe.

## Vérifications automatisées

`tests/export-documents.test.ts` inspecte les archives DOCX/PPTX, les sentinelles privées, les notes du présentateur, les QR, les pages internes, les filtres et les horaires après minuit. `tests/export-ai.test.ts` contrôle les droits, le contexte public/privé et le rejet d’identifiants ou de paramètres inventés par le modèle. `tests/export-presets.test.ts` vérifie la propriété et le CRUD des préréglages. Ces tests ne remplacent pas l’ouverture des fichiers dans le logiciel utilisé par l’organisation.
