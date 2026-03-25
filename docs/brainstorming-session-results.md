# Renta_Immo — Spécifications Produit V3

**Sessions :** 2026-03-04 · 2026-03-17 · 2026-03-18
**Facilitatrice :** 📊 Business Analyst — Mary (BMad)
**Participant :** Alban
**Statut :** ✅ COMPLET — 12/12 features spécifiées et approfondies

---

## Table des matières

1. [Executive Summary](#executive-summary)
2. [Roadmap — Ordre de priorité](#roadmap--ordre-de-priorité)
3. [Insights transversaux](#insights-transversaux)
4. [Décisions déléguées à l'Architecte](#décisions-déléguées-à-larchitecte)
5. [Spécifications détaillées](#spécifications-détaillées)
   - [Feature #1 — Mode Express / Quick Scan](#feature-1--mode-express--quick-scan)
   - [Feature #2 — "Louer ou Acheter ?"](#feature-2--louer-ou-acheter-)
   - [Feature #3 — PDF optimisé "banquier"](#feature-3--pdf-optimisé-banquier)
   - [Feature #4 — LLM + RAG + Dialogue IA](#feature-4--llm--rag--dialogue-ia--rapport-narratif)
   - [Feature #5 — Profil psychologique + Stress-test](#feature-5--profil-psychologique--stress-test--score-alignement)
   - [Feature #6 — Comparateur de simulations](#feature-6--comparateur-simulations-historiques)
   - [Feature #7 — Extension navigateur](#feature-7--extension-navigateur--fallback-copier-coller)
   - [Feature #8 — Carte de chaleur](#feature-8--carte-de-chaleur-prixm--rendement-brut)
   - [Feature #9 — Intégration DVF automatique](#feature-9--intégration-dvf-automatique)
   - [Feature #10 — Observatoire multi-cartes](#feature-10--page-observatoire-multi-cartes)
   - [Feature #11 — Espace simulation partagé](#feature-11--espace-simulation-partagé-multi-utilisateurs)
   - [Feature #12 — Alertes veille marché](#feature-12--alertes-veille-marché)

---

## Executive Summary

**Objectif :** Évolution de Renta_Immo vers une plateforme grand public et IA-native, autour de 3 axes stratégiques :

- **Acquisition** : réduire la friction d'entrée (Mode Express, Carte de chaleur, Observatoire) — accès sans compte
- **Différenciation IA** : analyse narrative, dialogue LLM/RAG, profil psychologique, score alignement
- **Rétention & Pro** : comparateur, espace partagé CGP/client, alertes, export banquier

**Contraintes globales :** France uniquement · Open source privilégié · Sans revenus commerciaux · Infra actuelle = Vercel + Supabase

---

## Roadmap — Ordre de priorité

| Priorité | Feature                                               | Accès    | Statut      |
| -------- | ----------------------------------------------------- | -------- | ----------- |
| 1        | Mode Express / Quick Scan                             | Public   | ✅ Spécifié |
| 2        | "Louer ou Acheter ?"                                  | Public   | ✅ Spécifié |
| 3        | PDF optimisé "banquier"                               | Connecté | ✅ Spécifié |
| 4        | LLM + RAG + Dialogue IA + Rapport narratif            | Connecté | ✅ Spécifié |
| 5        | Profil psychologique + Stress-test + Score alignement | Connecté | ✅ Spécifié |
| 6        | Comparateur simulations historiques                   | Connecté | ✅ Spécifié |
| 7        | Extension navigateur + fallback copier-coller         | Public   | ✅ Spécifié |
| 8        | Carte de chaleur prix/m² + rendement brut             | Public   | ✅ Spécifié |
| 9        | Intégration DVF automatique                           | Connecté | ✅ Spécifié |
| 10       | Page Observatoire multi-cartes                        | Public   | ✅ Spécifié |
| 11       | Espace simulation partagé multi-utilisateurs          | Connecté | ✅ Spécifié |
| 12       | Alertes veille marché                                 | Connecté | ✅ Spécifié |

---

## Insights transversaux

- **DVF comme brique fondatrice :** socle commun aux Features #1, #8, #9, #10. À implémenter en priorité infrastructure dès que les features vitrines (1, 2) sont livrées.
- **Funnel de conversion central :** Carte de chaleur → Mode Express → "Simuler complet" → **création de compte**. Ce parcours sans friction est le principal levier d'acquisition.
- **LLM open source = différenciation durable :** les outils concurrents utilisent des APIs commerciales coûteuses. Un LLM self-hosted = même qualité, zéro coût, données non partagées.
- **RAG Notion déjà opérationnel :** le pipeline n8n → YouTube → Notion existe. La valeur est immédiate dès que le LLM est connecté.
- **Progressive disclosure :** principe UX central — Quick Scan (sans compte) → Simulateur complet (compte) → IA + Observatoire (compte + profil).
- **Profil psychologique = couche transversale :** une fois capturé, il enrichit les Features #4, #5, #12 (recommandations personnalisées selon profil Sécurité / Rendement / Patrimoine).
- **Extension navigateur = levier open source :** la contribution communautaire des parsers (modèle uBlock Origin) peut générer de l'engagement autour du projet.
- **Carte de chaleur = trafic organique :** une carte interactive bien référencée peut devenir une source d'acquisition majeure (SEO + partage social).
- **Menu "Exporter" unifié :** 4 options progressives — PDF Standard / PDF Banquier / PDF Narratif IA / PDF Comparatif.

---

## Décisions déléguées à l'Architecte

_À traiter avant démarrage du Sprint V3_

| #   | Sujet                                  | Features | Options identifiées                                           |
| --- | -------------------------------------- | -------- | ------------------------------------------------------------- |
| A1  | **Choix du LLM**                       | #4, #7   | Mistral/Ollama self-hosted · API commerciale · Hybride        |
| A2  | **Intégration extension → simulateur** | #7       | Deep link nouvel onglet · Injection onglet ouvert · Clipboard |
| A3  | **Stack temps réel collaboration**     | #11      | Supabase Realtime · WebSockets · Polling                      |
| A4  | **Stack cartographique**               | #8, #10  | Leaflet.js · MapLibre GL                                      |
| A5  | **Vector DB pour le RAG**              | #4       | Qdrant · Chroma                                               |
| A6  | **Algorithme rayon DVF adaptatif**     | #9       | Seuils densité + valeurs par défaut urbain/rural              |

**Contraintes à communiquer à l'architecte :**

- Infra actuelle (Vercel + Supabase) insuffisante pour héberger un LLM de manière robuste
- Stack existant : Next.js 14 · TypeScript · Supabase · Better Auth · Redis (Upstash)
- Préférence open source sur toutes les briques
- Supabase Realtime est déjà dans le stack (avantage pour A3)

---

## Spécifications détaillées

---

### Feature #1 — Mode Express / Quick Scan

> _Gap adressé : Acheteur spontané perdu face à la complexité du simulateur complet_

**Concept :** Simulateur allégé, entrée en 1 écran, résultat immédiat avec 3 scénarios. Accessible depuis la homepage sans compte requis. Premier maillon du funnel de conversion.

**Inputs minimaux** _(infos disponibles sur une annonce)_ :

- Prix du bien
- Localisation (commune ou adresse)
- Surface habitable
- Nombre de pièces / nombre de lots
- DPE
- État du bien (clé en main / travaux légers / gros travaux)

**Outputs :**

- Loyer estimé automatiquement (via DVF + OLL)
- Rendement brut immédiat
- 3 scénarios : optimiste / réaliste / prudent
- Aperçu visuel visible AVANT de remplir le formulaire

**UX :**

- Formulaire 1 page, 6-7 champs max
- Résultat en temps réel pendant la saisie
- Tooltips pédagogiques sur chaque champ
- Bouton "Importer une annonce" → Feature #7 (fallback copier-coller)
- Section dédiée homepage : _"Analysez une annonce en 30 secondes"_

**Funnel de conversion :**

- CTA _"Affiner avec le simulateur complet"_ → déclenche la **création de compte**
- Entrées : homepage directe · Carte de chaleur (Feature #8) avec commune pré-remplie

**Data :**

- DVF data.gouv.fr · INSEE · ANIL / OLL · ADEME
- Cache Supabase, actualisation trimestrielle

| Élément        | Décision                                                    |
| -------------- | ----------------------------------------------------------- |
| Accès          | Public — section homepage, sans compte                      |
| Inputs         | 6-7 champs (prix, localisation, surface, pièces, DPE, état) |
| Output         | Loyer estimé auto + rendement brut + 3 scénarios            |
| Import annonce | Bouton "Importer" → Feature #7                              |
| Funnel         | CTA "Simuler complet" → création de compte                  |
| Data           | DVF + INSEE + OLL — cache Supabase trimestriel              |

---

### Feature #2 — "Louer ou Acheter ?"

> _Gap adressé : Locataire hésitant qui ne sait pas si acheter est pertinent pour sa situation_

**Concept :** Parcours guidé sous forme d'arbre de décision visuel et progressif, intégrant données locales de marché automatiquement.

**Structure de l'arbre :**

```
Étape 1 — Situation de vie
   → Stabilité professionnelle ? Horizon géographique ? Situation familiale ?

Étape 2 — Capacité financière
   → Apport disponible ? Budget mensuel ? Endettement actuel ?
   → Coût d'opportunité du cash (si placé ailleurs ?)

Étape 3 — Marché local (auto-rempli via DVF + OLL)
   → Ratio Prix/Loyer de la commune
   → Tension locative locale
   → Dynamique des prix (haussier / stable / baissier)

Étape 4 — Profil patrimonial
   → Objectif : flexibilité ou constitution de patrimoine ?
   → Autres actifs détenus ? TMI ? Régime matrimonial ?

Étape 5 — Résultat
   → Recommandation + score de confiance
   → Point de bascule (à partir de quelle année l'achat devient avantageux)
   → Comparatif patrimonial à 10, 15, 20 ans
   → Alertes contextuelles (ex: "Votre mobilité pro rend l'achat risqué avant 5 ans")
   → Scénarios what-if (taux, enfant, évolution marché)
```

**UX :**

- L'arbre se dessine visuellement en temps réel au fil des réponses
- Données de marché local injectées automatiquement (étape 3)

| Élément     | Décision                                                       |
| ----------- | -------------------------------------------------------------- |
| Accès       | Public — sans compte, homepage ou menu dédié                   |
| Format      | Arbre de décision guidé, progressif et visuel                  |
| Data locale | DVF + INSEE + OLL — auto-rempli                                |
| Output      | Score recommandation + point de bascule + comparatif 10/20 ans |
| Scénarios   | What-if : taux, famille, marché                                |

---

### Feature #3 — PDF optimisé "banquier"

> _Problème résolu : le PDF actuel est un export brut — les banquiers lisent des ratios spécifiques_

**Concept :** Nouveau template PDF 4 pages orienté présentation bancaire, coexistant avec le PDF standard via un menu déroulant "Exporter" sur l'écran de résultats.

**Structure des 4 pages :**

- **Page 1 — Page de garde**
  - Titre (adresse ou nom de la simulation) · Date · Nom de l'investisseur (depuis profil)
  - Résumé exécutif 3-4 lignes (bien, prix, régime fiscal, cashflow net)

- **Page 2 — Ratios clés** _(code couleur vert / orange / rouge selon seuils bancaires)_
  - Taux d'endettement global (crédit / revenus totaux)
  - Taux d'effort (mensualité / revenus)
  - DSCR — Debt Service Coverage Ratio (loyers / mensualité)
  - Cashflow net mensuel (après charges, impôts, crédit)
  - Reste à vivre mensuel
  - Rendement net net

- **Page 3 — Projection patrimoniale**
  - Graphique : évolution patrimoine net à 10 / 20 ans
  - Tableau synthétique : cashflow cumulé, capital remboursé, valeur nette estimée
  - Hypothèses affichées (inflation, revalorisation loyers, taux)

- **Page 4 — Annexes**
  - Tableau d'amortissement annuel (synthétique)
  - Récapitulatif des paramètres de la simulation
  - Mentions légales et sources des données

**UX :** Menu déroulant "Exporter" sur l'écran résultats → **PDF Standard** / **PDF Banquier**

| Élément          | Décision                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------- |
| Accès            | Utilisateurs connectés uniquement                                                        |
| Format           | 4 pages — PDF généré côté serveur                                                        |
| UX export        | Menu déroulant "Exporter" sur l'écran résultats                                          |
| Ratios           | Taux endettement · Taux effort · DSCR · Cashflow net · Reste à vivre · Rendement net net |
| Données          | Uniquement celles déjà saisies (aucun champ supplémentaire)                              |
| Personnalisation | Nom depuis profil — pas de logo (V1)                                                     |
| Coexistence      | PDF Standard conservé — PDF Banquier = template additionnel                              |

---

### Feature #4 — LLM + RAG + Dialogue IA + Rapport narratif

> _Différenciation : analyse critique IA personnalisée sur chaque simulation, avec base de connaissance immobilière vérifiée_

**Concept :** Page dédiée par simulation sauvegardée, à la demande, offrant un dialogue interactif avec un LLM connecté à un RAG immobilier, produisant une analyse narrative et un rapport exportable.

**Architecture RAG :**
| Source | Type | Statut |
|--------|------|--------|
| Notion (YouTube pros immobilier via n8n) | Connaissance terrain | ✅ Opérationnel |
| BOFiP + legifrance.gouv.fr | Réglementaire fiscal | À intégrer |
| ANIL | Réglementaire locatif | À intégrer |
| DVF + OLL | Données marché | Partagé avec Feature #9 |

**UX :**

- Page `/simulations/[id]/analyse` — bouton "Analyser avec l'IA" (déclenchement à la demande)
- L'IA ouvre avec une **analyse proactive** : _"J'ai détecté 3 points d'attention sur cette simulation..."_
- Questions libres de l'utilisateur ensuite
- Historique **sauvegardé par simulation** (consultable à tout moment)
- Profil investisseur (Feature #5) **injecté au LLM** pour personnalisation

**Rapport narratif :**

- Structure : Synthèse exécutive → Points forts → Risques → Stratégies alternatives → Sources
- Livré **en double** : 1er message du dialogue (markdown) + export PDF narratif (3ème option menu Exporter)
- Criticité : expliquer + interpréter + proposer — jamais interdire

**Stack technique :** ⚠️ Choix LLM et Vector DB délégués à l'architecte (A1, A5)

| Élément          | Décision                                                            |
| ---------------- | ------------------------------------------------------------------- |
| Accès            | Page `/simulations/[id]/analyse` — connecté, simulation sauvegardée |
| Déclenchement    | À la demande — bouton "Analyser avec l'IA"                          |
| LLM              | Délégué architecte (A1)                                             |
| Vector DB        | Délégué architecte (A5)                                             |
| RAG source       | Notion + BOFiP + legifrance + DVF                                   |
| Historique       | 1 conversation par simulation, persistée                            |
| Rapport narratif | Dans le dialogue + export PDF (3ème option menu Exporter)           |
| Profil           | Injecté depuis Feature #5                                           |

---

### Feature #5 — Profil psychologique + Stress-test + Score alignement

> _Différenciation : aucun outil concurrent n'adapte les recommandations au profil comportemental de l'investisseur_

**Concept :** Couche émotionnelle et comportementale sur 3 composantes interconnectées.

**Composante 1 — Profil investisseur**

- Page `/profil` — accessible depuis les paramètres, modifiable à tout moment
- Questionnaire 5-7 questions → **profil dominant** : Sécurité / Rendement / Patrimoine
- Profil injecté dans : Feature #4 (analyse IA) · seuils d'alerte du simulateur · Feature #12 (alertes)

_Exemples de questions :_

1. Face à une vacance de 3 mois : _(Panique / Acceptable / Prévu dans mon plan)_
2. Horizon d'investissement : _(< 5 ans / 5-15 ans / 15+ ans)_
3. Priorité : _(Revenus immédiats / Constitution de patrimoine / Optimisation fiscale)_
4. Tolérance aux travaux imprévus : _(Zéro surprise / Quelques imprévus / Je gère)_
5. Si marché baisse de 15% : _(Vendre / Attendre / Acheter davantage)_

**Composante 2 — Stress-test émotionnel**

- Scénarios avec **valeurs par défaut** : vacance 3 mois · vacance 6 mois · taux +2% · loyers -10%
- Paramètres **ajustables par l'utilisateur** (slider ou champ numérique)
- Visualisation de l'impact sur le cashflow mensuel (bien + situation personnelle)

**Composante 3 — Score d'alignement bien/profil**

- Indicateur : _"Ce bien vous correspond à 78%"_
- Décomposé par dimension : rendement / risque / horizon / effort de gestion
- Affiché dans les **résultats du simulateur** et dans la **page Analyse IA** (Feature #4)

| Élément          | Décision                                                    |
| ---------------- | ----------------------------------------------------------- |
| Questionnaire    | Page `/profil` — modifiable à tout moment                   |
| Profil           | 1 profil dominant : Sécurité / Rendement / Patrimoine       |
| Stress-test      | Scénarios prédéfinis + ajustables par l'utilisateur         |
| Score alignement | Résultats simulation + page Analyse IA                      |
| Mode Express     | Reste générique (profil non requis, sans compte)            |
| Injection        | Profil transmis au LLM (Feature #4) + alertes (Feature #12) |

---

### Feature #6 — Comparateur simulations historiques

> _Besoin : arbitrer entre plusieurs biens sans perdre de vue ses simulations passées_

**Concept :** Vue tableau de bord comparative de 2 à 4 simulations, incluant la simulation en cours.

**Sélection :**

- Cases à cocher dans la liste → bouton "Comparer la sélection"
- Page `/simulations/comparer` avec ajout/retrait de colonnes à la volée
- Colonne **"En cours"** disponible (simulation non sauvegardée)

**Layout :**

- **Adaptatif** : 2 colonnes mobile · 4 colonnes max desktop
- Filtres au-dessus (date, ville, montant, régime fiscal)
- **Highlight automatique** : cellule verte = meilleure valeur par critère

**Indicateurs comparés :**

- Rendement brut / net / net net · Cashflow mensuel · TRI
- Score d'alignement (Feature #5) · Prix d'achat / Surface / Prix au m²
- Régime fiscal · Apport · Mensualité crédit

**Export :** PDF comparatif — 4ème option du menu "Exporter"

| Élément             | Décision                                       |
| ------------------- | ---------------------------------------------- |
| Accès               | Connecté — historique requis                   |
| Sélection           | Depuis liste + dans le comparateur             |
| Simulation en cours | Colonne "En cours" disponible                  |
| Colonnes            | 2 mobile · 4 max desktop                       |
| Highlight           | Meilleure valeur par critère en vert           |
| Export              | PDF comparatif — menu "Exporter" (4ème option) |

---

### Feature #7 — Extension navigateur + fallback copier-coller

> _Besoin : pré-remplir le simulateur depuis une annonce en une action, sans ressaisie manuelle_

**Concept :** Double approche pour l'import automatique d'annonce. Livré dès la **V1**.

**Option A — Extension navigateur** _(priorité)_

- Parsing DOM local → zéro serveur, CGU respectées, sans compte requis
- Parsers dédiés : SeLoger · LeBonCoin · PAP · Bien'ici · Logic-Immo
- Champ introuvable → valeur par défaut + badge "estimé" (orange)
- Méthode d'intégration vers le simulateur : **délégué architecte (A2)**
- Maintenance communautaire des parsers (open source GitHub)

**Option B — Copier-coller + LLM** _(fallback universel)_

- Bouton "Importer une annonce" sur le **formulaire de simulation ET la homepage**
- LLM extrait structurellement les données du texte collé (même LLM que Feature #4)
- Même comportement sur champ manquant : valeur par défaut + badge "estimé"

**Données extraites (communes) :**
Prix · Surface · Nombre de pièces · Localisation · DPE · Charges copro · État du bien

| Élément                | Décision                                          |
| ---------------------- | ------------------------------------------------- |
| Timing                 | V1                                                |
| Compte requis          | Non — extension utilisable sans compte            |
| Champ manquant         | Valeur par défaut + badge "estimé" (orange)       |
| Intégration simulateur | Délégué architecte (A2)                           |
| Fallback UX            | Bouton "Importer" sur formulaire + homepage       |
| Sites couverts         | SeLoger · LeBonCoin · PAP · Bien'ici (extensible) |
| LLM fallback           | Aligné Feature #4 (même infra)                    |

---

### Feature #8 — Carte de chaleur prix/m² + rendement brut

> _Objectif : trafic organique SEO + levier d'acquisition grand public_

**Concept :** Carte interactive France avec prix au m² et rendement brut estimé par commune/quartier. Accès public, premier maillon du funnel d'acquisition.

**Couches :**

- Prix au m² (DVF) · Rendement brut estimé (DVF + OLL)
- Sélecteur de couche · Filtre par type de bien (appartement / maison / studio)

**Granularité :**

- Commune par défaut (DVF disponible partout)
- Quartier si données OLL disponibles (Paris + grandes métropoles)
- Adaptée automatiquement au niveau de zoom

**Interactions :**

- **Zoom faible** → popup : prix/m² médian + rendement + CTA
- **Zoom fort** → fiche commune : historique 5 ans, tension locative, loyer médian
- **CTA "Analyser un bien ici"** → Mode Express avec commune pré-remplie
- Depuis Mode Express → CTA "Simuler complet" → **création de compte** (conversion)

**Stack :** Leaflet.js ou MapLibre GL + OpenStreetMap + GeoJSON data.gouv.fr (délégué architecte A4)

| Élément       | Décision                                        |
| ------------- | ----------------------------------------------- |
| Accès         | Public — sans compte                            |
| Couches       | Prix/m² + Rendement brut (sélecteur)            |
| Granularité   | Commune par défaut · quartier si OLL dispo      |
| Interaction   | Popup (zoom faible) · fiche commune (zoom fort) |
| CTA           | → Mode Express → création de compte (funnel)    |
| Actualisation | Trimestrielle (rythme DVF)                      |

---

### Feature #9 — Intégration DVF automatique

> _Brique fondatrice : alimente Features #1, #8, #10 et valide le prix du simulateur_

**Concept :** Données DVF intégrées dans le simulateur pour contextualiser chaque simulation avec les prix réels du marché local.

**Périmètre de recherche :**

- Rayon **configurable par l'utilisateur** (slider dans les paramètres de la simulation)
- Recommandation affichée selon densité : _"Seulement 3 transactions — élargissez à 1km"_
- Valeur par défaut selon densité locale (délégué architecte A6)

**Validation du prix :**

- Seuils par défaut : +15% = orange · +30% = rouge · -10% = vert "sous le marché"
- Seuils **configurables dans les paramètres utilisateur**
- Affichage **inline sous le champ Prix** (saisie) + **encart dans les résultats**

**Historique :** Graphique courbe évolution prix/m² sur 5 ans — commune

**Alimentation des autres features :**

- Feature #1 (Mode Express) : si géocodage disponible (API Adresse data.gouv.fr)
- Feature #8 (Carte chaleur) : socle de données communes
- Feature #10 (Observatoire) : couche Prix/m²

| Élément       | Décision                                    |
| ------------- | ------------------------------------------- |
| Source        | DVF data.gouv.fr + API Adresse data.gouv.fr |
| Cache         | Supabase — trimestriel (aligné Feature #8)  |
| Rayon         | Configurable + recommandation densité (A6)  |
| Seuils alerte | +15% / +30% prédéfinis + configurables      |
| Affichage     | Inline champ prix + encart résultats        |
| Historique    | Graphique courbe 5 ans                      |

---

### Feature #10 — Page Observatoire multi-cartes

> _Objectif : outil d'analyse territorial complet pour investisseurs avancés_

**Concept :** Page "Observatoire du Marché" avec 7 cartes thématiques synchronisées. Accès public.

**7 couches disponibles :**
| # | Couche | Source |
|---|--------|--------|
| 1 | Prix au m² | DVF data.gouv.fr |
| 2 | Rendement brut estimé | DVF + OLL |
| 3 | Tension locative / Zones tendues | ANIL |
| 4 | Loyers médians | OLL (Observatoires Locaux des Loyers) |
| 5 | Revenus médians des ménages | INSEE |
| 6 | Taux de logements vacants | INSEE |
| 7 | Répartition DPE par zone | ADEME |

**UX :**

- Onglets horizontaux + **mode côte à côte** (2 cartes simultanées)
- Barre de recherche commune/ville → zoom automatique
- **Synchronisation des vues** : position + zoom partagés entre toutes les cartes
- Export : **PNG** (carte + légende) + **PDF** (carte + légende + source + date)
- CTA "Analyser un bien ici" → Mode Express commune pré-remplie

| Élément         | Décision                                       |
| --------------- | ---------------------------------------------- |
| Accès           | Public — sans compte                           |
| Navigation      | Onglets + mode côte à côte (2 cartes)          |
| Recherche       | Barre commune → zoom automatique               |
| Synchronisation | Position/zoom partagés entre toutes les cartes |
| Export          | PNG + PDF (légende + source + date)            |
| CTA             | → Mode Express commune pré-remplie             |

---

### Feature #11 — Espace simulation partagé multi-utilisateurs

> _Cas d'usage : associés, couple, CGP + client travaillant sur le même projet_

**Concept :** Collaboration en temps réel sur une simulation partagée, avec rôles différenciés et mode présentation CGP.

**Accès :** Lien public ou invitation email — compte requis pour tous les participants

**Rôles & permissions :**
| Rôle | Modifier données | Annoter | Inviter | Dupliquer | Supprimer |
|------|-----------------|---------|---------|-----------|-----------|
| **Propriétaire** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Collaborateur** | ❌ | ✅ | ❌ | ✅ (copie dans ses simulations) | ❌ |
| **Lecteur** | ❌ | ❌ | ❌ | ❌ | ❌ |

**Collaboration :**

- Temps réel de préférence — stack à définir par l'architecte (A3, Supabase Realtime favorisé)
- Annotations et commentaires sur les champs et résultats
- Historique des modifications horodaté par utilisateur

**Notifications :** Email + in-app, configurables (canal + fréquence)

**Mode "présentation" CGP :**

- Masque les données personnelles (revenus, apport, situation familiale)
- Garde uniquement résultats et ratios clés
- Activable par le Propriétaire depuis les options de partage

| Élément       | Décision                                                |
| ------------- | ------------------------------------------------------- |
| Partage       | Lien + invitation email                                 |
| Collaboration | Temps réel (préférence) — stack délégué architecte (A3) |
| Collaborateur | Annotations uniquement — peut dupliquer                 |
| Notifications | Email + in-app, configurables                           |
| Mode CGP      | Masque données personnelles                             |

---

### Feature #12 — Alertes veille marché

> _Objectif : maintenir l'engagement utilisateur et signaler les opportunités ou risques_

**Concept :** Notifications intelligentes sur zones d'intérêt et événements marché/réglementaires.

**Types d'alertes :**
| Type | Source | Fréquence |
|------|--------|-----------|
| Évolution taux de crédit | Courtiers (Meilleurtaux...) | Quotidienne |
| Modification réglementaire (LMNP, SCI IS...) | BOFiP · legifrance | Hebdomadaire |
| Évolution prix commune suivie | DVF data.gouv.fr | Trimestrielle |
| Changement zone tendue | ANIL | Hebdomadaire |
| Baromètre DPE | ADEME | Hebdomadaire |

**Configuration — double point d'entrée :**

- Page "Mes alertes" (paramètres du compte) — vue centralisée
- Depuis la carte (Features #8/10) — bouton "Suivre cette commune"

**Seuils :** Entièrement libres — champ numérique par alerte, défini par l'utilisateur

**Format des notifications :**

- **In-app** : message court + lien direct _(ex: "Prix +7% à Lyon 3e — voir la carte")_
- **Email** : détaillé avec données chiffrées + source + CTA vers la feature concernée

**Limite :** Illimitées

| Élément       | Décision                                                 |
| ------------- | -------------------------------------------------------- |
| Configuration | Page "Mes alertes" + bouton "Suivre" depuis la carte     |
| Seuils        | Libres — définis par l'utilisateur                       |
| Fréquence     | Adaptée par source (quotidienne / hebdo / trimestrielle) |
| Canaux        | In-app (court) + email (détaillé)                        |
| Limite        | Illimitées                                               |
| Polling       | n8n ou cron selon fréquence par type                     |

---

## Menu "Exporter" — Récapitulatif

_Disponible sur l'écran de résultats du simulateur complet (utilisateurs connectés)_

| Option          | Contenu                                         | Feature |
| --------------- | ----------------------------------------------- | ------- |
| PDF Standard    | Export brut existant                            | —       |
| PDF Banquier    | 4 pages : garde + ratios + projection + annexes | #3      |
| PDF Narratif IA | Rapport IA : synthèse + risques + stratégies    | #4      |
| PDF Comparatif  | Tableau comparateur de simulations              | #6      |

---

_Session 1 — 2026-03-04 — BMad Analyst Mary_
_Session 2 — 2026-03-17 — BMad Analyst Mary — Fonctionnalités IA & Tech_
_Session 3 — 2026-03-18 — BMad Analyst Mary — Approfondissement & Mise en forme_
