import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { QuoteBreakdownItem, MarketComparison } from '../types';

interface CostChartProps {
  breakdown: QuoteBreakdownItem[];
  totalCost: number;
  marketComparison: MarketComparison;
  darkMode: boolean;
}

// Updated modern palette for charts
const COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

export const CostChart: React.FC<CostChartProps> = ({ breakdown, totalCost, marketComparison, darkMode }) => {
  const pieData = breakdown.map((item) => ({
    name: item.category,
    value: item.cost
  }));

  const comparisonData = [
    { name: 'Smart Bytes', amount: totalCost },
    { name: 'Premium / Agencia', amount: marketComparison.highEstimate },
  ];

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  const textColor = darkMode ? '#94a3b8' : '#64748b';
  const gridColor = darkMode ? '#334155' : '#e2e8f0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
      {/* Breakdown Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors flex flex-col">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 text-center">Desglose de Inversión</h3>
        <div className="h-72 w-full flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                stroke={darkMode ? '#1e293b' : '#fff'}
                strokeWidth={2}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: darkMode ? '#0f172a' : '#fff',
                  borderColor: darkMode ? '#334155' : '#e2e8f0',
                  borderRadius: '0.75rem',
                  color: darkMode ? '#f8fafc' : '#0f172a'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors flex flex-col">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 text-center">Comparativa de Mercado</h3>
        <div className="h-72 w-full flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
              <XAxis type="number" tickFormatter={(val) => `$${val/1000}k`} tick={{fill: textColor}} stroke={gridColor} />
              <YAxis dataKey="name" type="category" width={100} style={{ fontSize: '11px' }} tick={{fill: textColor}} stroke={gridColor} />
              <Tooltip 
                 formatter={(value: number) => formatCurrency(value)}
                 cursor={{fill: darkMode ? '#334155' : '#f1f5f9', opacity: 0.4}}
                 contentStyle={{ 
                  backgroundColor: darkMode ? '#0f172a' : '#fff',
                  borderColor: darkMode ? '#334155' : '#e2e8f0',
                  borderRadius: '0.75rem',
                  color: darkMode ? '#f8fafc' : '#0f172a'
                }}
              />
              <Bar dataKey="amount" radius={[0, 6, 6, 0]} barSize={40}>
                {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#8b5cf6' : (darkMode ? '#475569' : '#cbd5e1')} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4 italic">{marketComparison.marketTrend}</p>
      </div>
    </div>
  );
};