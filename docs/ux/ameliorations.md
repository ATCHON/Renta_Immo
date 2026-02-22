# Améliorations de l'Interface Utilisateur (UX/UI)

Ce document liste les améliorations à apporter à l'interface de l'application Renta Immo suite aux retours utilisateurs.

## Liste des améliorations prévues

### 1. Ajout d'infobulles (tooltips) d'aide sur les champs du formulaire

- **Problème / Retour utilisateur :** Certains champs techniques du formulaire sont difficiles à comprendre pour les investisseurs débutants.
- **Solution proposée :** Ajouter une icône ℹ️ à côté du titre des champs complexes. Au survol, une infobulle affichera une explication concise du champ, sa définition détaillée et les règles métiers associées tirées de la page "En savoir plus".
- **Composants impactés :** Formulaires de saisie du calculateur.
- **Statut :** **Terminé**
- **Détails des champs à traiter :**
  - **Part terrain (%) :** Seule la partie bâti est amortissable en LMNP/SCI IS. Le terrain (en général 15 à 20% du prix) ne s'amortit pas.
  - **Rénovation énergétique éligible :** Travaux permettant de sortir le bien des classes DPE E, F ou G. Ils ouvrent droit à un plafond de déficit foncier imputable sur le revenu global majoré (21 400€/an).
  - **Pondération loyers HCSF :** Règle du Haut Conseil de Stabilité Financière. Les banques ne prennent en compte qu'une fraction (généralement 70%) de vos revenus locatifs bruts pour calculer votre taux d'endettement maximal (35%).
  - **Taux d'occupation :** Taux de remplissage de votre bien sur l'année (100% - taux de vacance locative). Impacte directement la rentabilité réelle.
  - **Charges récupérables :** Part des charges (copropriété, entretien, taxe ordures ménagères) que vous pouvez légalement imputer et refacturer à votre locataire.
  - **Évolution annuelle loyers :** L'Indice de Référence des Loyers (IRL) fixe le plafond de l'augmentation annuelle légale. _Attention : pour les passoires thermiques (DPE F ou G), le loyer est strictement gelé (inflation forcée à 0%)._
  - **Mode d'assurance :** Détermine la base de calcul des primes. **CRD** (Capital Restant Dû) : la prime baisse avec le temps; **Capital Initial** : la prime reste fixe sur toute la durée du prêt.
  - **CFE Estimée :** Cotisation Foncière des Entreprises. Due en LMNP/SCI. Exonérée la 1ère année. Si vos recettes annuelles sont inférieures à 5 000 €, vous en êtes exonéré.
  - **Type de location :** En SCI à l'IS, ce choix n'impacte pas la fiscalité (l'amortissement et les règles de l'IS priment).

### 2. Sauvegarde de simulation et redirection post-authentification

- **Problème / Retour utilisateur :** Lorsqu'un utilisateur non connecté tentait de sauvegarder une simulation, il était redirigé vers la page de connexion/inscription mais perdait les données de sa simulation en cours. De plus, après une sauvegarde réussie, il manquait un retour clair pour l'utilisateur.
- **Solution apportée :**
  - **Persistance :** Ajout du middleware `persist` (Zustand) sur le store du calculateur pour sauvegarder temporairement les données dans le `localStorage` en attendant la connexion.
  - **Redirection UX :** Redirection automatique de l'utilisateur vers la page "Mes Simulations" (`/simulations`) après une sauvegarde réussie afin de lui confirmer visuellement l'action.
  - **Sécurité :** Création d'un utilitaire sécurisé (`getValidatedRedirect`) pour valider les paramètres de redirection (`?redirect=...`) et prévenir les vulnérabilités de type "Open Redirect".
