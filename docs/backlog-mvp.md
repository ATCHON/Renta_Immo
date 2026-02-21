# Backlog MVP — Renta_Immo

> Simulateur de rentabilité immobilière

## Légende

### Priorité

- **P1** : Critique — Bloquant pour les autres fonctionnalités
- **P2** : Haute — Essentiel pour une analyse complète
- **P3** : Moyenne — Important mais non bloquant

### Complexité (T-Shirt Sizing)

- **XS** : Quelques heures — Modification mineure
- **S** : 1-2 jours — Fonctionnalité simple
- **M** : 3-5 jours — Fonctionnalité moyenne
- **L** : 1-2 semaines — Fonctionnalité complexe
- **XL** : 2-4 semaines — Fonctionnalité majeure

---

## Vue d'Ensemble MVP

| Priorité  | Nb Features | Effort Total Estimé |
| --------- | ----------- | ------------------- |
| P1        | 10          | ~6-8 semaines       |
| P2        | 12          | ~6-8 semaines       |
| P3        | 5           | ~2-3 semaines       |
| **Total** | **27**      | **~14-19 semaines** |

> ⚠️ **Note importante** : Le backend n8n est remplacé par un backend custom. Les items MVP-024 à MVP-027 couvrent cette migration.

---

## P1 — Priorité Critique

> Ces fonctionnalités sont les fondations du MVP. À implémenter en premier.

### MVP-001 : Frais de notaire automatiques

| Champ           | Valeur            |
| --------------- | ----------------- |
| **ID**          | MVP-001           |
| **Catégorie**   | Frais acquisition |
| **Priorité**    | P1                |
| **Complexité**  | S                 |
| **Dépendances** | Aucune            |

**Description**
Calculer automatiquement les frais de notaire en fonction du type de bien (ancien/neuf) et du prix d'achat.

**Critères d'acceptation**

- [x] Choix ancien (7-8%) ou neuf (2-3%)
- [x] Calcul automatique basé sur le prix d'achat
- [x] Option de saisie manuelle pour override
- [x] Affichage du détail (droits mutation, émoluments, débours)
- [x] Intégration dans le coût total d'acquisition

**User Stories**

- En tant qu'investisseur, je veux connaître les frais de notaire estimés pour calculer mon budget total
- En tant qu'investisseur confirmé, je veux pouvoir modifier le montant si j'ai un devis précis

---

### MVP-002 : Frais d'agence

| Champ           | Valeur            |
| --------------- | ----------------- |
| **ID**          | MVP-002           |
| **Catégorie**   | Frais acquisition |
| **Priorité**    | P1                |
| **Complexité**  | XS                |
| **Dépendances** | Aucune            |

**Description**
Permettre la saisie des frais d'agence immobilière.

**Critères d'acceptation**

- [x] Saisie en montant fixe OU en pourcentage du prix
- [x] Choix : à charge acquéreur ou vendeur (inclus dans prix)
- [x] Si à charge vendeur : ne pas ajouter au coût d'acquisition
- [x] Intégration dans le récapitulatif des frais

**User Stories**

- En tant qu'investisseur, je veux distinguer si les frais d'agence sont inclus ou en sus du prix affiché

---

### MVP-003 : Travaux initiaux

| Champ           | Valeur            |
| --------------- | ----------------- |
| **ID**          | MVP-003           |
| **Catégorie**   | Frais acquisition |
| **Priorité**    | P1                |
| **Complexité**  | XS                |
| **Dépendances** | Aucune            |

**Description**
Permettre la saisie d'un budget travaux avant mise en location.

**Critères d'acceptation**

- [x] Champ montant travaux initiaux
- [x] Optionnel (défaut : 0€)
- [x] Intégration dans le coût total d'acquisition
- [x] Pris en compte dans le calcul de rentabilité

**User Stories**

- En tant qu'investisseur, je veux inclure mes travaux de rénovation dans mon calcul de rentabilité

---

