'use client';

import { useState } from 'react';
import { TableauAmortissement, LigneAmortissement } from '@/types/calculateur';
import { formatCurrency } from '@/lib/utils';
import { Card, CardHeader, CardContent, Button } from '@/components/ui';

interface AmortizationTableProps {
    data: TableauAmortissement;
}

export function AmortizationTable({ data }: AmortizationTableProps) {
    const [showMonthly, setShowMonthly] = useState(false);

    if (!data || !data.annuel) return null;

    return (
        <Card className="col-span-full">
            <CardHeader
                title="Détail du crédit"
                description="Répartition capital / intérêts par an"
                action={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMonthly(true)}
                    >
                        Détail mensuel
                    </Button>
                }
            />
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3">Année</th>
                                <th className="px-4 py-3 text-right">Échéance</th>
                                <th className="px-4 py-3 text-right">Capital</th>
                                <th className="px-4 py-3 text-right">Intérêts</th>
                                <th className="px-4 py-3 text-right">Assurance</th>
                                <th className="px-4 py-3 text-right">Reste dû</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.annuel.map((row) => (
                                <tr key={row.periode} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        Année {row.periode}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {formatCurrency(row.echeance)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-green-600">
                                        {formatCurrency(row.capital)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-amber-600">
                                        {formatCurrency(row.interets)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-blue-600">
                                        {formatCurrency(row.assurance)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        {formatCurrency(row.capitalRestant)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 font-semibold border-t-2 border-gray-200">
                            <tr>
                                <td className="px-4 py-3">TOTAL</td>
                                <td className="px-4 py-3 text-right">
                                    {formatCurrency(data.totaux.totalPaye)}
                                </td>
                                <td className="px-4 py-3 text-right">-</td>
                                <td className="px-4 py-3 text-right text-amber-600">
                                    {formatCurrency(data.totaux.totalInterets)}
                                </td>
                                <td className="px-4 py-3 text-right text-blue-600">
                                    {formatCurrency(data.totaux.totalAssurance)}
                                </td>
                                <td className="px-4 py-3 text-right">-</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </CardContent>

            {/* Modal Détail Mensuel */}
            {showMonthly && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                        <CardHeader
                            title="Tableau d'amortissement mensuel"
                            description="Détail mois par mois sur toute la durée du crédit"
                            action={
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowMonthly(false)}
                                >
                                    Fermer
                                </Button>
                            }
                        />
                        <CardContent className="flex-1 overflow-y-auto">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="sticky top-0 bg-white shadow-sm text-xs text-gray-700 uppercase border-b">
                                        <tr>
                                            <th className="px-4 py-3">Mois</th>
                                            <th className="px-4 py-3 text-right">Échéance</th>
                                            <th className="px-4 py-3 text-right">Capital</th>
                                            <th className="px-4 py-3 text-right">Intérêts</th>
                                            <th className="px-4 py-3 text-right">Assurance</th>
                                            <th className="px-4 py-3 text-right">Reste dû</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.mensuel?.map((row) => (
                                            <tr key={row.periode} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    Mois {row.periode}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {formatCurrency(row.echeance)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-green-600">
                                                    {formatCurrency(row.capital)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-amber-600">
                                                    {formatCurrency(row.interets)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-blue-600">
                                                    {formatCurrency(row.assurance)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {formatCurrency(row.capitalRestant)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </Card>
    );
}