- **Composants impactés :** `calculateur.store.ts`, `SaveSimulationModal.tsx`, pages d'authentification (`login`, `signup`).
- **Statut :** **Terminé** (PR #17)

### 3. Menu de Navigation Latéral

- **Problème / Retour utilisateur :** Le formulaire et l'écran des résultats étaient trop linéaires. Sur de grands écrans, beaucoup d'espace est perdu, et les utilisateurs manquent de repères sur leur progression globale ou sur ce que contient la page de résultats.
- **Solution apportée :**
  - **Nouveau Composant UI :** Introduction d'`un SideNavigation` générique.
  - **Côté Formulaire :** Affichage d'un sommaire listant les étapes, avec grisement des étapes non encore atteintes.
  - **Côté Résultats :** Menu listant les principaux blocs de résultats cliquables faisant office de sommaire de page avec défilement fluide.
  - **Responsive & Sticky :** Optimisé pour basculer sur des menus défilants sur mobile. Sur desktop, une position "sticky" robuste a été implémentée avec une gestion intelligente du débordement (scroll interne si le menu est plus haut que l'écran) pour garantir qu'aucune option ne disparaisse, même sur petit écran ou lors d'un défilement rapide.
- **Raffinements visuels :** Amélioration des contrastes, augmentation de la taille des polices et ajout d'indicateurs visuels premium (effet de surbrillance sur l'étape active) pour une navigation plus lisible.
- **Composants impactés :** `SideNavigation.tsx`, `FormWizard.tsx`, `Dashboard.tsx`.
- **Statut :** **Terminé** (Février 2026)

### 4. Affichage de la description de la simulation sauvegardée

- **Problème / Retour utilisateur :** Lorsqu'un utilisateur accède à une simulation sauvegardée (depuis l'écran "Mes simulations" ou l'écran de résultat), il ne retrouve pas la description détaillée qu'il avait rédigée lors de la sauvegarde.
- **Solution proposée :** Afficher la description saisie par l'utilisateur sur l'écran de résultat, précisément en bas à gauche, sous la section "Analyse de la simulation".
- **Composants impactés :** `Dashboard.tsx`, `calculateur.ts`, `calculateur.store.ts`.
- **Statut :** **Terminé**

### 5. Modification et pré-remplissage d'une simulation existante

- **Problème / Retour utilisateur :** Lorsqu'un utilisateur modifie une simulation existante et clique sur "Sauvegarder", la modale est vide et une nouvelle copie est inévitablement créée au lieu de la mettre à jour.
- **Solution apportée :** 
  - Ajout d'un identifiant `dbId` pour détecter l'origine de la simulation dans le Store.
  - Pré-remplissage automatique du nom et de la description dans la modale.
  - Distinction claire entre l'action "Mettre à jour" (UPDATE/PATCH) et "Sauvegarder une copie" (POST).
- **Composants impactés :** `SaveSimulationModal.tsx`, `calculateur.ts`, `calculateur.store.ts`.
- **Statut :** **Terminé**

### 6. Ajustement de la modale d'amortissement et harmonisation du titre fiscal

- **Problème / Retour utilisateur :** La modale d'amortissement mensuel avait un titre générique ne précisant pas qu'il s'agissait du crédit, et il n'était pas possible de la fermer en cliquant à l'extérieur (seulement via la croix). De plus, le bloc "Comparatif des Régimes Fiscaux" avait une police très grande rompant avec les autres titres de sections.
- **Solution apportée :** 
  - Renommage de la modale en "Détail mensuel du crédit".
  - Ajout de la fermeture au clic sur l'arrière-plan de la modale.
  - Ajustement des classes CSS du titre du "Comparatif des Régimes Fiscaux" pour coller aux standards (`text-lg font-black uppercase tracking-widest text-charcoal`).
- **Composants impactés :** `AmortizationTable.tsx`, `FiscalComparator.tsx`.
- **Statut :** **Terminé**

### 6. Séparation Expertise / Projections dans la navigation des résultats

- **Problème / Retour utilisateur :** Le dernier élément du menu de navigation gauche "Financement & Amortissement" pointait sur le bloc de financement sans distinguer le bloc des "Projections patrimoniales".
- **Solution apportée :** 
  - Ajout du lien "Projections détaillées" dans le menu de navigation indépendant.
  - Au clic sur l'ancre du menu, le navigateur non seulement scrolle vers le bloc, mais déclenche aussi l'ouverture via l'écoute d'un événement global ("open-collapsible").
- **Composants impactés :** `Dashboard.tsx`, `Collapsible.tsx`.
- **Statut :** **Terminé**
