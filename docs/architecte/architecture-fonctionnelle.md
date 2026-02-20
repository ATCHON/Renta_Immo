# Architecture Fonctionnelle et Mathématique - Renta_Immo

> **Version** : 2.0
> **Date** : 2026-02-20
> **Périmètre** : Modélisation mathématique exhaustive des règles métiers, fiscales et réglementaires du moteur de calcul interne, adossé aux 4 rapports d'audit de conformité (Rentabilité, Fiscalité, HCSF, Scoring/Projections).
> **Référence légales** : CGI (France), Décision HCSF 2024, Loi Climat-Résilience (2021), LF 2025 (Loi Le Meur), LFSS 2026.

---

## 1. Module d'Évaluation de la Rentabilité et du Financement

Ce module traite l'analyse purement financière et bancaire (hors impacts fiscaux complexes).

### 1.1 Emprunt et Amortissement Bancaire (Convention PMT)

La modélisation du crédit repose sur un lissage constant des mensualités (intérêts décroissants, capital amorti croissant).

- **Taux Mensuel (`t_m`)** : `taux_annuel / 12`
- **Mensualité hors assurance (`M_hc`)** : `[ Capital × t_m × (1 + t_m)^N ] / [ (1 + t_m)^N - 1 ]` (N = durée en mois).
- _Cas spécifique (Taux = 0%)_ : `M_hc = Capital / N` (amortissement linéaire).
- **Assurance Emprunteur (`Ass`)** : Calculée forfaitairement sur le **capital initial** (approche sécuritaire). `Ass_mensuelle = (Capital × Taux_assurance_annuel) / 12`.
- **Mensualité Totale** : `M_hc + Ass_mensuelle`.

### 1.2 Coût Total d'Acquisition et Frais Périmétriques

