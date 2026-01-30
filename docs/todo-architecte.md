# TODO Architecte - Renta_Immo

Ce document liste les livrables d'architecture à venir pour accompagner le développement du projet.

## 1. Visualisation et Modélisation
- [ ] **Schémas de Séquence** : Calcul du TRI, Flux Fiscalité SCI IS (Capitalisation vs Distribution).
- [ ] **Modèle de Données (ERD)** : Schéma des tables Supabase et relations.
- [ ] **Diagrammes de Conteneurs (C4)** : Architecture globale Frontend / API / Supabase.

## 2. Contrats d'Interface
- [ ] **Spécification OpenAPI** : Documentation de `/api/calculate` et futurs endpoints.
- [ ] **Contrat d'Interface Store/API** : Mapping des données entre Zustand et le Backend.

## 3. Stratégies Non-Fonctionnelles (ADRs)
- [ ] **ADR: Sécurité & Auth** : Intégration Supabase Auth et politiques RLS.
- [ ] **ADR: Performance & Offline** : Stratégie React Query et cache.
- [ ] **ADR: Observabilité** : Standards de log serveur et monitoring.

## 4. Processus et Gouvernance
- [ ] **RFC: Génération PDF** : Choix technique entre client-side et server-side (Phase 2).
- [ ] **Guide de Contribution Technique** : Setup local, outils MCP et environnement de dev.

## 5. Spécificités Renta_Immo (Prochaines Étapes)
- [ ] **Schéma PostgreSQL** : Table `simulations` pour la Phase 2.
- [ ] **API de Persistance** : Endpoints CRUD pour les simulations.

---
*Dernière mise à jour : ${new Date().toISOString().split('T')[0]} par Winston (Architecte)*
