'use client';

import React from 'react';
import {
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Cell,
    Legend,
    ComposedChart,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface CashflowDataPoint {
    name: string;
    cashflowNetImpot: number;
    cashflowCumule?: number;
}

interface CashflowChartProps {
    data: CashflowDataPoint[];
    breakEvenYear?: number | null;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) {
    if (!active || !payload?.length) return null;

    const cashflow = payload.find(p => p.dataKey === 'cashflowNetImpot');
    const cumul = payload.find(p => p.dataKey === 'cashflowCumule');

    return (
        <div className="bg-white rounded-xl border border-sand shadow-md p-3 text-xs">
            <p className="font-bold text-charcoal mb-1.5">{label}</p>
            {cashflow && (
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: (cashflow.value ?? 0) >= 0 ? '#2D5A45' : '#B54A32' }} />
                    <span className="text-stone">Cash-flow :</span>
                    <span className="font-bold tabular-nums">{formatCurrency(cashflow.value)}</span>
                </div>
            )}
            {cumul && (
                <div className="flex items-center gap-2 mt-1">
                    <span className="h-2 w-2 rounded-full bg-sage/40" />
                    <span className="text-stone">Cumulé :</span>
                    <span className="font-bold tabular-nums">{formatCurrency(cumul.value)}</span>
                </div>
            )}
        </div>
    );
}

export const CashflowChart = React.memo(function CashflowChart({ data, breakEvenYear }: CashflowChartProps) {
    const hasCumul = data.some(d => d.cashflowCumule !== undefined);

    // Find the breakeven index for the reference line
    const breakEvenLabel = breakEvenYear ? `Année ${breakEvenYear}` : null;

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 10 }}
                        interval={Math.floor(data.length / 5)}
                    />
                    <YAxis
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 10 }}
                        tickFormatter={(value) => `${value / 1000}k€`}
                    />
                    {hasCumul && (
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748B', fontSize: 10 }}
                            tickFormatter={(value) => `${value / 1000}k€`}
                        />
                    )}
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        iconType="circle"
                        formatter={(value: string) => (
                            <span className="text-xs text-stone">{value}</span>
                        )}
                    />
                    <ReferenceLine yAxisId="left" y={0} stroke="#CBD5E1" />
                    {breakEvenLabel && (
                        <ReferenceLine
                            yAxisId="left"
                            x={breakEvenLabel}
                            stroke="#2D5A45"
                            strokeDasharray="4 4"
                            strokeOpacity={0.6}
                            label={{ value: 'Équilibre', position: 'top', fill: '#2D5A45', fontSize: 10 }}
                        />
                    )}
                    <Bar
                        yAxisId="left"
                        dataKey="cashflowNetImpot"
                        name="Cash-flow net"
                        radius={[4, 4, 0, 0]}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.cashflowNetImpot >= 0 ? '#2D5A45' : '#B54A32'}
                            />
                        ))}
                    </Bar>
                    {hasCumul && (
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="cashflowCumule"
                            name="Cumulé"
                            stroke="#4A7C59"
                            strokeOpacity={0.45}
                            strokeWidth={1.5}
                            strokeDasharray="5 3"
                            dot={false}
                        />
                    )}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
});
