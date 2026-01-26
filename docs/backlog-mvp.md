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

| Priorité | Nb Features | Effort Total Estimé |
|----------|-------------|---------------------|
| P1 | 10 | ~6-8 semaines |
| P2 | 12 | ~6-8 semaines |
| P3 | 5 | ~2-3 semaines |
| **Total** | **27** | **~14-19 semaines** |

> ⚠️ **Note importante** : Le backend n8n est remplacé par un backend custom. Les items MVP-024 à MVP-027 couvrent cette migration.

---

## P1 — Priorité Critique

> Ces fonctionnalités sont les fondations du MVP. À implémenter en premier.

### MVP-001 : Frais de notaire automatiques

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-001 |
| **Catégorie** | Frais acquisition |
| **Priorité** | P1 |
| **Complexité** | S |
| **Dépendances** | Aucune |

**Description**
Calculer automatiquement les frais de notaire en fonction du type de bien (ancien/neuf) et du prix d'achat.

**Critères d'acceptation**
- [ ] Choix ancien (7-8%) ou neuf (2-3%)
- [ ] Calcul automatique basé sur le prix d'achat
- [ ] Option de saisie manuelle pour override
- [ ] Affichage du détail (droits mutation, émoluments, débours)
- [ ] Intégration dans le coût total d'acquisition

**User Stories**
- En tant qu'investisseur, je veux connaître les frais de notaire estimés pour calculer mon budget total
- En tant qu'investisseur confirmé, je veux pouvoir modifier le montant si j'ai un devis précis

---

### MVP-002 : Frais d'agence

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-002 |
| **Catégorie** | Frais acquisition |
| **Priorité** | P1 |
| **Complexité** | XS |
| **Dépendances** | Aucune |

**Description**
Permettre la saisie des frais d'agence immobilière.

**Critères d'acceptation**
- [ ] Saisie en montant fixe OU en pourcentage du prix
- [ ] Choix : à charge acquéreur ou vendeur (inclus dans prix)
- [ ] Si à charge vendeur : ne pas ajouter au coût d'acquisition
- [ ] Intégration dans le récapitulatif des frais

**User Stories**
- En tant qu'investisseur, je veux distinguer si les frais d'agence sont inclus ou en sus du prix affiché

---

### MVP-003 : Travaux initiaux

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-003 |
| **Catégorie** | Frais acquisition |
| **Priorité** | P1 |
| **Complexité** | XS |
| **Dépendances** | Aucune |

**Description**
Permettre la saisie d'un budget travaux avant mise en location.

**Critères d'acceptation**
- [ ] Champ montant travaux initiaux
- [ ] Optionnel (défaut : 0€)
- [ ] Intégration dans le coût total d'acquisition
- [ ] Pris en compte dans le calcul de rentabilité

**User Stories**
- En tant qu'investisseur, je veux inclure mes travaux de rénovation dans mon calcul de rentabilité

---

### MVP-004 : Choix du régime fiscal location nue

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-004 |
| **Catégorie** | Régimes fiscaux |
| **Priorité** | P1 |
| **Complexité** | M |
| **Dépendances** | Aucune |

**Description**
Permettre le choix entre micro-foncier et régime réel pour la location nue.

**Critères d'acceptation**
- [ ] Option micro-foncier : abattement 30%, plafond 15 000€/an
- [ ] Option régime réel : déduction des charges réelles
- [ ] Affichage comparatif des deux régimes
- [ ] Recommandation automatique du régime optimal
- [ ] Alerte si revenus > 15 000€ (micro impossible)

**User Stories**
- En tant qu'investisseur débutant, je veux comprendre quel régime est le plus avantageux
- En tant qu'investisseur, je veux voir la différence d'imposition entre les deux régimes

---

### MVP-005 : Choix du régime fiscal LMNP

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-005 |
| **Catégorie** | Régimes fiscaux |
| **Priorité** | P1 |
| **Complexité** | L |
| **Dépendances** | MVP-006 |

**Description**
Permettre le choix entre micro-BIC et régime réel pour le LMNP.

