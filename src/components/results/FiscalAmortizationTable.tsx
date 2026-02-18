'use client';

import React, { useState } from 'react';
import { TableauAmortissementFiscal } from '@/types/calculateur';
import { formatCurrency } from '@/lib/utils';
import { Card, CardHeader, CardContent, Button } from '@/components/ui';
import { Info } from 'lucide-react';

interface FiscalAmortizationTableProps {
    data: TableauAmortissementFiscal;
    anneeDepart?: number;
}

export const FiscalAmortizationTable = React.memo(function FiscalAmortizationTable({
    data,
    anneeDepart = new Date().getFullYear(),
}: FiscalAmortizationTableProps) {
    const [showInfo, setShowInfo] = useState(false);
    const [activeTooltip, setActiveTooltip] = useState<'eco' | 'reint' | null>(null);

    if (!data || !data.lignes?.length) return null;

    const modeLabel = data.modeAmortissement === 'composants' ? 'par composants' : 'simplifié';

    return (
        <Card className="col-span-full border-sand/50 shadow-sm overflow-hidden">
            <CardHeader
                title={`Amortissement fiscal — ${data.regime}`}
                description={`Mode ${modeLabel} · Déduction annuelle par composant`}
                action={
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowInfo((v) => !v)}
                        className="text-xs uppercase tracking-widest font-bold gap-1"
                    >
                        <Info className="h-3.5 w-3.5" />
                        {showInfo ? 'Masquer' : 'Comment ça marche ?'}
                    </Button>
                }
            />

            {showInfo && (
                <div className="mx-6 mb-4 p-4 bg-forest/5 border border-forest/15 rounded-xl text-sm text-pebble space-y-3">
                    <p>
                        <span className="font-bold text-charcoal">L&apos;amortissement fiscal</span> est distinct du remboursement du crédit.
                        Il représente la <span className="font-semibold">dépréciation comptable du bien</span> que vous pouvez déduire de vos revenus imposables chaque année.
                        Seule la partie <strong className="text-charcoal">bâti</strong> est amortissable — le terrain ne l&apos;est pas.
                    </p>
                    <p>
                        En {data.regime}, vous pouvez amortir le <span className="font-semibold">bâti</span> (hors terrain),
                        les <span className="font-semibold">travaux</span> et le <span className="font-semibold">mobilier</span>.
                    </p>
                    {data.regime === 'LMNP Réel' && (
                        <p className="font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs">
                            <strong>Règle fondamentale :</strong> L&apos;amortissement ne peut pas créer de déficit BIC.
                            Si l&apos;amortissement dépasse le bénéfice, l&apos;excédent est <strong>reporté sans limite de durée</strong> sur les exercices suivants.
                            Il n&apos;est jamais perdu.
                        </p>
                    )}
                    {data.regime === 'SCI IS' && (
                        <p className="font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs">
                            En SCI IS, l&apos;amortissement peut générer un <strong>déficit fiscal IS</strong>, reportable sur les exercices bénéficiaires futurs.
                        </p>
                    )}
                    {data.modeAmortissement === 'composants' && (
                        <p className="text-xs text-pebble/80">
                            Mode par composants : Gros œuvre 40% / 50 ans · Façade &amp; toiture 20% / 25 ans · Installations techniques 20% / 15 ans · Agencements intérieurs 20% / 10 ans.
                        </p>
                    )}
                    <p className="text-xs text-pebble/60 italic">
                        Les bases imposables affichées sont estimatives (loyers sans inflation). Les projections pluriannuelles intègrent l&apos;évolution exacte des loyers et charges.
                    </p>
                </div>
            )}

            {/* KPIs résumé */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-sand/30 mx-6 rounded-xl overflow-hidden border border-sand/40"
                style={{ marginBottom: activeTooltip ? '0' : undefined }}>
                <div className="bg-white px-5 py-4 text-center">
                    <p className="text-[10px] font-black text-pebble uppercase tracking-widest mb-1">Total amorti</p>
                    <p className="text-xl font-black text-charcoal tabular-nums">{formatCurrency(data.totaux.totalAmortissements)}</p>
                </div>
                <div className="bg-white px-5 py-4 text-center">
                    <p className="text-[10px] font-black text-pebble uppercase tracking-widest mb-1">Déductible effectif</p>
                    <p className="text-xl font-black text-forest tabular-nums">{formatCurrency(data.totaux.totalDeductible)}</p>
                </div>
                <button
                    type="button"
                    onClick={() => setActiveTooltip(activeTooltip === 'eco' ? null : 'eco')}
                    className="bg-forest/5 px-5 py-4 text-center cursor-pointer hover:bg-forest/10 transition-colors text-left w-full"
                >
                    <p className="text-[10px] font-black text-pebble uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                        Économie d&apos;impôt estimée
                        <Info className={`h-3 w-3 transition-colors ${activeTooltip === 'eco' ? 'text-forest' : 'text-pebble/40'}`} />
                    </p>
                    <p className="text-xl font-black text-forest tabular-nums">{formatCurrency(data.totaux.economieImpotEstimee)}</p>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTooltip(activeTooltip === 'reint' ? null : 'reint')}
                    className="bg-terracotta/5 border-l border-terracotta/10 px-5 py-4 text-center cursor-pointer hover:bg-terracotta/10 transition-colors text-left w-full"
                >
                    <p className="text-[10px] font-black text-pebble uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                        {data.regime === 'LMNP Réel' ? 'Réintégration PV (LF 2025)' : 'Réintégration IS (VNC)'}
                        <Info className={`h-3 w-3 transition-colors ${activeTooltip === 'reint' ? 'text-terracotta' : 'text-pebble/40'}`} />
                    </p>
                    <p className="text-xl font-black text-terracotta tabular-nums">{formatCurrency(data.totaux.amortissementAReintegrer)}</p>
                    {data.regime === 'LMNP Réel' && data.totaux.totalMobilierDeduit > 0 && (
                        <p className="text-[9px] text-pebble mt-0.5">Mobilier exclu : {formatCurrency(data.totaux.totalMobilierDeduit)}</p>
                    )}
                </button>
            </div>

            {/* Panneaux d'explication des KPIs (hors overflow-hidden) */}
            {activeTooltip === 'eco' && (
                <div className="mx-6 mt-px mb-4 p-3.5 bg-forest/5 border border-forest/15 rounded-b-xl text-xs text-left animate-fade-in">
                    <p className="font-bold text-charcoal mb-1 flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5 text-forest" />
                        Comment est calculée l&apos;économie d&apos;impôt ?
                    </p>
                    <p className="text-pebble leading-relaxed">
                        <span className="font-semibold text-charcoal">Déductible effectif × (TMI + PS)</span><br />
                        Le montant déduit chaque année réduit votre base imposable. L&apos;économie estimée correspond à ce que vous auriez payé en impôt sans l&apos;amortissement.
                    </p>
                    <p className="text-pebble/60 text-[10px] mt-1.5 italic">
                        Estimation indicative — ne tient pas compte des reports d&apos;amortissement ni de l&apos;évolution du revenu imposable réel.
                    </p>
                </div>
            )}
            {activeTooltip === 'reint' && (
                <div className="mx-6 mt-px mb-4 p-3.5 bg-terracotta/5 border border-terracotta/15 rounded-b-xl text-xs text-left animate-fade-in">
                    <p className="font-bold text-charcoal mb-1 flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5 text-terracotta" />
                        Comment est calculée la réintégration ?
                    </p>
                    {data.regime === 'LMNP Réel' ? (
                        <p className="text-pebble leading-relaxed">
                            <span className="font-semibold text-charcoal">Déductible effectif − Mobilier déduit</span><br />
                            En LMNP, seul le <strong>bâti et les travaux</strong> sont réintégrés dans la plus-value imposable à la revente.
                            Le mobilier est exonéré de réintégration depuis la <strong>Loi Le Meur (15/02/2025)</strong>.
                            Ce montant s&apos;ajoute à votre plus-value imposable au taux IR + PS de la plus-value immobilière.
                        </p>
                    ) : (
                        <p className="text-pebble leading-relaxed">
                            <span className="font-semibold text-charcoal">= Totalité des amortissements déduits</span><br />
                            En SCI IS, les amortissements réduisent la <strong>Valeur Nette Comptable (VNC)</strong> du bien.
                            La plus-value IS se calcule sur <em>Prix de cession − VNC</em>, ce qui intègre automatiquement la totalité des amortissements dans la base imposable à l&apos;IS.
                        </p>
                    )}
                    <p className="text-pebble/60 text-[10px] mt-1.5 italic">
                        Ce montant est une estimation basée sur les amortissements projetés sur l&apos;horizon de simulation.
                    </p>
                </div>
            )}
            {!activeTooltip && <div className="mb-4" />}

            <CardContent className="p-0">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-sand scrollbar-track-transparent">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-surface border-b border-sand/50">
                                <th className="px-5 py-4 text-[10px] font-black text-pebble uppercase tracking-widest">Année</th>
                                <th className="px-5 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">Immeuble</th>
                                <th className="px-5 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">Travaux</th>
                                <th className="px-5 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">Mobilier</th>
                                <th className="px-5 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">Total</th>
                                        <th className="px-5 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">Déductible</th>
                                {data.regime === 'LMNP Réel' && (
                                    <th className="px-5 py-4 text-[10px] font-black text-amber-700 uppercase tracking-widest text-right">Reporté ∑</th>
                                )}
                                <th className="px-5 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">Cumulé déduit</th>
                                <th className="px-5 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">Base avant</th>
                                <th className="px-5 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">Base après</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sand/30">
                            {data.lignes.map((row) => {
                                const excedent = row.amortissementTotal > row.amortissementDeductible;
                                return (
                                    <tr key={row.annee} className={`hover:bg-sand/10 transition-colors group${excedent ? ' bg-amber-50/40' : ''}`}>
                                        <td className="px-5 py-3.5 font-bold text-charcoal tabular-nums">
                                            {anneeDepart + row.annee - 1}
                                        </td>
                                        <td className="px-5 py-3.5 text-right tabular-nums text-pebble">
                                            {row.amortissementImmo > 0 ? formatCurrency(row.amortissementImmo) : <span className="text-sand">—</span>}
                                        </td>
                                        <td className="px-5 py-3.5 text-right tabular-nums text-pebble">
                                            {row.amortissementTravaux > 0 ? formatCurrency(row.amortissementTravaux) : <span className="text-sand">—</span>}
                                        </td>
                                        <td className="px-5 py-3.5 text-right tabular-nums text-pebble">
                                            {row.amortissementMobilier > 0 ? formatCurrency(row.amortissementMobilier) : <span className="text-sand">—</span>}
                                        </td>
                                        <td className="px-5 py-3.5 text-right tabular-nums font-semibold text-charcoal">
                                            {formatCurrency(row.amortissementTotal)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right tabular-nums font-bold text-forest">
                                            {formatCurrency(row.amortissementDeductible)}
                                        </td>
                                        {data.regime === 'LMNP Réel' && (
                                            <td className="px-5 py-3.5 text-right tabular-nums">
                                                {row.amortissementReporteCumule > 0 ? (
                                                    <span className="font-semibold text-amber-700">
                                                        {formatCurrency(row.amortissementReporteCumule)}
                                                    </span>
                                                ) : (
                                                    <span className="text-sand">—</span>
                                                )}
                                            </td>
                                        )}
                                        <td className="px-5 py-3.5 text-right tabular-nums text-charcoal/60">
                                            {formatCurrency(row.amortissementCumule)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right tabular-nums text-pebble">
                                            {formatCurrency(row.baseImposableAvant)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right tabular-nums font-semibold text-forest">
                                            {formatCurrency(row.baseImposableApres)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-surface/50 border-t-2 border-sand/30">
                            <tr className="font-black text-charcoal">
                                <td className="px-5 py-4 text-[10px] uppercase tracking-widest text-pebble">TOTAL</td>
                                <td className="px-5 py-4 text-right tabular-nums">
                                    {formatCurrency(data.lignes.reduce((s, l) => s + l.amortissementImmo, 0))}
                                </td>
                                <td className="px-5 py-4 text-right tabular-nums">
                                    {formatCurrency(data.lignes.reduce((s, l) => s + l.amortissementTravaux, 0))}
                                </td>
                                <td className="px-5 py-4 text-right tabular-nums">
                                    {formatCurrency(data.lignes.reduce((s, l) => s + l.amortissementMobilier, 0))}
                                </td>
                                <td className="px-5 py-4 text-right tabular-nums">
                                    {formatCurrency(data.totaux.totalAmortissements)}
                                </td>
                                <td className="px-5 py-4 text-right tabular-nums text-forest">
                                    {formatCurrency(data.totaux.totalDeductible)}
                                </td>
                                {data.regime === 'LMNP Réel' && (
                                    <td className="px-5 py-4 text-right tabular-nums text-amber-700">
                                        {formatCurrency(data.lignes[data.lignes.length - 1]?.amortissementReporteCumule ?? 0)}
                                    </td>
                                )}
                                <td className="px-5 py-4 text-right">—</td>
                                <td className="px-5 py-4 text-right">—</td>
                                <td className="px-5 py-4 text-right">—</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
});
