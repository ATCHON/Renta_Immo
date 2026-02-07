'use client';

import { Card, CardHeader, CardContent } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { ExploitationData, CashflowResultat, FinancementResultat } from '@/types';

interface OperationalBalanceProps {
    exploitation: Partial<ExploitationData>;
    cashflow: CashflowResultat;
    financement: FinancementResultat;
    impotMensuel: number;
}

export function OperationalBalance({
    exploitation,
    cashflow,
    financement,
    impotMensuel
}: OperationalBalanceProps) {
    const isPositive = cashflow.mensuel >= 0;
    const loyerMensuel = exploitation.loyer_mensuel || 0;
    const cashflowMensuelBrut = cashflow.mensuel_brut || 0;

    // Calcul du total des sorties mensuelles
    const chargesMensuelles = loyerMensuel - cashflowMensuelBrut;

    return (
        <Card className="h-full">
            <CardHeader
                title="Bilan d'Exploitation"
                description="Flux de trésorerie mensuel moyen"
            />
            <CardContent className="space-y-6">
                {/* Résumé Cashflow */}
                <div className={cn(
                    "p-6 rounded-2xl text-center border-2 transition-all duration-500",
                    isPositive
                        ? "bg-forest/5 border-forest/20 shadow-sm shadow-forest/10"
                        : "bg-terracotta/5 border-terracotta/20 shadow-sm shadow-terracotta/10"
                )}>
                    <p className="nordic-label-xs mb-1">Cashflow Net Mensuel</p>
                    <p className={cn(
                        "text-4xl font-black tabular-nums",
                        isPositive ? "text-forest" : "text-terracotta"
                    )}>
                        {isPositive ? '+' : ''}{formatCurrency(cashflow.mensuel)}
                    </p>
                    <p className="text-[10px] text-stone font-medium mt-2 uppercase tracking-tighter">
                        Après charges, crédit et fiscalité
                    </p>
                </div>

                {/* Détails entrées/sorties */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-forest/[0.03] rounded-xl">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-forest" />
                            <span className="text-sm font-medium text-charcoal">Revenus locatifs</span>
                        </div>
                        <span className="font-bold text-forest">{formatCurrency(loyerMensuel)}</span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="nordic-label-xs !tracking-wider">Charges estimées</span>
                            <span className="text-sm font-bold text-charcoal tabular-nums">-{formatCurrency(chargesMensuelles)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="nordic-label-xs !tracking-wider">Mensualité crédit</span>
                            <span className="text-sm font-bold text-charcoal tabular-nums">-{formatCurrency(financement.mensualite)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="nordic-label-xs !tracking-wider">Impôts & Prélèvements</span>
                            <span className="text-sm font-bold text-charcoal tabular-nums">-{formatCurrency(impotMensuel)}</span>
                        </div>
                    </div>
                </div>

                {/* Effort d'épargne ou levier */}
                <div className="pt-4 border-t border-sand/50">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-charcoal">
                                {isPositive ? "Auto-financement" : "Effort d'épargne"}
                            </span>
                            <span className="text-[10px] text-stone">Rapport au loyer</span>
                        </div>
                        <div className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold",
                            isPositive ? "bg-forest/10 text-forest" : "bg-terracotta/10 text-terracotta"
                        )}>
                            {isPositive ? "Projet Sain" : `${((Math.abs(cashflow.mensuel) / (loyerMensuel || 1)) * 100).toFixed(0)}% du loyer`}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