**Critères d'acceptation**
- [ ] Option micro-BIC : abattement 50%, plafond 77 700€/an
- [ ] Option régime réel : amortissement + déduction charges
- [ ] Type de location : meublé classique, tourisme, étudiant
- [ ] Affichage comparatif des deux régimes
- [ ] Recommandation automatique du régime optimal

**User Stories**
- En tant qu'investisseur LMNP, je veux comparer micro-BIC et réel pour optimiser ma fiscalité

---

### MVP-006 : Calcul d'amortissement

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-006 |
| **Catégorie** | Régimes fiscaux |
| **Priorité** | P1 |
| **Complexité** | L |
| **Dépendances** | Aucune |

**Description**
Calculer l'amortissement comptable du bien et du mobilier pour LMNP réel et SCI IS.

**Critères d'acceptation**
- [ ] Amortissement immobilier : composants (gros œuvre 50 ans, façade 30 ans, équipements 15 ans...)
- [ ] Amortissement mobilier : 5-10 ans selon catégorie
- [ ] Répartition automatique ou personnalisable
- [ ] Tableau d'amortissement sur la durée
- [ ] Intégration dans le calcul fiscal

**User Stories**
- En tant qu'investisseur LMNP réel, je veux connaître mon amortissement annuel déductible
- En tant qu'investisseur en SCI IS, je veux voir l'impact de l'amortissement sur mon résultat

---

### MVP-007 : Simulation pluriannuelle (structure)

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-007 |
| **Catégorie** | Projections |
| **Priorité** | P1 |
| **Complexité** | L |
| **Dépendances** | MVP-004, MVP-005, MVP-006 |

**Description**
Créer l'infrastructure pour les projections sur 5/10/15/20/25 ans.

**Critères d'acceptation**
- [ ] Sélection de la durée de projection (5/10/15/20/25 ans)
- [ ] Structure de données pour stocker les projections annuelles
- [ ] Calcul année par année de tous les indicateurs
- [ ] Base pour les graphiques d'évolution

**User Stories**
- En tant qu'investisseur, je veux voir l'évolution de mon investissement dans le temps

---

### MVP-008 : Multi-scénarios (structure)

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-008 |
| **Catégorie** | Comparaison |
| **Priorité** | P1 |
| **Complexité** | M |
| **Dépendances** | Aucune |

**Description**
Permettre la création et comparaison de plusieurs scénarios.

**Critères d'acceptation**
- [ ] Créer jusqu'à 3 scénarios
- [ ] Dupliquer un scénario existant
- [ ] Modifier indépendamment chaque scénario
- [ ] Nommer chaque scénario
- [ ] Affichage côte à côte des résultats

**User Stories**
- En tant qu'investisseur, je veux comparer différentes hypothèses (apport, durée, loyer...)

---

### MVP-024 : Moteur de calcul autonome

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-024 |
| **Catégorie** | Backend |
| **Priorité** | P1 |
| **Complexité** | L |
| **Dépendances** | Aucune |

**Description**
Implémenter un moteur de calcul de rentabilité autonome, sans dépendance à n8n. Tous les calculs (rentabilité, cashflow, fiscalité, HCSF) sont effectués côté backend.

**Critères d'acceptation**
- [ ] Calculs de rentabilité brute, nette, nette-nette
- [ ] Calculs de cashflow mensuel et annuel
- [ ] Calculs fiscaux selon le régime (nu, LMNP, SCI)
- [ ] Calcul du taux d'endettement HCSF
- [ ] Score de synthèse et recommandations
- [ ] Résultats identiques à l'ancien système n8n

**User Stories**
- En tant que développeur, je veux un moteur de calcul maintenable et testable
- En tant qu'utilisateur, je veux des calculs fiables et rapides

---

### MVP-025 : API de simulation

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-025 |
| **Catégorie** | Backend |
| **Priorité** | P1 |
| **Complexité** | M |
| **Dépendances** | MVP-024 |

**Description**
Créer une API REST pour soumettre les données du formulaire et récupérer les résultats de simulation.

**Critères d'acceptation**
- [ ] Endpoint POST pour soumettre une simulation
- [ ] Endpoint GET pour récupérer une simulation
- [ ] Validation des données entrantes
- [ ] Gestion des erreurs avec messages clairs
- [ ] Documentation de l'API

