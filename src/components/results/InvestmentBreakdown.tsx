'use client';

import { Card, CardHeader, CardContent } from '@/components/ui';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { BienData, FinancementData, FinancementResultat } from '@/types';

interface InvestmentBreakdownProps {
    bien: BienData;
    financement: FinancementData;
    resultats: FinancementResultat;
}

export function InvestmentBreakdown({ bien, financement, resultats }: InvestmentBreakdownProps) {
    const totalInvesti = (bien.prix_achat || 0) + (bien.montant_travaux || 0) + resultats.cout_total_credit - (resultats.montant_emprunt - (bien.prix_achat || 0));
    // Note: Simplification pour le capital total mobilisé
    const totalBesoin = (bien.prix_achat || 0) + (bien.montant_travaux || 0) + (financement.frais_dossier || 0) + (financement.frais_garantie || 0);

    const apportPart = (financement.apport / totalBesoin) * 100;
    const empruntPart = (resultats.montant_emprunt / totalBesoin) * 100;

    return (
        <Card className="h-full">
            <CardHeader
                title="Structure de l'investissement"
                description="Répartition du capital et mode de financement"
            />
            <CardContent className="space-y-6">
                {/* Graphique de financement simple */}
                <div className="space-y-2">
                    <div className="flex justify-between nordic-label-xs">
                        <span>Financement</span>
                        <span>Total : {formatCurrency(totalBesoin)}</span>
                    </div>
                    <div className="h-6 flex rounded-full overflow-hidden border border-sand/30 shadow-inner">
                        <div
                            className="bg-forest flex items-center justify-center text-[10px] font-bold text-white transition-all duration-1000"
                            style={{ width: `${empruntPart}%` }}
                            title="Emprunt"
                        >
                            {empruntPart > 15 && `${empruntPart.toFixed(0)}% Crédit`}
                        </div>
                        <div
                            className="bg-forest-light flex items-center justify-center text-[10px] font-bold text-forest transition-all duration-1000"
                            style={{ width: `${apportPart}%` }}
                            title="Apport"
                        >
                            {apportPart > 15 && `${apportPart.toFixed(0)}% Apport`}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-surface rounded-xl border border-sand/50">
                        <p className="nordic-label-xs !tracking-wider mb-1">Prix & Frais</p>
                        <p className="text-lg font-bold text-charcoal">{formatCurrency(bien.prix_achat)}</p>
                        <p className="text-[10px] text-stone/80">Exclu. frais de notaire</p>
                    </div>
                    <div className="p-3 bg-surface rounded-xl border border-sand/50">
                        <p className="nordic-label-xs !tracking-wider mb-1">Travaux & Mobilier</p>
                        <p className="text-lg font-bold text-charcoal">{formatCurrency((bien.montant_travaux || 0) + (bien.valeur_mobilier || 0))}</p>
                    </div>
                    <div className="p-3 bg-forest/5 rounded-xl border border-forest/10">
                        <p className="nordic-label-xs !text-forest !tracking-wider mb-1">Apport Personnel</p>
                        <p className="text-lg font-bold text-forest">{formatCurrency(financement.apport)}</p>
                    </div>
                    <div className="p-3 bg-forest/5 rounded-xl border border-forest/10">
                        <p className="nordic-label-xs !text-forest !tracking-wider mb-1">Montant Emprunté</p>
                        <p className="text-lg font-bold text-forest">{formatCurrency(resultats.montant_emprunt)}</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-sand/50 flex justify-between items-center text-xs">
                    <span className="nordic-label-xs !tracking-wider">Coût total du crédit</span>
                    <span className="font-bold text-terracotta">{formatCurrency(resultats.cout_total_credit)}</span>
                </div>
            </CardContent>
        </Card>
    );
}
