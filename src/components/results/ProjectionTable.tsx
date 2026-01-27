import { ProjectionData } from '@/types/calculateur';
import { formatCurrency } from '@/lib/utils';
import { Card, CardHeader, CardContent } from '@/components/ui';

interface ProjectionTableProps {
    data: ProjectionData;
}

export function ProjectionTable({ data }: ProjectionTableProps) {
    if (!data || !data.projections) return null;

    return (
        <Card className="col-span-full">
            <CardHeader
                title={`Projection sur ${data.horizon} ans`}
                description="Évolution du patrimoine et des flux financiers"
            />
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3">Année</th>
                                <th className="px-4 py-3 text-right">Loyer annuel</th>
                                <th className="px-4 py-3 text-right">Charges expl.</th>
                                <th className="px-4 py-3 text-right">Crédit</th>
                                <th className="px-4 py-3 text-right">Cash-flow</th>
                                <th className="px-4 py-3 text-right">Capital restant</th>
                                <th className="px-4 py-3 text-right">Patrimoine net</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.projections.map((row) => (
                                <tr key={row.annee} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {row.annee}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {formatCurrency(row.loyer)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-red-600">
                                        -{formatCurrency(row.chargesExploitation)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-amber-600">
                                        -{formatCurrency(row.remboursementCredit)}
                                    </td>
                                    <td className={`px-4 py-3 text-right font-medium ${row.cashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(row.cashflow)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {formatCurrency(row.capitalRestant)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                                        {formatCurrency(row.patrimoineNet)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 font-semibold border-t-2 border-gray-200">
                            <tr>
                                <td className="px-4 py-3">TOTAL / FIN</td>
                                <td className="px-4 py-3 text-right">-</td>
                                <td className="px-4 py-3 text-right">-</td>
                                <td className="px-4 py-3 text-right">-</td>
                                <td className={`px-4 py-3 text-right ${data.totaux.cashflowCumule >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(data.totaux.cashflowCumule)}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    -
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {formatCurrency(data.totaux.enrichissementTotal)} (Enrich.)
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