### MVP-004 : Choix du régime fiscal location nue

| Champ           | Valeur          |
| --------------- | --------------- |
| **ID**          | MVP-004         |
| **Catégorie**   | Régimes fiscaux |
| **Priorité**    | P1              |
| **Complexité**  | M               |
| **Dépendances** | Aucune          |

**Description**
Permettre le choix entre micro-foncier et régime réel pour la location nue.

**Critères d'acceptation**

- [x] Option micro-foncier : abattement 30%, plafond 15 000€/an
- [x] Option régime réel : déduction des charges réelles
- [x] Affichage comparatif des deux régimes (FiscalComparator)
- [x] Recommandation automatique du régime optimal (isOptimal flag)
- [x] Alerte si revenus > 15 000€ (micro impossible)

**User Stories**

- En tant qu'investisseur débutant, je veux comprendre quel régime est le plus avantageux
- En tant qu'investisseur, je veux voir la différence d'imposition entre les deux régimes

---

### MVP-005 : Choix du régime fiscal LMNP

| Champ           | Valeur          |
| --------------- | --------------- |
| **ID**          | MVP-005         |
| **Catégorie**   | Régimes fiscaux |
| **Priorité**    | P1              |
| **Complexité**  | L               |
| **Dépendances** | MVP-006         |

**Description**
Permettre le choix entre micro-BIC et régime réel pour le LMNP.

**Critères d'acceptation**

- [x] Option micro-BIC : abattement 50%, plafond 77 700€/an
- [x] Option régime réel : amortissement + déduction charges
- [x] Type de location : meublé classique, tourisme, étudiant
- [x] Affichage comparatif des deux régimes (FiscalComparator)
- [x] Recommandation automatique du régime optimal (isOptimal flag)

**User Stories**

- En tant qu'investisseur LMNP, je veux comparer micro-BIC et réel pour optimiser ma fiscalité

---

### MVP-006 : Calcul d'amortissement

| Champ           | Valeur          |
| --------------- | --------------- |
| **ID**          | MVP-006         |
| **Catégorie**   | Régimes fiscaux |
| **Priorité**    | P1              |
| **Complexité**  | L               |
| **Dépendances** | Aucune          |

**Description**
Calculer l'amortissement comptable du bien et du mobilier pour LMNP réel et SCI IS.

**Critères d'acceptation**

- [x] Amortissement immobilier : composants (gros œuvre 50 ans, façade 30 ans, équipements 15 ans...)
- [x] Amortissement mobilier : 5-10 ans selon catégorie
- [x] Répartition automatique ou personnalisable
- [x] Tableau d'amortissement sur la durée
- [x] Intégration dans le calcul fiscal

**User Stories**

- En tant qu'investisseur LMNP réel, je veux connaître mon amortissement annuel déductible
- En tant qu'investisseur en SCI IS, je veux voir l'impact de l'amortissement sur mon résultat

---

### MVP-007 : Simulation pluriannuelle (structure)

| Champ           | Valeur                    |
| --------------- | ------------------------- |
| **ID**          | MVP-007                   |
| **Catégorie**   | Projections               |
| **Priorité**    | P1                        |
| **Complexité**  | L                         |
| **Dépendances** | MVP-004, MVP-005, MVP-006 |

**Description**
Créer l'infrastructure pour les projections sur 5/10/15/20/25 ans.

**Critères d'acceptation**

- [x] Sélection de la durée de projection (5/10/15/20/25 ans)
- [x] Structure de données pour stocker les projections annuelles
- [x] Calcul année par année de tous les indicateurs
- [x] Base pour les graphiques d'évolution

**User Stories**

- En tant qu'investisseur, je veux voir l'évolution de mon investissement dans le temps

---

### MVP-008 : Multi-scénarios (structure)

| Champ           | Valeur      |
| --------------- | ----------- |
| **ID**          | MVP-008     |
| **Catégorie**   | Comparaison |
| **Priorité**    | P1          |
| **Complexité**  | M           |
| **Dépendances** | Aucune      |

