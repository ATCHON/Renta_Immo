import { createAdminClient } from '@/lib/supabase/server';
import { ConfigParam } from '@/server/config/config-types';

export interface ParamAlert {
    id: string;
    label: string;
    cle: string;
    dateExpiration: string;
    daysRemaining: number;
    severity: 'critical' | 'warning' | 'info';
}

export class AlertsService {
    async getExpirationAlerts(): Promise<ParamAlert[]> {
        const supabase = await createAdminClient();

        // Récupérer tous les paramètres temporaires
        // Note: is_temporary est un boolean, on filtre ceux qui sont true
        const { data, error } = await supabase
            .from('config_params')
            .select('*')
            .eq('is_temporary', true);

        if (error || !data) {
            console.error('Erreur lors de la récupération des alertes:', error);
            return [];
        }

        const alerts: ParamAlert[] = [];
        const now = new Date();

        data.forEach((row: any) => {
            if (!row.date_expiration) return;

            const expirationDate = new Date(row.date_expiration);
            const diffTime = expirationDate.getTime() - now.getTime();
            const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // On ne garde que les alertes pertinentes (ex: ce qui expire dans moins de 6 mois, ou déjà expiré)
            // Ici on prend tout ce qui est temporaire pour l'affichage, mais on classifie

            let severity: 'critical' | 'warning' | 'info' = 'info';

            if (daysRemaining <= 30) {
                severity = 'critical';
            } else if (daysRemaining <= 90) {
                severity = 'warning';
            }

            alerts.push({
                id: row.id,
                label: row.label,
                cle: row.cle,
                dateExpiration: row.date_expiration,
                daysRemaining,
                severity
            });
        });

        // Trier par urgence (jours restants croissant)
        return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
    }
}

export const alertsService = new AlertsService();
