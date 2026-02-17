/**
 * Scénarios types pour tester l'impact des changements de configuration
 */

export const FIXTURES = {
    lmnp_classique: {
        bien: {
            prix_achat: 200000,
            montant_travaux: 0,
            surface: 40,
            ville: 'Lyon',
        },
        financement: {
            apport_personnel: 20000,
            duree_emprunt: 20,
            taux_interet: 3.5,
            assurance_pret: 0.3,
        },
        exploitation: {
            loyer_mensuel: 1000,
            charges_copro_annuelles: 1200,
            taxe_fonciere: 800,
            assurance_pno: 150,
            services_gestion: 0, // Gestion directe
            cfe: 200,
        },
        structure: {
            type: 'nom_propre',
            regime: 'lmnp_reel',
            tmi: 30,
            nb_parts_fiscales: 1,
        },
        options: {
            horizon_projection: 20,
        },
    },
    sci_is_familiale: {
        bien: {
            prix_achat: 400000,
            montant_travaux: 50000,
            surface: 80,
            ville: 'Bordeaux',
        },
        financement: {
            apport_personnel: 40000,
            duree_emprunt: 25,
            taux_interet: 3.8,
            assurance_pret: 0.35,
        },
        exploitation: {
            loyer_mensuel: 2000,
            charges_copro_annuelles: 2400,
            taxe_fonciere: 1500,
            assurance_pno: 250,
            services_gestion: 1, // Agence
            cfe: 400,
        },
        structure: {
            type: 'sci_is',
            associes: [
                { nom: 'Parent 1', parts: 45, tmi: 41 },
                { nom: 'Parent 2', parts: 45, tmi: 41 },
                { nom: 'Enfant', parts: 10, tmi: 11 },
            ],
            is_taux_reduit_applicable: true,
        },
        options: {
            horizon_projection: 20,
        },
    },
    nu_reel_deficit: {
        bien: {
            prix_achat: 150000,
            montant_travaux: 80000, // Gros travaux pour déficit
            surface: 50,
            ville: 'Saint-Etienne',
        },
        financement: {
            apport_personnel: 15000,
            duree_emprunt: 20,
            taux_interet: 3.5,
            assurance_pret: 0.3,
        },
        exploitation: {
            loyer_mensuel: 700,
            charges_copro_annuelles: 800,
            taxe_fonciere: 600,
            assurance_pno: 120,
            services_gestion: 0,
            cfe: 0, // Pas de CFE en nu
        },
        structure: {
            type: 'nom_propre',
            regime: 'nu_reel',
            tmi: 41,
            nb_parts_fiscales: 2,
        },
        options: {
            horizon_projection: 20,
        },
    }
};
