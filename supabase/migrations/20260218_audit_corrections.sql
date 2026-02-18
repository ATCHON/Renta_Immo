-- Audit conformité 2026-02-18 : corrections et recommandations
-- REC-01 : Frais de notaire par tranches
-- REC-02 : HCSF capacité résiduelle configurable
-- REC-04 : VEFA HCSF durée 27 ans

INSERT INTO config_params (annee_fiscale, bloc, cle, valeur, unite, label) VALUES
  -- REC-02 : HCSF capacité résiduelle configurable
  (2026, 'hcsf', 'HCSF_TAUX_REFERENCE_CAPACITE',             0.035, 'decimal', 'Taux référence calcul capacité résiduelle'),
  (2026, 'hcsf', 'HCSF_DUREE_CAPACITE_RESIDUELLE_ANNEES',       20, 'annees',  'Durée (ans) calcul capacité résiduelle'),
  -- REC-04 : VEFA HCSF 27 ans
  (2026, 'hcsf', 'HCSF_DUREE_MAX_ANNEES_VEFA',                  27, 'annees',  'Durée max crédit HCSF - VEFA'),
  -- REC-01 : Frais de notaire par tranches
  (2026, 'charges', 'NOTAIRE_DMTO_TAUX_STANDARD', 0.0580665, 'decimal', 'DMTO taux standard (5,80665 %)'),
  (2026, 'charges', 'NOTAIRE_CSI_TAUX',               0.001, 'decimal', 'Contribution sécurité immobilière (0,1 %)'),
  (2026, 'charges', 'NOTAIRE_DEBOURS_FORFAIT',           800, 'euros',   'Débours forfaitaires notaire')
ON CONFLICT (annee_fiscale, bloc, cle) DO NOTHING;
