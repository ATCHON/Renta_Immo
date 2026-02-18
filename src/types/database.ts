import type { CalculateurFormData, CalculResultats } from './calculateur';

export interface Database {
  public: {
    Tables: {
      simulations: {
        Row: Simulation;
        Insert: SimulationInsert;
        Update: SimulationUpdate;
      };
    };
  };
}

export interface Simulation {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  form_data: CalculateurFormData;
  resultats: CalculResultats;
  rentabilite_brute: number | null;
  rentabilite_nette: number | null;
  cashflow_mensuel: number | null;
  score_global: number | null;
  is_favorite: boolean;
  is_archived: boolean;
}

export interface SimulationInsert {
  id?: string;
  user_id: string;
  name?: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  form_data: CalculateurFormData;
  resultats: CalculResultats;
  rentabilite_brute?: number | null;
  rentabilite_nette?: number | null;
  cashflow_mensuel?: number | null;
  score_global?: number | null;
  is_favorite?: boolean;
  is_archived?: boolean;
}

export interface SimulationUpdate {
  name?: string;
  description?: string | null;
  form_data?: CalculateurFormData;
  resultats?: CalculResultats;
  rentabilite_brute?: number | null;
  rentabilite_nette?: number | null;
  cashflow_mensuel?: number | null;
  score_global?: number | null;
  is_favorite?: boolean;
  is_archived?: boolean;
  updated_at?: string;
}
