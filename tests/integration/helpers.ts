import type { AssocieData, CalculateurFormData } from '@/types/calculateur';

// Helper TypeScript pour les types partiels imbriqués
type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

/**
 * Données de base pour les scénarios d'intégration.
 * Bien de référence : appartement ancien 200k€, LMNP réel, TMI 30%, emprunt 20 ans 3,5%.
 */
export function createBaseInput(overrides?: DeepPartial<CalculateurFormData>): CalculateurFormData {
  // Extraire associes des overrides structure pour le typer correctement
  const { associes: overrideAssocies, ...structureRest } = overrides?.structure ?? {};

  return {
    bien: {
      adresse: 'Test Intégration',
      prix_achat: 200000,
      surface: 50,
      type_bien: 'appartement',
      etat_bien: 'ancien',
      montant_travaux: 0,
      valeur_mobilier: 0,
      dpe: 'C',
      ...overrides?.bien,
    },
    financement: {
      apport: 40000,
      taux_interet: 3.5,
      duree_emprunt: 20,
      assurance_pret: 0.1,
      frais_dossier: 0,
      frais_garantie: 0,
      ...overrides?.financement,
    },
    exploitation: {
      loyer_mensuel: 900,
      charges_copro: 100,
      taxe_fonciere: 1000,
      assurance_pno: 150,
      gestion_locative: 0,
      provision_travaux: 0,
      provision_vacance: 0,
      type_location: 'meublee_longue_duree',
      charges_copro_recuperables: 0,
      assurance_gli: 0,
      cfe_estimee: 0,
      comptable_annuel: 400,
      taux_occupation: 1,
      ...overrides?.exploitation,
    },
    structure: {
      type: 'nom_propre',
      tmi: 30,
      regime_fiscal: 'lmnp_reel',
      associes: (overrideAssocies as AssocieData[] | undefined) ?? [],
      ...structureRest,
    },
    options: {
      generer_pdf: false,
      envoyer_email: false,
      horizon_projection: 20,
      ...overrides?.options,
    },
  };
}
