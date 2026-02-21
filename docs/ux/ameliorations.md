# Améliorations de l'Interface Utilisateur (UX/UI)

Ce document liste les améliorations à apporter à l'interface de l'application Renta Immo suite aux retours utilisateurs.

## Liste des améliorations prévues

### 1. Ajout d'infobulles (tooltips) d'aide sur les champs du formulaire

- **Problème / Retour utilisateur :** Certains champs techniques du formulaire sont difficiles à comprendre pour les investisseurs débutants.
- **Solution proposée :** Ajouter une icône ℹ️ à côté du titre des champs complexes. Au survol, une infobulle affichera une explication concise du champ, sa définition détaillée et les règles métiers associées tirées de la page "En savoir plus".
- **Composants impactés :** Formulaires de saisie du calculateur.
- **Statut :** En cours de planification
- **Détails des champs à traiter :**
  - **Part terrain (%) :** Seule la partie bâti est amortissable en LMNP/SCI IS. Le terrain (en général 15 à 20% du prix) ne s'amortit pas.
  - **Rénovation énergétique éligible :** Travaux permettant de sortir le bien des classes DPE E, F ou G. Ils ouvrent droit à un plafond de déficit foncier imputable sur le revenu global majoré (21 400€/an).
  - **Pondération loyers HCSF :** Règle du Haut Conseil de Stabilité Financière. Les banques ne prennent en compte qu'une fraction (généralement 70%) de vos revenus locatifs bruts pour calculer votre taux d'endettement maximal (35%).
  - **Taux d'occupation :** Taux de remplissage de votre bien sur l'année (100% - taux de vacance locative). Impacte directement la rentabilité réelle.
  - **Charges récupérables :** Part des charges (copropriété, entretien, taxe ordures ménagères) que vous pouvez légalement imputer et refacturer à votre locataire.
  - **Évolution annuelle loyers :** L'Indice de Référence des Loyers (IRL) fixe le plafond de l'augmentation annuelle légale. _Attention : pour les passoires thermiques (DPE F ou G), le loyer est strictement gelé (inflation forcée à 0%)._
  - **Mode d'assurance :** Détermine la base de calcul des primes. **CRD** (Capital Restant Dû) : la prime baisse avec le temps; **Capital Initial** : la prime reste fixe sur toute la durée du prêt.
  - **CFE Estimée :** Cotisation Foncière des Entreprises. Due en LMNP/SCI. Exonérée la 1ère année. Si vos recettes annuelles sont inférieures à 5 000 €, vous en êtes exonéré.
  - **Type de location :** Détermine l'abattement fiscal (ex: 50% en LMNP vs 30% en Nu). En SCI à l'IS, ce choix n'impacte pas la fiscalité (l'amortissement et les règles de l'IS priment).
