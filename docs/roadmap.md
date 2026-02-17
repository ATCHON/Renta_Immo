# Roadmap Renta_Immo

> Simulateur de rentabilité immobilière complet

## Vision Produit

**Renta_Immo** est un simulateur de rentabilité immobilière permettant aux investisseurs (débutants et confirmés) d'analyser la viabilité d'un investissement locatif avec précision et de prendre des décisions éclairées.

---

## Phases de Développement

| Phase | Focus | Fonctionnalités |
|-------|-------|-----------------|
| MVP | Analyse complète et fiable + Backend custom | 27 |
| V1 | Analyse de marché, précision et comptes utilisateurs | 17 |
| V2 | Fiscalité avancée et stratégie | 16 |
| V3 | Premium et intégrations | 14 |
| **Total** | | **74** |

> ⚠️ **Changement majeur** : Le backend n8n est remplacé par un backend custom dès le MVP.

---

## MVP — Analyse Complète & Fiable

> **Objectif** : Permettre une analyse d'investissement locatif complète et réaliste

### Nouvelles Fonctionnalités

| # | Catégorie | Fonctionnalité | Description |
|---|-----------|----------------|-------------|
| 1 | Frais acquisition | Frais de notaire | Calcul automatique (7-8% ancien, 2-3% neuf) avec option manuel |
| 2 | Frais acquisition | Frais d'agence | Montant ou % du prix, à charge acquéreur/vendeur |
| 3 | Frais acquisition | Travaux initiaux | Budget rénovation avant mise en location |
| 4 | Financement | Tableau d'amortissement | Détail année par année (capital, intérêts, reste dû) |
| 5 | Régimes fiscaux | Micro-foncier | Abattement 30%, plafond 15 000€ revenus fonciers |
| 6 | Régimes fiscaux | Foncier réel | Déduction charges réelles, déficit foncier |
| 7 | Régimes fiscaux | LMNP Micro-BIC | Abattement 50%, plafond 77 700€ |
| 8 | Régimes fiscaux | LMNP Réel | Amortissement comptable bien + mobilier |
| 9 | Régimes fiscaux | Amortissement | Calcul amortissement (LMNP réel, SCI IS) |
| 10 | Charges | Charges récupérables | Part récupérable sur le locataire |
| 11 | Charges | Honoraires comptable | Pour LMNP réel et SCI |
| 12 | Projections | Simulation pluriannuelle | Projection sur 5/10/15/20/25 ans |
| 13 | Projections | Évolution loyer (IRL) | Indexation annuelle paramétrable |
| 14 | Projections | Évolution charges | Inflation des charges |
| 15 | Projections | Enrichissement patrimonial | Capital remboursé + évolution valeur |
| 16 | Projections | TRI | Taux de Rendement Interne |
| 17 | Indicateurs | Effort d'épargne | Cashflow négatif vs capacité mensuelle |
| 18 | Indicateurs | Effet de levier | Multiplicateur rendement via crédit |
| 19 | Comparaison | Multi-scénarios | Comparer 2-3 configurations côte à côte |
| 20 | Comparaison | Comparaison régimes | Nu vs LMNP vs SCI sur même bien |

### Améliorations Existant

| # | Élément | Amélioration |
|---|---------|--------------|
| 21 | SCI IS | Simulation complète impôt société + distribution dividendes |
| 22 | Location nue | Choix micro-foncier vs réel avec comparaison |
| 23 | Résultats | Graphiques d'évolution sur la durée choisie |

### Infrastructure Backend (Nouveau)

> Remplacement de la dépendance n8n par un backend custom.

| # | Catégorie | Fonctionnalité | Description |
|---|-----------|----------------|-------------|
| 24 | Backend | Moteur de calcul autonome | Tous les calculs sans dépendance externe |
| 25 | Backend | API de simulation | Endpoints REST pour soumettre/récupérer les calculs |
| 26 | Persistance | Sauvegarde simulations | Stockage serveur des simulations |
| 27 | Export | Génération PDF autonome | Rapports PDF sans dépendance externe |

---

## V1 — Analyse de Marché & Précision

> **Objectif** : Contextualiser l'investissement dans son marché local

| # | Catégorie | Fonctionnalité | Description |
|---|-----------|----------------|-------------|
| 1 | Marché | Prix au m² du secteur | Comparaison prix bien vs marché local |
| 2 | Marché | Loyers du secteur | Estimation loyer marché, écart vs loyer saisi |
| 3 | Marché | Tension locative | Indicateur demande/offre zone |
| 4 | Marché | Zonage Pinel/PTZ | Zone A, Abis, B1, B2, C |
| 5 | Marché | Encadrement loyers | Alerte si zone concernée (Paris, Lyon...) |
| 6 | Marché | Impact DPE | Interdictions location, décote valeur |
| 7 | Financement | Différé d'amortissement | Différé partiel/total pour travaux |
| 8 | Financement | Prêt in fine | Capital remboursé à l'échéance |
| 9 | Charges | CFE | Cotisation Foncière Entreprises (LMNP/LMP) |
| 10 | Charges | Révision loyer IRL | Calcul automatique révision annuelle |
| 11 | Projections | VAN | Valeur Actuelle Nette |
| 12 | Projections | Cash-on-cash return | Rendement sur fonds propres |
| 13 | Indicateurs | Délai récupération | Années pour récupérer l'apport |
| 14 | Indicateurs | Capacité emprunt résiduelle | Pour prochain investissement |
| 15 | Comparaison | Analyse sensibilité | Impact variation taux, loyer, vacance |
| 16 | Comparaison | Best/Worst case | Scénarios optimiste/pessimiste |
| 17 | Utilisateurs | Comptes utilisateurs | Inscription, connexion, gestion des simulations |