**Description**
Permettre la création et comparaison de plusieurs scénarios.

**Critères d'acceptation**

- [x] Créer jusqu'à 3 scénarios (ScenarioTabs + Zustand)
- [x] Dupliquer un scénario existant (duplicateScenario)
- [x] Modifier indépendamment chaque scénario (UUID isolation)
- [x] Nommer chaque scénario (renameScenario)
- [x] Affichage côte à côte des résultats (onglets navigation)

**User Stories**

- En tant qu'investisseur, je veux comparer différentes hypothèses (apport, durée, loyer...)

---

### MVP-024 : Moteur de calcul autonome

| Champ           | Valeur  |
| --------------- | ------- |
| **ID**          | MVP-024 |
| **Catégorie**   | Backend |
| **Priorité**    | P1      |
| **Complexité**  | L       |
| **Dépendances** | Aucune  |

**Description**
Implémenter un moteur de calcul de rentabilité autonome, sans dépendance à n8n. Tous les calculs (rentabilité, cashflow, fiscalité, HCSF) sont effectués côté backend.

**Critères d'acceptation**

- [x] Calculs de rentabilité brute, nette, nette-nette
- [x] Calculs de cashflow mensuel et annuel
- [x] Calculs fiscaux selon le régime (nu, LMNP, SCI)
- [x] Calcul du taux d'endettement HCSF
- [x] Score de synthèse et recommandations
- [x] Résultats identiques à l'ancien système n8n

**User Stories**

- En tant que développeur, je veux un moteur de calcul maintenable et testable
- En tant qu'utilisateur, je veux des calculs fiables et rapides

---

### MVP-025 : API de simulation

| Champ           | Valeur  |
| --------------- | ------- |
| **ID**          | MVP-025 |
| **Catégorie**   | Backend |
| **Priorité**    | P1      |
| **Complexité**  | M       |
| **Dépendances** | MVP-024 |

**Description**
Créer une API REST pour soumettre les données du formulaire et récupérer les résultats de simulation.

**Critères d'acceptation**

- [x] Endpoint POST pour soumettre une simulation
- [x] Endpoint GET pour récupérer une simulation
- [x] Validation des données entrantes
- [x] Gestion des erreurs avec messages clairs
- [x] Documentation de l'API

**User Stories**

- En tant que front-end, je veux une API claire pour envoyer/recevoir les données
- En tant qu'utilisateur, je veux des messages d'erreur compréhensibles

---

## P2 — Priorité Haute

> Fonctionnalités essentielles pour une analyse complète.

### MVP-009 : Tableau d'amortissement crédit

| Champ           | Valeur      |
| --------------- | ----------- |
| **ID**          | MVP-009     |
| **Catégorie**   | Financement |
| **Priorité**    | P2          |
| **Complexité**  | S           |
| **Dépendances** | Aucune      |

**Description**
Afficher le tableau d'amortissement détaillé du crédit immobilier.

**Critères d'acceptation**

- [x] Tableau année par année (et mois par mois en option)
- [x] Colonnes : échéance, capital, intérêts, assurance, reste dû
- [x] Total des intérêts payés
- [x] Total assurance payée
- [x] Export possible (inclus dans PDF)

**User Stories**

- En tant qu'investisseur, je veux voir comment se répartit ma mensualité entre capital et intérêts

---

### MVP-010 : Évolution loyer (IRL)

| Champ           | Valeur      |
| --------------- | ----------- |
| **ID**          | MVP-010     |
| **Catégorie**   | Projections |
| **Priorité**    | P2          |
| **Complexité**  | S           |
| **Dépendances** | MVP-007     |

**Description**
Simuler l'évolution du loyer selon l'IRL (Indice de Référence des Loyers).

**Critères d'acceptation**

