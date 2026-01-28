# Audit Interne : Fiabilité des Calculs de Rentabilité

**Projet :** Renta Immo  
**Date :** 28 Janvier 2026  
**Auditeur :** Antigravity (AI Assistant)  
**Document de référence :** `docs/core/specification-calculs.md` (v2.0)

---

## 1. Objectif de l'audit

Le présent audit a pour objectif d'évaluer la correspondance entre les spécifications métier définies dans le dossier `docs/core` et leur implémentation technique au sein des moteurs de calcul de l'application (`src/server/calculations`). 

Il vise à garantir la fiabilité des résultats présentés aux utilisateurs et à identifier les pistes d'amélioration pour aligner l'outil sur les réalités fiscales et réglementaires de 2025/2026.

---

## 2. Synthèse de la correspondance

| Module | Statut | Observations |
| :--- | :--- | :--- |
| **Financement** | 🟡 Partiel | Les formules PMT sont correctes. Cependant, le calcul des frais de notaire est trop simplifié par rapport au barème légal spécifié. |
| **Charges** | 🟢 Conforme | Les charges d'exploitation et leur distinction fixe/proportionnelle sont bien intégrées. |
| **Rentabilité** | 🔴 Écart | Discrépance majeure sur le calcul de la rentabilité nette (base de calcul erronée). |
| **Fiscalité (LMNP/Foncière)** | 🟡 Partiel | Les taux et seuils 2025 sont à jour, mais la base imposable du régime réel est incomplète. |
| **Fiscalité (SCI IS)** | 🟡 Partiel | Le calcul de l'impôt sur les sociétés est mathématiquement correct mais fiscalement inexact (assiette trop large). |
| **Analyse HCSF** | 🟢 Conforme | Le calcul par associé pour les SCI IS est conforme aux attentes, bien que les données d'entrée individuelles soient limitées. |

---

## 3. Analyse détaillée des écarts

### 3.1. Rentabilité Nette (Indicateur Critique)
*   **Spécification :** La rentabilité nette doit être calculée sur le **Coût Total d'Acquisition** (Prix + Notaire + Travaux + Frais bancaires).
*   **Implémentation :** Elle est actuellement calculée uniquement sur le **Prix d'Achat**.
*   **Impact :** Cela conduit à une surestimation systématique de la rentabilité affichée (environ +0.5% à +1% d'écart).
*   **Action :** Aligner le dénominateur de la formule sur `cout_total_acquisition`.

### 3.2. Frais de Notaire
*   **Spécification :** Utilisation d'un barème progressif par tranches et déduction de la valeur du mobilier de l'assiette taxable.
*   **Implémentation :** Application d'un taux fixe (forfaitaire) sur le prix d'achat total.
*   **Action :** Implémenter la fonction `Calcul_Bareme(Prix_Achat)` et soustraire la `valeur_mobilier` avant application des taxes.

### 3.3. Fiscalité des Régimes Réels (LMNP & SCI IS)
*   **Spécification :** Les intérêts d'emprunt et l'assurance de prêt sont déductibles des revenus pour déterminer la base imposable.
*   **Implémentation :** La base imposable est calculée en soustrayant uniquement les charges d'exploitation et l'amortissement. Les frais financiers ne sont pas déduits.
*   **Impact :** L'impôt estimé est largement surestimé pour les projets fortement endettés.
*   **Action :** Modifier l'orchestration des calculs pour passer les frais financiers annuels au module de fiscalité.

### 3.4. Charges de Copropriété
*   **Spécification :** Seules les charges non récupérables doivent être incluses dans les dépenses du propriétaire.
*   **Implémentation :** Le calcul prend 100% des charges de copropriété saisies.
*   **Action :** Intégrer la déduction des `charges_copro_recuperables` dans le calcul des charges fixes.

---

## 4. Focus : Cohérence de la Simulation SCI à l'IS

Pour la structure juridique de type **SCI à l'IS**, nous avons identifié une anomalie de cohérence entre la théorie fiscale et le moteur actuel.

### Cas d'étude : Simulation d'un bien à 200 000 €
*   **Loyer annuel :** 12 000 €
*   **Charges d'exploitation :** 2 000 €
*   **Intérêts et Assurance (An 1) :** 7 600 €
*   **Amortissement annuel :** 4 250 €

**Résultat attendu (Expertise) :**
Base imposable = 12 000 (Loyer) - 2 000 (Charges) - 7 600 (Financement) - 4 250 (Amortissement) = **-1 850 € (Déficit)**.  
Impôt IS réel = **0 €**.

**Résultat implémenté (Logiciel) :**
Base imposable = 10 000 (Net exploitation) - 4 250 (Amortissement) = **5 750 €**.  
Impôt IS affiché = 5 750 * 15% = **862,50 €**.

**Conclusion de l'audit sur la SCI IS :** 
L'application affiche une charge fiscale là où l'investisseur ne devrait pas en avoir dans les premières années. Cela impacte négativement la décision d'investissement sur ce régime alors qu'il est souvent le plus avantageux.

---

## 5. Pistes d'amélioration et Recommandations

### Améliorations Immédiates (Audit Technique)
1.  **Refactorisation du lien Rentabilité-Fiscalité :** Permettre au module `fiscalite.ts` d'accéder aux détails du financement (intérêts/assurance) pour un calcul de base imposable fidèle.
2.  **Correction de l'assiette du Notaire :** Ajouter le support de la déduction du mobilier pour réduire les frais de notaire calculés.
3.  **Standardisation des PKI :** Créer une constante centrale pour les formules de rentabilité afin d'éviter les erreurs de dénominateur entre le frontend et le backend.

### Évolutions pour le Client (Mise à jour des Spécifications)
1.  **HCSF Nom Propre :** Nous recommandons d'ajouter des champs optionnels pour les "Crédits existants" et "Loyers actuels" dans le formulaire en nom propre, afin de rendre l'analyse HCSF aussi précise que pour la SCI.
2.  **Clarification sur l'Amortissement :** Préciser si l'amortissement "Simplifié" (2.5% ou 3% flat) est acceptable pour la v1 ou si le client exige le calcul par composants (toiture, électricité, etc.) qui est plus complexe à saisir pour l'utilisateur.

---

## 6. Conclusion

L'implémentation actuelle constitue une base solide mais nécessite des ajustements sur les **bases taxables** et les **formules de rentabilité nette**. Ces corrections fiabiliseront l'outil vis-à-vis d'un public d'experts ou d'investisseurs avertis qui pourraient noter des écarts avec leurs propres simulateurs ou ceux de leur expert-comptable.