---

## V2 — Fiscalité Avancée & Stratégie

> **Objectif** : Optimisation fiscale et stratégies complexes

| # | Catégorie | Fonctionnalité | Description |
|---|-----------|----------------|-------------|
| 1 | Régimes fiscaux | LMP | Statut professionnel, cotisations sociales |
| 2 | Régimes fiscaux | SCI IR | Transparence fiscale, quote-part associés |
| 3 | Régimes fiscaux | Déficit foncier | Imputation revenu global (10 700€/an) |
| 4 | Régimes fiscaux | Plus-value | Simulation revente (exonérations, abattements) |
| 5 | Dispositifs | Pinel | Simulation réduction d'impôt 6/9/12 ans |
| 6 | Dispositifs | Denormandie | Rénovation ancien centre-ville |
| 7 | Dispositifs | Malraux | Secteurs sauvegardés |
| 8 | Dispositifs | LMNP Censi-Bouvard | Résidences services |
| 9 | Financement | Lissage de prêts | Multi-prêts mensualité constante |
| 10 | Financement | IRA | Indemnités remboursement anticipé |
| 11 | Financement | Renégociation | Simulation changement de taux |
| 12 | Charges | Charges exceptionnelles | Gros travaux copro, ravalement |
| 13 | Projections | Graphiques avancés | Visualisations interactives détaillées |
| 14 | Indicateurs | ROE | Return on Equity |
| 15 | Indicateurs | Reste à vivre | Après toutes charges et crédits |
| 16 | Comparaison | Comparaison biens | Plusieurs biens côte à côte |

---

## V3 — Premium & Intégrations

> **Objectif** : Expérience utilisateur premium et automatisations

| # | Catégorie | Fonctionnalité | Description |
|---|-----------|----------------|-------------|
| 1 | Frais acquisition | Frais dossier bancaire | Dossier, garantie, hypothèque/caution |
| 2 | Frais acquisition | Frais courtage | Honoraires courtier |
| 3 | Frais acquisition | Mobilier LMNP | Budget équipement meublé |
| 4 | Frais acquisition | Diagnostics | Budget diagnostics obligatoires |
| 5 | Financement | Prêt relais | Achat avant revente |
| 6 | Marché | Évolution historique prix | Tendance marché local |
| 7 | Marché | Analyse quartier | Transports, commerces, écoles |
| 8 | UX | Compte utilisateur | Sauvegarde projets, historique |
| 9 | UX | Partage simulation | Lien partageable |
| 10 | UX | Import annonces | SeLoger, LeBonCoin, Bien'ici |
| 11 | UX | Export Excel | Données détaillées tableur |
| 12 | UX | Mode hors-ligne (PWA) | Utilisation sans connexion |
| 13 | UX | Alertes marché | Notifications évolution |
| 14 | Dispositifs | Monuments Historiques | Défiscalisation patrimoine |

---

## Fonctionnalités Existantes (Baseline)

Ces fonctionnalités sont déjà implémentées :

### Données Captées
- Bien : adresse, prix, surface, type, année construction
- Financement : apport, taux, durée, assurance emprunteur
- Exploitation : loyer, charges copro, taxe foncière, PNO, gestion, provisions
- Structure : Nom propre (TMI) ou SCI IS
- Associés (SCI) : parts, revenus, crédits, charges
- Options : PDF, email

### Calculs
- Rentabilité : brute, nette, nette-nette
- Cashflow : mensuel, annuel
- Financement : mensualité, montant emprunté, coût total
- Fiscalité : régime, impôt estimé, revenu net
- HCSF : taux endettement, conformité 35%
- Synthèse : score /100, recommandation, points d'attention

### Technique
- Formulaire multi-étapes avec validation Zod
- Persistance localStorage
- Intégration n8n
- Export PDF
- Dashboard résultats

---

## Historique des Versions

| Date | Version | Description |
|------|---------|-------------|
| 2025-01-25 | 0.1 | Création de la roadmap |
| 2025-01-25 | 0.2 | Ajout backend custom au MVP, comptes utilisateurs déplacés en V1 |
| 2026-02-16 | 0.3 | Achèvement du Sprint 4 (Back-office, Configuration dynamique, Refactoring) |