- [x] Taux IRL paramétrable (défaut : moyenne historique ~1.5%)
- [x] Application annuelle automatique
- [x] Impact sur les projections pluriannuelles
- [x] Affichage du loyer projeté année par année

**User Stories**

- En tant qu'investisseur, je veux projeter l'évolution de mes revenus locatifs

---

### MVP-011 : Évolution charges

| Champ           | Valeur      |
| --------------- | ----------- |
| **ID**          | MVP-011     |
| **Catégorie**   | Projections |
| **Priorité**    | P2          |
| **Complexité**  | S           |
| **Dépendances** | MVP-007     |

**Description**
Simuler l'évolution des charges avec l'inflation.

**Critères d'acceptation**

- [x] Taux d'inflation paramétrable (défaut : 2%)
- [x] Application sur toutes les charges (copro, taxe foncière, assurances...)
- [x] Impact sur les projections pluriannuelles

**User Stories**

- En tant qu'investisseur, je veux anticiper l'augmentation de mes charges

---

### MVP-012 : Enrichissement patrimonial

| Champ           | Valeur           |
| --------------- | ---------------- |
| **ID**          | MVP-012          |
| **Catégorie**   | Projections      |
| **Priorité**    | P2               |
| **Complexité**  | M                |
| **Dépendances** | MVP-007, MVP-009 |

**Description**
Calculer l'enrichissement patrimonial total dans le temps.

**Critères d'acceptation**

- [x] Capital remboursé cumulé (depuis tableau amortissement)
- [x] Plus-value potentielle (taux appréciation paramétrable)
- [x] Cashflow cumulé
- [x] Patrimoine net = Valeur bien - Capital restant dû
- [x] Graphique d'évolution

**User Stories**

- En tant qu'investisseur, je veux voir combien je me serai enrichi après 10/20 ans

---

### MVP-013 : Calcul du TRI

| Champ           | Valeur           |
| --------------- | ---------------- |
| **ID**          | MVP-013          |
| **Catégorie**   | Projections      |
| **Priorité**    | P2               |
| **Complexité**  | M                |
| **Dépendances** | MVP-007, MVP-012 |

**Description**
Calculer le Taux de Rendement Interne de l'investissement.

**Critères d'acceptation**

- [x] Calcul TRI sur la durée de projection choisie
- [x] Prise en compte : apport initial, cashflows annuels, valeur revente
- [x] Affichage avec explication pédagogique
- [x] Comparaison avec des benchmarks (livret A, assurance vie, bourse) — tooltips

**User Stories**

- En tant qu'investisseur, je veux connaître la performance réelle de mon investissement comparée à d'autres placements

---

### MVP-014 : Charges récupérables

| Champ           | Valeur  |
| --------------- | ------- |
| **ID**          | MVP-014 |
| **Catégorie**   | Charges |
| **Priorité**    | P2      |
| **Complexité**  | S       |
| **Dépendances** | Aucune  |

**Description**
Distinguer les charges récupérables sur le locataire.

**Critères d'acceptation**

- [x] Saisie des charges récupérables (provisions sur charges)
- [x] Distinction charges propriétaire vs charges récupérables
- [x] Impact sur le calcul du cashflow net
- [x] Régularisation annuelle (info) — tooltip explicatif

**User Stories**

- En tant qu'investisseur, je veux un cashflow précis tenant compte des charges récupérées

---

### MVP-015 : Honoraires comptable

| Champ           | Valeur  |
| --------------- | ------- |
| **ID**          | MVP-015 |
| **Catégorie**   | Charges |
| **Priorité**    | P2      |
| **Complexité**  | XS      |
| **Dépendances** | Aucune  |

**Description**
Ajouter les frais de comptabilité pour LMNP réel et SCI.

**Critères d'acceptation**

- [x] Champ honoraires annuels (défaut suggéré : 500-800€)
- [x] Affiché uniquement si régime réel ou SCI
- [x] Intégré dans les charges annuelles
- [x] Déductible fiscalement (info)

**User Stories**

