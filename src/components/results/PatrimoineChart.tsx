'use client';

import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ReferenceLine,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface PatrimoineDataPoint {
    name: string;
    valeurBien: number;
    capitalRestant: number;
    patrimoineNet: number;
}

interface PatrimoineChartProps {
    data: PatrimoineDataPoint[];
    loanEndYear?: number | null;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
    if (!active || !payload?.length) return null;

    const items = [
        { key: 'valeurBien', label: 'Valeur du bien', color: '#2D5A45' },
        { key: 'capitalRestant', label: 'Capital restant dû', color: '#6B6B6B' },
        { key: 'patrimoineNet', label: 'Patrimoine net', color: '#C4841D' },
    ];

    return (
        <div className="bg-white rounded-xl border border-sand shadow-md p-3 text-xs">
            <p className="font-bold text-charcoal mb-1.5">{label}</p>
            {items.map(item => {
                const entry = payload.find(p => p.dataKey === item.key);
                if (!entry) return null;
                return (
                    <div key={item.key} className="flex items-center gap-2 mt-1">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-stone">{item.label} :</span>
                        <span className="font-bold tabular-nums">{formatCurrency(entry.value)}</span>
                    </div>
                );
            })}
        </div>
    );
}

function formatCompact(value: number): string {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M€`;
    if (value >= 1_000) return `${Math.round(value / 1_000)}k€`;
    return `${value}€`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ValeurBienLastDot(props: any) {
    const { cx, cy, index, payload } = props;
    if (!cx || !cy) return null;
    // Only render on last data point
    if (index !== props.totalPoints - 1) return null;
    return (
        <g>
            <circle cx={cx} cy={cy} r={3.5} fill="#2D5A45" stroke="#fff" strokeWidth={1.5} />
            <text x={cx} y={cy - 10} textAnchor="end" fill="#2D5A45" fontSize={10} fontWeight="bold">
                {formatCompact(payload.valeurBien)}
            </text>
        </g>
    );
}

export const PatrimoineChart = React.memo(function PatrimoineChart({ data, loanEndYear }: PatrimoineChartProps) {
    const loanEndLabel = loanEndYear ? `Année ${loanEndYear}` : null;

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorValeur" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2D5A45" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="#2D5A45" stopOpacity={0.03} />
                        </linearGradient>
                        <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6B6B6B" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#6B6B6B" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPatrimoine" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C4841D" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#C4841D" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 10 }}
                        interval={Math.floor(data.length / 5)}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 10 }}
                        tickFormatter={(value) => `${value / 1000}k€`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" />
                    {loanEndLabel && (
                        <ReferenceLine
                            x={loanEndLabel}
                            stroke="#6B6B6B"
                            strokeDasharray="4 4"
                            strokeOpacity={0.5}
                            label={{ value: 'Fin crédit', position: 'top', fill: '#6B6B6B', fontSize: 10 }}
                        />
                    )}
                    <Area
                        type="monotone"
                        dataKey="valeurBien"
                        name="Valeur du bien (estimée)"
                        stroke="#2D5A45"
                        fillOpacity={1}
                        fill="url(#colorValeur)"
                        strokeWidth={2}
                        dot={<ValeurBienLastDot totalPoints={data.length} />}
                        activeDot={{ r: 4, fill: '#2D5A45', stroke: '#fff' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="capitalRestant"
                        name="Capital restant dû"
                        stroke="#6B6B6B"
                        fillOpacity={1}
                        fill="url(#colorCapital)"
                        strokeWidth={2}
                    />
                    <Area
                        type="monotone"
                        dataKey="patrimoineNet"
                        name="Patrimoine net"
                        stroke="#C4841D"
                        strokeOpacity={0.9}
                        fillOpacity={1}
                        fill="url(#colorPatrimoine)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
});
