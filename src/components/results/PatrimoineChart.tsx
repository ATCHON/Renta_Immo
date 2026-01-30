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
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface PatrimoineChartProps {
    data: any[];
}

export const PatrimoineChart: React.FC<PatrimoineChartProps> = ({ data }) => {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorValeur" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#059669" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#64748B" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#64748B" stopOpacity={0} />
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
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '12px',
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                        formatter={(value: any) => formatCurrency(Number(value))}
                    />
                    <Legend iconType="circle" />
                    <Area
                        type="monotone"
                        dataKey="valeurBien"
                        name="Valeur du bien"
                        stroke="#059669"
                        fillOpacity={1}
                        fill="url(#colorValeur)"
                        strokeWidth={2}
                    />
                    <Area
                        type="monotone"
                        dataKey="capitalRestant"
                        name="Capital restant dû"
                        stroke="#64748B"
                        fillOpacity={1}
                        fill="url(#colorCapital)"
                        strokeWidth={2}
                    />
                    <Area
                        type="monotone"
                        dataKey="patrimoineNet"
                        name="Patrimoine net"
                        stroke="#F59E0B"
                        strokeOpacity={0.8}
                        fill="transparent"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