- En tant qu'investisseur en LMNP réel, je veux inclure mes frais de comptable

---

### MVP-016 : Effort d'épargne

| Champ           | Valeur      |
| --------------- | ----------- |
| **ID**          | MVP-016     |
| **Catégorie**   | Indicateurs |
| **Priorité**    | P2          |
| **Complexité**  | S           |
| **Dépendances** | Aucune      |

**Description**
Calculer l'effort d'épargne mensuel nécessaire si cashflow négatif.

**Critères d'acceptation**

- [x] Si cashflow négatif : afficher comme "effort d'épargne"
- [x] Comparaison avec capacité d'épargne déclarée — N/A (pas de champ capacité)
- [x] Alerte si effort > capacité — N/A (pas de champ capacité)
- [x] Présentation positive ("investissement de X€/mois")

**User Stories**

- En tant qu'investisseur, je veux savoir combien je devrai sortir de ma poche chaque mois

---

### MVP-017 : Effet de levier

| Champ           | Valeur      |
| --------------- | ----------- |
| **ID**          | MVP-017     |
| **Catégorie**   | Indicateurs |
| **Priorité**    | P2          |
| **Complexité**  | S           |
| **Dépendances** | Aucune      |

**Description**
Calculer et expliquer l'effet de levier du crédit.

**Critères d'acceptation**

- [x] Formule : Rentabilité fonds propres / Rentabilité sans crédit
- [x] Explication pédagogique de l'effet de levier
- [x] Comparaison achat cash vs crédit — via multi-scénarios
- [x] Alerte si levier négatif (taux crédit > rentabilité)

**User Stories**

- En tant qu'investisseur, je veux comprendre l'intérêt d'emprunter plutôt que payer cash

---

### MVP-018 : Comparaison régimes fiscaux

| Champ           | Valeur                    |
| --------------- | ------------------------- |
| **ID**          | MVP-018                   |
| **Catégorie**   | Comparaison               |
| **Priorité**    | P2                        |
| **Complexité**  | M                         |
| **Dépendances** | MVP-004, MVP-005, MVP-006 |

**Description**
Comparer automatiquement les différents régimes fiscaux pour un même bien.

**Critères d'acceptation**

- [x] Tableau comparatif : Nu micro, Nu réel, LMNP micro, LMNP réel, SCI IS (FiscalComparator)
- [x] Pour chaque : imposition, cashflow net, rentabilité nette-nette
- [x] Mise en évidence du régime optimal (isOptimal + highlight vert)
- [x] Explication des différences (tooltips + conseils)

**User Stories**

- En tant qu'investisseur, je veux voir quel montage fiscal est le plus avantageux

---

### MVP-026 : Sauvegarde des simulations (serveur)

| Champ           | Valeur      |
| --------------- | ----------- |
| **ID**          | MVP-026     |
| **Catégorie**   | Persistance |
| **Priorité**    | P2          |
| **Complexité**  | M           |
| **Dépendances** | MVP-025     |

**Description**
Permettre la sauvegarde des simulations côté serveur (en plus du localStorage actuel) pour une persistance durable.

**Critères d'acceptation**

- [x] Sauvegarde automatique après calcul
- [x] Identifiant unique par simulation
- [x] Récupération d'une simulation par son ID
- [x] Liste des simulations récentes
- [x] Possibilité de supprimer une simulation

**User Stories**

- En tant qu'utilisateur, je veux retrouver mes simulations même si je change d'appareil
- En tant qu'utilisateur, je veux pouvoir partager un lien vers ma simulation

---

### MVP-027 : Génération PDF autonome

| Champ           | Valeur  |
| --------------- | ------- |
| **ID**          | MVP-027 |
| **Catégorie**   | Export  |
| **Priorité**    | P2      |
| **Complexité**  | M       |
| **Dépendances** | MVP-024 |

**Description**
Générer les rapports PDF de simulation sans dépendance à n8n.

**Critères d'acceptation**