**User Stories**
- En tant que front-end, je veux une API claire pour envoyer/recevoir les données
- En tant qu'utilisateur, je veux des messages d'erreur compréhensibles

---

## P2 — Priorité Haute

> Fonctionnalités essentielles pour une analyse complète.

### MVP-009 : Tableau d'amortissement crédit

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-009 |
| **Catégorie** | Financement |
| **Priorité** | P2 |
| **Complexité** | S |
| **Dépendances** | Aucune |

**Description**
Afficher le tableau d'amortissement détaillé du crédit immobilier.

**Critères d'acceptation**
- [ ] Tableau année par année (et mois par mois en option)
- [ ] Colonnes : échéance, capital, intérêts, assurance, reste dû
- [ ] Total des intérêts payés
- [ ] Export possible (PDF inclus)

**User Stories**
- En tant qu'investisseur, je veux voir comment se répartit ma mensualité entre capital et intérêts

---

### MVP-010 : Évolution loyer (IRL)

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-010 |
| **Catégorie** | Projections |
| **Priorité** | P2 |
| **Complexité** | S |
| **Dépendances** | MVP-007 |

**Description**
Simuler l'évolution du loyer selon l'IRL (Indice de Référence des Loyers).

**Critères d'acceptation**
- [ ] Taux IRL paramétrable (défaut : moyenne historique ~1.5%)
- [ ] Application annuelle automatique
- [ ] Impact sur les projections pluriannuelles
- [ ] Affichage du loyer projeté année par année

**User Stories**
- En tant qu'investisseur, je veux projeter l'évolution de mes revenus locatifs

---

### MVP-011 : Évolution charges

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-011 |
| **Catégorie** | Projections |
| **Priorité** | P2 |
| **Complexité** | S |
| **Dépendances** | MVP-007 |

**Description**
Simuler l'évolution des charges avec l'inflation.

**Critères d'acceptation**
- [ ] Taux d'inflation paramétrable (défaut : 2%)
- [ ] Application sur toutes les charges (copro, taxe foncière, assurances...)
- [ ] Impact sur les projections pluriannuelles

**User Stories**
- En tant qu'investisseur, je veux anticiper l'augmentation de mes charges

---

### MVP-012 : Enrichissement patrimonial

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-012 |
| **Catégorie** | Projections |
| **Priorité** | P2 |
| **Complexité** | M |
| **Dépendances** | MVP-007, MVP-009 |

**Description**
Calculer l'enrichissement patrimonial total dans le temps.

**Critères d'acceptation**
- [ ] Capital remboursé cumulé (depuis tableau amortissement)
- [ ] Plus-value potentielle (taux appréciation paramétrable)
- [ ] Cashflow cumulé
- [ ] Patrimoine net = Valeur bien - Capital restant dû
- [ ] Graphique d'évolution

**User Stories**
- En tant qu'investisseur, je veux voir combien je me serai enrichi après 10/20 ans

---

### MVP-013 : Calcul du TRI

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-013 |
| **Catégorie** | Projections |
| **Priorité** | P2 |
| **Complexité** | M |
| **Dépendances** | MVP-007, MVP-012 |

**Description**
Calculer le Taux de Rendement Interne de l'investissement.

**Critères d'acceptation**
- [ ] Calcul TRI sur la durée de projection choisie
- [ ] Prise en compte : apport initial, cashflows annuels, valeur revente
- [ ] Affichage avec explication pédagogique
- [ ] Comparaison avec des benchmarks (livret A, assurance vie, bourse)

**User Stories**
- En tant qu'investisseur, je veux connaître la performance réelle de mon investissement comparée à d'autres placements

---

### MVP-014 : Charges récupérables

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-014 |
| **Catégorie** | Charges |
| **Priorité** | P2 |
| **Complexité** | S |
| **Dépendances** | Aucune |

**Description**
Distinguer les charges récupérables sur le locataire.

**Critères d'acceptation**
- [ ] Saisie des charges récupérables (provisions sur charges)
- [ ] Distinction charges propriétaire vs charges récupérables
- [ ] Impact sur le calcul du cashflow net
- [ ] Régularisation annuelle (info)

**User Stories**
- En tant qu'investisseur, je veux un cashflow précis tenant compte des charges récupérées