Le montant nécessaire pour l'opération inclut : `Prix d'Achat Net Vendeur + Frais de Notaire + Travaux + Frais de Dossier Bancaire + Frais de Garantie`.

- **Frais de Notaire (Émoluments + DMTO + débours + CSI)** :
  - **Ancien** : Taux forfaitaire d'environ **8,00 %**.
  - **Neuf (VEFA)** : Taux forfaitaire d'environ **2,50 %**.
  - _Assiette de calcul_ : La valeur du patrimoine mobilier (cuisine, meubles existants) est préalablement déduite de la base d'acquisition avant l'application du taux notarié.
- **Capital à Financer** : `Max(0, Coût Total Acquisition - Apport)`.

### 1.3 Indicateurs de Performance Classiques

L'application expose les trois niveaux de rendements :

1. **Rentabilité Brute** : `(Loyer Annuel Théorique / Prix d'Achat Net Vendeur) × 100`. (Convention du marché immo : indicateur de "vitrine").
2. **Rentabilité Nette** : `(Loyer Annuel Réel - Total Charges Annuelles) / Coût Total Acquisition × 100`. Le "Loyer Réel" est le loyer théorique pondéré par le paramètre de **taux d'occupation** (vacance locative).
3. **Cashflow (Flux de Trésorerie)** : `Revenus Locatifs Réels - (Charges Locatives + Impôts + Mensualité Bancaire)`. Un déficit de Cashflow engendre un _Effort d'Épargne_.
4. **Effet de Levier Financier** : `(Rentabilité Nette - Taux du Crédit Global) × (Montant Emprunté / Apport)`. Moteur de l'enrichissement par l'endettement.

### 1.4 Ventilation des Charges

- **Charges Fixes** :
  - Copropriété (uniquement la part incombant au propriétaire, hors part récupérable sur le locataire).
  - Taxe Foncière nette.
  - CFE (Cotisation Foncière des Entreprises) : Exonération automatique si Loyers < 5 000 € / an.
  - Assurances : Propriétaire Non Occupant (PNO) et Garantie Loyers Impayés (GLI).
  - Frais comptables (fortement recommandés pour le réel LMNP ou SCI).
- **Charges Proportionnelles** :
  - Gestion Locative (ex: 5% à 8% des loyers réels).
  - Prevision d'entretien / gros travaux (% du loyer).
  - Provision pour vacance locative (uniquement si le taux d'occupation n'est pas déjà précisé explicitement).

---

## 2. Module de Conformité HCSF (Haut Conseil de Stabilité Financière)

Garantit le respect des règles strictes sur la distribution du crédit immobilier pour les investisseurs de détail (norme 2024).

### 2.1 Les 3 Barrières Réglementaires

1. **Taux d'Endettement Maximal = 35 %**
   - Formule : `Total des charges d'emprunt (Actuelles + Futures) / Total des revenus pondérés`.
   - Alertes : Avertissement si compris entre 33,25 % et 35 %. Non-finançable au-delà.
2. **Durée Maximale du Prêt = 25 ans**
   - Dérogation légale : **27 ans** stricte pour les projets en _Vente en l’État Futur d’Achèvement (VEFA)_.
3. **Pondération des Revenus Locatifs = 70 %**
   - Les revenus locatifs (actuels ou futurs) ne sont pris en compte qu'à 70 % de leur valeur faciale pour modéliser le risque d'impayé.
   - _Exception modélisée_ : Le seuil peut grimper à 80 % dans des dérogations bancaires mineures si une GLI est souscrite (paramétrable par l'utilisateur).

### 2.2 Modélisation Spécifique

- **Capacité d'Emprunt Résiduelle** : Processus de reverse-engineering. `Marge Libre = (Revenus x 35%) - Charges Actuelles - Charges Futures.` Transformée en capital finançable via facteur d'actualisation (`[1-(1+t_m)^-240]/t_m`).
- **Estimation des Revenus via TMI** : Le simulateur dispose d'une heuristique de substitution si les revenus ne sont pas saisis : TMI 0% (~800€/m), 11% (~1800€), 30% (~3500€), 41% (~7000€), 45% (~15000€).
- **Calcul SCI / Associés** : La charge d'endettement incombant au projet est répartie proportionnellement au capital social de l'associé. Le taux d'endettement de la SCI (vis-à-vis des banques) est souvent aligné sur l'associé au profil le plus risqué (taux maximum calculé individuellement retenu à des fins conservatrices).
- **Reste à Vivre** : L'outil alerte si le volume d'argent résiduel `Revenus Pondérés - Charges de Crédits` passe sous un seuil empirique de sécurité bancaire (par défaut paramétré à **1 000 €/mois**).

---

## 3. Module Fiscalité

L'épicentre du calculateur intègre les 6 grandes typologies d'exploitation du parc résidentiel français, adossées à leurs CGI respectifs.

### 3.1 Prélèvements Sociaux (Viguerie 2026)

Le système dissipe l'ambigüité historique sur les taux catégoriels :

- **PS Fonciers classiques & Plus-Values** : 17,20 %.
- **PS Revenus LMNP (Régime BIC)** : **18,60 %** (Appliqué formellement depuis Loi LFSS 2026, suite au relèvement de la CSG de patrimoine de 1.4 pt sur ces revenus semi-actifs).

### 3.2 Revenus Fonciers (Location Nue)

- **Le Micro-Foncier** (Art 32. CGI) : Applicable si recettes < 15 000 €. Abattement forfaitaire strict de **30 %**.
- **Le Foncier Réel** (Art 28 & 156 CGI) : Déduction au réel des charges d'exploitation et d'intérêts de prêt.
  - _Gestion du Déficit Foncier_ : Séparation fiscale stricte en deux parts.
    1. Base Intérêts (imputable _uniquement_ sur les bénéfices fonciers des dix années suivantes).
    2. Base Autres Charges : Imputable sur le revenu global du contribuable jusqu'à **10 700 € / an** (Plafond rehaussable à **21 400 € / an** en cas de travaux de rénovation énergétique type globale 2025). Le reliquat part en file d'attente FIFO (10 ans).

### 3.3 Régimes Locatifs Meublés (LMNP / BIC)

- **LMNP Micro** (Art 50-0 CGI) :
  - _Longue durée standard_ : Plafond 77 700 € | Abattement forfaitaire de **50 %**.
  - _Meublé de Tourisme Classé_ : Plafond 188 700 € | Abattement de **71 %**.
  - _Meublé de Tourisme Non-Classé_ : Plafond draconien de 15 000 € | Abattement de **30 %**.
- **LMNP Réel et Amortissements** (Art 39C CGI et PCG 214-9) :
  - L'actif immobilier est désagrégé selon des règles comptables : Gros Œuvre (40% de la base bâtie, lissé sur 50 ans), Façade/Toiture (20%, 25 ans), Technique (20%, 15 ans), Agencement (20%, 10 ans).
  - La valeur du FONCIER (Terrain) est exclue de la base d'amortissement à hauteur de **15 %**.
  - Le mobilier est amorti linéairement sur 10 ans, ainsi que les dépenses de gros travaux (15 ans).
  - _Plafonnement spécifique_ : L'amortissement n'a pas le droit de créer un déficit catégoriel. Si l'amortissement génère une perte nette, l'excédent est isolé dans un bucket comptable mobilisable ultérieurement sans limitation de durée (`Stock_ARD`).

### 3.4 SCI à l'Impôt sur les Sociétés (IS)

- L'assiette est frappée au Taux IS : **15 %** jusqu'à la limite des 42 500 € de bénéfices nets annuels, **25 %** au-delà.
- La remontée des capitaux vers les associés personnes physiques s'accompagne d'un frottement fiscal via dividendes (imposition au prélèvement de Flat Tax globale à **30 %**, dit PFU).

### 3.5 Détermination de la Plus-Value de Cession (IR)

L'exit fiscal à la revente est simulé mathématiquement :

- **Abattements Temporels** (CGI 150 VC & VD) :
  - _IR (19%)_ : Exonération totale atteinte à 22 ans de détention. Érosion au rythme de 6 % par an au-delà de la 5ème année de détention.
  - _PS (17.20%)_ : Exonération totale atteinte à 30 ans. Érosion au rythme de 1,65 % par an (5-21) puis 9 % (23-30).
- **Majoration du Prix d'Acquisition (CGI)** : Forfait Frais de Notaire réglementaire (7,5 %) au lieu du réel. Si détention dépasse 5 ans, un forfait travaux additionnel et automatique (15 %) est intégré dans la base de calcul (PRK).
- **Tranches de Surtaxe des Cessions de Valeur > 50 000 € nettes** (CGI 1609 nonies G) :
  - > 50 K€ (2%), > 100K€ (3%), > 150K€ (4%), **> 200K€ (5%)**, > 250K€ (6%).
- **Coup d'arrêt LMNP (Loi Le Meur)** : Dès le 15 février 2025, toute cession en statut LMNP (non catégorisé "résidences services") subit une _réintégration des amortissements immobiliers_ (hors mobilier) qui avaient été passés en charge dans les années précédant la vente, augmentant lourdement le montant de la plus-value brute.

---

## 4. Module Projections et Scoring Stratégique

### 4.1 Scoring Investisseur

Le processus de notation est propriétaire et dynamique.

- **Formule de Base** : L'investissement démarre à 40 points sur un espace délimité continument `[0, 100]`.
- Chaque métrique (Rentabilité [−15 à +20 pts], Cashflow, Reste à Vivre, DPE, HCSF) gagne ou perd des points selon une **interpolation mathématique linéaire** dans des paliers pré-configurés.
- **Matrice de Profilage (Biaisage Poids)** :
  - _Rentier_ : Pondération exacerbée du Cashflow immédiat (× 1.5) et de la rentabilité intrinsèque (× 1.2). Le reste à vivre est dévalué (× 0.5).
  - _Patrimonial_ : Attention marquée pour la préservation au long terme. Valorisation stricte du Label DPE (× 1.5) et du taux d'endettement HCSF (× 1.2).

### 4.2 Projections Macro-économiques (Horizon N ans)

Les projections intègrent des chocs asymétriques prudents (modifiables).

- Inflation locative (IRL) : **1,50 % / an**.
- Inflation des dépenses d'entretien et charges : **2,00 % / an**.
- Revalorisation asymétrique du foncier global : **1,00 % / an**.

- **Choc Climatique (Vérification DPE L.2021-1104)** :
  - Impact direct sur le loyer en l'absence de rénovation énergétique. Gel officiel (Loi Climat-Résilience) de l'inflation locative immédiat pour `F` et `G`, effectif en 2034 pour `E`. Interdiction simulée à une date butoire de la mise sur le marché.
  - Décote drastique de la valeur terminale du bien en cas de diagnostic indigent (-15% pour FG, -5% pour E).

### 4.3 Convergence Vectorielle : Le Taux de Rendement Interne (TRI)

Le TRI calcule avec une précision formelle l'enrichissement net total procuré par une ressource monétaire (l'apport), tous impôts inclus.

- Le flux monétaire initial est _l'Outflow Période Zéro_ (l'apport soustraité, remplacé par une valeur ε = 1 € dans le code matriciel si l'investisseur emprunte à 110%).
- Les flux intermédiaires `[T1 -> Tn-1]` sont consubstantiels au Cashflow Net de toute fiscalité après imputation des dettes bancaires.
- Le flux terminal `Tn` comprend : Cashflow N + **(Valeur du bien liquidée de sa décote DPE) - (Frais d'Agences Immobilière Forfaitaires Standard ~5 %) - (Coût fixe des diags légaux ~500€) - (Capital Restant Dû à la banque) - (Impôt Final sur la Plus-Value IR)**.
- Le taux d'actualisation est évalué via convergence asymtotique du modèle de **Newton-Raphson** plafonnée à 100 itérations avec une tolérance numérique de `0.00001`.