- [x] PDF avec récapitulatif des données saisies
- [x] PDF avec tous les résultats de calcul
- [x] Mise en page professionnelle
- [x] Téléchargement direct depuis l'interface
- [x] Option d'envoi par email (si email renseigné)

**User Stories**

- En tant qu'utilisateur, je veux télécharger un rapport PDF de ma simulation
- En tant qu'investisseur, je veux un document présentable à montrer à ma banque

---

## P3 — Priorité Moyenne

> Fonctionnalités importantes pour enrichir l'analyse.

### MVP-019 : Amélioration SCI IS

| Champ           | Valeur          |
| --------------- | --------------- |
| **ID**          | MVP-019         |
| **Catégorie**   | Régimes fiscaux |
| **Priorité**    | P3              |
| **Complexité**  | M               |
| **Dépendances** | MVP-006         |

**Description**
Compléter la simulation SCI IS existante.

**Critères d'acceptation**

- [x] Calcul IS : 15% jusqu'à 42 500€, 25% au-delà (fiscalite.ts)
- [x] Simulation distribution dividendes
- [x] Flat tax 30% sur dividendes
- [x] Comparaison : capitaliser vs distribuer
- [x] Impact sur HCSF des associés (hcsf.ts mode SCI)

**User Stories**

- En tant qu'investisseur en SCI, je veux simuler l'imposition société et la distribution

---

### MVP-020 : Graphiques d'évolution

| Champ           | Valeur                    |
| --------------- | ------------------------- |
| **ID**          | MVP-020                   |
| **Catégorie**   | Projections               |
| **Priorité**    | P3                        |
| **Complexité**  | M                         |
| **Dépendances** | MVP-007, MVP-012, MVP-013 |

**Description**
Ajouter des graphiques pour visualiser les projections.

**Critères d'acceptation**

- [x] Graphique cashflow annuel (CashflowChart.tsx + Recharts)
- [x] Graphique enrichissement patrimonial (PatrimoineChart.tsx)
- [x] Graphique répartition capital/intérêts (AmortizationTable)
- [x] Graphique évolution loyer vs charges (ProjectionTable)
- [x] Interactif (survol pour détails) — Recharts tooltips

**User Stories**

- En tant qu'investisseur, je veux visualiser graphiquement l'évolution de mon investissement

---

### MVP-021 : Amélioration formulaire régimes

| Champ           | Valeur           |
| --------------- | ---------------- |
| **ID**          | MVP-021          |
| **Catégorie**   | UX               |
| **Priorité**    | P3               |
| **Complexité**  | M                |
| **Dépendances** | MVP-004, MVP-005 |

**Description**
Refondre l'étape "Structure" pour intégrer tous les régimes.

**Critères d'acceptation**

- [x] Choix type location : Nue / Meublée (LMNP) (StepStructure workflow)
- [x] Si Nue : choix micro-foncier / réel
- [x] Si Meublée : choix micro-BIC / réel
- [x] Option SCI (IR ou IS)
- [x] Workflow clair et guidé (S6.4 implémenté)

**User Stories**

- En tant qu'utilisateur, je veux un parcours clair pour choisir mon régime fiscal

---

### MVP-022 : Synthèse coût acquisition

| Champ           | Valeur                    |
| --------------- | ------------------------- |
| **ID**          | MVP-022                   |
| **Catégorie**   | Frais acquisition         |
| **Priorité**    | P3                        |
| **Complexité**  | S                         |
| **Dépendances** | MVP-001, MVP-002, MVP-003 |

**Description**
Afficher un récapitulatif clair du coût total d'acquisition.

**Critères d'acceptation**

- [x] Tableau récapitulatif : prix + frais notaire + agence + travaux (InvestmentBreakdown)
- [x] Total "clé en main" (coutTotalAcquisition)
- [x] Pourcentage de frais par rapport au prix
- [x] Affiché dans les résultats (Dashboard)

**User Stories**