---

### MVP-015 : Honoraires comptable

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-015 |
| **Catégorie** | Charges |
| **Priorité** | P2 |
| **Complexité** | XS |
| **Dépendances** | Aucune |

**Description**
Ajouter les frais de comptabilité pour LMNP réel et SCI.

**Critères d'acceptation**
- [ ] Champ honoraires annuels (défaut suggéré : 500-800€)
- [ ] Affiché uniquement si régime réel ou SCI
- [ ] Intégré dans les charges annuelles
- [ ] Déductible fiscalement (info)

**User Stories**
- En tant qu'investisseur en LMNP réel, je veux inclure mes frais de comptable

---

### MVP-016 : Effort d'épargne

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-016 |
| **Catégorie** | Indicateurs |
| **Priorité** | P2 |
| **Complexité** | S |
| **Dépendances** | Aucune |

**Description**
Calculer l'effort d'épargne mensuel nécessaire si cashflow négatif.

**Critères d'acceptation**
- [ ] Si cashflow négatif : afficher comme "effort d'épargne"
- [ ] Comparaison avec capacité d'épargne déclarée (optionnel)
- [ ] Alerte si effort > capacité
- [ ] Présentation positive ("investissement de X€/mois")

**User Stories**
- En tant qu'investisseur, je veux savoir combien je devrai sortir de ma poche chaque mois

---

### MVP-017 : Effet de levier

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-017 |
| **Catégorie** | Indicateurs |
| **Priorité** | P2 |
| **Complexité** | S |
| **Dépendances** | Aucune |

**Description**
Calculer et expliquer l'effet de levier du crédit.

**Critères d'acceptation**
- [ ] Formule : Rentabilité fonds propres / Rentabilité sans crédit
- [ ] Explication pédagogique de l'effet de levier
- [ ] Comparaison achat cash vs achat crédit
- [ ] Alerte si levier négatif (taux crédit > rentabilité)

**User Stories**
- En tant qu'investisseur, je veux comprendre l'intérêt d'emprunter plutôt que payer cash

---

### MVP-018 : Comparaison régimes fiscaux

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-018 |
| **Catégorie** | Comparaison |
| **Priorité** | P2 |
| **Complexité** | M |
| **Dépendances** | MVP-004, MVP-005, MVP-006 |

**Description**
Comparer automatiquement les différents régimes fiscaux pour un même bien.

**Critères d'acceptation**
- [ ] Tableau comparatif : Nu micro, Nu réel, LMNP micro, LMNP réel, SCI IS
- [ ] Pour chaque : imposition, cashflow net, rentabilité nette-nette
- [ ] Mise en évidence du régime optimal
- [ ] Explication des différences

**User Stories**
- En tant qu'investisseur, je veux voir quel montage fiscal est le plus avantageux

---

### MVP-026 : Sauvegarde des simulations (serveur)

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-026 |
| **Catégorie** | Persistance |
| **Priorité** | P2 |
| **Complexité** | M |
| **Dépendances** | MVP-025 |

**Description**
Permettre la sauvegarde des simulations côté serveur (en plus du localStorage actuel) pour une persistance durable.

**Critères d'acceptation**
- [ ] Sauvegarde automatique après calcul
- [ ] Identifiant unique par simulation
- [ ] Récupération d'une simulation par son ID
- [ ] Liste des simulations récentes
- [ ] Possibilité de supprimer une simulation

**User Stories**
- En tant qu'utilisateur, je veux retrouver mes simulations même si je change d'appareil
- En tant qu'utilisateur, je veux pouvoir partager un lien vers ma simulation

---

### MVP-027 : Génération PDF autonome

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-027 |
| **Catégorie** | Export |
| **Priorité** | P2 |
| **Complexité** | M |
| **Dépendances** | MVP-024 |

**Description**
Générer les rapports PDF de simulation sans dépendance à n8n.

**Critères d'acceptation**
- [ ] PDF avec récapitulatif des données saisies
- [ ] PDF avec tous les résultats de calcul
- [ ] Mise en page professionnelle
- [ ] Téléchargement direct depuis l'interface
- [ ] Option d'envoi par email (si email renseigné)

