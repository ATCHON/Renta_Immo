-- supabase/migrations/20260216_sprint4_config_params.sql

-- ============================================================
-- 1. Migration du rôle utilisateur
-- ============================================================
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

CREATE INDEX IF NOT EXISTS idx_user_role ON "user"(role) WHERE role = 'admin';

-- ============================================================
-- 2. Table principale des paramètres configurables
-- ============================================================
CREATE TABLE public.config_params (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  annee_fiscale INTEGER NOT NULL,               -- Ex: 2025, 2026
  bloc         TEXT NOT NULL,                   -- 'fiscalite', 'hcsf', 'plus_value', etc.
  cle          TEXT NOT NULL,                   -- Ex: 'TAUX_PS_FONCIER'
  valeur       DECIMAL(20, 8) NOT NULL,         -- Valeur numérique
  unite        TEXT NOT NULL DEFAULT 'decimal', -- 'decimal', 'euros', 'annees', 'pourcentage'
  label        TEXT NOT NULL,                   -- Libellé affichable
  description  TEXT,                            -- Texte aide contextuelle
  is_temporary BOOLEAN NOT NULL DEFAULT FALSE,  -- TRUE = dispositif fiscal temporaire
  date_expiration DATE,                         -- Date d'expiration
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT config_params_unique UNIQUE (annee_fiscale, bloc, cle)
);

CREATE INDEX idx_config_params_annee ON public.config_params(annee_fiscale);
CREATE INDEX idx_config_params_bloc ON public.config_params(annee_fiscale, bloc);
CREATE INDEX idx_config_params_temporary ON public.config_params(is_temporary, date_expiration)
  WHERE is_temporary = TRUE;

-- Trigger updated_at
CREATE TRIGGER config_params_updated_at
  BEFORE UPDATE ON public.config_params
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE public.config_params ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. Table d'audit des modifications
-- ============================================================
CREATE TABLE public.config_params_audit (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id     UUID NOT NULL REFERENCES public.config_params(id) ON DELETE CASCADE,
  annee_fiscale INTEGER NOT NULL,
  bloc          TEXT NOT NULL,
  cle           TEXT NOT NULL,
  ancienne_valeur DECIMAL(20, 8) NOT NULL,
  nouvelle_valeur DECIMAL(20, 8) NOT NULL,
  modifie_par   TEXT NOT NULL REFERENCES "user"(id),
  modifie_le    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  motif         TEXT
);

CREATE INDEX idx_audit_config_id ON public.config_params_audit(config_id);
CREATE INDEX idx_audit_modifie_le ON public.config_params_audit(modifie_le DESC);

ALTER TABLE public.config_params_audit ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. Seed initial des données 2026
-- ============================================================
INSERT INTO public.config_params (annee_fiscale, bloc, cle, valeur, unite, label, is_temporary, date_expiration) VALUES
-- A - Fiscalité
(2026, 'fiscalite', 'TAUX_PS_FONCIER',              0.172,  'decimal', 'PS sur revenus fonciers',             FALSE, NULL),
(2026, 'fiscalite', 'TAUX_PS_REVENUS_BIC_LMNP',     0.186,  'decimal', 'PS sur revenus BIC LMNP',             FALSE, NULL),
(2026, 'fiscalite', 'MICRO_FONCIER_ABATTEMENT',     0.30,   'decimal', 'Abattement Micro-Foncier',             FALSE, NULL),
(2026, 'fiscalite', 'MICRO_FONCIER_PLAFOND',        15000,  'euros',   'Plafond Micro-Foncier',                FALSE, NULL),
(2026, 'fiscalite', 'MICRO_BIC_MEUBLE_LONGUE_DUREE_ABATTEMENT', 0.50, 'decimal', 'Abattement BIC Classique', FALSE, NULL),
(2026, 'fiscalite', 'MICRO_BIC_MEUBLE_LONGUE_DUREE_PLAFOND',    77700, 'euros', 'Plafond BIC Classique', FALSE, NULL),
(2026, 'fiscalite', 'MICRO_BIC_TOURISME_CLASSE_ABATTEMENT',     0.71, 'decimal', 'Abattement Tourisme Classé', FALSE, NULL),
(2026, 'fiscalite', 'MICRO_BIC_TOURISME_CLASSE_PLAFOND',        188700, 'euros', 'Plafond Tourisme Classé', FALSE, NULL),
(2026, 'fiscalite', 'MICRO_BIC_TOURISME_NON_CLASSE_ABATTEMENT', 0.30, 'decimal', 'Abattement Tourisme Non Classé', FALSE, NULL),
(2026, 'fiscalite', 'MICRO_BIC_TOURISME_NON_CLASSE_PLAFOND',    15000, 'euros', 'Plafond Tourisme Non Classé', FALSE, NULL),
(2026, 'fiscalite', 'IS_TAUX_REDUIT',               0.15,   'decimal', 'Taux réduit IS',                      FALSE, NULL),
(2026, 'fiscalite', 'IS_TAUX_NORMAL',               0.25,   'decimal', 'Taux normal IS',                     FALSE, NULL),
(2026, 'fiscalite', 'IS_SEUIL_TAUX_REDUIT',         42500,  'euros',   'Seuil taux réduit IS',                FALSE, NULL),
(2026, 'fiscalite', 'FLAT_TAX',                     0.30,   'decimal', 'Flat Tax (PFU)',                     FALSE, NULL),