- En tant qu'investisseur, je veux voir clairement le coût total de mon acquisition

---

### MVP-023 : Persistance scénarios

| Champ           | Valeur      |
| --------------- | ----------- |
| **ID**          | MVP-023     |
| **Catégorie**   | Comparaison |
| **Priorité**    | P3          |
| **Complexité**  | S           |
| **Dépendances** | MVP-008     |

**Description**
Sauvegarder les scénarios en localStorage.

**Critères d'acceptation**

- [x] Sauvegarde automatique des scénarios
- [x] Restauration au rechargement
- [x] Suppression d'un scénario
- [x] Limite de 3 scénarios max

**User Stories**

- En tant qu'utilisateur, je veux retrouver mes scénarios si je quitte la page

---

## Ordre d'Implémentation Recommandé

### Sprint 0 : Infrastructure Backend (Prérequis)

> ⚠️ Ce sprint remplace la dépendance n8n par un backend custom.

1. MVP-024 : Moteur de calcul autonome (L)
2. MVP-025 : API de simulation (M)
3. MVP-027 : Génération PDF autonome (M)
4. MVP-026 : Sauvegarde des simulations serveur (M)

### Sprint 1 : Fondations Acquisition

5. MVP-001 : Frais de notaire (S)
6. MVP-002 : Frais d'agence (XS)
7. MVP-003 : Travaux initiaux (XS)
8. MVP-022 : Synthèse coût acquisition (S)

### Sprint 2 : Régimes Fiscaux Base

9. MVP-004 : Choix régime location nue (M)
10. MVP-006 : Calcul d'amortissement (L)
11. MVP-005 : Choix régime LMNP (L)

### Sprint 3 : Projections

12. MVP-007 : Simulation pluriannuelle structure (L)
13. MVP-009 : Tableau amortissement crédit (S)
14. MVP-010 : Évolution loyer IRL (S)
15. MVP-011 : Évolution charges (S)

### Sprint 4 : Indicateurs & Enrichissement

16. MVP-012 : Enrichissement patrimonial (M)
17. MVP-013 : Calcul TRI (M)
18. MVP-016 : Effort d'épargne (S)
19. MVP-017 : Effet de levier (S)

### Sprint 5 : Charges & Fiscalité

20. MVP-014 : Charges récupérables (S)
21. MVP-015 : Honoraires comptable (XS)
22. MVP-018 : Comparaison régimes fiscaux (M)
23. MVP-019 : Amélioration SCI IS (M)

### Sprint 6 : Comparaison & Finalisation

24. MVP-008 : Multi-scénarios structure (M)
25. MVP-023 : Persistance scénarios (S)
26. MVP-020 : Graphiques d'évolution (M)
27. MVP-021 : Amélioration formulaire régimes (M)

---

## Métriques de Succès MVP

| Métrique                     | Objectif                             |
| ---------------------------- | ------------------------------------ |
| Précision calcul rentabilité | Écart < 5% vs calcul expert          |
| Couverture régimes           | 100% cas courants (nu, LMNP, SCI IS) |
| Projections                  | 5 à 25 ans disponibles               |
| Temps de simulation          | < 5 min pour analyse complète        |
| Taux completion formulaire   | > 80%                                |

---

## Historique

| Date       | Version | Description                                                                              |
| ---------- | ------- | ---------------------------------------------------------------------------------------- |
| 2025-01-25 | 1.0     | Création du backlog MVP                                                                  |
| 2025-01-25 | 1.1     | Ajout items backend custom (MVP-024 à MVP-027), retrait dépendance n8n                   |
| 2026-02-04 | 1.2     | Mise à jour post-implémentation : MVP-004/005/008/013-022 cochés (validation DoD Epic 2) |
| 2026-02-16 | 1.3     | Achèvement du Sprint 4 (Back-office, Configuration dynamique, Refactoring)               |
| 2026-02-20 | 1.4     | Clôture du backlog : toutes les fonctionnalités MVP sont développées                     |