**User Stories**
- En tant qu'utilisateur, je veux télécharger un rapport PDF de ma simulation
- En tant qu'investisseur, je veux un document présentable à montrer à ma banque

---

## P3 — Priorité Moyenne

> Fonctionnalités importantes pour enrichir l'analyse.

### MVP-019 : Amélioration SCI IS

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-019 |
| **Catégorie** | Régimes fiscaux |
| **Priorité** | P3 |
| **Complexité** | M |
| **Dépendances** | MVP-006 |

**Description**
Compléter la simulation SCI IS existante.

**Critères d'acceptation**
- [ ] Calcul IS : 15% jusqu'à 42 500€, 25% au-delà
- [ ] Simulation distribution dividendes
- [ ] Flat tax 30% sur dividendes
- [ ] Comparaison : capitaliser vs distribuer
- [ ] Impact sur HCSF des associés

**User Stories**
- En tant qu'investisseur en SCI, je veux simuler l'imposition société et la distribution

---

### MVP-020 : Graphiques d'évolution

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-020 |
| **Catégorie** | Projections |
| **Priorité** | P3 |
| **Complexité** | M |
| **Dépendances** | MVP-007, MVP-012, MVP-013 |

**Description**
Ajouter des graphiques pour visualiser les projections.

**Critères d'acceptation**
- [ ] Graphique cashflow annuel
- [ ] Graphique enrichissement patrimonial
- [ ] Graphique répartition capital/intérêts
- [ ] Graphique évolution loyer vs charges
- [ ] Interactif (survol pour détails)

**User Stories**
- En tant qu'investisseur, je veux visualiser graphiquement l'évolution de mon investissement

---

### MVP-021 : Amélioration formulaire régimes

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-021 |
| **Catégorie** | UX |
| **Priorité** | P3 |
| **Complexité** | M |
| **Dépendances** | MVP-004, MVP-005 |

**Description**
Refondre l'étape "Structure" pour intégrer tous les régimes.

**Critères d'acceptation**
- [ ] Choix type location : Nue / Meublée (LMNP)
- [ ] Si Nue : choix micro-foncier / réel
- [ ] Si Meublée : choix micro-BIC / réel
- [ ] Option SCI (IR ou IS)
- [ ] Workflow clair et guidé

**User Stories**
- En tant qu'utilisateur, je veux un parcours clair pour choisir mon régime fiscal

---

### MVP-022 : Synthèse coût acquisition

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-022 |
| **Catégorie** | Frais acquisition |
| **Priorité** | P3 |
| **Complexité** | S |
| **Dépendances** | MVP-001, MVP-002, MVP-003 |

**Description**
Afficher un récapitulatif clair du coût total d'acquisition.

**Critères d'acceptation**
- [ ] Tableau récapitulatif : prix + frais notaire + agence + travaux
- [ ] Total "clé en main"
- [ ] Pourcentage de frais par rapport au prix
- [ ] Affiché dans les résultats

**User Stories**
- En tant qu'investisseur, je veux voir clairement le coût total de mon acquisition

---

### MVP-023 : Persistance scénarios

| Champ | Valeur |
|-------|--------|
| **ID** | MVP-023 |
| **Catégorie** | Comparaison |
| **Priorité** | P3 |
| **Complexité** | S |
| **Dépendances** | MVP-008 |

**Description**
Sauvegarder les scénarios en localStorage.

**Critères d'acceptation**
- [ ] Sauvegarde automatique des scénarios
- [ ] Restauration au rechargement
- [ ] Suppression d'un scénario
- [ ] Limite de 5 scénarios max

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

| Métrique | Objectif |
|----------|----------|
| Précision calcul rentabilité | Écart < 5% vs calcul expert |
| Couverture régimes | 100% cas courants (nu, LMNP, SCI IS) |
| Projections | 5 à 25 ans disponibles |
| Temps de simulation | < 5 min pour analyse complète |
| Taux completion formulaire | > 80% |

---

## Historique

| Date | Version | Description |
|------|---------|-------------|
| 2025-01-25 | 1.0 | Création du backlog MVP |
| 2025-01-25 | 1.1 | Ajout items backend custom (MVP-024 à MVP-027), retrait dépendance n8n |