-- B - Foncier
(2026, 'foncier',   'DEFICIT_FONCIER_PLAFOND_IMPUTATION', 10700, 'euros', 'Plafond imputation déficit foncier', FALSE, NULL),
(2026, 'foncier',   'DEFICIT_FONCIER_PLAFOND_ENERGIE',    21400, 'euros', 'Plafond majoré déficit foncier énergie', TRUE, '2025-12-31'),
(2026, 'foncier',   'DEFICIT_FONCIER_DUREE_REPORT',      10,    'annees', 'Durée report déficit foncier',         FALSE, NULL),

-- C - Plus-value
(2026, 'plus_value', 'PLUS_VALUE_TAUX_IR',          0.19,   'decimal', 'Taux IR Plus-Value',                  FALSE, NULL),
(2026, 'plus_value', 'PLUS_VALUE_TAUX_PS',          0.172,  'decimal', 'Taux PS Plus-Value',                  FALSE, NULL),
(2026, 'plus_value', 'PLUS_VALUE_FORFAIT_FRAIS_ACQUISITION', 0.075, 'decimal', 'Forfait frais acquisition',   FALSE, NULL),
(2026, 'plus_value', 'PLUS_VALUE_FORFAIT_TRAVAUX_PV', 0.15,   'decimal', 'Forfait travaux plus-value',        FALSE, NULL),
(2026, 'plus_value', 'PLUS_VALUE_SEUIL_SURTAXE',    50000,  'euros',   'Seuil surtaxe plus-value immobilière', FALSE, NULL),

-- D - HCSF
(2026, 'hcsf',      'HCSF_TAUX_MAX',                0.35,   'decimal', 'Taux endettement max HCSF',           FALSE, NULL),
(2026, 'hcsf',      'HCSF_DUREE_MAX_ANNEES',        25,     'annees', 'Durée max emprunt HCSF',               FALSE, NULL),
(2026, 'hcsf',      'HCSF_PONDERATION_LOCATIFS',    0.70,   'decimal', 'Pondération revenus locatifs HCSF',   FALSE, NULL),

-- E - DPE
(2026, 'dpe',       'DECOTE_DPE_FG',                0.15,   'decimal', 'Décote valeur DPE F/G',               FALSE, NULL),
(2026, 'dpe',       'DECOTE_DPE_E',                 0.05,   'decimal', 'Décote valeur DPE E',                 FALSE, NULL),

-- F - Scoring / LMP
(2026, 'lmp_scoring', 'LMP_SEUIL_ALERTE',           20000,  'euros',   'Seuil alerte LMP',                    FALSE, NULL),
(2026, 'lmp_scoring', 'LMP_SEUIL_LMP',              23000,  'euros',   'Seuil passage statut LMP',            FALSE, NULL),
(2026, 'lmp_scoring', 'RESTE_A_VIVRE_SEUIL_MIN',    1000,   'euros',   'Seuil reste-à-vivre minimal',         FALSE, NULL),
(2026, 'lmp_scoring', 'RESTE_A_VIVRE_SEUIL_CONFORT', 2500,   'euros',   'Seuil reste-à-vivre confort',         FALSE, NULL),

-- G - Charges
(2026, 'charges',   'DEFAULTS_ASSURANCE_PNO',       150,    'euros',   'Défaut assurance PNO annuel',         FALSE, NULL),
(2026, 'charges',   'DEFAULTS_CHARGES_COPRO_M2',    30,     'euros',   'Défaut charges copro / m2 / an',      FALSE, NULL),
(2026, 'charges',   'DEFAULTS_TAXE_FONCIERES_MOIS', 0.1,    'decimal', 'Défaut taxe foncière (% loyer)',      FALSE, NULL),
(2026, 'charges',   'DEFAULTS_FRAIS_DOSSIER_BANQUE', 500,   'euros',   'Défaut frais dossier banque',         FALSE, NULL),
(2026, 'charges',   'DEFAULTS_FRAIS_GARANTIE_CREDIT', 0.012, 'decimal', 'Défaut frais garantie crédit',        FALSE, NULL),
(2026, 'charges',   'DEFAULTS_COMPTABLE_ANNUEL',    400,    'euros',   'Défaut frais comptable annuel',       FALSE, NULL),
(2026, 'charges',   'DEFAULTS_CFE_MIN',             150,    'euros',   'Défaut CFE minimum',                  FALSE, NULL),
(2026, 'charges',   'CFE_SEUIL_EXONERATION',        5000,   'euros',   'Seuil exonération CFE (CA)',          FALSE, NULL),
(2026, 'charges',   'FRAIS_REVENTE_TAUX_AGENCE_DEFAUT', 0.05, 'decimal', 'Défaut frais agence à la revente',   FALSE, NULL),
(2026, 'charges',   'FRAIS_REVENTE_DIAGNOSTICS',    500,    'euros',   'Défaut frais diagnostics revente',    FALSE, NULL),
(2026, 'charges',   'NOTAIRE_TAUX_ANCIEN',          0.08,   'decimal', 'Frais notaire estimatifs ancien',     FALSE, NULL),
(2026, 'charges',   'NOTAIRE_TAUX_NEUF',            0.025,  'decimal', 'Frais notaire estimatifs neuf',       FALSE, NULL),

-- H - Projections
(2026, 'projections', 'PROJECTION_INFLATION_LOYER', 0.015,  'decimal', 'Inflation loyers par défaut',        FALSE, NULL),
(2026, 'projections', 'PROJECTION_INFLATION_CHARGES', 0.02,   'decimal', 'Inflation charges par défaut',       FALSE, NULL),
(2026, 'projections', 'PROJECTION_REVALORISATION_BIEN', 0.01, 'decimal', 'Revalorisation bien par défaut',      FALSE, NULL)
;

-- Notes : Les paramètres de barèmes complexes (Tranches TMI, Emoluments notaire) restent en code
-- car ils nécessitent une structure de données plus complexe que de simples clefs/valeurs.
